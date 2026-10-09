from __future__ import annotations
import base64, hashlib, hmac, json, os, secrets, sqlite3, time, uuid
from pathlib import Path
from typing import Any, Optional
import jwt
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ConfigDict

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv('KHB_DATA_DIR', ROOT / 'backend' / 'data'))
UPLOAD_DIR = Path(os.getenv('KHB_UPLOAD_DIR', ROOT / 'backend' / 'uploads'))
DATA_DIR.mkdir(parents=True, exist_ok=True); UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / 'khb.sqlite3'
ENV = os.getenv('KHB_ENV', 'development').lower()
JWT_SECRET = os.getenv('KHB_JWT_SECRET') or (
    secrets.token_urlsafe(48) if ENV != 'production' else ''
)
JWT_ALG = 'HS256'
JWT_TTL = int(os.getenv('KHB_JWT_TTL', '86400'))
DEV_OTP = os.getenv('KHB_DEV_OTP', '')
if ENV == 'production' and len(JWT_SECRET) < 32:
    raise RuntimeError('KHB_JWT_SECRET must be set to at least 32 characters in production')
if ENV == 'production' and DEV_OTP:
    raise RuntimeError('KHB_DEV_OTP must not be configured in production')
if JWT_TTL < 300 or JWT_TTL > 2592000:
    raise RuntimeError('KHB_JWT_TTL must be between 300 and 2592000 seconds')
MAX_UPLOAD = int(os.getenv('KHB_MAX_UPLOAD_BYTES', str(10*1024*1024)))
APP_VERSION = '0.7.2'
app = FastAPI(title='۴ دیواری API', version=APP_VERSION)
origins=[x.strip() for x in os.getenv('KHB_CORS_ORIGINS','http://localhost:8080,http://127.0.0.1:8080').split(',') if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

SCHEMA='''
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, phone TEXT UNIQUE NOT NULL, full_name TEXT, role TEXT NOT NULL DEFAULT 'applicant', password_hash TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS otp_codes(id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS listings(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, is_tender INTEGER NOT NULL DEFAULT 0, org_name TEXT, category TEXT NOT NULL, province TEXT NOT NULL, city TEXT NOT NULL, title TEXT NOT NULL, description TEXT, phone TEXT, answer_mode TEXT DEFAULT 'self', postal_code TEXT, status TEXT NOT NULL DEFAULT 'pending', reject_reason TEXT, publish_code TEXT UNIQUE, data_json TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS favorites(user_id TEXT NOT NULL, listing_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(user_id,listing_id));
CREATE TABLE IF NOT EXISTS visits(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,listing_id TEXT NOT NULL,requested_at INTEGER NOT NULL,scheduled_at INTEGER,status TEXT NOT NULL DEFAULT 'requested',note TEXT);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,sender_id TEXT NOT NULL,recipient_id TEXT NOT NULL,listing_id TEXT,body TEXT NOT NULL,created_at INTEGER NOT NULL,read_at INTEGER);
CREATE TABLE IF NOT EXISTS contracts(id TEXT PRIMARY KEY,listing_id TEXT NOT NULL,party_a TEXT NOT NULL,party_b TEXT NOT NULL,party_a_national TEXT,party_b_national TEXT,party_b_phone TEXT,percent REAL NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS notification_subscriptions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,endpoint TEXT NOT NULL,subscription_json TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS property_history(id INTEGER PRIMARY KEY AUTOINCREMENT,listing_id TEXT NOT NULL,actor_id TEXT,action TEXT NOT NULL,data_json TEXT,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT,action TEXT NOT NULL,object_type TEXT,object_id TEXT,meta_json TEXT,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS app_settings(key TEXT PRIMARY KEY,value_json TEXT NOT NULL);
'''

def db():
    c=sqlite3.connect(DB_PATH); c.row_factory=sqlite3.Row; c.execute('PRAGMA foreign_keys=ON'); c.execute('PRAGMA journal_mode=WAL'); c.executescript(SCHEMA); _migrate(c); return c

def _migrate(c):
    # F15: بایگانی آگهی‌دهنده — عکس پروفایل و شمارش معاملات برای رتبه ستاره‌ای
    cols={r[1] for r in c.execute('PRAGMA table_info(users)')}
    if 'avatar' not in cols: c.execute("ALTER TABLE users ADD COLUMN avatar TEXT")
    if 'deals_count' not in cols: c.execute("ALTER TABLE users ADD COLUMN deals_count INTEGER NOT NULL DEFAULT 0")
    c.commit()

def now(): return int(time.time())
def uid(): return str(uuid.uuid4())
def jsonable(x): return json.loads(x) if isinstance(x,str) else x

def hash_secret(s: str)->str:
    salt=secrets.token_bytes(16); dk=hashlib.scrypt(s.encode(),salt=salt,n=2**14,r=8,p=1); return base64.urlsafe_b64encode(salt+dk).decode()
def verify_secret(s, stored):
    try:
        raw=base64.urlsafe_b64decode(stored.encode()); salt,expected=raw[:16],raw[16:]; actual=hashlib.scrypt(s.encode(),salt=salt,n=2**14,r=8,p=1); return hmac.compare_digest(actual,expected)
    except Exception:return False

def token_for(user): return jwt.encode({'sub':user['id'],'role':user['role'],'exp':now()+JWT_TTL},JWT_SECRET,algorithm=JWT_ALG)
def auth(authorization: Optional[str]=Header(default=None)):
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'احراز هویت لازم است')
    try: p=jwt.decode(authorization[7:],JWT_SECRET,algorithms=[JWT_ALG])
    except jwt.PyJWTError: raise HTTPException(401,'توکن نامعتبر یا منقضی است')
    c=db(); u=c.execute('SELECT * FROM users WHERE id=?',(p.get('sub'),)).fetchone(); c.close()
    if not u: raise HTTPException(401,'کاربر یافت نشد')
    return u

