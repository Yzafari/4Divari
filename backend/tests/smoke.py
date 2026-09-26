import os,sys,tempfile
from pathlib import Path
os.environ['KHB_DATA_DIR']=tempfile.mkdtemp(); os.environ['KHB_UPLOAD_DIR']=tempfile.mkdtemp(); os.environ['KHB_DEV_OTP']='123456'; os.environ['KHB_JWT_SECRET']='smoke-secret-012345678901234567890123456789'
sys.path.insert(0,str(Path(__file__).resolve().parents[1])); from fastapi.testclient import TestClient
from app.main import app
c=TestClient(app)
assert c.get('/api/health').json()['ok']
assert c.get('/api/health').json()['version']=='0.7.2'
assert c.get('/api/listings').status_code==200
for phone in ['09120000001','09120000002']:
    assert c.post('/api/auth/otp/request',json={'phone':phone}).status_code==200
r=c.post('/api/auth/otp/verify',json={'phone':'09120000001','code':'123456','full_name':'User 1'}); assert r.status_code==200; t1=r.json()['access_token']
r=c.post('/api/auth/otp/verify',json={'phone':'09120000002','code':'123456','full_name':'User 2'}); assert r.status_code==200; t2=r.json()['access_token']
h1={'Authorization':'Bearer '+t1}; h2={'Authorization':'Bearer '+t2}
r=c.post('/api/listings',headers=h1,json={'category':'residential','province':'کرمانشاه','city':'کرمانشاه','title':'Private','description':'x','data':{'pricing':{'total':100},'structural':{'rooms':2,'landArea':100}}}); assert r.status_code==200; lid=r.json()['id']
assert c.get('/api/listings/'+lid,headers=h2).status_code==403
assert all(x['id'] != lid for x in c.get('/api/listings?status=pending',headers=h2).json()['items'])
# operator seed directly
from app.main import db,hash_secret
con=db(); con.execute("INSERT INTO users(id,phone,full_name,role,created_at) VALUES(?,?,?,?,?)",('op','09120000003','Operator','operator',0)); con.commit(); con.close()
r=c.post('/api/auth/otp/request',json={'phone':'09120000003'}); assert r.status_code==200
r=c.post('/api/auth/otp/verify',json={'phone':'09120000003','code':'123456'}); assert r.status_code==200; ho={'Authorization':'Bearer '+r.json()['access_token']}
r=c.post('/api/operator/listings/'+lid+'/approve',headers=ho); assert r.status_code==200
assert c.get('/api/listings/'+lid,headers=h2).status_code==200
print('BACKEND_SMOKE_OK')