def optional_auth(authorization: Optional[str]=Header(default=None)):
    if not authorization: return None
    try:
        p=jwt.decode(authorization[7:] if authorization.startswith('Bearer ') else authorization,JWT_SECRET,algorithms=[JWT_ALG])
    except jwt.PyJWTError: return None
    c=db(); u=c.execute('SELECT * FROM users WHERE id=?',(p.get('sub'),)).fetchone(); c.close(); return u

def role(*roles):
    def dep(u=Depends(auth)):
        if u['role'] not in roles: raise HTTPException(403,'دسترسی مجاز نیست')
        return u
    return dep

def audit(c,actor,action,otype=None,oid=None,meta=None): c.execute('INSERT INTO audit_logs(actor_id,action,object_type,object_id,meta_json,created_at) VALUES(?,?,?,?,?,?)',(actor,action,otype,oid,json.dumps(meta or {},ensure_ascii=False),now()))

class OTPRequest(BaseModel): phone: str = Field(pattern=r'^09\d{9}$')
class OTPVerify(BaseModel): phone: str = Field(pattern=r'^09\d{9}$'); code: str = Field(min_length=4,max_length=8); full_name: Optional[str]=None
class ListingIn(BaseModel):
    model_config=ConfigDict(extra='allow')
    is_tender: bool=False; org_name: Optional[str]=None; category: str; province: str; city: str; title: str=Field(min_length=1,max_length=200); description: Optional[str]=Field(default=None,max_length=2000); phone: Optional[str]=None; answer_mode: str='self'; postal_code: Optional[str]=None; data: dict[str,Any]=Field(default_factory=dict)
class RejectIn(BaseModel): reason: str=Field(min_length=1,max_length=500)
class ContractIn(BaseModel): partyA: str; partyB: str; percent: float=Field(ge=0,le=100); partyANational: Optional[str]=None; partyBNational: Optional[str]=None; partyBPhone: Optional[str]=None
class VisitIn(BaseModel): scheduled_at: Optional[int]=None; note: Optional[str]=Field(default=None,max_length=1000)
class MessageIn(BaseModel): recipient_id: str; listing_id: Optional[str]=None; body: str=Field(min_length=1,max_length=4000)
class SubscriptionIn(BaseModel): endpoint: str=Field(min_length=1,max_length=4096); subscription: dict[str,Any]=Field(default_factory=dict)

@app.get('/api/health')
def health(): return {'ok':True,'version':APP_VERSION,'environment':ENV}
@app.get('/api/property-schemas')
def schemas():
    return {'version':APP_VERSION,'types':{
        'residential':['area','rooms','floor','parking','storage','elevator','yearBuilt'],
        'agricultural_land':['area','landUse','waterSource','waterRights','riserCount','pressureIrrigation','dedicatedTransformer','pumpCount','seasonalPumpingCapacity'],
        'commercial':['area','floor','parking','yearBuilt'], 'office':['area','rooms','floor','parking','elevator'],
        'warehouse':['area','ceilingHeight','loadingAccess','power'], 'workshop':['area','power','accessRoadWidth'],
        'industrial':['landArea','buildArea','power','gas','accessRoadWidth'], 'garden':['area','waterSource','trees','buildingArea'], 'land':['area','landUse']}}

@app.post('/api/auth/otp/request')
def otp_request(x: OTPRequest):
    # Production deliberately fails closed until a real SMS/OTP provider is configured.
    # Development/test may inject KHB_DEV_OTP explicitly; no fixed OTP exists in source.
    if ENV == 'production':
        raise HTTPException(503,'سرویس ارسال OTP در محیط عملیاتی پیکربندی نشده است')
    if not DEV_OTP or not DEV_OTP.isdigit() or not 4 <= len(DEV_OTP) <= 8:
        raise HTTPException(503,'OTP توسعه‌ای تنظیم نشده است')
    c=db(); c.execute('UPDATE otp_codes SET used=1 WHERE phone=? AND used=0',(x.phone,));
    c.execute('INSERT INTO otp_codes(phone,code_hash,expires_at) VALUES(?,?,?)',(x.phone,hash_secret(DEV_OTP),now()+300)); c.commit(); c.close()
    return {'ok':True,'dev_code':DEV_OTP}
@app.post('/api/auth/otp/verify')
def otp_verify(x: OTPVerify):
    c=db(); r=c.execute('SELECT * FROM otp_codes WHERE phone=? AND used=0 ORDER BY id DESC LIMIT 1',(x.phone,)).fetchone()
    if not r or r['expires_at']<now() or not verify_secret(x.code,r['code_hash']): c.close(); raise HTTPException(401,'کد OTP نامعتبر است')
    c.execute('UPDATE otp_codes SET used=1 WHERE id=?',(r['id'],)); u=c.execute('SELECT * FROM users WHERE phone=?',(x.phone,)).fetchone()
    if not u:
        u={'id':uid(),'phone':x.phone,'full_name':x.full_name,'role':'applicant'}; c.execute('INSERT INTO users(id,phone,full_name,role,created_at) VALUES(?,?,?,?,?)',(u['id'],u['phone'],u['full_name'],u['role'],now()))
    elif x.full_name: c.execute('UPDATE users SET full_name=? WHERE id=?',(x.full_name,u['id'])); u=c.execute('SELECT * FROM users WHERE id=?',(u['id'],)).fetchone()
    c.commit(); c.close(); return {'access_token':token_for(u),'token_type':'bearer','user':dict(u)}
@app.get('/api/auth/me')
def me(u=Depends(auth)): return dict(u)

@app.get('/api/listings')
def list_listings(province:Optional[str]=None,city:Optional[str]=None,category:Optional[str]=None,status:Optional[str]=None,priceMin:Optional[int]=None,priceMax:Optional[int]=None,areaMin:Optional[float]=None,areaMax:Optional[float]=None,rooms:Optional[int]=None,includeMine:bool=False,u=Depends(optional_auth)):
    c=db(); q='SELECT * FROM listings WHERE 1=1'; a=[]
    privileged=bool(u and u['role']=='operator')
    mine_mode=bool(u and includeMine)
    if privileged:
        if status in ('draft','pending','approved','rejected'): q+=' AND status=?';a.append(status)
        else: q+=" AND status='approved'"
    elif mine_mode:
        q+=' AND user_id=?'; a.append(u['id'])
        if status in ('draft','pending','approved','rejected'): q+=' AND status=?';a.append(status)
    else:
        q+=" AND status='approved'"
    for col,val in [('province',province),('city',city),('category',category)]:
        if val: q+=f' AND {col}=?';a.append(val)
    if not privileged: q+=" AND is_tender=0 AND status='approved'"
    rows=c.execute(q+' ORDER BY created_at DESC LIMIT 500',a).fetchall(); c.close()
    out=[]
    for r in rows:
        d=json.loads(r['data_json']); pr=d.get('pricing',{}); st=d.get('structural',{}); area=st.get('landArea') or d.get('landInfo',{}).get('area')
        if priceMin is not None and (pr.get('total') is None or pr.get('total')<priceMin): continue
        if priceMax is not None and (pr.get('total') is None or pr.get('total')>priceMax): continue
        if areaMin is not None and (area is None or float(area)<areaMin): continue
        if areaMax is not None and (area is None or float(area)>areaMax): continue
        if rooms is not None and st.get('rooms')!=rooms: continue
        out.append(public_listing(r,u['id']))
    return {'items':out,'count':len(out)}

def public_listing(r,uid0=None):
    d=json.loads(r['data_json'])
    mine=bool(uid0 and r['user_id']==uid0)
    if not mine:
        d=dict(d); d.pop('identity',None)
        # Internal document/data groups must not be exposed to anonymous users.
        if isinstance(d.get('property'),dict):
            d['property']={k:v for k,v in d['property'].items() if k not in ('identity','national','birth','sana')}
    x={'id':r['id'],'isTender':bool(r['is_tender']),'orgName':r['org_name'],'category':r['category'],'province':r['province'],'city':r['city'],'title':r['title'],'desc':r['description'],'phone':r['phone'] if mine else None,'answerMode':r['answer_mode'],'postalCode':r['postal_code'],'status':r['status'],'rejectReason':r['reject_reason'] if mine else None,'publishCode':r['publish_code'] if mine else None,'createdAt':r['created_at'],'data':d}
    if mine: x['__mine']=True; x['ownerUserId']=r['user_id']
    return x

@app.get('/api/listings/{listing_id}')
def get_listing(listing_id:str,u=Depends(optional_auth)):
    c=db(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone(); c.close()
    if not r: raise HTTPException(404,'آگهی یافت نشد')
    if r['status']!='approved' and (not u or (r['user_id']!=u['id'] and u['role']!='operator')): raise HTTPException(403,'دسترسی مجاز نیست')
    return public_listing(r,u['id'] if u else None)
@app.post('/api/listings')
def create_listing(x:ListingIn,u=Depends(role('applicant','operator','org'))):
    if x.phone and not __import__('re').match(r'^09\d{9}$',x.phone): raise HTTPException(422,'شماره موبایل نامعتبر است')
    c=db(); lid=uid(); t=now(); d=x.data.copy(); d.update({'structural':d.get('structural',{}),'pricing':d.get('pricing',{}),'property':d.get('property',{}),'identity':d.get('identity',{})})
    c.execute('INSERT INTO listings(id,user_id,is_tender,org_name,category,province,city,title,description,phone,answer_mode,postal_code,status,reject_reason,publish_code,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(lid,u['id'],int(x.is_tender),x.org_name,x.category,x.province,x.city,x.title,x.description,x.phone,x.answer_mode,x.postal_code,'pending',None,None,json.dumps(d,ensure_ascii=False),t,t)); audit(c,u['id'],'listing.create','listing',lid); c.execute('INSERT INTO property_history(listing_id,actor_id,action,data_json,created_at) VALUES(?,?,?,?,?)',(lid,u['id'],'created',json.dumps(d,ensure_ascii=False),t)); c.commit(); r=c.execute('SELECT * FROM listings WHERE id=?',(lid,)).fetchone(); c.close(); return public_listing(r,u['id'])
@app.patch('/api/listings/{listing_id}')
def update_listing(listing_id:str,x:ListingIn,u=Depends(auth)):
    c=db(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone()
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    if r['user_id']!=u['id'] and u['role']!='operator': c.close(); raise HTTPException(403,'دسترسی مجاز نیست')
    if u['role']!='operator' and r['status'] not in ('draft','rejected'): c.close(); raise HTTPException(409,'در وضعیت فعلی قابل ویرایش نیست')
    d=x.data; c.execute('UPDATE listings SET category=?,province=?,city=?,title=?,description=?,phone=?,answer_mode=?,postal_code=?,data_json=?,status=?,reject_reason=NULL,updated_at=? WHERE id=?',(x.category,x.province,x.city,x.title,x.description,x.phone,x.answer_mode,x.postal_code,json.dumps(d,ensure_ascii=False),'pending',now(),listing_id)); audit(c,u['id'],'listing.update','listing',listing_id); c.commit(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone(); c.close(); return public_listing(r,u['id'])

@app.get('/api/operator/listings')
def operator_list(status:Optional[str]=None,u=Depends(role('operator'))):
    c=db(); q='SELECT * FROM listings'; a=[]
    if status: q+=' WHERE status=?';a=[status]
    rows=c.execute(q+' ORDER BY created_at DESC LIMIT 1000',a).fetchall(); c.close(); return {'items':[public_listing(r,u['id']) for r in rows]}
@app.post('/api/operator/listings/{listing_id}/approve')
def approve(listing_id:str,u=Depends(role('operator'))):
    c=db(); code='KB-'+secrets.token_hex(4).upper(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone()
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    c.execute("UPDATE listings SET status='approved',publish_code=?,updated_at=? WHERE id=?",(code,now(),listing_id)); audit(c,u['id'],'listing.approve','listing',listing_id); c.commit(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone(); c.close(); return public_listing(r,u['id'])
@app.post('/api/operator/listings/{listing_id}/reject')
def reject(listing_id:str,x:RejectIn,u=Depends(role('operator'))):
    c=db(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone();
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    c.execute("UPDATE listings SET status='rejected',reject_reason=?,updated_at=? WHERE id=?",(x.reason,now(),listing_id)); audit(c,u['id'],'listing.reject','listing',listing_id,{'reason':x.reason}); c.commit(); c.close(); return {'ok':True}
@app.post('/api/operator/listings/{listing_id}/contract')
def contract(listing_id:str,x:ContractIn,u=Depends(role('operator'))):
    c=db(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone();
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    cid=uid(); c.execute('INSERT INTO contracts(id,listing_id,party_a,party_b,party_a_national,party_b_national,party_b_phone,percent,created_at) VALUES(?,?,?,?,?,?,?,?,?)',(cid,listing_id,x.partyA,x.partyB,x.partyANational,x.partyBNational,x.partyBPhone,x.percent,now())); c.execute("UPDATE users SET deals_count=deals_count+1 WHERE id=(SELECT user_id FROM listings WHERE id=?)",(listing_id,)); audit(c,u['id'],'contract.create','contract',cid,{'listing_id':listing_id}); c.commit(); c.close(); return {'id':cid,'listing_id':listing_id,'partyA':x.partyA,'partyB':x.partyB,'percent':x.percent}

@app.post('/api/favorites/{listing_id}')
def favorite(listing_id:str,u=Depends(auth)):
    c=db(); r=c.execute('SELECT id,status FROM listings WHERE id=?',(listing_id,)).fetchone();
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    c.execute('INSERT OR IGNORE INTO favorites VALUES(?,?,?)',(u['id'],listing_id,now())); c.commit(); c.close(); return {'ok':True}
@app.delete('/api/favorites/{listing_id}')
def unfavorite(listing_id:str,u=Depends(auth)):
    c=db(); c.execute('DELETE FROM favorites WHERE user_id=? AND listing_id=?',(u['id'],listing_id)); c.commit(); c.close(); return {'ok':True}
@app.get('/api/favorites')
def favorites(u=Depends(auth)):
    c=db(); rows=c.execute('SELECT l.* FROM listings l JOIN favorites f ON f.listing_id=l.id WHERE f.user_id=? ORDER BY f.created_at DESC',(u['id'],)).fetchall(); c.close(); return {'items':[public_listing(r,u['id']) for r in rows]}

@app.post('/api/visits/{listing_id}')
def visit(listing_id:str,x:VisitIn,u=Depends(auth)):
    c=db(); r=c.execute('SELECT * FROM listings WHERE id=?',(listing_id,)).fetchone();
    if not r or r['status']!='approved': c.close(); raise HTTPException(404,'آگهی قابل بازدید نیست')
    vid=uid(); c.execute('INSERT INTO visits VALUES(?,?,?,?,?,?)',(vid,u['id'],listing_id,now(),x.scheduled_at,'requested',x.note)); c.commit(); c.close(); return {'id':vid,'status':'requested'}
@app.get('/api/visits')
def visits(u=Depends(auth)):
    c=db(); rows=c.execute('SELECT * FROM visits WHERE user_id=? ORDER BY requested_at DESC',(u['id'],)).fetchall(); c.close(); return {'items':[dict(r) for r in rows]}

@app.post('/api/messages')
def send_message(x:MessageIn,u=Depends(auth)):
    if x.recipient_id==u['id']: raise HTTPException(400,'گیرنده نمی‌تواند خود کاربر باشد')
    c=db(); exists=c.execute('SELECT id FROM users WHERE id=?',(x.recipient_id,)).fetchone();
    if not exists: c.close(); raise HTTPException(404,'گیرنده یافت نشد')
    if x.listing_id:
        lr=c.execute('SELECT id,status,user_id FROM listings WHERE id=?',(x.listing_id,)).fetchone()
        if not lr or lr['status']!='approved' or (lr['user_id'] not in (u['id'],x.recipient_id)):
            c.close(); raise HTTPException(403,'ارتباط با این آگهی مجاز نیست')
    mid=uid(); c.execute('INSERT INTO messages VALUES(?,?,?,?,?,?,?)',(mid,u['id'],x.recipient_id,x.listing_id,x.body,now(),None)); c.commit(); c.close(); return {'id':mid}
@app.get('/api/messages')
def messages(u=Depends(auth)):
    c=db(); rows=c.execute('SELECT * FROM messages WHERE sender_id=? OR recipient_id=? ORDER BY created_at DESC LIMIT 500',(u['id'],u['id'])).fetchall(); c.close(); return {'items':[dict(r) for r in rows]}

@app.post('/api/notifications/subscribe')
def subscribe(x:SubscriptionIn,u=Depends(auth)):
    c=db(); sid=uid(); c.execute('INSERT INTO notification_subscriptions VALUES(?,?,?,?,?)',(sid,u['id'],x.endpoint,json.dumps(x.subscription,ensure_ascii=False),now())); c.commit(); c.close(); return {'id':sid}
@app.get('/api/settings/contact')
def contact():
    c=db(); r=c.execute("SELECT value_json FROM app_settings WHERE key='contact'").fetchone(); c.close(); return json.loads(r['value_json']) if r else {'phone':'','email':'','address':''}

@app.post('/api/listings/{listing_id}/documents/{doc_type}')
async def upload_document(listing_id:str,doc_type:str,file:UploadFile=File(...),u=Depends(auth)):
    if doc_type not in {'identity','property'}: raise HTTPException(400,'نوع سند نامعتبر است')
    c=db(); r=c.execute('SELECT user_id FROM listings WHERE id=?',(listing_id,)).fetchone();
    if not r: c.close(); raise HTTPException(404,'آگهی یافت نشد')
    if r['user_id']!=u['id'] and u['role']!='operator': c.close(); raise HTTPException(403,'دسترسی مجاز نیست')
    data=await file.read(MAX_UPLOAD+1)
    if len(data)>MAX_UPLOAD: c.close(); raise HTTPException(413,'حجم فایل بیش از حد مجاز است')
    ext=Path(file.filename or '').suffix.lower();
    allowed={'.jpg':{'image/jpeg'},'.jpeg':{'image/jpeg'},'.png':{'image/png'},'.webp':{'image/webp'},'.pdf':{'application/pdf'}}
    if ext not in allowed or (file.content_type and file.content_type not in allowed[ext]):
        c.close(); raise HTTPException(415,'نوع فایل مجاز نیست')
    signatures={'.jpg':(b'\xff\xd8\xff',),'.jpeg':(b'\xff\xd8\xff',),'.png':(b'\x89PNG\r\n\x1a\n',),'.pdf':(b'%PDF-',)}
    if ext in signatures and not any(data.startswith(sig) for sig in signatures[ext]):
        c.close(); raise HTTPException(415,'محتوای فایل با پسوند آن سازگار نیست')
    if ext=='.webp' and not (len(data)>=12 and data[:4]==b'RIFF' and data[8:12]==b'WEBP'):
        c.close(); raise HTTPException(415,'محتوای فایل WebP نامعتبر است')
    out=UPLOAD_DIR/f'{listing_id}_{uuid.uuid4().hex}{ext}'; out.write_bytes(data); audit(c,u['id'],'document.upload','listing',listing_id,{'type':doc_type,'file':out.name}); c.commit(); c.close(); return {'ok':True,'filename':out.name}

@app.get('/api/audit/{listing_id}')
def audit_listing(listing_id:str,u=Depends(role('operator'))):
    c=db(); rows=c.execute('SELECT * FROM audit_logs WHERE object_id=? ORDER BY created_at DESC',(listing_id,)).fetchall(); c.close(); return {'items':[dict(r) for r in rows]}


# ============================ v0.8 — بایگانی آگهی‌دهنده / رتبه / فایل‌ها / جستجوی خارجی ============================
from urllib.parse import quote_plus

@app.get('/api/users/{user_id}/public')
def user_public_profile(user_id:str):
    """F15: پروفایل عمومی آگهی‌دهنده — نام، عکس و رتبه ستاره‌ای بر اساس تعداد معاملات."""
    c=db(); u=c.execute('SELECT id,full_name,avatar,deals_count,created_at FROM users WHERE id=?',(user_id,)).fetchone(); c.close()
    if not u: raise HTTPException(404,'کاربر یافت نشد')
    d=dict(u); d['stars']=min(5,int(d.get('deals_count') or 0)); return d

@app.post('/api/users/me/avatar')
async def upload_avatar(file:UploadFile=File(...),u=Depends(auth)):
    """F14: عکس پروفایل کارشناس فروش (همان آگهی‌دهنده)."""
    data=await file.read(MAX_UPLOAD+1)
    if len(data)>MAX_UPLOAD: raise HTTPException(413,'حجم فایل بیش از حد مجاز است')
    ext=Path(file.filename or '').suffix.lower()
    if ext not in {'.jpg','.jpeg','.png','.webp'}: raise HTTPException(415,'فقط تصویر مجاز است')
    out=UPLOAD_DIR/f'avatar_{u["id"]}{ext}'; out.write_bytes(data)
    c=db(); c.execute('UPDATE users SET avatar=? WHERE id=?',(out.name,u['id'])); c.commit(); c.close()
    return {'ok':True,'avatar':out.name}

@app.get('/api/files/{name}')
def serve_upload(name:str):
    """سرو امن فایل‌های بارگذاری‌شده (بدون پیمایش مسیر)."""
    safe=Path(name).name
    f=UPLOAD_DIR/safe
    if not f.exists(): raise HTTPException(404,'فایل یافت نشد')
    return FileResponse(f)

@app.get('/api/external/search-links')
def external_search_links(q:str=Query('',max_length=200), city:str=Query('',max_length=100)):
    """F23: لینک‌های جستجو در گوگل و سایت‌های املاک.
    توجه: گردآوری خودکار (scraping) محتوای سایت‌های ثالث بدون مجوز رسمی مجاز نیست؛
    این endpoint فقط لینک جستجو برمی‌گرداند و نتیجه در سایت مقصد باز می‌شود."""
    term=(q+' '+city).strip() or 'آگهی ملک'
    return {'items':[
        {'source':'گوگل','url':'https://www.google.com/search?q='+quote_plus(term)},
        {'source':'دیوار','url':'https://divar.ir/s/v2/?q='+quote_plus(term)},
        {'source':'شیپور','url':'https://sheypoor.com/search?q='+quote_plus(term)},
    ]}
