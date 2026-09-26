/* ============================ داده‌های پایه ============================ */
const CATEGORIES = [
  {id:'warehouse_rent', label:'انبار برای اجاره', ic:'📦', kind:'commercial', rent:true, subtype:'warehouse'},
  {id:'warehouse_sale', label:'انبار برای فروش', ic:'🏚️', kind:'commercial', rent:false, subtype:'warehouse'},
  {id:'workshop_rent', label:'کارگاه برای اجاره', ic:'🛠️', kind:'commercial', rent:true, subtype:'workshop'},
  {id:'workshop_sale', label:'کارگاه برای فروش', ic:'🔧', kind:'commercial', rent:false, subtype:'workshop'},
  {id:'rent_year', label:'خانه برای کرایه یک‌ساله', ic:'🏠', kind:'house', rent:true},
  {id:'rent_short', label:'خانه برای کرایه کوتاه‌مدت', ic:'🛎️', kind:'house', rent:true},
  {id:'sale_house', label:'خانه برای فروش', ic:'🔑', kind:'house', rent:false},
  {id:'land_residential', label:'زمین مسکونی برای ساخت‌وساز', ic:'📐', kind:'land', rent:false},
  {id:'land_agri_sale', label:'زمین کشاورزی برای فروش', ic:'🌱', kind:'land', rent:false},
  {id:'land_agri_rent', label:'زمین کشاورزی برای اجاره', ic:'🌾', kind:'land', rent:true},
  {id:'commercial_rent', label:'واحد تجاری برای اجاره', ic:'🏪', kind:'commercial', rent:true},
  {id:'commercial_sale', label:'واحد تجاری برای فروش', ic:'🏬', kind:'commercial', rent:false},
  {id:'office_rent', label:'دفتر / اداری برای اجاره', ic:'💼', kind:'commercial', rent:true},
  {id:'office_sale', label:'دفتر / اداری برای فروش', ic:'🏢', kind:'commercial', rent:false},
  {id:'industrial', label:'ملک / زمین صنعتی', ic:'🏭', kind:'commercial', rent:false},
  {id:'garden', label:'باغ و باغچه', ic:'🌳', kind:'land', rent:false},
  {id:'partnership', label:'پروژه‌های مشارکتی', ic:'🤝', kind:'other', rent:false},
  {id:'other', label:'سایر پروژه‌ها', ic:'📁', kind:'other', rent:false},
];
const TENDER_CATEGORIES = [
  {id:'t_building', label:'ساختمان', ic:'🏢'},
  {id:'t_land_residential', label:'زمین مسکونی', ic:'📐'},
  {id:'t_land_agri', label:'زمین کشاورزی', ic:'🌾'},
];
const findCat = (id, list) => (list||CATEGORIES).find(c=>c.id===id);
const catLabel = (id, list) => (findCat(id,list)||{}).label || id;
const catIcon = (id, list) => (findCat(id,list)||{}).ic || '📁';
const catInfo = id => findCat(id, CATEGORIES) || {kind:'other', rent:false};

/* فهرست شهرستان‌های هر استان — تا حد امکان کامل بر اساس آخرین تقسیمات شناخته‌شده.
   توجه: تقسیمات کشوری گاهی تغییر می‌کند (شهرستان‌های جدید ایجاد می‌شوند)؛
   پیش از انتشار نهایی، بهتر است این فهرست توسط اپراتور با منبع رسمی وزارت کشور تطبیق داده شود. */
const PROVINCES = {
  'آذربایجان شرقی':['تبریز','آذرشهر','اسکو','اهر','بستان‌آباد','بناب','جلفا','چاراویماق','خداآفرین','سراب','شبستر','عجب‌شیر','کلیبر','مراغه','مرند','ملکان','میانه','هریس','هشترود','ورزقان'],
  'آذربایجان غربی':['ارومیه','اشنویه','بوکان','پلدشت','پیرانشهر','تکاب','چایپاره','چالدران','خوی','سردشت','سلماس','شاهین‌دژ','ماکو','مهاباد','میاندوآب','نقده'],
  'اردبیل':['اردبیل','بیله‌سوار','پارس‌آباد','خلخال','کوثر','گرمی','مشگین‌شهر','نمین','نیر','سرعین'],
  'اصفهان':['اصفهان','آران و بیدگل','اردستان','برخوار','تیران و کرون','چادگان','خمینی‌شهر','خوانسار','دهاقان','سمیرم','شاهین‌شهر و میمه','شهرضا','فریدن','فریدون‌شهر','فلاورجان','کاشان','گلپایگان','لنجان','مبارکه','نائین','نجف‌آباد','نطنز'],
  'البرز':['کرج','اشتهارد','ساوجبلاغ','طالقان','فردیس','نظرآباد'],
  'ایلام':['ایلام','آبدانان','ایوان','بدره','چرداول','دره‌شهر','دهلران','زرین‌آباد','سیروان','ملکشاهی'],
  'بوشهر':['بوشهر','تنگستان','جم','دشتستان','دشتی','دیر','دیلم','کنگان','گناوه'],
  'تهران':['تهران','اسلامشهر','بهارستان','پاکدشت','پردیس','دماوند','رباط‌کریم','ری','شمیرانات','شهریار','فیروزکوه','قدس','ملارد','ورامین'],
  'چهارمحال و بختیاری':['شهرکرد','اردل','بروجن','فارسان','کوهرنگ','کیار','لردگان','بن','سامان'],
  'خراسان جنوبی':['بیرجند','بشرویه','خوسف','درمیان','زیرکوه','سرایان','سربیشه','فردوس','قاین','نهبندان'],
  'خراسان رضوی':['مشهد','بجستان','بردسکن','تایباد','تربت‌جام','تربت‌حیدریه','چناران','خلیل‌آباد','خواف','درگز','رشتخوار','زبرخان','سبزوار','سرخس','فریمان','فیض‌آباد','قوچان','کاشمر','کلات','گناباد','مه‌ولات','نیشابور'],
  'خراسان شمالی':['بجنورد','اسفراین','جاجرم','رازوجرگلان','شیروان','فاروج','گرمه','مانه و سملقان'],
  'خوزستان':['اهواز','آبادان','امیدیه','اندیکا','اندیمشک','ایذه','باغ‌ملک','بندر ماهشهر','بهبهان','خرمشهر','دزفول','دشت آزادگان','رامشیر','رامهرمز','شادگان','شوش','شوشتر','گتوند','لالی','مسجدسلیمان','هندیجان','هویزه','کارون'],
  'زنجان':['زنجان','ابهر','ایجرود','خدابنده','خرمدره','طارم','ماه‌نشان'],
  'سمنان':['سمنان','دامغان','شاهرود','گرمسار','مهدی‌شهر','میامی'],
  'سیستان و بلوچستان':['زاهدان','ایرانشهر','چابهار','خاش','دلگان','زابل','زهک','سراوان','سرباز','سیب و سوران','فنوج','قصرقند','کنارک','مهرستان','میرجاوه','نیک‌شهر','هامون','هیرمند'],
  'فارس':['شیراز','آباده','ارسنجان','استهبان','اقلید','بوانات','بیضا','پاسارگاد','جهرم','جویم','خرم‌بید','خنج','داراب','رستم','زرین‌دشت','سپیدان','سروستان','فراشبند','فسا','فیروزآباد','قیروکارزین','کازرون','کوار','کوه‌چنار','گراش','لارستان','لامرد','مرودشت','ممسنی','مهر','نی‌ریز'],
  'قزوین':['قزوین','آبیک','البرز','آوج','بوئین‌زهرا','تاکستان'],
  'قم':['قم'],
  'کردستان':['سنندج','بانه','بیجار','دهگلان','دیواندره','سروآباد','سقز','قروه','کامیاران','مریوان'],
  'کرمان':['کرمان','ارزوئیه','انار','بافت','بردسیر','بم','جیرفت','رابر','راور','رفسنجان','رودبار جنوب','ریگان','زرند','سیرجان','شهربابک','عنبرآباد','فهرج','قلعه‌گنج','کهنوج','کوهبنان','منوجان','نرماشیر','ماهان'],
  'کرمانشاه':['کرمانشاه','اسلام‌آباد غرب','پاوه','ثلاث باباجانی','جوانرود','دالاهو','روانسر','سرپل ذهاب','سنقر','صحنه','قصر شیرین','کنگاور','گیلان‌غرب','هرسین'],
  'کهگیلویه و بویراحمد':['یاسوج','باشت','بویراحمد','بهمئی','چاروسا','دنا','گچساران','کهگیلویه','لنده'],
  'گلستان':['گرگان','آزادشهر','آق‌قلا','بندر ترکمن','رامیان','علی‌آباد کتول','کردکوی','کلاله','گالیکش','گمیشان','گنبد کاووس','مراوه‌تپه','مینودشت'],
  'گیلان':['رشت','آستارا','آستانه‌اشرفیه','املش','بندرانزلی','رستم‌آباد','رودبار','رودسر','سیاهکل','شفت','صومعه‌سرا','طوالش','فومن','لاهیجان','لنگرود','ماسال'],
  'لرستان':['خرم‌آباد','ازنا','الیگودرز','بروجرد','چگنی','دورود','دلفان','رومشکان','سلسله','کوهدشت','پل‌دختر','دوره‌چگنی'],
  'مازندران':['ساری','آمل','بابل','بابلسر','بندپی','بهشهر','تنکابن','جویبار','چالوس','رامسر','سوادکوه','عباس‌آباد','قائم‌شهر','کلاردشت','گلوگاه','میاندورود','نکا','نور','نوشهر'],
  'مرکزی':['اراک','آشتیان','تفرش','خمین','خنداب','دلیجان','زرندیه','ساوه','شازند','فراهان','کمیجان','محلات'],
  'هرمزگان':['بندرعباس','بستک','بشاگرد','بندر لنگه','پارسیان','جاسک','حاجی‌آباد','خمیر','رودان','قشم','میناب','ابوموسی','سیریک'],
  'همدان':['همدان','اسدآباد','بهار','تویسرکان','رزن','فامنین','کبودراهنگ','ملایر','نهاوند'],
  'یزد':['یزد','ابرکوه','اردکان','بافق','بهاباد','تفت','خاتم','صدوق','مهریز','میبد'],
};
const PROVINCE_COORDS = {
  'تهران':[35.6892,51.3890],'البرز':[35.8400,50.9391],'آذربایجان شرقی':[38.0800,46.2919],
  'آذربایجان غربی':[37.5527,45.0761],'اردبیل':[38.2498,48.2933],'اصفهان':[32.6546,51.6680],
  'ایلام':[33.6374,46.4227],'بوشهر':[28.9234,50.8203],'چهارمحال و بختیاری':[32.3257,50.8642],
  'خراسان جنوبی':[32.8649,59.2262],'خراسان رضوی':[36.2605,59.6168],'خراسان شمالی':[37.4747,57.3290],
  'خوزستان':[31.3183,48.6706],'زنجان':[36.6736,48.4787],'سمنان':[35.5729,53.3971],
  'سیستان و بلوچستان':[29.4963,60.8629],'فارس':[29.5918,52.5837],'قزوین':[36.2688,50.0041],
  'قم':[34.6416,50.8746],'کردستان':[35.3219,46.9862],'کرمان':[30.2839,57.0834],
  'کرمانشاه':[34.3277,47.0778],'کهگیلویه و بویراحمد':[30.6683,51.5878],'گلستان':[36.8393,54.4342],
  'گیلان':[37.2809,49.5832],'لرستان':[33.4878,48.3558],'مازندران':[36.5633,53.0601],
  'مرکزی':[34.0917,49.6892],'هرمزگان':[27.1832,56.2666],'همدان':[34.7992,48.5146],'یزد':[31.8974,54.3569],
};

/* v0.7.2 — جغرافیای داخلی و بین‌المللی */
const COUNTRIES = [
  {id:'IR',name:'ایران',flag:'🇮🇷'},
  {id:'TR',name:'ترکیه',flag:'🇹🇷'},
  {id:'IQ',name:'عراق',flag:'🇮🇶'},
  {id:'AZ',name:'آذربایجان',flag:'🇦🇿'},
  {id:'AM',name:'ارمنستان',flag:'🇦🇲'},
  {id:'GE',name:'گرجستان',flag:'🇬🇪'},
  {id:'TM',name:'ترکمنستان',flag:'🇹🇲'},
  {id:'AF',name:'افغانستان',flag:'🇦🇫'},
  {id:'PK',name:'پاکستان',flag:'🇵🇰'}
];
const countryById=id=>COUNTRIES.find(x=>x.id===id)||COUNTRIES[0];
const countryLabel=id=>countryById(id).name;

const HERO_SLIDES = [
  {ic:'⌂', title:'۴ دیواری؛ املاکی آنلاین شما', text:'فروش، اجاره و جست‌وجوی ملک را در یک فضای ساده و قابل توسعه انجام دهید.'},
  {ic:'⌖', title:'چند شهر و چند استان، هم‌زمان', text:'می‌توانید چند شهرستان یا استان را هم‌زمان انتخاب کنید و نتایج را یکجا ببینید.'},
  {ic:'🌍', title:'جست‌وجوی ملک در کشورهای همجوار', text:'برای سفر و اقامت، آگهی‌های اجاره کوتاه‌مدت در کشورهایی مانند ترکیه و عراق نیز قابل ثبت و جست‌وجو هستند.'},
  {ic:'🔒', title:'حریم خصوصی از ابتدا', text:'مدارک هویتی و مالکیتی از اطلاعات عمومی آگهی جدا نگهداری می‌شوند؛ اتصال امن سرور و احراز هویت واقعی در نسخه عملیاتی تکمیل می‌شود.'},
];
const ABOUT_TEXT = `۴ دیواری یک بستر املاک برای ثبت، جست‌وجو و مدیریت آگهی‌های فروش، اجاره و اجاره کوتاه‌مدت است. در این نسخه، بخشی از داده‌ها نمونه و محلی هستند تا رابط کاربری و مسیرهای اصلی برنامه آزمایش شوند.
در نسخه عملیاتی، احراز هویت، ذخیره‌سازی امن مدارک، پرداخت، پیام‌رسانی و کنترل انتشار باید از طریق Backend امن و سرویس‌های واقعی پیاده‌سازی و قبل از انتشار عمومی آزموده شوند.
کاربر می‌تواند چند استان، چند شهرستان یا چند کشور را هم‌زمان انتخاب کند و نتایج را در یک فهرست واحد ببیند.`;

/* ============================ عدد به حروف ============================ */
const YEKAN=['','یک','دو','سه','چهار','پنج','شش','هفت','هشت','نه'];
const DAHGAN=['','ده','بیست','سی','چهل','پنجاه','شصت','هفتاد','هشتاد','نود'];
const DAHYEK=['ده','یازده','دوازده','سیزده','چهارده','پانزده','شانزده','هفده','هجده','نوزده'];
const SADGAN=['','یکصد','دویست','سیصد','چهارصد','پانصد','ششصد','هفتصد','هشتصد','نهصد'];
const MAGNITUDE=['','هزار','میلیون','میلیارد','هزار میلیارد'];
function threeDigitWords(n){
  n=parseInt(n); if(!n) return '';
  let parts=[]; const sad=Math.floor(n/100), rest=n%100;
  if(sad) parts.push(SADGAN[sad]);
  if(rest>=10 && rest<20) parts.push(DAHYEK[rest-10]);
  else{ const dah=Math.floor(rest/10), yek=rest%10; if(dah) parts.push(DAHGAN[dah]); if(yek) parts.push(YEKAN[yek]); }
  return parts.join(' و ');
}
function numberToWordsFa(num){
  num=Math.floor(Math.abs(Number(num))||0);
  if(num===0) return '';
  if(num>999999999999) return 'عدد بسیار بزرگ است';
  let groups=[],n=num;
  while(n>0){ groups.unshift(n%1000); n=Math.floor(n/1000); }
  let parts=[]; const offset=groups.length-1;
  groups.forEach((g,i)=>{ if(!g) return; const w=threeDigitWords(g); const mag=MAGNITUDE[offset-i]; parts.push(w+(mag?' '+mag:'')); });
  return parts.join(' و ') + ' تومان';
}
function parseNum(str){ return parseInt((str||'').toString().replace(/[^\d]/g,''))||0; }
function toFa(n){ const d=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; return (n||'').toString().replace(/\d/g,x=>d[x]); }

/* ============================ حالت برنامه ============================ */
let state = {
  tab:'browse',
  browse:{province:'', city:'', category:'', detailId:null, priceMin:'', priceMax:'', areaMin:'', areaMax:'', rooms:'', countries:[], provinces:[], cities:[]},
  post:{screen:'wizard', step:1, draft:blankDraft(), },
  tenders:{screen:'list', step:1, draft:null, province:'', category:''},
  map:{},
  drawerOpen:false,
  operatorUnlocked:false,
};

function blankDraft(isTender){
  return {
    id:null, isTender:!!isTender, orgName:'',
    country:'IR', category:'', province:'', city:'', title:'', desc:'',
    phone:'', answerMode:'self',
    postalCode:'',
    structural:{ yearBuilt:'', landArea:'', buildArea:'', rooms:'', terrace:'', floor:'', parking:'', storage:'',
      furnished:false,
      elevator:false, elevatorPhotos:[], water:false, power:false, gas:false,
      coolingTypes:[], coolingPhotos:[], heatingTypes:[], heatingPhotos:[], bathArea:'', bathPhotos:[],
      poolArea:'', poolPhotos:[], greenhouseArea:'', greenhousePhotos:[],
      cabinetryPhotos:[], audioPhotos:[], lightingPhotos:[],
      securityTypes:[], securityPhotos:[],
      accessRoadWidth:'', accessRoadType:'',
      strengthTags:[], strengthOther:'', ownerExpectations:'',
      commercialType:'', storefrontWidth:'', ceilingHeight:'', businessLicense:'', dedicatedMeter:false, subtype:'', loadingAccess:'', industrialPower:'', threePhase:false, yardArea:'', crane:false, ventilation:false,
      agri:{irrigationType:'', waterSource:'', riserCount:'', pressureIrrigation:false, dedicatedTransformer:false, pumpCount:'', seasonalPumpReduction:false, waterRightDoc:''}
    },
    landInfo:{ area:'', landUse:'' },
    pricing:{ total:'', perMeter:'', deposit:'', monthly:'' },
    identity:{ national:null, birth:null, sana:null },
    property:{ ownership:[], construction:[], permits:[] },
    dealPhotos:[],
    status:'draft', rejectReason:'', publishCode:'', contract:null, contractPercent:null,
    createdAt:null, __mine:false,
  };
}

/* ============================ ذخیره‌سازی ============================ */
const LKEY='khb_listings_v5', SKEY='khb_settings_v2';
function loadListings(){ try{ return JSON.parse(localStorage.getItem(LKEY))||seedListings(); }catch(e){ return seedListings(); } }
function saveListings(list){ try{ localStorage.setItem(LKEY, JSON.stringify(list)); }catch(e){} }
function loadSettings(){
  try{ return JSON.parse(localStorage.getItem(SKEY))|| defaultSettings(); }
  catch(e){ return defaultSettings(); }
}
function defaultSettings(){
  return { defaultPercent:2, theme:'dark', contact:{address:'', email:'', phone:''} };
}
function saveSettings(s){ try{ localStorage.setItem(SKEY, JSON.stringify(s)); }catch(e){} }

function seedListings(){
  const demo = [
    {cat:'rent_year', province:'تهران', city:'شهریار', title:'آپارتمان ۹۰ متری دو خواب، نوساز', desc:'واحد نوساز، طبقه سوم، پارکینگ و انباری، نزدیک مترو.', total:0, deposit:450000000, monthly:6000000, area:90, rooms:'2'},
    {cat:'sale_house', province:'اصفهان', city:'کاشان', title:'خانه ویلایی حیاط‌دار ۲۰۰ متر', desc:'بافت قدیم، امکان بازسازی، سند تک‌برگ.', total:11000000000, area:200, rooms:'3'},
    {cat:'land_residential', province:'مازندران', city:'نوشهر', title:'زمین مسکونی ۳۰۰ متری نزدیک دریا', desc:'کاربری مسکونی، جواز ساخت آماده.', total:3500000000, area:300, rooms:''},
    {cat:'land_agri_rent', province:'فارس', city:'مرودشت', title:'۵ هکتار زمین کشاورزی آبی', desc:'دسترسی به چاه عمیق و جاده آسفالته.', total:0, monthly:250000000, area:50000, rooms:''},
    {cat:'partnership', province:'تهران', city:'تهران', title:'مشارکت در ساخت ۶ واحدی', desc:'زمین موجود، به‌دنبال سرمایه‌گذار یا سازنده.', total:0, area:'', rooms:''},
    {cat:'rent_short', province:'گیلان', city:'رشت', title:'سوئیت مبله کوتاه‌مدت', desc:'نزدیک مرکز شهر، مناسب مسافر.', total:0, deposit:20000000, monthly:24000000, area:45, rooms:'1'},
    {cat:'rent_short', country:'TR', province:'استانبول', city:'استانبول', title:'آپارتمان مبله کوتاه‌مدت در استانبول', desc:'مناسب سفر و اقامت کوتاه‌مدت؛ اطلاعات تماس مالک پس از انتشار قابل مشاهده است.', total:0, deposit:0, monthly:800, area:65, rooms:'1'},
    {cat:'rent_short', country:'IQ', province:'اربیل', city:'اربیل', title:'آپارتمان مبله کوتاه‌مدت در اربیل', desc:'مناسب اقامت مسافران؛ واحد مبله در محدوده شهری.', total:0, deposit:0, monthly:350, area:80, rooms:'2'},
  ];
  const list = demo.map((d,i)=>{
    const b = blankDraft(false);
    b.id='seed'+i; b.category=d.cat; b.country=d.country||'IR'; b.province=d.province; b.city=d.city; b.title=d.title; b.desc=d.desc;
    b.pricing.total=d.total?String(d.total):''; b.pricing.deposit=d.deposit?String(d.deposit):''; b.pricing.monthly=d.monthly?String(d.monthly):'';
    b.structural.buildArea=String(d.area||''); b.landInfo.area=String(d.area||''); b.structural.rooms=d.rooms||'';
    b.status='approved'; b.publishCode='KB-'+(10230+i); b.createdAt=Date.now()-(i+1)*86400000;
    return b;
  });
  saveListings(list);
  return list;
}

let listings = loadListings();
let settings = loadSettings();
applyTheme();
const carouselTimers = {};

/* ============================ ابزارها ============================ */
function uid(){ return 'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2800); }
function fileToThumb(file, maxW, cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxW/img.width); const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
      const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      cb(canvas.toDataURL('image/jpeg',0.62));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function fmtDate(ts){ try{ return new Date(ts).toLocaleDateString('fa-IR')+' - '+new Date(ts).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
function statusBadge(st){
  if(st==='approved') return '<span class="badge badge-approved">تاییدشده</span>';
  if(st==='pending') return '<span class="badge badge-pending">در انتظار بررسی</span>';
  if(st==='rejected') return '<span class="badge badge-rejected">ردشده</span>';
  return '<span class="badge" style="background:var(--line);color:var(--ink-soft)">پیش‌نویس</span>';
}
function applyTheme(){
  document.documentElement.removeAttribute('data-theme');
  if(settings.theme==='dark') document.documentElement.setAttribute('data-theme','dark');
  if(settings.theme==='light') document.documentElement.setAttribute('data-theme','light');
}
function haversine(lat1,lon1,lat2,lon2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

/* ============================ ناوبری بالا/پایین ============================ */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{ state.tab=btn.dataset.tab; render(); });
});
document.getElementById('themeBtn').addEventListener('click', ()=>{
  settings.theme = settings.theme==='dark' ? 'light' : settings.theme==='light' ? 'auto' : 'dark';
  saveSettings(settings); applyTheme();
  toast('تم: ' + (settings.theme==='dark'?'تیره':settings.theme==='light'?'روشن':'خودکار'));
});
document.getElementById('menuBtn').addEventListener('click', openDrawer);

/* ============================ رندر اصلی ============================ */
function render(){
  Object.values(carouselTimers).forEach(clearInterval);
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===state.tab));
  const view=document.getElementById('view');
  if(state.tab==='browse') view.innerHTML = renderBrowse();
  else if(state.tab==='post') view.innerHTML = renderPost();
  else if(state.tab==='tenders') view.innerHTML = renderTendersTab();
  else if(state.tab==='map') view.innerHTML = renderMap();
  else if(state.tab==='operator') view.innerHTML = renderOperator();
  bindDynamicHandlers();
  startCardCarousels();
  startHeroCarousel();
  view.scrollTop = 0;
}

/* ============================ کاروسل معرفی (بالای صفحه اصلی) ============================ */
function heroCarouselHtml(){
  const a=[
    ['hero-art-house','⌂','ملک شما، با پرونده‌ای منظم','آگهی، عکس، ویدئو و اطلاعات ملک را در یک مسیر مشخص ثبت کنید.'],
    ['hero-art-map','⌖','ملک را دقیق‌تر روی نقشه ببینید','موقعیت و محدوده ملک را مشخص کنید و نتایج مناطق مختلف را یکجا ببینید.'],
    ['hero-art-trust','✓','بررسی بیشتر، اطمینان بیشتر','برای معاملات مهم، امکان درخواست کارشناسی رسمی و نگهداری گزارش در پرونده ملک فراهم می‌شود.'],
    ['hero-art-3d','◇','بازدید مجازی؛ نزدیک‌تر به بازدید واقعی','عکس، ویدئو و تور مجازی را کنار هم ببینید و قبل از رفتن به محل، اطلاعات بیشتری جمع کنید.'],
    ['hero-art-offer','٪','پیشنهاد ویژه اولین معامله','تخفیف‌های راه‌اندازی و خدمات منتخب در زمان فعال‌شدن سرویس، شفاف و قبل از پرداخت نمایش داده می‌شوند.']
  ];
  return '<div class="hero-carousel hero-carousel-large">'+a.map((x,i)=>'<div class="hero-slide '+x[0]+' '+(i?'':'show')+'" data-hero-slide="'+i+'"><div class="hero-art-icon">'+x[1]+'</div><div class="hero-slide-copy"><h3>'+x[2]+'</h3><p>'+x[3]+'</p></div></div>').join('')+
  '<div class="hero-dots">'+a.map((x,i)=>'<span class="hero-dot '+(i?'':'on')+'" data-hero-dot="'+i+'"></span>').join('')+'</div></div>'+
  '<div class="trust-strip"><b>اعتماد و شفافیت</b><span>مدارک خصوصی از آگهی عمومی جدا نگهداری می‌شوند و هزینه خدمات قبل از پرداخت نمایش داده می‌شود.</span></div>'+
  '<div class="quick-actions"><button class="quick-action" data-quick="post"><span class="quick-icon-img"><img src="assets/icons/custom/house-mark.png" alt=""></span><b>ثبت آگهی</b><small>فروش، اجاره یا مشارکت</small></button><button class="quick-action" data-quick="map"><span class="quick-icon-img"><img src="assets/icons/custom/map-pin-house.png" alt=""></span><b>نقشه املاک</b><small>مشاهده ملک‌ها روی نقشه</small></button></div>'+
  '<div class="about-toggle" id="aboutToggle">درباره ۴ دیواری و نحوه کار آن بیشتر بدانید ▾</div><div class="about-box" id="aboutBox" style="display:none">'+ABOUT_TEXT.replace(/\n/g,'<br><br>')+'</div>';
}
function renderBrowse(){
  if(state.browse.detailId){
    const l = listings.find(x=>x.id===state.browse.detailId && !x.isTender);
    if(!l) state.browse.detailId=null; else return renderListingDetail(l);
  }
  const b = state.browse;
  const provinceOptions = Object.keys(PROVINCES).map(p=>`<option value="${p}" ${b.province===p?'selected':''}>${p}</option>`).join('');
  const cityOptions = b.province ? PROVINCES[b.province].map(c=>`<option value="${c}" ${b.city===c?'selected':''}>${c}</option>`).join('') : '';

  let results = listings.filter(l=>l.status==='approved' && !l.isTender);
  if(b.province) results = results.filter(l=>l.province===b.province);
  if(b.city) results = results.filter(l=>l.city===b.city);
  if(b.category) results = results.filter(l=>l.category===b.category);
  if(b.priceMin) results = results.filter(l=>parseNum(l.pricing.total)>=parseNum(b.priceMin) || !l.pricing.total);
  if(b.priceMax) results = results.filter(l=>!l.pricing.total || parseNum(l.pricing.total)<=parseNum(b.priceMax));
  if(b.areaMin) results = results.filter(l=>{const a=parseNum(l.structural.buildArea||l.landInfo.area); return !a || a>=parseNum(b.areaMin);});
  if(b.areaMax) results = results.filter(l=>{const a=parseNum(l.structural.buildArea||l.landInfo.area); return !a || a<=parseNum(b.areaMax);});
  if(b.rooms) results = results.filter(l=> (b.rooms==='4+' ? parseNum(l.structural.rooms)>=4 : l.structural.rooms===b.rooms));
  results.sort((x,y)=>y.createdAt-x.createdAt);

  return `
    ${heroCarouselHtml()}
    <div class="filter-card">
      <div class="filter-row">
        <div><label class="field-label">استان</label>
          <select id="fProvince"><option value="">همه استان‌ها</option>${provinceOptions}</select></div>
        <div><label class="field-label">شهرستان</label>
          <select id="fCity" ${!b.province?'disabled':''}><option value="">همه شهرستان‌ها</option>${cityOptions}</select></div>
      </div>
      <div class="filter-row" style="margin-top:10px;">
        <div><label class="field-label">حداقل قیمت (تومان)</label><input type="number" id="fPriceMin" value="${b.priceMin}" placeholder="مثلاً 500000000"></div>
        <div><label class="field-label">حداکثر قیمت (تومان)</label><input type="number" id="fPriceMax" value="${b.priceMax}" placeholder="مثلاً 3000000000"></div>
      </div>
      <div class="filter-row" style="margin-top:10px;">
        <div><label class="field-label">حداقل متراژ</label><input type="number" id="fAreaMin" value="${b.areaMin}"></div>
        <div><label class="field-label">حداکثر متراژ</label><input type="number" id="fAreaMax" value="${b.areaMax}"></div>
      </div>
      <label class="field-label">تعداد اتاق</label>
      <select id="fRooms">
        <option value="">هر تعداد</option>
        <option value="1" ${b.rooms==='1'?'selected':''}>۱ اتاق</option>
        <option value="2" ${b.rooms==='2'?'selected':''}>۲ اتاق</option>
        <option value="3" ${b.rooms==='3'?'selected':''}>۳ اتاق</option>
        <option value="4+" ${b.rooms==='4+'?'selected':''}>۴ اتاق و بیشتر</option>
      </select>
    </div>
    <div class="section-title">دسته‌بندی</div>
    <div class="cat-grid">
      ${CATEGORIES.map(c=>`<div class="cat-chip ${b.category===c.id?'active':''}" data-fcat="${c.id}"><span class="ic">${c.ic}</span><span>${c.label}</span></div>`).join('')}
    </div>
    <div class="section-title">${results.length} آگهی یافت شد</div>
    ${results.length ? results.map(renderListingCard).join('') : `<div class="empty-state"><div class="ic">🔍</div><div>آگهی‌ای با این فیلتر پیدا نشد.</div></div>`}
  `;
}

function renderListingCard(l){
  const photos = l.dealPhotos||[];
  return `
  <div class="listing-card" data-open="${l.id}">
    <div class="card-slideshow" data-card-slideshow="${l.id}">
      ${photos.length ? photos.map((p,i)=>`<img src="${p}" class="${i===0?'show':''}">`).join('') : `<div class="noimg">🖼️</div>`}
      ${photos.length>1? `<div class="dot-row">${photos.map((_,i)=>`<span class="${i===0?'on':''}"></span>`).join('')}</div>`:''}
    </div>
    <div class="card-body">
      <div class="listing-top">
        <div>
          <div class="listing-title">${l.title}</div>
          <div class="listing-loc">📍 ${countryLabel(l.country||'IR')} · ${l.province||''}${l.province?' · ':''}${l.city||''} <span>· ثبت‌شده ${fmtDate(l.createdAt)}</span></div>
        </div>
        <span class="badge badge-cat">${catIcon(l.category)} ${catLabel(l.category)}</span>
      </div>
      <div class="listing-desc">${l.desc||''}</div>
      <div class="meta-strip">
        ${l.structural.buildArea||l.landInfo.area? `<span>متراژ: ${toFa(l.structural.buildArea||l.landInfo.area)} م²</span>`:''}
        ${l.structural.rooms? `<span>${toFa(l.structural.rooms)} اتاق</span>`:''}
        ${l.structural.yearBuilt? `<span>ساخت ${toFa(l.structural.yearBuilt)}</span>`:''}
      </div>
      <div class="listing-price">${priceSummary(l)}</div>
    </div>
  </div>`;
}
function priceSummary(l){
  const cat = catInfo(l.category);
  if(cat.rent){
    const parts=[];
    if(parseNum(l.pricing.deposit)) parts.push('رهن '+toFa(parseNum(l.pricing.deposit).toLocaleString('en-US')));
    if(parseNum(l.pricing.monthly)) parts.push('اجاره '+toFa(parseNum(l.pricing.monthly).toLocaleString('en-US')));
    return parts.length? parts.join(' / ')+' تومان' : 'قیمت توافقی';
  }
  if(parseNum(l.pricing.total)) return toFa(parseNum(l.pricing.total).toLocaleString('en-US'))+' تومان';
  return 'قیمت توافقی';
}

function renderSpecialPropertyInfo(l){
  const a=l.structural?.agri||{}; const c=catInfo(l.category); let rows=[];
  if(['land_agri_rent','land_agri_sale'].includes(l.category)) rows=[['نوع آب/کشت',a.irrigationType],['منبع آب',a.waterSource],['تعداد رایزر',a.riserCount],['تعداد پمپ',a.pumpCount],['آبیاری تحت فشار',a.pressureIrrigation?'دارد':'ندارد'],['ترانس اختصاصی',a.dedicatedTransformer?'دارد':'ندارد'],['کاهش پمپاژ فصلی',a.seasonalPumpReduction?'بله':'خیر'],['حق‌آبه/مجوز',a.waterRightDoc]];
  if(c.kind==='commercial') rows=[['نوع کاربری',l.structural?.commercialType],['عرض بر',l.structural?.storefrontWidth?l.structural.storefrontWidth+' متر':''],['ارتفاع سقف',l.structural?.ceilingHeight?l.structural.ceilingHeight+' متر':''],['مجوز/نوع فعالیت',l.structural?.businessLicense],['کنتور برق اختصاصی',l.structural?.dedicatedMeter?'دارد':'ندارد']];
  rows=rows.filter(x=>x[1]!==undefined&&x[1]!==''); return rows.length?rows.map(x=>`<div class="summary-row"><span class="k">${x[0]}</span><span class="v">${x[1]}</span></div>`).join(''):'اطلاعات اختصاصی تکمیل نشده است.';
}
function renderListingDetail(l){
  const photos = l.dealPhotos||[];
  const cat = catInfo(l.category);
  return `
    <div class="back-row" data-back="browse">→ بازگشت به فهرست</div>
    <div class="detail-hero">
      <span class="badge badge-cat" style="background:rgba(255,255,255,.18); color:#fff;">${catIcon(l.category)} ${catLabel(l.category)}</span>
      <h2 style="margin-top:10px; font-size:18px;">${l.title}</h2>
      <div style="font-size:12.5px; opacity:.85;">📍 ${l.province} · ${l.city} · ثبت‌شده ${fmtDate(l.createdAt)}</div>
    </div>
    ${photos.length ? `<div class="thumb-grid">${photos.map(p=>`<div class="thumb"><img src="${p}"></div>`).join('')}</div>` :
      `<div class="empty-state" style="padding:24px;"><div class="ic">🖼️</div><div>برای این آگهی عکسی ثبت نشده است.</div></div>`}

    ${(l.structural.buildArea||l.structural.rooms||l.structural.yearBuilt) ? `
    <div class="section-title">مشخصات سازه</div>
    <div class="filter-card">
      ${l.structural.yearBuilt? `<div class="summary-row"><span class="k">سال ساخت</span><span class="v">${toFa(l.structural.yearBuilt)}</span></div>`:''}
      ${l.structural.landArea? `<div class="summary-row"><span class="k">متراژ عرصه</span><span class="v">${toFa(l.structural.landArea)} م²</span></div>`:''}
      ${l.structural.buildArea? `<div class="summary-row"><span class="k">متراژ اعیان</span><span class="v">${toFa(l.structural.buildArea)} م²</span></div>`:''}
      ${l.structural.rooms? `<div class="summary-row"><span class="k">تعداد اتاق</span><span class="v">${toFa(l.structural.rooms)}</span></div>`:''}
      ${l.structural.terrace? `<div class="summary-row"><span class="k">متراژ تراس</span><span class="v">${toFa(l.structural.terrace)} م²</span></div>`:''}
      ${l.structural.floor? `<div class="summary-row"><span class="k">طبقه</span><span class="v">${toFa(l.structural.floor)}</span></div>`:''}
      ${l.structural.parking? `<div class="summary-row"><span class="k">متراژ پارکینگ</span><span class="v">${toFa(l.structural.parking)} م²</span></div>`:''}
      ${l.structural.storage? `<div class="summary-row"><span class="k">متراژ انباری</span><span class="v">${toFa(l.structural.storage)} م²</span></div>`:''}
      ${l.structural.bathArea? `<div class="summary-row"><span class="k">متراژ سرویس/حمام</span><span class="v">${toFa(l.structural.bathArea)} م²</span></div>`:''}
      <div class="summary-row"><span class="k">مبله</span><span class="v">${l.structural.furnished?'بله':'خیر'}</span></div>
      <div class="summary-row"><span class="k">آسانسور/بالابر</span><span class="v">${l.structural.elevator?'دارد':'ندارد'}</span></div>
      <div class="summary-row"><span class="k">انشعابات آب/برق/گاز</span><span class="v">${[l.structural.water&&'آب',l.structural.power&&'برق',l.structural.gas&&'گاز'].filter(Boolean).join('، ')||'—'}</span></div>
      ${(l.structural.coolingTypes||[]).length? `<div class="summary-row"><span class="k">سرمایشی</span><span class="v">${l.structural.coolingTypes.join('، ')}</span></div>`:''}
      ${(l.structural.heatingTypes||[]).length? `<div class="summary-row"><span class="k">گرمایشی</span><span class="v">${l.structural.heatingTypes.join('، ')}</span></div>`:''}
      ${l.structural.poolArea? `<div class="summary-row"><span class="k">استخر</span><span class="v">${toFa(l.structural.poolArea)} م²</span></div>`:''}
      ${l.structural.greenhouseArea? `<div class="summary-row"><span class="k">گلخانه</span><span class="v">${toFa(l.structural.greenhouseArea)} م²</span></div>`:''}
      ${(l.structural.securityTypes||[]).length? `<div class="summary-row"><span class="k">تجهیزات حفاظتی</span><span class="v">${l.structural.securityTypes.join('، ')}</span></div>`:''}
      ${l.structural.accessRoadType? `<div class="summary-row"><span class="k">معبر</span><span class="v">${l.structural.accessRoadType}${l.structural.accessRoadWidth?' — عرض '+toFa(l.structural.accessRoadWidth)+' متر':''}</span></div>`:''}
    </div>`:''}
    ${((l.structural.strengthTags||[]).length || l.structural.strengthOther) ? `
    <div class="section-title">نقاط قوت ملک</div>
    <div class="filter-card"><p class="muted" style="margin:0;">${[...(l.structural.strengthTags||[]), l.structural.strengthOther].filter(Boolean).join('، ')}</p></div>`:''}

    ${l.landInfo.area? `
    <div class="section-title">مشخصات زمین</div>
    <div class="filter-card">
      <div class="summary-row"><span class="k">متراژ</span><span class="v">${toFa(l.landInfo.area)} م²</span></div>
      ${l.landInfo.landUse? `<div class="summary-row"><span class="k">کاربری</span><span class="v">${l.landInfo.landUse}</span></div>`:''}
    </div>`:''}

    <div class="section-title">توضیحات</div>
    <p class="muted">${l.desc||'توضیحی ثبت نشده است.'}</p>
    ${l.postalCode? `<p class="muted">کدپستی: ${toFa(l.postalCode)}</p>`:''}
    <div class="section-title">قیمت</div>
    <div class="listing-price">${priceSummary(l)}</div>
    ${cat.rent && parseNum(l.pricing.deposit) ? `<div class="muted">مبلغ بیعانه به حروف: ${numberToWordsFa(l.pricing.deposit)}</div>`:''}
    ${cat.rent && parseNum(l.pricing.monthly) ? `<div class="muted">اجاره ماهانه به حروف: ${numberToWordsFa(l.pricing.monthly)}</div>`:''}
    ${!cat.rent && parseNum(l.pricing.total) ? `<div class="muted">مبلغ کل به حروف: ${numberToWordsFa(l.pricing.total)}</div>`:''}

    <div class="info-box" style="margin-top:18px;">
      کد انتشار این آگهی: <b>${l.publishCode||'—'}</b><br>
      مدارک هویتی و مالکیتی آگهی‌دهنده فقط نزد اپراتور ۴ دیواری محفوظ است و در این صفحه نمایش داده نمی‌شود.
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" data-contact="${l.id}">💬 گفتگو با آگهی‌دهنده</button>
      <button class="btn btn-secondary" data-call="${l.id}">📞 تماس</button>
    </div>
  `;
}

/* ============================ تب ثبت آگهی (ویزارد) ============================ */
const WIZARD_STEPS = ['دسته و موقعیت','مشخصات ملک','قیمت و تماس','احراز هویت','اسناد ملک','عکس‌های معامله','بازبینی و ثبت'];

function renderPost(){
  if(state.post.screen==='mine') return renderMyListings(false);
  return renderWizard(false);
}
function renderMyListings(isTender){
  const st = isTender? state.tenders : state.post;
  const mySet = listings.filter(l=>l.__mine && !!l.isTender===!!isTender);
  return `
    <div class="back-row" data-back="fresh-${isTender?'tender':'post'}">→ ${isTender?'مناقصه جدید':'آگهی جدید'}</div>
    <div class="section-title">${isTender?'مناقصات من':'آگهی‌های من'}</div>
    ${mySet.length? mySet.map(l=>`
      <div class="op-item" data-editmine="${l.id}">
        <div class="op-item-top"><b style="font-size:13px;">${l.title||'بدون عنوان'}</b>${statusBadge(l.status)}</div>
        <div class="muted" style="margin-top:4px;">${catLabel(l.category, isTender?TENDER_CATEGORIES:CATEGORIES)} · ${l.province||''} ${l.city||''}</div>
        ${l.status==='rejected'? `<div class="warn-box" style="margin-top:8px;">دلیل رد: ${l.rejectReason||'نامشخص'} — برای ویرایش لمس کنید.</div>`:''}
        ${l.status==='approved'? `<div class="info-box" style="margin-top:8px;">کد انتشار: <b>${l.publishCode}</b></div>`:''}
      </div>
    `).join('') : `<div class="empty-state"><div class="ic">📭</div><div>هنوز موردی ثبت نکرده‌اید.</div></div>`}
  `;
}

function renderWizard(isTender){
  const st = isTender ? state.tenders : state.post;
  const d = st.draft;
  const step = st.step;
  const stepperHtml = `<div class="stepper">
    ${WIZARD_STEPS.map((s,i)=>{ const n=i+1; const cls=n<step?'done':n===step?'current':'';
      return `<div class="step-dot ${cls}">${n<step?'✓':n}</div>${i<WIZARD_STEPS.length-1?`<div class="step-line ${n<step?'done':''}"></div>`:''}`; }).join('')}
  </div>`;
  let body='';
  if(step===1) body = stepCategory(d, isTender);
  else if(step===2) body = stepStructural(d);
  else if(step===3) body = stepPricing(d);
  else if(step===4) body = stepIdentity(d);
  else if(step===5) body = stepProperty(d);
  else if(step===6) body = stepDealPhotos(d);
  else if(step===7) body = stepReview(d, isTender);

  const canGoNext = validateStep(step, d, isTender);
  const prefix = isTender?'t':'p';
  return `
    ${stepperHtml}
    <div class="step-title">${WIZARD_STEPS[step-1]}</div>
    <div class="step-sub">${stepSub(step)}</div>
    ${body}
    <div class="btn-row" style="margin-top:20px;">
      ${step>1? `<button class="btn btn-outline" data-wiz="back-${prefix}">مرحله قبل</button>`:''}
      ${step<7? `<button class="btn btn-primary" data-wiz="next-${prefix}" ${canGoNext?'':'disabled'}>مرحله بعد</button>`
                :`<button class="btn btn-primary" data-wiz="submit-${prefix}" ${canGoNext?'':'disabled'}>ثبت نهایی</button>`}
    </div>
    ${listings.some(l=>l.__mine && !!l.isTender===!!isTender) ? `<div style="margin-top:14px; text-align:center;"><a href="#" data-goto="mine-${prefix}" style="color:var(--primary); font-size:12.5px; font-weight:700; text-decoration:none;">مشاهده موارد ثبت‌شده من ←</a></div>`:''}
  `;
}
function stepSub(step){
  if(step===1) return 'دسته‌بندی، موقعیت و عنوان را مشخص کنید.';
  if(step===2) return 'بر اساس نوع ملک، مشخصات فنی و کدپستی (در صورت وجود) را وارد کنید.';
  if(step===3) return 'مبلغ را به عدد وارد کنید؛ نمایش به حروف به‌صورت خودکار انجام می‌شود.';
  if(step===4) return 'برای تایید هویت، تصویر واضح این مدارک را بارگذاری کنید. این اطلاعات فقط برای بررسی اپراتور استفاده می‌شود.';
  if(step===5) return 'مدارک مربوط به ملک را بارگذاری کنید؛ تعداد عکس در هر بخش محدودیتی ندارد.';
  if(step===6) return 'حداکثر ۸ عکس از خود ملک یا مورد معامله انتخاب کنید.';
  return 'اطلاعات را یک‌بار دیگر بررسی کنید. پس از ثبت، برای اپراتور ارسال می‌شود.';
}
function validateStep(step,d,isTender){
  if(step===1) return d.category && d.city && d.title.trim().length>2 && (d.country!=='IR' || d.province) && (!isTender || d.orgName.trim().length>1);
  if(step===2) return true;
  if(step===3) return d.phone.trim().length>=8;
  if(step===4) return d.identity.national && d.identity.birth && d.identity.sana;
  if(step===5) return d.property.ownership.length>0;
  if(step===6) return d.dealPhotos.length>0;
  if(step===7) return true;
  return false;
}

function stepCategory(d, isTender){
  const list = isTender? TENDER_CATEGORIES : CATEGORIES;
  return `
    ${isTender? `<label class="field-label">نام سازمان / اداره برگزارکننده</label>
      <input type="text" id="dOrg" value="${(d.orgName||'').replace(/"/g,'&quot;')}" placeholder="مثلاً: اداره کل راه و شهرسازی استان...">`:''}
    <label class="field-label" style="margin-top:${isTender?'12px':'0'};">دسته‌بندی</label>
    <div class="cat-grid">
      ${list.map(c=>`<div class="cat-chip ${d.category===c.id?'active':''}" data-setcat="${c.id}"><span class="ic">${c.ic}</span><span>${c.label}</span></div>`).join('')}
    </div>
    <label class="field-label">استان</label>
    <select id="dProvince"><option value="">انتخاب کنید</option>${Object.keys(PROVINCES).map(p=>`<option value="${p}" ${d.province===p?'selected':''}>${p}</option>`).join('')}</select>
    <label class="field-label">شهرستان</label>
    <select id="dCity" ${!d.province?'disabled':''}><option value="">انتخاب کنید</option>${d.province? PROVINCES[d.province].map(c=>`<option value="${c}" ${d.city===c?'selected':''}>${c}</option>`).join(''):''}</select>
    <label class="field-label">عنوان ${isTender?'مناقصه':'آگهی'}</label>
    <input type="text" id="dTitle" value="${d.title.replace(/"/g,'&quot;')}" placeholder="${isTender?'مثلاً: مناقصه واگذاری زمین صنعتی':'مثلاً: آپارتمان ۸۵ متری دو خواب'}">
    <label class="field-label">توضیحات</label>
    <textarea id="dDesc" rows="4" maxlength="2000" placeholder="توضیحات تکمیلی">${d.desc}</textarea>
    <div class="field-hint" style="text-align:left;" id="descCounter">${toFa((d.desc||'').length)} / ۲۰۰۰</div>
  `;
}

const COOLING_OPTIONS = ['کولر آبی','کولر گازی (اسپلیت)','چیلر','فن‌کوئل','تهویه مطبوع مرکزی'];
const HEATING_OPTIONS = ['بخاری گازی','پکیج و رادیاتور','شومینه','بخاری نفتی','گرمایش از کف','موتورخانه مرکزی'];
const SECURITY_OPTIONS = ['دوربین مداربسته','دزدگیر','درب ضدسرقت','آیفون تصویری','نگهبانی/کنسرژ'];
const STRENGTH_OPTIONS = ['نزدیک پارک','نزدیک مسجد','نزدیک مترو/ایستگاه اتوبوس','نزدیک مدرسه','نزدیک بازار/مرکز خرید','نورگیر بودن','دید و منظره خوب','خیابان آرام و کم‌رفت‌وآمد'];
const ROAD_TYPES = ['آسفالته','خاکی','شنی','بن‌بست','بلوار/بزرگراه'];

function multiSelectBlock(idPrefix, options, selected){
  return `<div class="cat-grid">${options.map((o,i)=>`
    <div class="cat-chip ${selected.includes(o)?'active':''}" data-multitoggle="${idPrefix}:${o}"><span class="ic">${selected.includes(o)?'✅':'▫️'}</span><span>${o}</span></div>
  `).join('')}</div>`;
}

function stepStructural(d){
  const cat = catInfo(d.category);
  if(cat.kind==='house'){
    return `
      <div class="checkbox-row"><input type="checkbox" id="sFurnished" ${d.structural.furnished?'checked':''}><label for="sFurnished">این ملک مبله اجاره/فروش می‌رود</label></div>
      <div class="filter-row"><div><label class="field-label">سال ساخت</label><input type="number" id="sYear" value="${d.structural.yearBuilt}"></div>
      <div><label class="field-label">تعداد اتاق</label><input type="number" id="sRooms" value="${d.structural.rooms}"></div></div>
      <div class="filter-row"><div><label class="field-label">متراژ عرصه (م²)</label><input type="number" id="sLand" value="${d.structural.landArea}"></div>
      <div><label class="field-label">متراژ اعیان (م²)</label><input type="number" id="sBuild" value="${d.structural.buildArea}"></div></div>
      <div class="filter-row"><div><label class="field-label">متراژ تراس (م²)</label><input type="number" id="sTerrace" value="${d.structural.terrace}"></div>
      <div><label class="field-label">طبقه</label><input type="number" id="sFloor" value="${d.structural.floor}"></div></div>
      <div class="filter-row"><div><label class="field-label">متراژ پارکینگ (م²)</label><input type="number" id="sParking" value="${d.structural.parking}"></div>
      <div><label class="field-label">متراژ انباری (م²)</label><input type="number" id="sStorage" value="${d.structural.storage}"></div></div>
      <label class="field-label">متراژ سرویس بهداشتی/حمام (م²)</label>
      <input type="number" id="sBathArea" value="${d.structural.bathArea}">
      ${propPhotoBlock('bathPhotos','عکس سرویس بهداشتی و حمام', d.structural.bathPhotos)}
      <label class="field-label">کدپستی واحد مسکونی (اختیاری)</label>
      <input type="text" id="sPostal" value="${d.postalCode}" placeholder="۱۰ رقم">
      <div class="checkbox-row"><input type="checkbox" id="sElevator" ${d.structural.elevator?'checked':''}><label for="sElevator">دارای آسانسور/بالابر</label></div>
      ${d.structural.elevator? propPhotoBlock('elevatorPhotos','عکس آسانسور/بالابر', d.structural.elevatorPhotos):''}
      <label class="field-label">انشعابات</label>
      <div class="checkbox-row"><input type="checkbox" id="sWater" ${d.structural.water?'checked':''}><label for="sWater">انشعاب آب</label></div>
      <div class="checkbox-row"><input type="checkbox" id="sPower" ${d.structural.power?'checked':''}><label for="sPower">انشعاب برق</label></div>
      <div class="checkbox-row"><input type="checkbox" id="sGas" ${d.structural.gas?'checked':''}><label for="sGas">انشعاب گاز</label></div>

      <label class="field-label">نوع وسایل سرمایشی (چند مورد قابل انتخاب)</label>
      ${multiSelectBlock('cooling', COOLING_OPTIONS, d.structural.coolingTypes)}
      ${propPhotoBlock('coolingPhotos','عکس وسایل سرمایشی', d.structural.coolingPhotos)}

      <label class="field-label">نوع وسایل گرمایشی (چند مورد قابل انتخاب)</label>
      ${multiSelectBlock('heating', HEATING_OPTIONS, d.structural.heatingTypes)}
      ${propPhotoBlock('heatingPhotos','عکس وسایل گرمایشی', d.structural.heatingPhotos)}

      <label class="field-label">متراژ استخر (م²) — در صورت وجود</label>
      <input type="number" id="sPoolArea" value="${d.structural.poolArea}">
      ${propPhotoBlock('poolPhotos','عکس استخر', d.structural.poolPhotos)}
      <label class="field-label">متراژ گلخانه (م²) — در صورت وجود</label>
      <input type="number" id="sGreenhouseArea" value="${d.structural.greenhouseArea}">
      ${propPhotoBlock('greenhousePhotos','عکس گلخانه', d.structural.greenhousePhotos)}

      ${propPhotoBlock('cabinetryPhotos','عکس کابینت‌کاری', d.structural.cabinetryPhotos)}
      ${propPhotoBlock('audioPhotos','عکس سیستم صوتی', d.structural.audioPhotos)}
      ${propPhotoBlock('lightingPhotos','عکس نورپردازی', d.structural.lightingPhotos)}

      <label class="field-label">تجهیزات حفاظتی</label>
      ${multiSelectBlock('security', SECURITY_OPTIONS, d.structural.securityTypes)}
      ${propPhotoBlock('securityPhotos','عکس تجهیزات حفاظتی', d.structural.securityPhotos)}

      <label class="field-label">معبر</label>
      <div class="filter-row">
        <div><input type="number" id="sRoadWidth" value="${d.structural.accessRoadWidth}" placeholder="عرض معبر (متر)"></div>
        <div><select id="sRoadType"><option value="">نوع معبر</option>${ROAD_TYPES.map(t=>`<option value="${t}" ${d.structural.accessRoadType===t?'selected':''}>${t}</option>`).join('')}</select></div>
      </div>

      <label class="field-label">نقاط قوت ملک</label>
      ${multiSelectBlock('strength', STRENGTH_OPTIONS, d.structural.strengthTags)}
      <textarea id="sStrengthOther" rows="2" placeholder="سایر نقاط قوت (اختیاری)">${d.structural.strengthOther}</textarea>
      <label class="field-label">انتظارات مالک از اجاره‌گیرنده / استفاده‌کننده</label>
      <textarea id="sOwnerExpectations" rows="4" maxlength="2000" placeholder="مثلاً حفظ کابینت و تجهیزات، رعایت ساعات سکوت، عدم ایجاد مزاحمت برای همسایه‌ها و ...">${d.structural.ownerExpectations||''}</textarea>
    `;
  }
  if(cat.kind==='land'){
    const agri = d.structural.agri || {};
    const isAgri = ['land_agri_rent','land_agri_sale'].includes(d.category);
    return `
      <label class="field-label">متراژ زمین (م²)</label><input type="number" id="sLandArea2" value="${d.landInfo.area}">
      <label class="field-label">کاربری زمین</label><input type="text" id="sLandUse" value="${d.landInfo.landUse}" placeholder="مثلاً: مسکونی / کشاورزی آبی / باغ">
      ${isAgri ? `
        <div class="section-title" style="margin-top:14px">مشخصات فنی زمین کشاورزی</div>
        <label class="field-label">نوع کشت و آب</label>
        <select id="sAgriIrrigation"><option value="">انتخاب کنید</option><option value="دیم" ${agri.irrigationType==='دیم'?'selected':''}>دیم</option><option value="آبی" ${agri.irrigationType==='آبی'?'selected':''}>آبی</option><option value="مختلط" ${agri.irrigationType==='مختلط'?'selected':''}>مختلط</option></select>
        <label class="field-label">منبع آب</label><input type="text" id="sWaterSource" value="${agri.waterSource||''}" placeholder="چاه، قنات، رودخانه، شبکه آب و ...">
        <div class="filter-row"><div><label class="field-label">تعداد رایزر</label><input type="number" id="sRiserCount" value="${agri.riserCount||''}"></div><div><label class="field-label">تعداد پمپ</label><input type="number" id="sPumpCount" value="${agri.pumpCount||''}"></div></div>
        <div class="checkbox-row"><input type="checkbox" id="sPressureIrrigation" ${agri.pressureIrrigation?'checked':''}><label for="sPressureIrrigation">آبیاری تحت فشار</label></div>
        <div class="checkbox-row"><input type="checkbox" id="sDedicatedTransformer" ${agri.dedicatedTransformer?'checked':''}><label for="sDedicatedTransformer">ترانس برق اختصاصی</label></div>
        <div class="checkbox-row"><input type="checkbox" id="sSeasonalPumpReduction" ${agri.seasonalPumpReduction?'checked':''}><label for="sSeasonalPumpReduction">کاهش تعداد/ظرفیت پمپاژ رایزرها در طول فصل یا با افت سطح آب</label></div>
        <label class="field-label">توضیح وضعیت حق‌آبه/مجوز آب</label><textarea id="sWaterRightDoc" rows="2" placeholder="مثلاً تعداد ساعت آب، میزان حق‌آبه یا شماره مجوز">${agri.waterRightDoc||''}</textarea>
      `:''}
      <label class="field-label">کدپستی (در صورت وجود)</label><input type="text" id="sPostal2" value="${d.postalCode}">
      <label class="field-label">معبر</label><div class="filter-row"><div><input type="number" id="sRoadWidth" value="${d.structural.accessRoadWidth}" placeholder="عرض معبر (متر)"></div><div><select id="sRoadType"><option value="">نوع معبر</option>${ROAD_TYPES.map(t=>`<option value="${t}" ${d.structural.accessRoadType===t?'selected':''}>${t}</option>`).join('')}</select></div></div>
      <label class="field-label">نقاط قوت ملک</label>${multiSelectBlock('strength', STRENGTH_OPTIONS, d.structural.strengthTags)}<textarea id="sStrengthOther" rows="2" placeholder="سایر نقاط قوت (اختیاری)">${d.structural.strengthOther}</textarea>
      <label class="field-label">انتظارات مالک از استفاده‌کننده / مستأجر</label><textarea id="sOwnerExpectations" rows="4" maxlength="2000" placeholder="مثلاً حفظ تجهیزات، رعایت ساعات سکوت، عدم ایجاد مزاحمت برای همسایه‌ها و ...">${d.structural.ownerExpectations||''}</textarea>
    `;
  }
  if(cat.kind==='commercial'){
    const st=d.structural, subtype=cat.subtype||'';
    const isWarehouse=subtype==='warehouse', isWorkshop=subtype==='workshop', isIndustrial=d.category==='industrial';
    return `
      <label class="field-label">متراژ ملک (م²)</label><input type="number" id="sLandArea3" value="${d.landInfo.area}">
      <div class="filter-row"><div><label class="field-label">نوع کاربری</label><input type="text" id="sCommercialType" value="${st.commercialType||''}" placeholder="مغازه، دفتر، انبار، کارگاه..."></div><div><label class="field-label">عرض بر (متر)</label><input type="number" id="sStorefrontWidth" value="${st.storefrontWidth||''}"></div></div>
      <div class="filter-row"><div><label class="field-label">ارتفاع سقف (متر)</label><input type="number" id="sCeilingHeight" value="${st.ceilingHeight||''}"></div><div><label class="field-label">نوع فعالیت / مجوز</label><input type="text" id="sBusinessLicense" value="${st.businessLicense||''}"></div></div>
      ${isWarehouse||isWorkshop||isIndustrial ? `<div class="section-title" style="margin-top:14px">مشخصات تخصصی ${isWarehouse?'انبار':isWorkshop?'کارگاه':'ملک صنعتی'}</div>
        <div class="filter-row"><div><label class="field-label">مساحت محوطه (م²)</label><input type="number" id="sYardArea" value="${st.yardArea||''}"></div><div><label class="field-label">دسترسی بارگیری</label><input type="text" id="sLoadingAccess" value="${st.loadingAccess||''}" placeholder="کامیون، تریلی، رمپ و ..."></div></div>
        ${isIndustrial||isWorkshop?`<div class="filter-row"><div><label class="field-label">قدرت برق صنعتی (کیلووات)</label><input type="number" id="sIndustrialPower" value="${st.industrialPower||''}"></div><div class="checkbox-row"><input type="checkbox" id="sThreePhase" ${st.threePhase?'checked':''}><label for="sThreePhase">برق سه‌فاز</label></div></div>`:''}
        ${isWarehouse||isWorkshop?`<div class="checkbox-row"><input type="checkbox" id="sVentilation" ${st.ventilation?'checked':''}><label for="sVentilation">تهویه مناسب</label></div>`:''}
        ${isWorkshop?`<div class="checkbox-row"><input type="checkbox" id="sCrane" ${st.crane?'checked':''}><label for="sCrane">جرثقیل سقفی / دروازه‌ای</label></div>`:''}`:''}
      <div class="checkbox-row"><input type="checkbox" id="sDedicatedMeter" ${st.dedicatedMeter?'checked':''}><label for="sDedicatedMeter">کنتور اختصاصی برق</label></div>
      <label class="field-label">کدپستی</label><input type="text" id="sPostal2" value="${d.postalCode}">
      <label class="field-label">نقاط قوت ملک</label>${multiSelectBlock('strength', STRENGTH_OPTIONS, st.strengthTags)}<textarea id="sStrengthOther" rows="2">${st.strengthOther}</textarea>
      <label class="field-label">انتظارات مالک از استفاده‌کننده / مستأجر</label><textarea id="sOwnerExpectations" rows="4" maxlength="2000" placeholder="شرایط استفاده، حفظ تجهیزات، ساعات کاری، محدودیت فعالیت و ...">${st.ownerExpectations||''}</textarea>
    `;
  }
  return `<label class="field-label">متراژ تقریبی (م²) — اختیاری</label><input type="number" id="sLandArea3" value="${d.landInfo.area}">
    <div class="field-hint">برای پروژه‌های مشارکتی یا سایر موارد، پر کردن این بخش اختیاری است.</div>`;
}
function propPhotoBlock(key,label,arr,max){
  max = max || 4;
  const full = arr.length>=max;
  return `
    <label class="field-label">${label} <span class="pill" style="margin-right:6px;">${arr.length} از ${max}</span></label>
    <div class="thumb-grid">
      ${arr.map((src,i)=>`<div class="thumb"><img src="${src}"><button class="rm" data-rmstruct="${key}:${i}">✕</button></div>`).join('')}
      ${full? '' : `<div class="thumb-add"><span>➕</span><span>افزودن</span><input type="file" accept="image/*" multiple data-structfile="${key}" data-structmax="${max}"></div>`}
    </div>`;
}

function stepPricing(d){
  const cat = catInfo(d.category);
  return `
    ${cat.rent? `
      <label class="field-label">مبلغ بیعانه/رهن (تومان)</label>
      <input type="number" id="pDeposit" value="${d.pricing.deposit}">
      <div class="words-hint">${d.pricing.deposit? numberToWordsFa(d.pricing.deposit) : 'به حروف اینجا نمایش داده می‌شود'}</div>
      <label class="field-label">اجاره ماهانه (تومان)</label>
      <input type="number" id="pMonthly" value="${d.pricing.monthly}">
      <div class="words-hint">${d.pricing.monthly? numberToWordsFa(d.pricing.monthly) : 'به حروف اینجا نمایش داده می‌شود'}</div>
    ` : `
      <label class="field-label">مبلغ کل (تومان)</label>
      <input type="number" id="pTotal" value="${d.pricing.total}">
      <div class="words-hint">${d.pricing.total? numberToWordsFa(d.pricing.total) : 'به حروف اینجا نمایش داده می‌شود'}</div>
      <label class="field-label">قیمت هر متر (تومان) — اختیاری</label>
      <input type="number" id="pPerMeter" value="${d.pricing.perMeter}">
      <div class="words-hint">${d.pricing.perMeter? numberToWordsFa(d.pricing.perMeter) : 'به حروف اینجا نمایش داده می‌شود'}</div>
    `}
    <label class="field-label">شماره تماس متقاضی</label>
    <input type="tel" id="pPhone" value="${d.phone}" placeholder="۰۹xxxxxxxxx">
    <label class="field-label">پاسخگویی تماس‌ها</label>
    <div class="cat-grid">
      <div class="cat-chip ${d.answerMode==='self'?'active':''}" data-setanswer="self"><span class="ic">🙋</span><span>خودم پاسخگو هستم</span></div>
      <div class="cat-chip ${d.answerMode==='company'?'active':''}" data-setanswer="company"><span class="ic">🏢</span><span>۴ دیواری نمایندگی کند</span></div>
    </div>
  `;
}

function stepIdentity(d){
  const box=(key,label,sub)=>`
    <div class="upload-box ${d.identity[key]?'has-file':''}">
      ${d.identity[key]? `<img src="${d.identity[key]}" style="max-height:90px;border-radius:8px;margin-bottom:6px;">`:''}
      <span class="ic">${d.identity[key]?'✅':'🪪'}</span><div class="lbl">${label}</div>
      <div class="sub">${d.identity[key]?'بارگذاری شد — برای تغییر لمس کنید':sub}</div>
      <input type="file" accept="image/*" data-idfile="${key}">
    </div>`;
  return `
    ${box('national','عکس کارت ملی','واضح و کامل')}
    ${box('birth','عکس شناسنامه','صفحه اول شناسنامه')}
    ${box('sana','عکس برگه ثنا','تصویر صفحه ثبت‌نام ثنا')}
    <div class="info-box">مدارک هویتی فقط در اختیار اپراتور ۴ دیواری قرار می‌گیرد و در آگهی عمومی نمایش داده نمی‌شود.</div>
  `;
}

function stepProperty(d){
  const section=(key,label)=>`
    <label class="field-label">${label} <span class="pill" style="margin-right:6px;">${d.property[key].length} عکس</span></label>
    <div class="thumb-grid">
      ${d.property[key].map((src,i)=>`<div class="thumb"><img src="${src}"><button class="rm" data-rmprop="${key}:${i}">✕</button></div>`).join('')}
      <div class="thumb-add"><span>➕</span><span>افزودن</span><input type="file" accept="image/*" multiple data-propfile="${key}"></div>
    </div>`;
  return `
    ${section('ownership','اسناد مالکیت')}
    ${section('construction','اسناد ساخت‌وساز')}
    ${section('permits','مجوزات و مستندات')}
    <div class="field-hint">حداقل یک تصویر از اسناد مالکیت برای ادامه لازم است. تعداد عکس‌ها محدودیتی ندارد.</div>
  `;
}

function stepDealPhotos(d){
  return `
    <label class="field-label">عکس‌های مورد معامله <span class="pill" style="margin-right:6px;">${d.dealPhotos.length} از ۸</span></label>
    <div class="thumb-grid">
      ${d.dealPhotos.map((src,i)=>`<div class="thumb"><img src="${src}"><button class="rm" data-rmdeal="${i}">✕</button></div>`).join('')}
      ${d.dealPhotos.length<8? `<div class="thumb-add"><span>➕</span><span>افزودن</span><input type="file" accept="image/*" multiple id="dealFileInput"></div>`:''}
    </div>
    <div class="field-hint">حداکثر ۸ عکس؛ به ترتیبی که آپلود شوند در آگهی به‌صورت متوالی نمایش داده می‌شوند.</div>
  `;
}

function stepReview(d, isTender){
  const cat = catInfo(d.category);
  return `
    <div class="filter-card">
      ${isTender? `<div class="summary-row"><span class="k">سازمان</span><span class="v">${d.orgName}</span></div>`:''}
      <div class="summary-row"><span class="k">دسته‌بندی</span><span class="v">${catIcon(d.category, isTender?TENDER_CATEGORIES:CATEGORIES)} ${catLabel(d.category, isTender?TENDER_CATEGORIES:CATEGORIES)}</span></div>
      <div class="summary-row"><span class="k">موقعیت</span><span class="v">${d.province} · ${d.city}</span></div>
      <div class="summary-row"><span class="k">عنوان</span><span class="v">${d.title}</span></div>
      <div class="summary-row"><span class="k">قیمت</span><span class="v">${priceSummary(d)}</span></div>
      <div class="summary-row"><span class="k">شماره تماس</span><span class="v">${d.phone} (${d.answerMode==='self'?'خودش پاسخگو':'نمایندگی ۴ دیواری'})</span></div>
      <div class="summary-row"><span class="k">مدارک هویتی</span><span class="v">${['national','birth','sana'].filter(k=>d.identity[k]).length} / ۳</span></div>
      <div class="summary-row"><span class="k">اسناد ملک</span><span class="v">${d.property.ownership.length+d.property.construction.length+d.property.permits.length} عکس</span></div>
      <div class="summary-row"><span class="k">عکس‌های معامله</span><span class="v">${d.dealPhotos.length} از ۸</span></div>
    </div>
    <div class="info-box">با ثبت این مورد، اطلاعات برای بررسی هویت و مدارک در اختیار اپراتور ۴ دیواری قرار می‌گیرد. در صورت تایید، کد انتشار صادر و پیامک اطلاع‌رسانی ارسال می‌شود. در صورت عدم تایید، امکان ویرایش و ارسال مجدد خواهید داشت.</div>
  `;
}

/* ============================ تب مناقصات ============================ */
function renderTendersTab(){
  if(state.tenders.screen==='mine') return renderMyListings(true);
  if(state.tenders.screen==='wizard') return renderWizard(true);
  const t = state.tenders;
  const provinceOptions = Object.keys(PROVINCES).map(p=>`<option value="${p}" ${t.province===p?'selected':''}>${p}</option>`).join('');
  let results = listings.filter(l=>l.isTender && l.status==='approved');
  if(t.province) results = results.filter(l=>l.province===t.province);
  if(t.category) results = results.filter(l=>l.category===t.category);
  results.sort((a,b)=>b.createdAt-a.createdAt);
  return `
    <div class="info-box">در این بخش، ادارات و سازمان‌های دولتی یا خصوصی می‌توانند مناقصه واگذاری ساختمان، زمین مسکونی یا زمین کشاورزی را ثبت کنند.</div>
    <button class="btn btn-primary" data-newtender="1">➕ ثبت مناقصه جدید</button>
    <div class="section-title">فیلتر مناقصات</div>
    <div class="filter-card">
      <label class="field-label">استان</label>
      <select id="tProvince"><option value="">همه استان‌ها</option>${provinceOptions}</select>
      <label class="field-label">نوع</label>
      <select id="tCategory"><option value="">همه انواع</option>${TENDER_CATEGORIES.map(c=>`<option value="${c.id}" ${t.category===c.id?'selected':''}>${c.ic} ${c.label}</option>`).join('')}</select>
    </div>
    <div class="section-title">${results.length} مناقصه یافت شد</div>
    ${results.length? results.map(l=>`
      <div class="listing-card" data-opentender="${l.id}">
        <div class="card-body">
          <div class="listing-top">
            <div><div class="listing-title">${l.title}</div><div class="listing-loc">📍 ${countryLabel(l.country||'IR')} · ${l.province||''}${l.province?' · ':''}${l.city||''} · ${l.orgName}</div></div>
            <span class="badge badge-cat">${catIcon(l.category, TENDER_CATEGORIES)} ${catLabel(l.category, TENDER_CATEGORIES)}</span>
          </div>
          <div class="listing-desc">${l.desc||''}</div>
          <div class="muted" style="margin-top:6px;">ثبت‌شده: ${fmtDate(l.createdAt)}</div>
        </div>
      </div>`).join('') : `<div class="empty-state"><div class="ic">🏛️</div><div>مناقصه‌ای یافت نشد.</div></div>`}
    <div style="margin-top:14px; text-align:center;"><a href="#" data-goto="mine-t" style="color:var(--primary); font-size:12.5px; font-weight:700; text-decoration:none;">مناقصات ثبت‌شده من ←</a></div>
  `;
}

/* ============================ تب نقشه ============================ */
function renderMap(){
  const approved = listings.filter(l=>l.status==='approved' && !l.isTender);
  return `
    <div class="info-box">نزدیک‌ترین آگهی‌ها به موقعیت شما را نمایش می‌دهیم و امکان مشاهده روی نقشه را فراهم می‌کنیم.</div>
    <button class="btn btn-primary" id="locateBtn">📍 یافتن موقعیت من و مرتب‌سازی بر اساس فاصله</button>
    <a href="https://earth.google.com/web/" target="_blank" rel="noopener" style="text-decoration:none;">
      <button class="btn btn-secondary" style="margin-top:10px;">🌍 باز کردن Google Earth</button>
    </a>
    <div class="section-title" id="mapResultsTitle">آگهی‌ها بر اساس استان</div>
    <div id="mapResults">
      ${Object.keys(PROVINCES).filter(p=>approved.some(l=>l.province===p)).map(p=>{
        const coords = PROVINCE_COORDS[p];
        const count = approved.filter(l=>l.province===p).length;
        const mapUrl = coords? `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}` : '#';
        return `<div class="map-list-item">
          <div><b style="font-size:13px;">${p}</b><div class="muted">${count} آگهی</div></div>
          <a href="${mapUrl}" target="_blank" rel="noopener"><button class="btn btn-outline btn-sm">مشاهده روی نقشه</button></a>
        </div>`;
      }).join('') || `<div class="empty-state"><div class="ic">🗺️</div><div>هنوز آگهی تاییدشده‌ای برای نمایش وجود ندارد.</div></div>`}
    </div>
    <div class="field-hint" style="margin-top:8px;">به‌دلیل محدودیت‌های مرورگر، موقعیت دقیق GPS ممکن است در برخی گوشی‌ها قابل دریافت نباشد؛ در آن صورت از فهرست استان‌ها استفاده کنید.</div>
  `;
}

/* ============================ تب پنل اپراتور (درون تنظیمات) ============================ */
function renderOperator(){
  if(state.operator.selectedId){
    const l = listings.find(x=>x.id===state.operator.selectedId);
    if(l) return renderOperatorDetail(l);
    state.operator.selectedId=null;
  }
  const filter = state.operator.filter;
  let items = listings.filter(l=>l.status!=='draft');
  if(filter!=='all') items = items.filter(l=>l.status===filter);
  items.sort((a,b)=>b.createdAt-a.createdAt);
  const counts = { pending: listings.filter(l=>l.status==='pending').length, approved: listings.filter(l=>l.status==='approved').length, rejected: listings.filter(l=>l.status==='rejected').length };

  return `
    <div class="back-row" data-back="drawer">→ بازگشت به تنظیمات</div>
    <div class="section-title" style="margin-top:0;">پنل اپراتور</div><div class="btn-row" style="margin-bottom:12px"><button class="btn btn-secondary" id="openDetailedMapsOperator">🗺️ مدیریت نقشه‌های تفصیلی شهرداری</button></div>
    <div class="filter-card" style="margin-bottom:14px;">
      <label class="field-label">درصد حق‌العمل پیش‌فرض قرارداد</label>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="number" id="defPercent" min="0" max="100" step="0.5" value="${settings.defaultPercent}" style="flex:1;">
        <span class="muted">٪</span>
      </div>
    </div>
    <div class="op-filter-row">
      <button class="op-filter-btn ${filter==='pending'?'active':''}" data-opfilter="pending">در انتظار (${counts.pending})</button>
      <button class="op-filter-btn ${filter==='approved'?'active':''}" data-opfilter="approved">تاییدشده (${counts.approved})</button>
      <button class="op-filter-btn ${filter==='rejected'?'active':''}" data-opfilter="rejected">ردشده (${counts.rejected})</button>
      <button class="op-filter-btn ${filter==='all'?'active':''}" data-opfilter="all">همه</button>
    </div>
    ${items.length? items.map(l=>`
      <div class="op-item" data-opopen="${l.id}">
        <div class="op-item-top"><b style="font-size:13px;">${l.isTender?'🏛️ ':''}${l.title||'بدون عنوان'}</b>${statusBadge(l.status)}</div>
        <div class="muted" style="margin-top:4px;">${catIcon(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)} ${catLabel(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)} · ${l.province} ${l.city} · ${fmtDate(l.createdAt)}</div>
      </div>`).join(''): `<div class="empty-state"><div class="ic">📋</div><div>موردی در این وضعیت وجود ندارد.</div></div>`}
  `;
}
function renderOperatorDetail(l){
  const idCount = ['national','birth','sana'].filter(k=>l.identity[k]).length;
  return `
    <div class="back-row" data-back="operator-list">→ بازگشت به فهرست</div>
    <div class="detail-hero">
      <span class="badge badge-cat" style="background:rgba(255,255,255,.18); color:#fff;">${catIcon(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)} ${catLabel(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)}</span>
      <h2 style="margin-top:10px; font-size:17px;">${l.title}</h2>
      <div style="font-size:12.5px; opacity:.85;">📍 ${l.province} · ${l.city} · ثبت‌شده ${fmtDate(l.createdAt)}</div>
      ${l.isTender? `<div style="font-size:12px; opacity:.85; margin-top:2px;">سازمان: ${l.orgName}</div>`:''}
    </div>
    <div style="margin-bottom:8px;">${statusBadge(l.status)}</div>

    <div class="section-title">بررسی مدارک</div>
    <div class="filter-card">
      <div class="doc-count-row"><span>مدارک هویتی تکمیل‌شده</span><span class="pill">${idCount} / ۳</span></div>
      <div class="doc-count-row"><span>اسناد مالکیت</span><span class="pill">${l.property.ownership.length} عکس</span></div>
      <div class="doc-count-row"><span>اسناد ساخت‌وساز</span><span class="pill">${l.property.construction.length} عکس</span></div>
      <div class="doc-count-row"><span>مجوزات و مستندات</span><span class="pill">${l.property.permits.length} عکس</span></div>
      <div class="doc-count-row"><span>عکس‌های مورد معامله</span><span class="pill">${l.dealPhotos.length} از ۸</span></div>
      <div class="doc-count-row"><span>شماره تماس</span><span class="pill">${l.phone||'—'}</span></div>
    </div>

    ${idCount>0? `<div class="section-title">مدارک هویتی</div><div class="thumb-grid">${['national','birth','sana'].filter(k=>l.identity[k]).map(k=>`<div class="thumb"><img src="${l.identity[k]}"></div>`).join('')}</div>`:''}
    ${l.dealPhotos.length? `<div class="section-title">عکس‌های ملک</div><div class="thumb-grid">${l.dealPhotos.map(p=>`<div class="thumb"><img src="${p}"></div>`).join('')}</div>`:''}

    <div class="section-title">توضیحات و قیمت</div>
    <p class="muted">${l.desc||'—'}</p>
    <div class="listing-price">${priceSummary(l)}</div>

    ${l.status==='pending'? `
      <div class="section-title">تصمیم اپراتور</div>
      <div class="btn-row"><button class="btn btn-success" data-approve="${l.id}">✔ تایید و صدور کد انتشار</button></div>
      <label class="field-label">در صورت رد، دلیل را بنویسید</label>
      <textarea id="rejectReason" rows="2" placeholder="مثلاً: تصویر کارت ملی واضح نیست"></textarea>
      <button class="btn btn-danger" style="margin-top:8px;" data-reject="${l.id}">✕ رد آگهی</button>
    `:''}

    ${l.status==='approved'? `
      <div class="info-box">کد انتشار: <b>${l.publishCode}</b></div>
      <div class="btn-row">
        <button class="btn btn-secondary" data-print="${l.id}">🖨️ خروجی PDF</button><button class="btn btn-outline" data-word="${l.id}">📝 خروجی Word</button>
        <button class="btn btn-primary" data-contractstart="${l.id}">📄 شروع فرآیند قرارداد</button>
      </div>
      ${l.contract? `
        <div class="info-box" style="margin-top:10px;">
          قرارداد ثبت‌شده — طرفین: ${l.contract.partyA} و ${l.contract.partyB} — حق‌العمل: ${l.contract.percent}٪
          <div class="btn-row" style="margin-top:8px;">
            <button class="btn btn-outline btn-sm" data-printcontract="${l.id}">🖨️ چاپ قرارداد</button>
            <a href="https://kateb.ir" target="_blank" rel="noopener" style="flex:1;"><button class="btn btn-secondary btn-sm" style="width:100%;">📎 سامانه کاتب</button></a>
          </div>
          <div class="legal-box">تنظیم رسمی قولنامه در سامانه کاتب (kateb.ir) نیازمند حساب کاربری رسمیِ دفترخانه یا مشاور املاک دارای مجوز است؛ این دکمه فقط لینک ورود به سامانه را باز می‌کند و اتصال مستقیم برنامه به آن سامانه نیازمند هماهنگی رسمی با سازمان ثبت اسناد و املاک کشور است.</div>
        </div>`:''}
    `:''}
    ${l.status==='rejected'? `<div class="warn-box">دلیل رد: ${l.rejectReason||'—'} (پیامک عدم تایید برای متقاضی ارسال شده است)</div>`:''}
  `;
}

/* ============================ مودال قرارداد ============================ */
function contractModalHtml(l){
  const pct = l.contractPercent ?? settings.defaultPercent;
  return `
  <div class="modal-overlay" id="contractModal">
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <h3 style="margin-bottom:4px;">شروع فرآیند قرارداد</h3>
      <p class="muted" style="margin-bottom:14px;">اطلاعات طرفین معامله را برای «${l.title}» ثبت کنید.</p>
      <div class="payment-card"><b>طرف اول — مالک / فروشنده / موجر</b><p class="muted">اطلاعات مالک از پرونده آگهی استفاده می‌شود.</p><input type="text" id="partyA" placeholder="نام و نام خانوادگی مالک"><input type="text" id="partyANational" placeholder="کد ملی مالک" style="margin-top:8px"></div>
      <div class="payment-card"><b>طرف دوم — خریدار / مستأجر</b><input type="text" id="partyB" placeholder="نام و نام خانوادگی"><input type="text" id="partyBNational" placeholder="کد ملی" style="margin-top:8px"><input type="text" id="partyBPhone" placeholder="شماره موبایل" style="margin-top:8px"></div>
      <label class="field-label">درصد حق‌العمل ۴ دیواری</label><input type="number" id="contractPercent" min="0" max="100" step="0.5" value="${pct}">
      <div class="field-hint">در نسخه واقعی، استعلام هویت با کد ملی فقط از طریق سرویس رسمی و با مجوز/احراز لازم انجام می‌شود؛ برنامه نباید به‌صورت غیررسمی از پایگاه‌های هویتی استعلام کند.</div>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="contractCancel">انصراف</button>
        <button class="btn btn-primary" id="contractSave">ثبت قرارداد</button>
      </div>
    </div>
  </div>`;
}

/* ============================ منوی اصلی v0.4 ============================ */
function openDrawer(){
  state.drawerOpen=true;
  const wrap=document.createElement('div'); wrap.className='drawer-overlay'; wrap.id='settingsDrawer';
  wrap.innerHTML=drawerHtml(); document.body.appendChild(wrap);
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeDrawer();}); bindDrawerHandlers();
}
function closeDrawer(){const el=document.getElementById('settingsDrawer');if(el)el.remove();state.drawerOpen=false;}
function drawerHtml(){
  const notify=localStorage.getItem('khb_push_enabled')==='1';
  return `<div class="drawer">
    <div class="drawer-title"><span>۴ دیواری</span><button class="icon-btn" id="drawerClose" style="background:var(--primary-tint);color:var(--primary-dark);">✕</button></div>
    <div class="menu-profile"><div class="menu-avatar">⌂</div><div><b>بازار هوشمند املاک</b><small>خانه، زمین، کشاورزی، تجاری و بیشتر</small></div></div>
    <div class="menu-grid">
      <button class="menu-item" id="menuBrowse"><span class="mi">⌂</span><b>آگهی‌ها</b><small>جست‌وجوی ملک و زمین</small></button>
      <button class="menu-item" id="menuPost"><span class="mi">＋</span><b>ثبت آگهی</b><small>فروش، اجاره و سایر معاملات</small></button>
      <button class="menu-item" id="menuMap"><span class="mi">⌖</span><b>نقشه</b><small>مشاهده موقعیت املاک</small></button>
      <button class="menu-item" id="menuMine"><span class="mi">▣</span><b>آگهی‌های من</b><small>مدیریت پرونده‌های شما</small></button>
    </div>
    <div class="menu-list">
      <button id="menuContracts"><span class="ml-icon">▤</span><span>قرارداد و قولنامه</span></button>
      <button id="menuDetailedMaps"><span class="ml-icon">🗺️</span><span>نقشه‌های تفصیلی شهرداری</span></button>
      <button id="menuNotify"><span class="ml-icon">🔔</span><span>اعلان‌های گوشی</span><span class="pill" id="notifyPill">${notify?'فعال':'غیرفعال'}</span></button>
      <button id="menuInstall"><span class="ml-icon">📲</span><span>نصب برنامه روی گوشی</span></button>
      <button id="menuContact"><span class="ml-icon">☎</span><span>تماس با ما</span></button>
      <button id="menuTheme"><span class="ml-icon">◐</span><span>تغییر حالت نمایش</span></button>
    </div>
    <div class="update-card"><b>به‌روزرسانی هوشمند</b><p>نسخه جدید برنامه هنگام اتصال به اینترنت بررسی می‌شود و فایل‌های قدیمی کش‌شده به‌صورت کنترل‌شده جایگزین می‌شوند.</p><button class="btn btn-sm" id="checkUpdate">بررسی به‌روزرسانی</button></div>
    <div class="drawer-section" style="margin-top:12px"><h4>🛡️ پنل اپراتور</h4><div class="field-hint">دسترسی اپراتور فقط از طریق احراز هویت Backend انجام می‌شود. هیچ رمز اپراتوری داخل برنامه نگهداری نمی‌شود.</div></div>
  </div>`;
}
function bindDrawerHandlers(){
  const close=document.getElementById('drawerClose');if(close)close.onclick=closeDrawer;
  const go=(tab,screen)=>()=>{state.tab=tab;if(tab==='post'){state.post.screen=screen||'wizard';state.post.step=1}closeDrawer();render();};
  ['menuBrowse','menuPost','menuMap','menuMine'].forEach(id=>{const e=document.getElementById(id);if(!e)return;e.onclick=id==='menuBrowse'?go('browse'):id==='menuPost'?go('post'):id==='menuMap'?go('map'):go('post','mine');});
  const contracts=document.getElementById('menuContracts');if(contracts)contracts.onclick=()=>{state.tab='post';state.post.screen='mine';closeDrawer();render();toast('برای هر آگهی می‌توانید پیش‌نویس قرارداد ایجاد کنید.');};
  const dm=document.getElementById('menuDetailedMaps');if(dm)dm.onclick=()=>{state.tab='detailedMaps';closeDrawer();render();};
  const notify=document.getElementById('menuNotify');if(notify)notify.onclick=async()=>{const ok=await enablePushNotifications();if(ok){localStorage.setItem('khb_push_enabled','1');closeDrawer();openDrawer();}};
  const install=document.getElementById('menuInstall');if(install)install.onclick=()=>installApp();
  const theme=document.getElementById('menuTheme');if(theme)theme.onclick=()=>{document.getElementById('themeBtn')?.click();closeDrawer();};
  const contact=document.getElementById('menuContact');if(contact)contact.onclick=()=>{closeDrawer();toast('اطلاعات تماس در نسخه عملیاتی از تنظیمات سامانه خوانده می‌شود.');};
  const update=document.getElementById('checkUpdate');if(update)update.onclick=()=>checkForAppUpdate(true);
}

/* ---------- نصب، به‌روزرسانی و اعلان ---------- */
let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;});
async function installApp(){
  if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;return;}
  toast('اگر گزینه نصب نمایش داده نمی‌شود، از منوی مرورگر «افزودن به صفحه اصلی / نصب برنامه» را انتخاب کنید.');
}
async function enablePushNotifications(){
  if(!('Notification' in window)){toast('این دستگاه/مرورگر از اعلان وب پشتیبانی نمی‌کند.');return false;}
  const p=await Notification.requestPermission();
  if(p!=='granted'){toast('اجازه اعلان داده نشد.');return false;}
  if('serviceWorker' in navigator){
    const reg=await navigator.serviceWorker.ready;
    if('PushManager' in window){
      const existing=await reg.pushManager.getSubscription();
      /* برای نسخه بدون Backend فقط permission/local capability فعال می‌شود؛ اتصال VAPID در Backend انجام خواهد شد. */
      if(existing)localStorage.setItem('khb_push_endpoint',existing.endpoint);
    }
  }
  try{new Notification('۴ دیواری',{body:'اعلان‌های برنامه فعال شد.',icon:'assets/icons/icon-192.png'});}catch(e){}
  toast('اعلان‌های گوشی فعال شد. اتصال ارسال اعلان از سرور در نسخه عملیاتی انجام می‌شود.'); return true;
}
async function checkForAppUpdate(manual=false){
  try{
    const r=await fetch('./version.json?ts='+Date.now(),{cache:'no-store'}); const remote=await r.json();
    const current=window.KHB_BUILD||'0.4.0';
    if(remote.version && remote.version!==current){toast('نسخه جدید پیدا شد؛ برنامه در حال آماده‌سازی به‌روزرسانی است.');await navigator.serviceWorker?.getRegistration().then(reg=>reg?.update());setTimeout(()=>location.reload(),900);}
    else if(manual)toast('برنامه به‌روز است.');
  }catch(e){if(manual)toast('بررسی به‌روزرسانی به اتصال اینترنت نیاز دارد.');}
}
window.addEventListener('load',()=>{setTimeout(()=>checkForAppUpdate(false),1800);});

/* ============================ چاپ / PDF ============================ */
function buildPrintable(l){
  return `
    <h2 style="text-align:center;">برگه تایید ${l.isTender?'مناقصه':'آگهی'} — ۴ دیواری</h2><hr>
    <p><b>کد انتشار:</b> ${l.publishCode}</p>
    <p><b>دسته‌بندی:</b> ${catLabel(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)}</p>
    <p><b>موقعیت:</b> ${l.province} - ${l.city}</p>
    <p><b>عنوان:</b> ${l.title}</p>
    <p><b>قیمت / شرایط:</b> ${priceSummary(l)}</p>
    <p><b>توضیحات:</b> ${l.desc||'—'}</p>
    <p><b>تاریخ ثبت:</b> ${fmtDate(l.createdAt)}</p>
    <p><b>تاریخ تایید:</b> ${fmtDate(Date.now())}</p><hr>
    <p style="font-size:12px;color:#666;">این سند به‌صورت خودکار از اپلیکیشن ۴ دیواری صادر شده است.</p>
  `;
}
function buildContractPrintable(l){
  const c=l.contract;
  return `
    <h2 style="text-align:center;">قرارداد اولیه معامله — ۴ دیواری</h2><hr>
    <p><b>موضوع:</b> ${l.title} (${catLabel(l.category, l.isTender?TENDER_CATEGORIES:CATEGORIES)})</p>
    <p><b>موقعیت ملک:</b> ${l.province} - ${l.city}</p>
    <p><b>طرف اول:</b> ${c.partyA} — کد ملی: ${c.partyANational||'—'}</p><p><b>طرف دوم:</b> ${c.partyB} — کد ملی: ${c.partyBNational||'—'} — موبایل: ${c.partyBPhone||'—'}</p>
    <p><b>درصد حق‌العمل بنگاه (اپراتور ۴ دیواری):</b> ${c.percent}٪</p>
    <p><b>تاریخ تنظیم:</b> ${fmtDate(c.createdAt)}</p><hr>
    <p style="font-size:12px;color:#666;">این برگه پیش‌نویس اولیه قرارداد است و می‌بایست نزد اپراتور و طبق ضوابط سامانه کاتب (kateb.ir) تکمیل و ثبت رسمی شود.</p>
  `;
}
function doPrint(html){ document.getElementById('printArea').innerHTML = html; window.print(); }

/* ============================ رویدادها ============================ */
function bindDynamicHandlers(){
  const view = document.getElementById('view');
  const isTenderScreen = state.tab==='tenders' && state.tenders.screen==='wizard';

  const aboutToggle=document.getElementById('aboutToggle');
  if(aboutToggle) aboutToggle.addEventListener('click', ()=>{
    const box=document.getElementById('aboutBox');
    const open = box.style.display!=='none';
    box.style.display = open? 'none':'block';
    aboutToggle.textContent = open? 'درباره ۴ دیواری و نحوه کار آن بیشتر بدانید ▾' : 'بستن توضیحات ▴';
  });

  // ---- Browse filters ----
  const fp=document.getElementById('fProvince'); if(fp) fp.addEventListener('change', e=>{ state.browse.province=e.target.value; state.browse.city=''; render(); });
  const fc=document.getElementById('fCity'); if(fc) fc.addEventListener('change', e=>{ state.browse.city=e.target.value; render(); });
  ['fPriceMin','fPriceMax','fAreaMin','fAreaMax'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('change', e=>{
      const map={fPriceMin:'priceMin',fPriceMax:'priceMax',fAreaMin:'areaMin',fAreaMax:'areaMax'};
      state.browse[map[id]] = e.target.value; render();
    });
  });
  const fRooms=document.getElementById('fRooms'); if(fRooms) fRooms.addEventListener('change', e=>{ state.browse.rooms=e.target.value; render(); });
  view.querySelectorAll('[data-fcat]').forEach(el=>el.addEventListener('click', ()=>{ const v=el.dataset.fcat; state.browse.category = state.browse.category===v? '' : v; render(); }));
  view.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click', ()=>{ state.browse.detailId=el.dataset.open; render(); }));
  const backBrowse=view.querySelector('[data-back="browse"]'); if(backBrowse) backBrowse.addEventListener('click', ()=>{ state.browse.detailId=null; render(); });
  const contactBtn=view.querySelector('[data-contact]'); if(contactBtn) contactBtn.addEventListener('click', ()=> toast('گفتگو با آگهی‌دهنده آغاز شد. (شبیه‌سازی چت)'));
  const callBtn=view.querySelector('[data-call]'); if(callBtn) callBtn.addEventListener('click', ()=> toast('درخواست تماس ثبت شد — بر اساس تنظیم آگهی‌دهنده، تماس گرفته می‌شود. (شبیه‌سازی)'));

  // ---- Wizard: step 1 ----
  const dOrg=document.getElementById('dOrg'); if(dOrg) dOrg.addEventListener('input', e=>{ getDraft(isTenderScreen).orgName=e.target.value; refreshNextBtn(isTenderScreen); });
  view.querySelectorAll('[data-setcat]').forEach(el=>el.addEventListener('click', ()=>{ getDraft(isTenderScreen).category=el.dataset.setcat; render(); }));
  const dProvince=document.getElementById('dProvince'); if(dProvince) dProvince.addEventListener('change', e=>{ getDraft(isTenderScreen).province=e.target.value; getDraft(isTenderScreen).city=''; render(); });
  const dCountry=document.getElementById('dCountry'); if(dCountry) dCountry.addEventListener('change', e=>{ const d=getDraft(isTenderScreen); d.country=e.target.value; d.province=''; d.city=''; render(); });
  const dForeignProvince=document.getElementById('dForeignProvince'); if(dForeignProvince) dForeignProvince.addEventListener('input', e=>{getDraft(isTenderScreen).province=e.target.value;refreshNextBtn(isTenderScreen);});
  const dForeignCity=document.getElementById('dForeignCity'); if(dForeignCity) dForeignCity.addEventListener('input', e=>{getDraft(isTenderScreen).city=e.target.value;refreshNextBtn(isTenderScreen);});
  const dCity=document.getElementById('dCity'); if(dCity) dCity.addEventListener('change', e=>{ getDraft(isTenderScreen).city=e.target.value; render(); });
  const dTitle=document.getElementById('dTitle'); if(dTitle) dTitle.addEventListener('input', e=>{ getDraft(isTenderScreen).title=e.target.value; refreshNextBtn(isTenderScreen); });
  const dDesc=document.getElementById('dDesc'); if(dDesc) dDesc.addEventListener('input', e=>{
    let v=e.target.value; if(v.length>2000){ v=v.slice(0,2000); e.target.value=v; }
    getDraft(isTenderScreen).desc=v;
    const cnt=document.getElementById('descCounter'); if(cnt) cnt.textContent=toFa(v.length)+' / ۲۰۰۰';
  });

  // ---- Wizard: step 2 structural ----
  bindNum('sYear','structural.yearBuilt',isTenderScreen); bindNum('sRooms','structural.rooms',isTenderScreen);
  bindNum('sLand','structural.landArea',isTenderScreen); bindNum('sBuild','structural.buildArea',isTenderScreen);
  bindNum('sTerrace','structural.terrace',isTenderScreen); bindNum('sFloor','structural.floor',isTenderScreen);
  bindNum('sParking','structural.parking',isTenderScreen); bindNum('sStorage','structural.storage',isTenderScreen);
  bindNum('sBathArea','structural.bathArea',isTenderScreen); bindText('sPostal','postalCode',isTenderScreen);
  bindNum('sPoolArea','structural.poolArea',isTenderScreen); bindNum('sGreenhouseArea','structural.greenhouseArea',isTenderScreen);
  bindNum('sRoadWidth','structural.accessRoadWidth',isTenderScreen); bindText('sRoadType','structural.accessRoadType',isTenderScreen);
  bindText('sStrengthOther','structural.strengthOther',isTenderScreen); bindText('sOwnerExpectations','structural.ownerExpectations',isTenderScreen); bindText('sCommercialType','structural.commercialType',isTenderScreen); bindText('sStorefrontWidth','structural.storefrontWidth',isTenderScreen); bindText('sCeilingHeight','structural.ceilingHeight',isTenderScreen); bindText('sBusinessLicense','structural.businessLicense',isTenderScreen); bindText('sYardArea','structural.yardArea',isTenderScreen); bindText('sLoadingAccess','structural.loadingAccess',isTenderScreen); bindText('sIndustrialPower','structural.industrialPower',isTenderScreen);
  bindText('sAgriIrrigation','structural.agri.irrigationType',isTenderScreen); bindText('sWaterSource','structural.agri.waterSource',isTenderScreen); bindText('sRiserCount','structural.agri.riserCount',isTenderScreen); bindText('sPumpCount','structural.agri.pumpCount',isTenderScreen); bindText('sWaterRightDoc','structural.agri.waterRightDoc',isTenderScreen);
  bindText('sLandArea2','landInfo.area',isTenderScreen); bindText('sLandUse','landInfo.landUse',isTenderScreen); bindText('sPostal2','postalCode',isTenderScreen);
  bindText('sLandArea3','landInfo.area',isTenderScreen);
  const sFurnished=document.getElementById('sFurnished'); if(sFurnished) sFurnished.addEventListener('change', e=>{ getDraft(isTenderScreen).structural.furnished=e.target.checked; });
  const sElevator=document.getElementById('sElevator'); if(sElevator) sElevator.addEventListener('change', e=>{ getDraft(isTenderScreen).structural.elevator=e.target.checked; render(); });
  const sWater=document.getElementById('sWater'); if(sWater) sWater.addEventListener('change', e=>{ getDraft(isTenderScreen).structural.water=e.target.checked; });
  const sPower=document.getElementById('sPower'); if(sPower) sPower.addEventListener('change', e=>{ getDraft(isTenderScreen).structural.power=e.target.checked; });
  const sGas=document.getElementById('sGas'); if(sGas) sGas.addEventListener('change', e=>{ getDraft(isTenderScreen).structural.gas=e.target.checked; });
  [['sPressureIrrigation','pressureIrrigation'],['sDedicatedTransformer','dedicatedTransformer'],['sSeasonalPumpReduction','seasonalPumpReduction']].forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.addEventListener('change',e=>{getDraft(isTenderScreen).structural.agri[key]=e.target.checked;});});
  const sDedicatedMeter=document.getElementById('sDedicatedMeter'); if(sDedicatedMeter) sDedicatedMeter.addEventListener('change',e=>{getDraft(isTenderScreen).structural.dedicatedMeter=e.target.checked;});
  [['sThreePhase','threePhase'],['sCrane','crane'],['sVentilation','ventilation']].forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.addEventListener('change',e=>{getDraft(isTenderScreen).structural[key]=e.target.checked;});});
  view.querySelectorAll('[data-multitoggle]').forEach(el=>el.addEventListener('click', ()=>{
    const [group,val] = el.dataset.multitoggle.split(':');
    const fieldMap = {cooling:'coolingTypes', heating:'heatingTypes', security:'securityTypes', strength:'strengthTags'};
    const arr = getDraft(isTenderScreen).structural[fieldMap[group]];
    const idx = arr.indexOf(val);
    if(idx>=0) arr.splice(idx,1); else arr.push(val);
    render();
  }));
  view.querySelectorAll('[data-structfile]').forEach(el=>el.addEventListener('change', e=>{
    const key=el.dataset.structfile; const max=parseInt(el.dataset.structmax)||4;
    const arr = getDraft(isTenderScreen).structural[key];
    const files=Array.from(e.target.files||[]); const slotsLeft=max-arr.length;
    const toAdd=files.slice(0,slotsLeft); if(files.length>slotsLeft) toast('حداکثر '+toFa(max)+' عکس مجاز است.');
    let remaining=toAdd.length; if(remaining===0){ render(); return; }
    toAdd.forEach(f=>fileToThumb(f,480,dataUrl=>{ arr.push(dataUrl); remaining--; if(remaining===0) render(); }));
  }));
  view.querySelectorAll('[data-rmstruct]').forEach(el=>el.addEventListener('click', ()=>{ const [key,idx]=el.dataset.rmstruct.split(':'); getDraft(isTenderScreen).structural[key].splice(+idx,1); render(); }));

  // ---- Wizard: step 3 pricing ----
  bindNumWords('pDeposit','pricing.deposit',isTenderScreen); bindNumWords('pMonthly','pricing.monthly',isTenderScreen);
  bindNumWords('pTotal','pricing.total',isTenderScreen); bindNumWords('pPerMeter','pricing.perMeter',isTenderScreen);
  const pPhone=document.getElementById('pPhone'); if(pPhone) pPhone.addEventListener('input', e=>{ getDraft(isTenderScreen).phone=e.target.value; refreshNextBtn(isTenderScreen); });
  view.querySelectorAll('[data-setanswer]').forEach(el=>el.addEventListener('click', ()=>{ getDraft(isTenderScreen).answerMode=el.dataset.setanswer; render(); }));

  // ---- Wizard: step 4 identity ----
  view.querySelectorAll('[data-idfile]').forEach(el=>el.addEventListener('change', e=>{
    const key=el.dataset.idfile; const file=e.target.files[0]; if(!file) return;
    fileToThumb(file,480,dataUrl=>{ getDraft(isTenderScreen).identity[key]=dataUrl; render(); });
  }));

  // ---- Wizard: step 5 property docs ----
  view.querySelectorAll('[data-propfile]').forEach(el=>el.addEventListener('change', e=>{
    const key=el.dataset.propfile; const files=Array.from(e.target.files||[]); let remaining=files.length;
    files.forEach(f=>fileToThumb(f,480,dataUrl=>{ getDraft(isTenderScreen).property[key].push(dataUrl); remaining--; if(remaining===0) render(); }));
  }));
  view.querySelectorAll('[data-rmprop]').forEach(el=>el.addEventListener('click', ()=>{ const [key,idx]=el.dataset.rmprop.split(':'); getDraft(isTenderScreen).property[key].splice(+idx,1); render(); }));

  // ---- Wizard: step 6 deal photos ----
  const dealInput=document.getElementById('dealFileInput'); if(dealInput) dealInput.addEventListener('change', e=>{
    const d=getDraft(isTenderScreen); const files=Array.from(e.target.files||[]); const slotsLeft=8-d.dealPhotos.length;
    const toAdd=files.slice(0,slotsLeft); if(files.length>slotsLeft) toast('حداکثر ۸ عکس مجاز است.');
    let remaining=toAdd.length; if(remaining===0) return;
    toAdd.forEach(f=>fileToThumb(f,480,dataUrl=>{ d.dealPhotos.push(dataUrl); remaining--; if(remaining===0) render(); }));
  });
  view.querySelectorAll('[data-rmdeal]').forEach(el=>el.addEventListener('click', ()=>{ getDraft(isTenderScreen).dealPhotos.splice(+el.dataset.rmdeal,1); render(); }));

  // ---- Wizard nav ----
  ['p','t'].forEach(prefix=>{
    const isT = prefix==='t';
    const next=view.querySelector(`[data-wiz="next-${prefix}"]`); if(next) next.addEventListener('click', ()=>{ (isT?state.tenders:state.post).step++; render(); });
    const back=view.querySelector(`[data-wiz="back-${prefix}"]`); if(back) back.addEventListener('click', ()=>{ (isT?state.tenders:state.post).step--; render(); });
    const submit=view.querySelector(`[data-wiz="submit-${prefix}"]`); if(submit) submit.addEventListener('click', ()=> submitEntry(isT));
    const goto=view.querySelector(`[data-goto="mine-${prefix}"]`); if(goto) goto.addEventListener('click', e=>{ e.preventDefault(); (isT?state.tenders:state.post).screen='mine'; render(); });
    const backFresh=view.querySelector(`[data-back="fresh-${isT?'tender':'post'}"]`); if(backFresh) backFresh.addEventListener('click', ()=>{
      const st = isT?state.tenders:state.post; st.screen='wizard'; st.step=1; st.draft=blankDraft(isT); render();
    });
  });
  view.querySelectorAll('[data-editmine]').forEach(el=>el.addEventListener('click', ()=>{
    const l=listings.find(x=>x.id===el.dataset.editmine); if(!l) return;
    if(l.status!=='rejected'){ toast('فقط موارد ردشده قابل ویرایش هستند.'); return; }
    const st = l.isTender? state.tenders : state.post;
    st.draft=JSON.parse(JSON.stringify(l)); st.screen='wizard'; st.step=1; render();
  }));

  // ---- Tenders tab ----
  const newTender=view.querySelector('[data-newtender]'); if(newTender) newTender.addEventListener('click', ()=>{ state.tenders.screen='wizard'; state.tenders.step=1; state.tenders.draft=blankDraft(true); render(); });
  const tProvince=document.getElementById('tProvince'); if(tProvince) tProvince.addEventListener('change', e=>{ state.tenders.province=e.target.value; render(); });
  const tCategory=document.getElementById('tCategory'); if(tCategory) tCategory.addEventListener('change', e=>{ state.tenders.category=e.target.value; render(); });
  view.querySelectorAll('[data-opentender]').forEach(el=>el.addEventListener('click', ()=>{ toast('برای مشاهده کامل مناقصه با کارشناس ۴ دیواری تماس بگیرید.'); }));

  // ---- Map ----
  const locateBtn=document.getElementById('locateBtn'); if(locateBtn) locateBtn.addEventListener('click', handleLocate);

  // ---- Operator ----
  const odm=document.getElementById('openDetailedMapsOperator');if(odm)odm.onclick=()=>{state.tab='detailedMapsOperator';render();};
  view.querySelectorAll('[data-opfilter]').forEach(el=>el.addEventListener('click', ()=>{ state.operator.filter=el.dataset.opfilter; render(); }));
  view.querySelectorAll('[data-opopen]').forEach(el=>el.addEventListener('click', ()=>{ state.operator.selectedId=el.dataset.opopen; render(); }));
  const backOp=view.querySelector('[data-back="operator-list"]'); if(backOp) backOp.addEventListener('click', ()=>{ state.operator.selectedId=null; render(); });
  const backDrawer=view.querySelector('[data-back="drawer"]'); if(backDrawer) backDrawer.addEventListener('click', ()=>{ state.tab='browse'; render(); openDrawer(); });
  const defPercent=document.getElementById('defPercent'); if(defPercent) defPercent.addEventListener('change', e=>{ settings.defaultPercent=parseFloat(e.target.value)||0; saveSettings(settings); toast('درصد پیش‌فرض به‌روزرسانی شد.'); });
  const approveBtn=view.querySelector('[data-approve]'); if(approveBtn) approveBtn.addEventListener('click', ()=>{
    const l=listings.find(x=>x.id===approveBtn.dataset.approve); l.status='approved'; l.publishCode='KB-'+Math.floor(10000+Math.random()*89999);
    saveListings(listings); toast('تایید شد. پیامک حاوی کد انتشار برای متقاضی ارسال شد. (شبیه‌سازی)'); render();
  });
  const rejectBtn=view.querySelector('[data-reject]'); if(rejectBtn) rejectBtn.addEventListener('click', ()=>{
    const l=listings.find(x=>x.id===rejectBtn.dataset.reject); const reason=document.getElementById('rejectReason').value.trim();
    l.status='rejected'; l.rejectReason=reason||'مدارک ناقص یا نامعتبر'; saveListings(listings);
    toast('رد شد. پیامک عدم تایید برای متقاضی ارسال شد. (شبیه‌سازی)'); render();
  });
  const printBtn=view.querySelector('[data-print]'); if(printBtn) printBtn.addEventListener('click', ()=>{ const l=listings.find(x=>x.id===printBtn.dataset.print); doPrint(buildPrintable(l)); });
  const contractStartBtn=view.querySelector('[data-contractstart]'); if(contractStartBtn) contractStartBtn.addEventListener('click', ()=>{ const l=listings.find(x=>x.id===contractStartBtn.dataset.contractstart); openContractModal(l); });
  const printContractBtn=view.querySelector('[data-printcontract]'); if(printContractBtn) printContractBtn.addEventListener('click', ()=>{ const l=listings.find(x=>x.id===printContractBtn.dataset.printcontract); doPrint(buildContractPrintable(l)); });
}

function getDraft(isTender){ return isTender? state.tenders.draft : state.post.draft; }
function setPath(obj, path, val){ const parts=path.split('.'); let cur=obj; for(let i=0;i<parts.length-1;i++) cur=cur[parts[i]]; cur[parts[parts.length-1]]=val; }
function bindNum(id, path, isTender){ const el=document.getElementById(id); if(el) el.addEventListener('input', e=>{ setPath(getDraft(isTender), path, e.target.value); }); }
function bindText(id, path, isTender){ const el=document.getElementById(id); if(el) el.addEventListener('input', e=>{ setPath(getDraft(isTender), path, e.target.value); }); }
function bindNumWords(id, path, isTender){ const el=document.getElementById(id); if(el) el.addEventListener('input', e=>{ setPath(getDraft(isTender), path, e.target.value); render(); }); }

function refreshNextBtn(isTender){
  const prefix = isTender?'t':'p';
  const btn=document.querySelector(`[data-wiz="next-${prefix}"], [data-wiz="submit-${prefix}"]`);
  const st = isTender? state.tenders : state.post;
  if(btn) btn.disabled = !validateStep(st.step, st.draft, isTender);
}

function handleLocate(){
  if(!navigator.geolocation){ toast('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.'); return; }
  toast('در حال دریافت موقعیت...');
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    const approved = listings.filter(l=>l.status==='approved' && !l.isTender);
    const withDist = approved.map(l=>{
      const c = PROVINCE_COORDS[l.province]; const dist = c? haversine(latitude,longitude,c[0],c[1]) : 99999;
      return {l, dist};
    }).sort((a,b)=>a.dist-b.dist).slice(0,8);
    document.getElementById('mapResultsTitle').textContent = 'نزدیک‌ترین آگهی‌ها به شما';
    document.getElementById('mapResults').innerHTML = withDist.map(({l,dist})=>{
      const c = PROVINCE_COORDS[l.province];
      const mapUrl = c? `https://www.google.com/maps/search/?api=1&query=${c[0]},${c[1]}` : '#';
      return `<div class="map-list-item">
        <div><b style="font-size:13px;">${l.title}</b><div class="muted">${l.province} · ${l.city} — حدود ${Math.round(dist)} کیلومتر</div></div>
        <a href="${mapUrl}" target="_blank" rel="noopener"><button class="btn btn-outline btn-sm">نقشه</button></a>
      </div>`;
    }).join('') || `<div class="empty-state"><div class="ic">🗺️</div><div>آگهی‌ای یافت نشد.</div></div>`;
  }, err=>{
    toast('دسترسی به موقعیت مکانی رد شد یا در دسترس نیست. از فهرست استان‌ها استفاده کنید.');
  }, {timeout:8000});
}

function openContractModal(l){
  const wrap=document.createElement('div'); wrap.innerHTML=contractModalHtml(l); document.body.appendChild(wrap.firstElementChild);
  document.getElementById('contractCancel').addEventListener('click', ()=> document.getElementById('contractModal').remove());
  document.getElementById('contractSave').addEventListener('click', ()=>{
    const partyA=document.getElementById('partyA').value.trim(); const partyB=document.getElementById('partyB').value.trim();
    const partyANational=document.getElementById('partyANational').value.trim(); const partyBNational=document.getElementById('partyBNational').value.trim(); const partyBPhone=document.getElementById('partyBPhone').value.trim();
    const percent=parseFloat(document.getElementById('contractPercent').value)||0;
    if(!partyA || !partyB){ toast('نام هر دو طرف معامله را وارد کنید.'); return; }
    l.contract={partyA,partyANational,partyB,partyBNational,partyBPhone,percent,createdAt:Date.now()}; saveListings(listings);
    document.getElementById('contractModal').remove(); toast('قرارداد اولیه ثبت شد.'); render();
  });
}

function submitEntry(isTender){
  const st = isTender? state.tenders : state.post;
  const d = st.draft;
  if(!d.id) d.id=uid();
  d.status='pending'; d.rejectReason=''; d.createdAt=Date.now(); d.__mine=true;
  const idx=listings.findIndex(x=>x.id===d.id); if(idx>=0) listings[idx]=d; else listings.push(d);
  saveListings(listings);
  st.draft=blankDraft(isTender); st.step=1; st.screen='mine';
  render();
  toast(isTender? 'مناقصه شما ثبت شد و برای بررسی اپراتور ارسال شد.' : 'آگهی شما ثبت شد و برای بررسی اپراتور ارسال شد.');
}


/* ============================ نسخه ارتقایافته 0.2 ============================ */
const APP_CONFIG={version:'0.7.2',apiBaseUrl:window.KHB_API_BASE||'',paymentGatewayUrl:'',maxImageBytes:900*1024,imageMaxWidth:1600,maxDealPhotos:8};
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function ensureDraftShape(d){d=d||blankDraft(false);d.country=d.country||'IR';d.location=d.location||{lat:null,lng:null,source:null,accuracy:null};d.payment=d.payment||{representative:false,status:'not_started',amount:0,authority:null};d.structural=d.structural||{};d.structural.agri=d.structural.agri||{irrigationType:'',waterSource:'',riserCount:'',pressureIrrigation:false,dedicatedTransformer:false,pumpCount:'',seasonalPumpReduction:false,waterRightDoc:''};d.structural.ownerExpectations=d.structural.ownerExpectations||'';d.structural.commercialType=d.structural.commercialType||'';d.structural.storefrontWidth=d.structural.storefrontWidth||'';d.structural.ceilingHeight=d.structural.ceilingHeight||'';d.structural.businessLicense=d.structural.businessLicense||'';d.structural.yardArea=d.structural.yardArea||'';d.structural.loadingAccess=d.structural.loadingAccess||'';d.structural.industrialPower=d.structural.industrialPower||'';d.structural.threePhase=!!d.structural.threePhase;d.structural.crane=!!d.structural.crane;d.structural.ventilation=!!d.structural.ventilation;return d;}
const DB_NAME='khb_local_v2',DB_VERSION=2,STORE='app',MEDIA_STORE='media';let idbPromise=null;
function openKHBDB(){if(idbPromise)return idbPromise;idbPromise=new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('IndexedDB unavailable'));const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE);if(!r.result.objectStoreNames.contains(MEDIA_STORE))r.result.createObjectStore(MEDIA_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return idbPromise;}
async function idbGet(k){const db=await openKHBDB();return new Promise((res,rej)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbPut(k,v){const db=await openKHBDB();return new Promise((res,rej)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(v,k);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
async function migrateLocalData(){try{const existing=await idbGet('listings');if(existing)listings=existing.map(ensureDraftShape);else await idbPut('listings',(listings||[]).map(ensureDraftShape));const saved=await idbGet('settings');if(saved)settings={...settings,...saved};else await idbPut('settings',settings);applyTheme();render()}catch(e){console.warn('IndexedDB:',e)}}
function saveListings(list){listings=list;idbPut('listings',list.map(ensureDraftShape)).catch(()=>{try{localStorage.setItem(LKEY,JSON.stringify(list))}catch(e){}})}
function saveSettings(s){settings=s;idbPut('settings',s).catch(()=>{try{localStorage.setItem(SKEY,JSON.stringify(s))}catch(e){}})}
function compressImage(file,opts={}){const maxW=opts.maxW||APP_CONFIG.imageMaxWidth,quality=opts.quality||.78;return new Promise((resolve,reject)=>{if(!file||!file.type.startsWith('image/'))return reject(new Error('not image'));const r=new FileReader();r.onerror=()=>reject(r.error);r.onload=e=>{const img=new Image();img.onerror=()=>reject(new Error('bad image'));img.onload=()=>{const scale=Math.min(1,maxW/img.width),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);let q=quality,data=c.toDataURL('image/jpeg',q);while(data.length*.75>APP_CONFIG.maxImageBytes&&q>.45){q-=.06;data=c.toDataURL('image/jpeg',q)}resolve({dataUrl:data,width:w,height:h,originalBytes:file.size,estimatedBytes:Math.round(data.length*.75)})};img.src=e.target.result};r.readAsDataURL(file)})}
function fileToThumb(file,maxW,cb){compressImage(file,{maxW:maxW||900}).then(r=>cb(r.dataUrl)).catch(()=>toast('تصویر قابل پردازش نبود.'))}
const PAGE_GUIDANCE={1:['ملک خود را معرفی کنید','اطلاعات این مرحله برای ساخت پرونده ملک استفاده می‌شود؛ شما کنترل می‌کنید چه چیزی در آگهی عمومی نمایش داده شود.'],2:['مشخصات ملک را با دقت ثبت کنید','مواردی را که ندارید خالی بگذارید؛ این اطلاعات برای شناخت دقیق‌تر ملک و کاهش ابهام معامله ثبت می‌شود.'],3:['قیمت و نحوه پاسخگویی','قیمت پیشنهادی شما مبنای بررسی اولیه است و بدون تأیید شما تغییر نمی‌کند.'],4:['اطلاعات هویتی شما محرمانه است','مدارک هویتی برای احراز هویت دریافت می‌شود و نباید در آگهی عمومی نمایش داده شود.'],5:['اسناد ملک را با خیال راحت ارسال کنید','اسناد برای بررسی و تشکیل پرونده دریافت می‌شوند و نباید در آگهی عمومی قرار بگیرند.'],6:['تصاویر ملک را اضافه کنید','برنامه قبل از ذخیره، تصاویر را کم‌حجم می‌کند تا اینترنت و فضای ذخیره‌سازی شما کمتر مصرف شود.'],7:['یک بار دیگر پرونده را بررسی کنید','قبل از ثبت نهایی، اطلاعات و تصاویر را مرور کنید؛ سپس پرونده برای بررسی کارشناسی ارسال می‌شود.']};
function guidanceBox(step){const g=PAGE_GUIDANCE[step]||PAGE_GUIDANCE[1];return '<div class="page-guidance"><div class="page-guidance-title">'+g[0]+'</div><div>'+g[1]+'</div></div>'}
function locationCard(d){const l=d.location||{},has=Number.isFinite(Number(l.lat))&&Number.isFinite(Number(l.lng));return '<div class="location-card"><div><b>موقعیت ملک روی نقشه</b><div class="muted">می‌توانید نقطه تقریبی ملک را انتخاب کنید تا حریم خصوصی مالک حفظ شود.</div></div><button class="btn btn-outline btn-sm" data-pick-location>⌖ '+(has?'ویرایش موقعیت':'انتخاب روی نقشه')+'</button>'+(has?'<div class="location-coords">'+Number(l.lat).toFixed(5)+' ، '+Number(l.lng).toFixed(5)+'</div>':'')+'</div>'}
function openMapPicker(d){const wrap=document.createElement('div');wrap.className='modal-overlay';wrap.innerHTML='<div class="modal-sheet map-modal"><div class="modal-handle"></div><div class="drawer-title">انتخاب موقعیت ملک <button class="icon-btn modal-close">×</button></div><div class="info-box">نقطه را روی نقشه لمس کنید. موقعیت تقریبی هم قابل ثبت است.</div><div id="propertyMap" class="property-map"></div><div class="btn-row" style="margin-top:10px"><button class="btn btn-outline" data-use-location>موقعیت فعلی من</button><button class="btn btn-primary" data-save-map>ثبت موقعیت</button></div></div>';document.body.appendChild(wrap);let picked=d.location?.lat?{lat:+d.location.lat,lng:+d.location.lng}:null,map,marker;const init=()=>{if(!window.L){toast('نقشه در دسترس نیست؛ اتصال اینترنت را بررسی کنید.');return}map=L.map('propertyMap').setView(picked?[picked.lat,picked.lng]:[35.6892,51.389],picked?15:5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);if(picked)marker=L.marker([picked.lat,picked.lng]).addTo(map);map.on('click',e=>{picked={lat:e.latlng.lat,lng:e.latlng.lng};if(marker)marker.setLatLng(e.latlng);else marker=L.marker(e.latlng).addTo(map)})};requestAnimationFrame(init);wrap.querySelector('.modal-close').onclick=()=>wrap.remove();wrap.querySelector('[data-save-map]').onclick=()=>{if(!picked)return toast('یک نقطه روی نقشه انتخاب کنید.');d.location={...picked,source:'map',accuracy:'approx'};wrap.remove();render()};wrap.querySelector('[data-use-location]').onclick=()=>navigator.geolocation?.getCurrentPosition(p=>{picked={lat:p.coords.latitude,lng:p.coords.longitude};if(map){map.setView([picked.lat,picked.lng],16);map.fire('click',{latlng:L.latLng(picked.lat,picked.lng)});}},()=>toast('دسترسی به موقعیت مکانی رد شد.'))}
function stepCategory(d,isTender){
  const list=isTender?TENDER_CATEGORIES:CATEGORIES;
  const country=(d.country||'IR');
  const locationHtml=country==='IR'
    ? '<div class="filter-row"><div><label class="field-label">استان</label><select id="dProvince"><option value="">انتخاب کنید</option>'+Object.keys(PROVINCES).map(p=>'<option value="'+escapeHtml(p)+'" '+(d.province===p?'selected':'')+'>'+escapeHtml(p)+'</option>').join('')+'</select></div><div><label class="field-label">شهرستان</label><select id="dCity" '+(!d.province?'disabled':'')+'><option value="">انتخاب کنید</option>'+(d.province?(PROVINCES[d.province]||[]).map(c=>'<option value="'+escapeHtml(c)+'" '+(d.city===c?'selected':'')+'>'+escapeHtml(c)+'</option>').join(''):'')+'</select></div></div>'
    : '<div class="filter-row"><div><label class="field-label">استان / منطقه (اختیاری)</label><input id="dForeignProvince" value="'+escapeHtml(d.province||'')+'" placeholder="مثلاً: استانبول"></div><div><label class="field-label">شهر</label><input id="dForeignCity" value="'+escapeHtml(d.city||'')+'" placeholder="مثلاً: استانبول"></div></div>';
  return (isTender?'<label class="field-label">نام سازمان / اداره برگزارکننده</label><input type="text" id="dOrg" value="'+escapeHtml(d.orgName)+'">':'')+'<label class="field-label">دسته‌بندی</label><div class="cat-grid">'+list.map(c=>'<div class="cat-chip '+(d.category===c.id?'active':'')+'" data-setcat="'+c.id+'"><span class="ic">'+c.ic+'</span><span>'+c.label+'</span></div>').join('')+'</div><label class="field-label">کشور</label><select id="dCountry">'+COUNTRIES.map(c=>'<option value="'+c.id+'" '+(country===c.id?'selected':'')+'>'+c.flag+' '+c.name+'</option>').join('')+'</select>'+locationHtml+locationCard(d)+'<label class="field-label">عنوان '+(isTender?'مناقصه':'آگهی')+'</label><input type="text" id="dTitle" value="'+escapeHtml(d.title)+'" placeholder="مثلاً: آپارتمان ۸۵ متری دو خواب"><label class="field-label">توضیحات</label><textarea id="dDesc" rows="4" maxlength="2000" placeholder="توضیحات تکمیلی">'+escapeHtml(d.desc)+'</textarea><div class="field-hint">'+toFa((d.desc||'').length)+' / ۲۰۰۰</div>'
}
function stepPricing(d){const cat=catInfo(d.category);return (cat.rent?'<label class="field-label">مبلغ بیعانه/رهن (تومان)</label><input type="number" id="pDeposit" value="'+escapeHtml(d.pricing.deposit)+'"><div class="words-hint">'+(d.pricing.deposit?numberToWordsFa(d.pricing.deposit):'به حروف اینجا نمایش داده می‌شود')+'</div><label class="field-label">اجاره ماهانه (تومان)</label><input type="number" id="pMonthly" value="'+escapeHtml(d.pricing.monthly)+'"><div class="words-hint">'+(d.pricing.monthly?numberToWordsFa(d.pricing.monthly):'به حروف اینجا نمایش داده می‌شود')+'</div>':'<label class="field-label">مبلغ کل (تومان)</label><input type="number" id="pTotal" value="'+escapeHtml(d.pricing.total)+'"><div class="words-hint">'+(d.pricing.total?numberToWordsFa(d.pricing.total):'به حروف اینجا نمایش داده می‌شود')+'</div><label class="field-label">قیمت هر متر (تومان) — اختیاری</label><input type="number" id="pPerMeter" value="'+escapeHtml(d.pricing.perMeter)+'"><div class="words-hint">'+(d.pricing.perMeter?numberToWordsFa(d.pricing.perMeter):'به حروف اینجا نمایش داده می‌شود')+'</div>')+'<label class="field-label">شماره تماس متقاضی</label><input type="tel" id="pPhone" value="'+escapeHtml(d.phone)+'" placeholder="۰۹xxxxxxxxx"><label class="field-label">پاسخگویی تماس‌ها</label><div class="cat-grid"><div class="cat-chip '+(d.answerMode==='self'?'active':'')+'" data-setanswer="self"><span class="ic">🙋</span><span>خودم پاسخگو هستم</span></div><div class="cat-chip '+(d.answerMode==='company'?'active':'')+'" data-setanswer="company"><span class="ic">🏢</span><span>۴ دیواری نمایندگی کند</span></div></div>'+(d.answerMode==='company'?'<div class="payment-card"><b>نمایندگی ۴ دیواری</b><p>پس از اتصال حساب شرکت به درگاه بانکی، هزینه خدمات از داخل برنامه پرداخت می‌شود.</p><button class="btn btn-success btn-sm" data-start-payment>💳 پرداخت هزینه نمایندگی</button><small>درگاه واقعی نیازمند اتصال امن Backend و کلیدهای درگاه است.</small></div>':'')}
function stepIdentity(d){const box=(k,l,s)=>'<div class="upload-box '+(d.identity[k]?'has-file':'')+'">'+(d.identity[k]?'<img src="'+d.identity[k]+'" style="max-height:90px;border-radius:8px;margin-bottom:6px;">':'')+'<span class="ic">'+(d.identity[k]?'✅':'🪪')+'</span><div class="lbl">'+l+'</div><div class="sub">'+(d.identity[k]?'بارگذاری شد — برای تغییر لمس کنید':s)+'</div><input type="file" accept="image/*" data-idfile="'+k+'"></div>';return guidanceBox(4)+'<div class="privacy-hero"><b>اطلاعات هویتی شما نزد ۴ دیواری محرمانه است.</b><span>این مدارک برای احراز هویت و تشکیل پرونده دریافت می‌شود و در آگهی عمومی نمایش داده نمی‌شود.</span></div>'+box('national','عکس کارت ملی','واضح و کامل')+box('birth','عکس شناسنامه','صفحه اول شناسنامه')+box('sana','عکس برگه ثنا','تصویر صفحه ثبت‌نام ثنا')}
function stepProperty(d){const section=(k,l)=>'<label class="field-label">'+l+' <span class="pill">'+d.property[k].length+' عکس</span></label><div class="thumb-grid">'+d.property[k].map((src,i)=>'<div class="thumb"><img src="'+src+'"><button class="rm" data-rmprop="'+k+':'+i+'">✕</button></div>').join('')+'<div class="thumb-add"><span>➕</span><span>افزودن</span><input type="file" accept="image/*" multiple data-propfile="'+k+'"></div></div>';return guidanceBox(5)+'<div class="privacy-hero"><b>این اسناد سرمایه و حریم خصوصی شما هستند.</b><span>در نسخه نهایی، فایل‌ها باید در فضای خصوصی و با کنترل دسترسی نگهداری شوند.</span></div>'+section('ownership','اسناد مالکیت')+section('construction','اسناد ساخت‌وساز')+section('permits','مجوزات و مستندات')+'<div class="field-hint">حداقل یک تصویر از اسناد مالکیت برای ادامه لازم است.</div>'}
function stepDealPhotos(d){return guidanceBox(6)+'<label class="field-label">عکس‌های مورد معامله <span class="pill">'+d.dealPhotos.length+' از ۸</span></label><div class="thumb-grid">'+d.dealPhotos.map((src,i)=>'<div class="thumb"><img src="'+src+'"><button class="rm" data-rmdeal="'+i+'">✕</button></div>').join('')+(d.dealPhotos.length<8?'<div class="thumb-add"><span>📷</span><span>افزودن عکس</span><small>خودکار کم‌حجم می‌شود</small><input type="file" accept="image/*" multiple id="dealFileInput"></div>':'')+'</div><div class="compression-note">⚡ عکس‌های بزرگ قبل از ذخیره کم‌حجم می‌شوند.</div>'}
function renderWizard(isTender){const st=isTender?state.tenders:state.post;st.draft=ensureDraftShape(st.draft);const d=st.draft,step=st.step,can=validateStep(step,d,isTender),prefix=isTender?'t':'p';const dots='<div class="stepper">'+WIZARD_STEPS.map((x,i)=>{const n=i+1;return '<div class="step-dot '+(n<step?'done ':'')+(n===step?'current':'')+'" title="'+x+'">'+(n<step?'✓':n)+'</div>'+(i<6?'<div class="step-line '+(n<step?'done':'')+'"></div>':'')}).join('')+'</div>';let body=step===1?stepCategory(d,isTender):step===2?stepStructural(d):step===3?stepPricing(d):step===4?stepIdentity(d):step===5?stepProperty(d):step===6?stepDealPhotos(d):stepReview(d,isTender);return '<div class="wizard-header"><div class="wizard-kicker">مرحله '+toFa(step)+' از ۷</div>'+dots+'<div class="step-title">'+(PAGE_GUIDANCE[step]?.[0]||WIZARD_STEPS[step-1])+'</div><div class="step-sub">'+(PAGE_GUIDANCE[step]?.[1]||stepSub(step))+'</div></div>'+body+'<div class="btn-row" style="margin-top:20px">'+(step>1?'<button class="btn btn-outline" data-wiz="back-'+prefix+'">مرحله قبل</button>':'')+(step<7?'<button class="btn btn-primary" data-wiz="next-'+prefix+'" '+(can?'':'disabled')+'>مرحله بعد</button>':'<button class="btn btn-primary" data-wiz="submit-'+prefix+'" '+(can?'':'disabled')+'>ثبت نهایی</button>')+'</div>'}
function startHeroCarousel(){const slides=document.querySelectorAll('[data-hero-slide]');if(!slides.length)return;let idx=0;carouselTimers.hero=setInterval(()=>{idx=(idx+1)%slides.length;slides.forEach((e,i)=>e.classList.toggle('show',i===idx));document.querySelectorAll('[data-hero-dot]').forEach((e,i)=>e.classList.toggle('on',i===idx))},6000);document.querySelectorAll('.hero-slide-copy').forEach(el=>{let drag=false,sx=0,sy=0,ox=0,oy=0;el.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;sy=e.clientY;el.setPointerCapture?.(e.pointerId)});el.addEventListener('pointermove',e=>{if(!drag)return;el.style.transform='translate('+Math.max(-80,Math.min(80,ox+e.clientX-sx))+'px,'+Math.max(-35,Math.min(35,oy+e.clientY-sy))+'px)'});el.addEventListener('pointerup',()=>{drag=false;const m=(el.style.transform||'').match(/translate\(([-\d.]+)px,([-\d.]+)px/);if(m){ox=+m[1];oy=+m[2]}});el.addEventListener('pointercancel',()=>drag=false)})}
function heroCarouselHtml(){const a=[['hero-art-house','⌂','ملک شما، با پرونده‌ای منظم','آگهی، مدارک و سابقه ملک را در یک مسیر مشخص ثبت کنید.'],['hero-art-map','⌖','ملک را روی نقشه پیدا کنید','موقعیت ملک را انتخاب کنید و آگهی‌های اطراف را ببینید.'],['hero-art-trust','✓','امنیت اطلاعات، قبل از معامله','مدارک هویتی و مالکیتی از آگهی عمومی جدا نگهداری می‌شوند.'],['hero-art-3d','◇','آینده: بازدید مجازی و 3D','برای آگهی‌های منتخب، امکان تور مجازی و نمای سه‌بعدی اضافه می‌شود.']];return '<div class="hero-carousel hero-carousel-large">'+a.map((x,i)=>'<div class="hero-slide '+x[0]+' '+(i?'':'show')+'" data-hero-slide="'+i+'"><div class="hero-art-icon">'+x[1]+'</div><div class="hero-slide-copy"><h3>'+x[2]+'</h3><p>'+x[3]+'</p></div></div>').join('')+'<div class="hero-dots">'+a.map((x,i)=>'<span class="hero-dot '+(i?'':'on')+'" data-hero-dot="'+i+'"></span>').join('')+'</div></div><div class="trust-strip"><b>حریم خصوصی</b><span>مدارک شما برای آگهی عمومی نمایش داده نمی‌شود.</span></div><div class="quick-actions"><button class="quick-action" data-quick="post"><span>＋</span><b>ثبت آگهی</b><small>فروش، اجاره یا مشارکت</small></button><button class="quick-action" data-quick="map"><span>⌖</span><b>نقشه املاک</b><small>مشاهده ملک‌ها روی نقشه</small></button></div><div class="about-toggle" id="aboutToggle">درباره ۴ دیواری و نحوه کار آن بیشتر بدانید ▾</div><div class="about-box" id="aboutBox" style="display:none">'+ABOUT_TEXT.replace(/\n/g,'<br><br>')+'</div>'}
function renderBrowse(){
  if(state.browse.detailId){
    const l=listings.find(x=>x.id===state.browse.detailId&&!x.isTender);
    if(l)return renderListingDetail(l);
    state.browse.detailId=null;
  }
  const b=state.browse;
  b.countries=Array.isArray(b.countries)?b.countries:[];
  b.provinces=Array.isArray(b.provinces)?b.provinces:[];
  b.cities=Array.isArray(b.cities)?b.cities:[];
  let r=listings.filter(l=>l.status==='approved'&&!l.isTender);
  r=r.filter(l=>{
    const country=l.country||'IR';
    const hasLocation=b.countries.length||b.provinces.length||b.cities.length;
    if(!hasLocation) return true;
    const countrySelected=b.countries.includes(country);
    if(country!=='IR') return countrySelected;
    if(b.cities.length) return b.cities.includes(l.city||'');
    if(b.provinces.length) return b.provinces.includes(l.province||'');
    return countrySelected || b.countries.includes('IR');
  });
  if(b.category)r=r.filter(l=>l.category===b.category);
  if(b.priceMin)r=r.filter(l=>parseNum(l.pricing?.total)>=parseNum(b.priceMin)||!l.pricing?.total);
  if(b.priceMax)r=r.filter(l=>!l.pricing?.total||parseNum(l.pricing.total)<=parseNum(b.priceMax));
  r.sort((x,y)=>y.createdAt-x.createdAt);
  const selectedCountryNames=b.countries.map(countryLabel);
  const selectedLocations=[...selectedCountryNames,...b.provinces,...b.cities];
  const countries=COUNTRIES.map(c=>'<button type="button" class="location-pill '+(b.countries.includes(c.id)?'active':'')+'" data-country="'+c.id+'">'+c.flag+' '+c.name+'</button>').join('');
  const provinceButtons=Object.keys(PROVINCES).map(p=>'<button type="button" class="location-pill '+(b.provinces.includes(p)?'active':'')+'" data-province="'+escapeHtml(p)+'">'+escapeHtml(p)+'</button>').join('');
  const citySet=new Set();
  (b.provinces.length?b.provinces:Object.keys(PROVINCES)).forEach(p=>(PROVINCES[p]||[]).forEach(c=>citySet.add(c)));
  const cityButtons=[...citySet].sort((a,z)=>a.localeCompare(z,'fa')).map(c=>'<button type="button" class="location-pill '+(b.cities.includes(c)?'active':'')+'" data-city="'+escapeHtml(c)+'">'+escapeHtml(c)+'</button>').join('');
  return heroCarouselHtml()+
    '<div class="section-title page-section-title">جست‌وجوی ملک</div>'+
    '<div class="multi-location-box"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>📍 محدوده‌های جست‌وجو</b><button type="button" class="btn btn-outline btn-sm" id="clearLocations">پاک کردن</button></div>'+
    '<div class="location-pills"><button type="button" class="location-pill all '+(b.countries.includes('IR')&&!b.provinces.length&&!b.cities.length?'active':'')+'" data-all-iran="1">🇮🇷 تمام ایران</button></div>'+
    '<details class="multi-location-section" open><summary>کشورها</summary><div class="location-pills">'+countries+'</div></details>'+
    '<details class="multi-location-section"><summary>چند استان هم‌زمان</summary><div class="multi-location-scroll"><div class="location-pills">'+provinceButtons+'</div></div></details>'+
    '<details class="multi-location-section"><summary>چند شهرستان هم‌زمان</summary><div class="multi-location-scroll"><div class="location-pills">'+cityButtons+'</div></div></details>'+
    '<div class="selection-count">'+(selectedLocations.length?('انتخاب شده: '+selectedLocations.map(escapeHtml).join(' · ')):'همه محدوده‌ها')+'</div>'+
    '<div class="foreign-note">کشورهای همجوار ایران نیز قابل جست‌وجو هستند. اجاره کوتاه‌مدت خارجی می‌تواند شامل قیمت، شهر و اطلاعات تماس آگهی‌دهنده باشد.</div></div>'+
    '<div class="filter-card"><div class="filter-row"><div><label class="field-label">حداقل قیمت</label><input type="number" id="fPriceMin" value="'+escapeHtml(b.priceMin||'')+'"></div><div><label class="field-label">حداکثر قیمت</label><input type="number" id="fPriceMax" value="'+escapeHtml(b.priceMax||'')+'"></div></div></div>'+
    '<div class="section-title">دسته‌بندی</div><div class="cat-grid">'+CATEGORIES.map(c=>'<div class="cat-chip '+(b.category===c.id?'active':'')+'" data-fcat="'+c.id+'"><span class="ic">'+c.ic+'</span><span>'+c.label+'</span></div>').join('')+'</div>'+
    '<div class="section-title">'+toFa(r.length)+' آگهی یافت شد</div>'+(r.length?r.map(renderListingCard).join(''):'<div class="empty-state"><div class="ic">🔍</div><div>آگهی‌ای با این فیلتر پیدا نشد.</div></div>');
}

function downloadWord(l){const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>body{font-family:Tahoma,Arial;direction:rtl;line-height:2}h1{color:#2f8f63}table{width:100%;border-collapse:collapse}td{border:1px solid #ccc;padding:6px}</style></head><body><h1>۴ دیواری — پرونده آگهی</h1><table><tr><td>کد انتشار</td><td>'+escapeHtml(l.publishCode||l.id)+'</td></tr><tr><td>عنوان</td><td>'+escapeHtml(l.title)+'</td></tr><tr><td>دسته</td><td>'+escapeHtml(catLabel(l.category,CATEGORIES))+'</td></tr><tr><td>موقعیت</td><td>'+escapeHtml((l.province||'')+' / '+(l.city||''))+'</td></tr><tr><td>قیمت</td><td>'+escapeHtml(priceSummary(l))+'</td></tr><tr><td>توضیحات</td><td>'+escapeHtml(l.desc||'—')+'</td></tr><tr><td>تاریخ ثبت</td><td>'+escapeHtml(fmtDate(l.createdAt))+'</td></tr></table><h2>تصاویر و مدارک</h2><p>عکس ملک: '+(l.dealPhotos||[]).length+' — اسناد مالکیت: '+(l.property?.ownership||[]).length+' — اسناد ساخت‌وساز: '+(l.property?.construction||[]).length+' — مجوزات: '+(l.property?.permits||[]).length+'</p><p>اصل اسناد باید در بایگانی امن نگهداری شود.</p></body></html>';const blob=new Blob([html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='khb-'+(l.publishCode||l.id)+'.doc';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

const _oldBind=bindDynamicHandlers;function bindDynamicHandlers(){_oldBind();
  document.querySelectorAll('[data-country]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.country;const a=state.browse.countries||[];state.browse.countries=a.includes(id)?a.filter(x=>x!==id):[...a,id];if(id!=='IR'){state.browse.provinces=[];state.browse.cities=[];}render();}));
  const allIran=document.getElementById('clearLocations'); if(allIran)allIran.addEventListener('click',()=>{state.browse.countries=[];state.browse.provinces=[];state.browse.cities=[];render();});
  document.querySelectorAll('[data-all-iran]').forEach(b=>b.addEventListener('click',()=>{state.browse.countries=['IR'];state.browse.provinces=[];state.browse.cities=[];render();}));
  document.querySelectorAll('[data-province]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.province,a=state.browse.provinces||[];state.browse.provinces=a.includes(v)?a.filter(x=>x!==v):[...a,v];if(state.browse.provinces.length)state.browse.countries=state.browse.countries.filter(x=>x!=='IR');render();}));
  document.querySelectorAll('[data-city]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.city,a=state.browse.cities||[];state.browse.cities=a.includes(v)?a.filter(x=>x!==v):[...a,v];if(state.browse.cities.length)state.browse.countries=state.browse.countries.filter(x=>x!=='IR');render();}));
  document.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.quick==='post'?'post':'map';if(state.tab==='post'){state.post.screen='wizard';state.post.step=1}render()}));document.querySelectorAll('[data-pick-location]').forEach(b=>b.addEventListener('click',()=>openMapPicker(getDraft(false))));document.querySelectorAll('[data-word]').forEach(b=>b.addEventListener('click',()=>{const l=listings.find(x=>x.id===b.dataset.word);if(l)downloadWord(l)}));document.querySelectorAll('[data-start-payment]').forEach(b=>b.addEventListener('click',()=>{if(!APP_CONFIG.paymentGatewayUrl)toast('درگاه هنوز به حساب شرکت متصل نشده است؛ مسیر پرداخت آماده است.');else location.href=APP_CONFIG.paymentGatewayUrl+'?listingId='+encodeURIComponent(getDraft(false).id||'new')}))}
setTimeout(migrateLocalData,0);


/* ============================ v0.6 — منطقه کاربر + نقشه‌های تفصیلی ============================ */
const USER_REGION_KEY='khb_user_region_v1';
const DETAIL_MAPS_KEY='khb_detailed_maps_v1';
state.detailedMapsFilter=state.detailedMapsFilter||{province:'',city:''};
const CITY_HINTS={
  'تهران':[35.6892,51.3890],'کرج':[35.8400,50.9391],'تبریز':[38.0962,46.2738],'ارومیه':[37.5527,45.0761],
  'اردبیل':[38.2498,48.2933],'اصفهان':[32.6546,51.6680],'ایلام':[33.6374,46.4227],'بوشهر':[28.9234,50.8203],
  'شهرکرد':[32.3256,50.8644],'بیرجند':[32.8663,59.2211],'مشهد':[36.2605,59.6168],'بجنورد':[37.4750,57.3333],
  'اهواز':[31.3183,48.6706],'زنجان':[36.6736,48.4787],'سمنان':[35.5729,53.3971],'زاهدان':[29.4963,60.8629],
  'شیراز':[29.5918,52.5837],'قزوین':[36.2688,50.0041],'قم':[34.6416,50.8746],'سنندج':[35.3219,46.9862],
  'کرمان':[30.2839,57.0834],'کرمانشاه':[34.3277,47.0778],'یاسوج':[30.6683,51.5878],'گرگان':[36.8393,54.4342],
  'رشت':[37.2809,49.5832],'خرم‌آباد':[33.4878,48.3558],'ساری':[36.5633,53.0601],'اراک':[34.0917,49.6892],
  'بندرعباس':[27.1832,56.2666],'همدان':[34.7992,48.5146],'یزد':[31.8974,54.3569],'کاشان':[33.9850,51.4100],
  'سنقر':[34.7830,47.6000],'روانسر':[34.7150,46.6500],'پاوه':[35.0433,46.3560],'جوانرود':[34.8067,46.4881],
  'مریوان':[35.5260,46.1760],'سقز':[36.2400,46.2700],'بانه':[35.9980,45.8850],'مرودشت':[29.8740,52.8020],
  'شهریار':[35.6590,51.0590],'ری':[35.6000,51.4400],'اسلامشهر':[35.5440,51.2300],'دماوند':[35.7170,52.0690]
};
function saveUserRegion(r){try{localStorage.setItem(USER_REGION_KEY,JSON.stringify(r||{}));}catch(e){}}
function loadUserRegion(){try{return JSON.parse(localStorage.getItem(USER_REGION_KEY))||{};}catch(e){return {};}}
function regionDistance(a,b){return haversine(a[0],a[1],b[0],b[1]);}
function nearestProvince(lat,lng){let best=null;Object.entries(PROVINCE_COORDS).forEach(([p,c])=>{const d=regionDistance([lat,lng],c);if(!best||d<best.distance)best={province:p,distance:d};});return best;}
function nearestCity(lat,lng,province){const names=province&&PROVINCES[province]?PROVINCES[province]:Object.keys(CITY_HINTS);let best=null;names.forEach(name=>{const c=CITY_HINTS[name];if(!c)return;const d=regionDistance([lat,lng],c);if(!best||d<best.distance)best={city:name,distance:d};});return best;}
async function detectUserRegion(opts={silent:false}){
  if(!navigator.geolocation){if(!opts.silent)toast('این گوشی موقعیت‌یابی GPS را ارائه نمی‌کند.');return null;}
  return new Promise(resolve=>navigator.geolocation.getCurrentPosition(async pos=>{
    const lat=pos.coords.latitude,lng=pos.coords.longitude,accuracy=pos.coords.accuracy;
    let province=nearestProvince(lat,lng)?.province||'', city=nearestCity(lat,lng,province)?.city||'';
    try{
      const u='https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lng)+'&zoom=10&accept-language=fa';
      const r=await fetch(u,{headers:{'Accept':'application/json'}}); if(r.ok){const j=await r.json();const a=j.address||{};province=a.state||a.province||province;city=a.county||a.city||a.town||a.municipality||city;}
    }catch(e){}
    const region={lat,lng,accuracy,province,city,detectedAt:Date.now(),source:'gps'};saveUserRegion(region);state.userRegion=region;
    if(!state.browse.province && province) state.browse.province=province;
    if(!state.browse.city && city) state.browse.city=city;
    if(!opts.silent)toast('منطقه شما شناسایی شد: '+(province||'—')+' · '+(city||'—'));
    render();resolve(region);
  },()=>{if(!opts.silent)toast('اجازه دسترسی به GPS داده نشد؛ می‌توانید منطقه را دستی انتخاب کنید.');resolve(null);},{enableHighAccuracy:true,timeout:9000,maximumAge:15*60*1000}));
}
function userRegionBanner(){const r=state.userRegion||{};return '<div class="user-region-card"><div class="user-region-icon">⌖</div><div class="user-region-copy"><b>منطقه پیشنهادی شما</b><span>'+(r.province?escapeHtml(r.province)+' · '+escapeHtml(r.city||'شهرستان نامشخص'):'برای پیشنهاد آگهی‌های نزدیک، موقعیت گوشی را فعال کنید.')+'</span></div><button class="btn btn-outline btn-sm" id="detectRegionBtn">'+(r.province?'تغییر منطقه':'تشخیص GPS')+'</button></div>'}
function manualRegionPanel(){const r=state.userRegion||{};return '<div class="filter-card region-manual"><div class="section-title" style="margin-top:0">انتخاب منطقه جست‌وجو</div><div class="filter-row"><div><label class="field-label">استان کاربر</label><select id="userProvince"><option value="">انتخاب استان</option>'+Object.keys(PROVINCES).map(p=>'<option value="'+escapeHtml(p)+'" '+(r.province===p?'selected':'')+'>'+escapeHtml(p)+'</option>').join('')+'</select></div><div><label class="field-label">شهرستان کاربر</label><select id="userCity" '+(!r.province?'disabled':'')+'><option value="">انتخاب شهرستان</option>'+(r.province?(PROVINCES[r.province]||[]).map(c=>'<option value="'+escapeHtml(c)+'" '+(r.city===c?'selected':'')+'>'+escapeHtml(c)+'</option>').join(''):'')+'</select></div></div></div>'}
function detailedMapsLoad(){try{return JSON.parse(localStorage.getItem(DETAIL_MAPS_KEY))||[];}catch(e){return [];}}
function detailedMapsSave(a){try{localStorage.setItem(DETAIL_MAPS_KEY,JSON.stringify(a));}catch(e){toast('فضای ذخیره‌سازی کافی نیست؛ برای فایل‌های بزرگ‌تر نسخه سروری لازم است.');}}
function renderDetailedMaps(){
  const maps=detailedMapsLoad(),r=state.userRegion||{},f=state.detailedMapsFilter||{};
  const filtered=maps.filter(m=>!(f.province||r.province)&&true).filter(m=>!(f.province||r.province)||(m.province===(f.province||r.province))).filter(m=>!(f.city||r.city)||(m.city===(f.city||r.city)));
  return '<div class="section-title">🗺️ نقشه‌های تفصیلی شهرداری</div>'+userRegionBanner()+'<div class="info-box">نقشه‌های تفصیلی توسط اپراتور و پس از دریافت از شهرداری بارگذاری می‌شوند. این بخش می‌تواند شامل نقشه شهر، الحاقات، قواره‌بندی زمین‌ها، معابر و کاربری‌های مصوب باشد.</div><div class="filter-card"><label class="field-label">استان</label><select id="dmProvince"><option value="">همه استان‌ها</option>'+Object.keys(PROVINCES).map(p=>'<option value="'+escapeHtml(p)+'" '+((state.detailedMapsFilter?.province||'')===p?'selected':'')+'>'+escapeHtml(p)+'</option>').join('')+'</select><label class="field-label" style="margin-top:10px">شهرستان</label><select id="dmCity" disabled><option value="">همه شهرستان‌ها</option></select></div>'+(filtered.length?filtered.map(m=>'<div class="detail-map-card"><div class="detail-map-head"><div><b>'+escapeHtml(m.title||'نقشه تفصیلی')+'</b><div class="muted">📍 '+escapeHtml(m.province||'')+' · '+escapeHtml(m.city||'')+'</div></div><span class="pill">'+(m.type==='pdf'?'PDF':'تصویر')+'</span></div>'+(m.description?'<p class="muted">'+escapeHtml(m.description)+'</p>':'')+(m.type==='pdf'?'<iframe class="detail-map-frame" src="'+m.dataUrl+'" title="'+escapeHtml(m.title||'نقشه تفصیلی')+'"></iframe>':'<img class="detail-map-image" src="'+m.dataUrl+'" alt="'+escapeHtml(m.title||'نقشه تفصیلی')+'">')+'</div>').join(''):'<div class="empty-state"><div class="ic">🗺️</div><div>برای این منطقه هنوز نقشه تفصیلی بارگذاری نشده است.</div></div>')}
function renderDetailedMapsOperator(){
  const maps=detailedMapsLoad();
  return '<div class="back-row" data-back="operator-list">→ بازگشت به فهرست اپراتور</div><div class="section-title">مدیریت نقشه‌های تفصیلی</div><div class="info-box">اپراتور می‌تواند فایل نقشه‌ای را که از شهرداری دریافت کرده، همراه با استان و شهرستان در اینجا ثبت کند. برای نسخه عملیاتی، این فایل‌ها باید روی فضای ذخیره‌سازی سرور نگهداری شوند.</div><div class="filter-card"><label class="field-label">استان</label><select id="dmOpProvince"><option value="">انتخاب استان</option>'+Object.keys(PROVINCES).map(p=>'<option value="'+escapeHtml(p)+'" '+((state.detailedMapsFilter?.province||'')===p?'selected':'')+'>'+escapeHtml(p)+'</option>').join('')+'</select><label class="field-label" style="margin-top:10px">شهرستان</label><select id="dmOpCity" disabled><option value="">انتخاب شهرستان</option></select><label class="field-label" style="margin-top:10px">عنوان نقشه</label><input id="dmTitle" placeholder="مثلاً: نقشه تفصیلی الحاقی روانسر"><label class="field-label" style="margin-top:10px">توضیح</label><textarea id="dmDesc" rows="3" placeholder="توضیح درباره محدوده، سال نقشه یا مرجع شهرداری"></textarea><label class="field-label" style="margin-top:10px">فایل نقشه</label><input type="file" id="dmFile" accept="image/*,application/pdf"><button class="btn btn-primary" id="dmUpload" style="margin-top:10px">⬆️ بارگذاری نقشه</button></div>'+(maps.length?maps.map(m=>'<div class="op-item"><div class="op-item-top"><b>'+escapeHtml(m.title||'نقشه تفصیلی')+'</b><button class="btn btn-danger btn-sm" data-dmremove="'+escapeHtml(m.id)+'">حذف</button></div><div class="muted" style="margin-top:4px">'+escapeHtml(m.province||'')+' · '+escapeHtml(m.city||'')+' · '+(m.type==='pdf'?'PDF':'تصویر')+'</div></div>').join(''):'<div class="empty-state">هنوز نقشه‌ای ثبت نشده است.</div>');
}
function detailedMapCitySelect(province,cityId){const el=document.getElementById(cityId);if(!el)return;el.disabled=!province;el.innerHTML='<option value="">انتخاب شهرستان</option>'+(province?(PROVINCES[province]||[]).map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join(''):'');}
function bindRegionAndMaps(){
  const detect=document.getElementById('detectRegionBtn');if(detect)detect.onclick=()=>detectUserRegion();
  const up=document.getElementById('userProvince');if(up)up.onchange=e=>{const r={...(state.userRegion||{}),province:e.target.value,city:''};state.userRegion=r;state.browse.province=e.target.value;state.browse.city='';saveUserRegion(r);render();};
  const uc=document.getElementById('userCity');if(uc)uc.onchange=e=>{const r={...(state.userRegion||{}),city:e.target.value};state.userRegion=r;state.browse.province=r.province||state.browse.province;state.browse.city=e.target.value;saveUserRegion(r);render();};
  const dp=document.getElementById('dmProvince');if(dp)dp.onchange=e=>{state.detailedMapsFilter={province:e.target.value,city:''};detailedMapCitySelect(e.target.value,'dmCity');render();};
  const dc=document.getElementById('dmCity');if(dc)dc.onchange=e=>{state.detailedMapsFilter.city=e.target.value;render();};
  const op=document.getElementById('dmOpProvince');if(op)op.onchange=e=>detailedMapCitySelect(e.target.value,'dmOpCity');
  const upload=document.getElementById('dmUpload');if(upload)upload.onclick=async()=>{const province=document.getElementById('dmOpProvince')?.value,city=document.getElementById('dmOpCity')?.value,title=document.getElementById('dmTitle')?.value.trim(),desc=document.getElementById('dmDesc')?.value.trim(),file=document.getElementById('dmFile')?.files?.[0];if(!province||!city||!title||!file)return toast('استان، شهرستان، عنوان و فایل نقشه الزامی است.');if(file.size>8*1024*1024)return toast('برای نسخه آفلاین فعلی فایل حداکثر ۸ مگابایت باشد.');const reader=new FileReader();reader.onload=()=>{const maps=detailedMapsLoad();maps.unshift({id:uid(),province,city,title,description:desc,type:file.type==='application/pdf'?'pdf':'image',dataUrl:reader.result,createdAt:Date.now()});detailedMapsSave(maps);toast('نقشه تفصیلی ثبت شد.');render();};reader.readAsDataURL(file);};
  document.querySelectorAll('[data-dmremove]').forEach(b=>b.onclick=()=>{const maps=detailedMapsLoad().filter(m=>m.id!==b.dataset.dmremove);detailedMapsSave(maps);render();});
}
function renderDetailedMapsFiltersOnly(){/* فیلترها در نسخه بعدی با داده سروری کامل می‌شوند. */}

/* بازنویسی کنترل منطقه‌ای صفحه آگهی‌ها بدون از بین بردن فیلترهای قبلی */
const _renderBrowseBase=renderBrowse;
renderBrowse=function(){
  return userRegionBanner()+_renderBrowseBase();
};
const _renderBase=render;
render=function(){
  Object.values(carouselTimers).forEach(clearInterval);
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
  const view=document.getElementById('view');
  if(state.tab==='browse') view.innerHTML=renderBrowse();
  else if(state.tab==='post') view.innerHTML=renderPost();
  else if(state.tab==='tenders') view.innerHTML=renderTendersTab();
  else if(state.tab==='map') view.innerHTML=renderMap();
  else if(state.tab==='detailedMaps') view.innerHTML=renderDetailedMaps();
  else if(state.tab==='detailedMapsOperator') view.innerHTML=renderDetailedMapsOperator();
  else if(state.tab==='operator') view.innerHTML=renderOperator();
  bindDynamicHandlers();bindRegionAndMaps();startCardCarousels();startHeroCarousel();view.scrollTop=0;
};
const _bindBase=bindDynamicHandlers;
bindDynamicHandlers=function(){
  _bindBase();
  const r=state.userRegion||{};
  if(state.tab==='browse'){
    /* پیشنهاد منطقه فقط در اولین ورود/بدون فیلتر؛ انتخاب دستی کاربر دست‌نخورده می‌ماند. */
    const autoProvince=!state.browse.province&&r.province;
    const autoCity=!state.browse.city&&r.city;
    if(autoProvince){
      /* صرفاً در UI پیشنهاد می‌دهیم؛ فیلتر اصلی با لمس کاربر اعمال می‌شود. */
    }
  }
};
state.userRegion=loadUserRegion();
if(!state.userRegion.province && !state.userRegion.city){setTimeout(()=>detectUserRegion({silent:true}),700);}

/* ============================ شروع ============================ */
render();


function loadLeafletForMap(){
  if(window.L)return Promise.resolve();
  if(window.__khbLeafletPromise)return window.__khbLeafletPromise;
  window.__khbLeafletPromise=new Promise((resolve,reject)=>{
    const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
    const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=()=>resolve();s.onerror=()=>reject(new Error('Leaflet CDN unavailable'));document.head.appendChild(s);
  });
  return window.__khbLeafletPromise;
}

/* ---------- نقشه عمومی آگهی‌ها ---------- */
function renderMap(){
  const approved=listings.filter(l=>l.status==='approved'&&!l.isTender);
  const mapped=approved.filter(l=>l.location&&Number.isFinite(Number(l.location.lat))&&Number.isFinite(Number(l.location.lng)));
  return `<div class="page-guidance"><div class="page-guidance-title">نقشه املاک</div><div>ملک‌هایی که مالک برای نمایش عمومی موقعیت ثبت کرده است روی نقشه دیده می‌شوند. موقعیت خصوصی اسناد و اطلاعات هویتی نمایش داده نمی‌شود.</div></div><div id="publicMap" class="property-map public-map"></div><div class="section-title">آگهی‌های روی نقشه</div>${mapped.length?mapped.map(l=>{const lat=Number(l.location.lat),lng=Number(l.location.lng);const earth='https://earth.google.com/web/@'+lat+','+lng+',500a,1000d,35y,0h,0t,0r';return `<div class="map-list-item"><div><b>${escapeHtml(l.title)}</b><div class="muted">${escapeHtml(l.province||'')} · ${escapeHtml(l.city||'')}</div></div><div style="display:flex;gap:5px"><a href="${earth}" target="_blank" rel="noopener"><button class="btn btn-outline btn-sm">🌐 3D</button></a><button class="btn btn-primary btn-sm" data-open="${l.id}">مشاهده</button></div></div>`}).join(''):`<div class="empty-state"><div class="ic">⌖</div><div>هنوز آگهی عمومی دارای موقعیت نقشه ثبت نشده است.</div></div>`}`;
}
const _oldBind2=bindDynamicHandlers;function bindDynamicHandlers(){_oldBind2();if(state.tab==='map'){const el=document.getElementById('publicMap');if(el){if(window.L){initPublicMap(el);}else{el.innerHTML='<div class="empty-state"><div class="ic">🗺️</div><div>در حال آماده‌سازی نقشه…</div></div>';loadLeafletForMap().then(()=>{if(state.tab==='map')initPublicMap(document.getElementById('publicMap'));}).catch(()=>{if(el)el.innerHTML='<div class="empty-state"><div class="ic">🌐</div><div>برای نمایش نقشه، اتصال اینترنت را فعال کنید.</div></div>';});}}}}
function initPublicMap(el){if(!window.L||!el||el.dataset.mapReady==='1')return;el.dataset.mapReady='1';const mapped=listings.filter(l=>l.status==='approved'&&!l.isTender&&l.location&&Number.isFinite(Number(l.location.lat)));const center=mapped[0]?[+mapped[0].location.lat,+mapped[0].location.lng]:[35.6892,51.389];const map=L.map(el).setView(center,mapped.length?7:5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);mapped.forEach(l=>{const m=L.marker([+l.location.lat,+l.location.lng]).addTo(map);m.bindPopup('<b>'+escapeHtml(l.title)+'</b><br>'+escapeHtml(l.province||'')+' · '+escapeHtml(l.city||''));});}

/* ============================ ۴ دیواری 0.7 — معامله‌محور ============================
   امکانات این لایه:
   - ویدئوی معرفی ملک با دوربین/گالری و نگهداری Blob در IndexedDB
   - محدوده ملک با چند رأس و محاسبه تقریبی مساحت/محیط
   - بازدید مجازی مرحله‌ای از عکس/ویدئو
   - درخواست کارشناس رسمی دادگستری
   - صفحه خدمات و قیمت‌گذاری شفاف/تخفیف معرفی
   نکته: این نسخه همچنان Prototype/Local-first است؛ ذخیره‌سازی ابری، درگاه و اتصال واقعی
   به کارشناس/سامانه‌های رسمی نیازمند Backend و قراردادهای واقعی هستند.
*/

const FOURDIVARI_VERSION='0.7.1';
const MEDIA_URLS={};
const EXPERT_KEY='khb_expert_requests_v1';
const SERVICE_PRICES={
  contractForm:300000,
  contractService:5000000,
  firstDealDiscount:70
};

function expertRequestsLoad(){
  try{return JSON.parse(localStorage.getItem(EXPERT_KEY))||[];}catch(e){return [];}
}
function expertRequestsSave(a){try{localStorage.setItem(EXPERT_KEY,JSON.stringify(a));}catch(e){toast('ذخیره درخواست کارشناسی با محدودیت فضای محلی مواجه شد.');}}
function mediaPut(key,blob){
  return openKHBDB().then(db=>new Promise((resolve,reject)=>{
    const r=db.transaction(MEDIA_STORE,'readwrite').objectStore(MEDIA_STORE).put(blob,key);
    r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);
  })).catch(()=>{try{localStorage.setItem('khb_media_meta_'+key,JSON.stringify({size:blob.size,type:blob.type}));}catch(e){}});
}
function mediaGet(key){
  return openKHBDB().then(db=>new Promise((resolve,reject)=>{
    const r=db.transaction(MEDIA_STORE,'readonly').objectStore(MEDIA_STORE).get(key);
    r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);
  }));
}
function mediaDelete(key){
  return openKHBDB().then(db=>new Promise((resolve,reject)=>{
    const r=db.transaction(MEDIA_STORE,'readwrite').objectStore(MEDIA_STORE).delete(key);
    r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);
  })).catch(()=>{});
}
function videoLabel(bytes){
  const n=Number(bytes)||0;
  if(n<1024*1024)return `${Math.round(n/1024)} کیلوبایت`;
  return `${(n/(1024*1024)).toFixed(1)} مگابایت`;
}
function polygonAreaM2(points){
  if(!Array.isArray(points)||points.length<3)return 0;
  const R=6378137;
  const lat0=points.reduce((a,p)=>a+Number(p.lat),0)/points.length*Math.PI/180;
  const xy=points.map(p=>({x:R*Number(p.lng)*Math.PI/180*Math.cos(lat0),y:R*Number(p.lat)*Math.PI/180}));
  let sum=0; for(let i=0;i<xy.length;i++){const j=(i+1)%xy.length;sum+=xy[i].x*xy[j].y-xy[j].x*xy[i].y;}
  return Math.abs(sum)/2;
}
function polygonPerimeterM(points){
  if(!Array.isArray(points)||points.length<2)return 0;
  let total=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];total+=haversine(Number(a.lat),Number(a.lng),Number(b.lat),Number(b.lng))*1000;}return total;
}
function boundarySummary(d){
  const p=d.boundary?.points||[];const area=polygonAreaM2(p),per=polygonPerimeterM(p);
  return {count:p.length,area,perimeter:per};
}
function formatM2(n){return n?toFa(Math.round(n).toLocaleString('en-US'))+' مترمربع':'—';}
function formatMeters(n){return n?toFa(Math.round(n).toLocaleString('en-US'))+' متر':'—';}

function ensureFeatureShape(d){
  d=ensureDraftShape(d);
  d.boundary=d.boundary||{points:[],source:null,areaM2:0,perimeterM:0,updatedAt:null};
  d.videos=Array.isArray(d.videos)?d.videos:[];
  d.videoKey=d.videoKey||null;
  d.virtualTour=d.virtualTour||{enabled:false,sceneOrder:[]};
  d.expertRequests=Array.isArray(d.expertRequests)?d.expertRequests:[];
  d.payment=d.payment||{representative:false,status:'not_started',amount:0,authority:null};
  return d;
}

/* ---------- محدوده ملک ---------- */
async function openBoundaryPicker(d){
  const wrap=document.createElement('div');wrap.className='modal-overlay';
  wrap.innerHTML=`<div class="modal-sheet map-modal boundary-modal"><div class="modal-handle"></div>
    <div class="drawer-title">تعیین محدوده ملک <button class="icon-btn modal-close">×</button></div>
    <div class="info-box">روی چهار گوشه یا رأس‌های زمین لمس کنید. برای زمین‌های نامنظم می‌توانید بیش از ۴ نقطه انتخاب کنید. مساحت محاسبه‌شده تقریبی است و جایگزین نقشه‌برداری ثبتی نیست.</div>
    <div id="boundaryMap" class="property-map"></div>
    <div class="boundary-stats" id="boundaryStats">حداقل ۳ نقطه برای محاسبه مساحت لازم است.</div>
    <div class="btn-row"><button class="btn btn-outline" id="boundaryUndo">↶ حذف آخرین نقطه</button><button class="btn btn-outline" id="boundaryClear">پاک کردن</button></div>
    <div class="btn-row" style="margin-top:8px"><button class="btn btn-primary" id="boundarySave">ثبت محدوده</button></div>
  </div>`;
  document.body.appendChild(wrap);
  const points=(d.boundary?.points||[]).map(p=>({lat:+p.lat,lng:+p.lng}));
  let map=null,poly=null,markers=[];
  const stats=()=>{const s={count:points.length,area:polygonAreaM2(points),perimeter:polygonPerimeterM(points)};document.getElementById('boundaryStats').innerHTML=`<b>${toFa(s.count)} نقطه</b> · مساحت تقریبی: <b>${formatM2(s.area)}</b> · محیط تقریبی: <b>${formatMeters(s.perimeter)}</b>`;};
  const redraw=()=>{markers.forEach(m=>m.remove());markers=[];if(poly){poly.remove();poly=null;}if(!map)return;points.forEach((p,i)=>{const m=L.marker([p.lat,p.lng]).addTo(map);m.bindTooltip(String(i+1),{permanent:true,direction:'top',offset:[0,-8]});markers.push(m);});if(points.length>=2)poly=L.polygon(points,{color:'#27A56A',weight:3,fillOpacity:.18}).addTo(map);stats();};
  try{await loadLeafletForMap();}catch(e){wrap.remove();toast('نقشه برای تعیین محدوده نیاز به اینترنت دارد.');return;}
  map=L.map('boundaryMap').setView(points.length?[points[0].lat,points[0].lng]:[35.6892,51.389],points.length?15:5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(map);
  map.on('click',e=>{points.push({lat:e.latlng.lat,lng:e.latlng.lng});redraw();});
  redraw();
  document.getElementById('boundaryUndo').onclick=()=>{points.pop();redraw();};
  document.getElementById('boundaryClear').onclick=()=>{points.splice(0);redraw();};
  document.querySelector('.modal-close').onclick=()=>wrap.remove();
  document.getElementById('boundarySave').onclick=()=>{
    if(points.length<3){toast('برای تشکیل محدوده حداقل ۳ نقطه لازم است.');return;}
    d.boundary={points:points.map(p=>({lat:+p.lat,lng:+p.lng})),source:'in-app-map',areaM2:polygonAreaM2(points),perimeterM:polygonPerimeterM(points),updatedAt:Date.now()};
    wrap.remove();render();
  };
}

/* ---------- بازدید مجازی ---------- */
function openVirtualTour(l){
  const wrap=document.createElement('div');wrap.className='modal-overlay';
  wrap.innerHTML=`<div class="modal-sheet tour-modal"><div class="modal-handle"></div><div class="drawer-title">بازدید مجازی ملک <button class="icon-btn modal-close">×</button></div><div id="tourStage" class="tour-stage"></div><div id="tourCaption" class="tour-caption"></div><div class="btn-row"><button class="btn btn-outline" id="tourPrev">‹ قبلی</button><button class="btn btn-primary" id="tourNext">بعدی ›</button></div><div class="tour-note">این بازدید مجازی بر اساس محتوای ارائه‌شده توسط آگهی‌دهنده ساخته شده و جایگزین بازدید حضوری یا بررسی تخصصی نیست.</div></div>`;
  document.body.appendChild(wrap);
  const scenes=[];
  (l.dealPhotos||[]).forEach((src,i)=>scenes.push({type:'image',src,title:`نمای ${i+1}`}));
  const vk=l.videoKey||null;
  let idx=0;
  const renderScene=async()=>{
    const stage=document.getElementById('tourStage'),cap=document.getElementById('tourCaption');if(!stage)return;
    if(!scenes.length && !vk){stage.innerHTML='<div class="empty-state">برای این ملک هنوز محتوای بازدید مجازی ثبت نشده است.</div>';return;}
    if(idx<scenes.length){stage.innerHTML=`<img src="${scenes[idx].src}" alt="${escapeHtml(scenes[idx].title)}">`;cap.textContent=`${scenes[idx].title} · ${toFa(idx+1)} از ${toFa(scenes.length+(vk?1:0))}`;}
    else {stage.innerHTML='<div class="tour-loading">در حال آماده‌سازی ویدئو…</div>';try{const blob=await mediaGet(vk);if(blob){const u=URL.createObjectURL(blob);MEDIA_URLS['tour-'+vk]=u;stage.innerHTML=`<video controls playsinline preload="metadata" src="${u}"></video>`;cap.textContent=`ویدئوی معرفی · ${toFa(idx+1)} از ${toFa(scenes.length+1)}`;}else stage.innerHTML='<div class="empty-state">ویدئو در حافظه محلی پیدا نشد.</div>';}catch(e){stage.innerHTML='<div class="empty-state">ویدئو قابل بارگذاری نیست.</div>';}}
  };
  document.querySelector('.modal-close').onclick=()=>wrap.remove();
  document.getElementById('tourPrev').onclick=()=>{idx=Math.max(0,idx-1);renderScene();};
  document.getElementById('tourNext').onclick=()=>{idx=Math.min(scenes.length+(vk?1:0)-1,idx+1);renderScene();};
  renderScene();
}

/* ---------- درخواست کارشناس رسمی ---------- */
function expertRequestModal(listingId){
  const l=listings.find(x=>x.id===listingId)||{id:null,title:'درخواست عمومی کارشناسی',province:'',city:''};
  const wrap=document.createElement('div');wrap.className='modal-overlay';
  wrap.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div><div class="drawer-title">درخواست کارشناس رسمی دادگستری <button class="icon-btn modal-close">×</button></div>
  <div class="info-box"><b>موضوع کارشناسی را دقیق بنویسید.</b><br>۴ دیواری درخواست را ثبت و برای هماهنگی با کارشناس دارای صلاحیت پیگیری می‌کند. گزارش نهایی باید توسط خود کارشناس رسمی صادر و مهر/امضا شود.</div>
  <label class="field-label">موضوع کارشناسی</label><select id="expertSubject"><option value="value">تعیین ارزش روز ملک</option><option value="survey">نقشه‌برداری، مساحت و مختصات</option><option value="boundary">بررسی حدود و موقعیت</option><option value="damage">ارزیابی خسارت</option><option value="building">ارزیابی ساختمان</option><option value="evidence">تأمین دلیل</option><option value="other">سایر</option></select>
  <label class="field-label">هدف و خواسته شما از کارشناس</label><textarea id="expertGoal" rows="5" placeholder="مثلاً: می‌خواهم چهار گوشه زمین، مساحت دقیق و مختصات آن مشخص شود."></textarea>
  <label class="field-label">توضیحات تکمیلی</label><textarea id="expertNote" rows="3" placeholder="هر نکته‌ای که برای انتخاب کارشناس لازم است..."></textarea>
  <label class="field-label">محدوده خدمات</label><input id="expertCity" value="${escapeHtml((l.province||'')+' / '+(l.city||''))}" placeholder="استان / شهرستان">
  <div class="legal-box">هزینه کارشناس رسمی بر اساس موضوع، صلاحیت موردنیاز و شرایط پرونده تعیین می‌شود. مبلغ نهایی قبل از پرداخت به شما اعلام خواهد شد.</div>
  <div class="btn-row" style="margin-top:14px"><button class="btn btn-outline" id="expertCancel">انصراف</button><button class="btn btn-primary" id="expertSave">ثبت درخواست</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('.modal-close').onclick=()=>wrap.remove();wrap.querySelector('#expertCancel').onclick=()=>wrap.remove();
  wrap.querySelector('#expertSave').onclick=()=>{
    const req={id:uid(),listingId,subject:document.getElementById('expertSubject').value,goal:document.getElementById('expertGoal').value.trim(),note:document.getElementById('expertNote').value.trim(),serviceArea:document.getElementById('expertCity').value.trim(),status:'pending',createdAt:Date.now(),report:null};
    if(!req.goal){toast('هدف و خواسته از کارشناس را بنویسید.');return;}
    const a=expertRequestsLoad();a.unshift(req);expertRequestsSave(a);wrap.remove();toast('درخواست کارشناسی ثبت شد. پس از بررسی، هزینه و مراحل هماهنگی اعلام می‌شود.');
  };
}
function renderExpertRequests(){
  const a=expertRequestsLoad();
  return `<div class="page-guidance"><div class="page-guidance-title">⚖️ کارشناسی رسمی</div><div>درخواست خود را ثبت کنید؛ موضوع و خواسته شما برای هماهنگی با کارشناس دارای صلاحیت ثبت می‌شود.</div></div>
  <div class="service-card featured"><b>کارشناس رسمی دادگستری</b><p>برای ارزش‌گذاری، نقشه‌برداری، تعیین حدود، خسارت یا تأمین دلیل.</p><button class="btn btn-primary" id="expertNewGlobal">ثبت درخواست جدید</button></div>
  <div class="section-title">درخواست‌های شما</div>
  ${a.length?a.map(r=>{const l=listings.find(x=>x.id===r.listingId);return `<div class="op-item"><div class="op-item-top"><b>${escapeHtml(l?.title||'پرونده ملک')}</b><span class="pill">${r.status==='pending'?'در انتظار بررسی':r.status==='quoted'?'اعلام هزینه':'تکمیل‌شده'}</span></div><div class="muted" style="margin-top:6px">موضوع: ${escapeHtml(r.subject)}<br>خواسته: ${escapeHtml(r.goal)}</div>${r.report?`<div class="info-box" style="margin-top:8px">گزارش کارشناسی بارگذاری شده است: ${escapeHtml(r.report.fileName||'گزارش')}</div>`:''}</div>`}).join(''):'<div class="empty-state"><div class="ic">⚖️</div><div>هنوز درخواست کارشناسی ثبت نکرده‌اید.</div></div>'}`;
}

/* ---------- خدمات و قیمت ---------- */
function renderServices(){
  return `<div class="page-guidance"><div class="page-guidance-title">💚 خدمات شفاف ۴ دیواری</div><div>قبل از پرداخت، دقیقاً می‌بینید بابت چه خدمتی و چه مبلغی پرداخت می‌کنید. مبلغ کارشناسی رسمی جداگانه و پس از مشخص‌شدن موضوع اعلام می‌شود.</div></div>
  <div class="service-card featured"><div class="service-badge">پیشنهاد شروع</div><h3>۷۰٪ تخفیف اولین معامله</h3><p>تخفیف فقط برای خدمت/شرایطی اعمال می‌شود که هنگام پرداخت در سامانه فعال باشد.</p><button class="btn btn-primary" id="serviceFirstDeal">مشاهده شرایط</button></div>
  <div class="service-card"><b>📄 فرم قرارداد قابل چاپ</b><strong>${toFa(SERVICE_PRICES.contractForm.toLocaleString('en-US'))} تومان</strong><p>فرم آماده برای تکمیل و چاپ شخصی. این مبلغ نمونه پروتوتایپ است و قبل از انتشار باید قیمت تجاری واقعی تعیین شود.</p></div>
  <div class="service-card"><b>🤝 خدمات تنظیم قرارداد</b><strong>${toFa(SERVICE_PRICES.contractService.toLocaleString('en-US'))} تومان</strong><p>نمونه قیمت برای طراحی مدل درآمدی؛ مبلغ نهایی باید بر اساس نوع معامله و مقررات محل خدمت تعیین شود.</p></div>
  <div class="service-card"><b>⚖️ کارشناسی رسمی</b><strong>قیمت پس از بررسی موضوع</strong><p>حق‌الزحمه کارشناس رسمی و هزینه خدمات پلتفرم جداگانه اعلام می‌شود.</p></div>
  <div class="legal-box">اعداد این صفحه برای نمونه‌سازی رابط کاربری هستند و نباید به‌عنوان تعرفه رسمی یا قیمت قطعی بازار تبلیغ شوند.</div>`;
}

/* ---------- بازدید مجازی + جزئیات محدوده ---------- */
function featureMediaBlock(l){
  const bs=boundarySummary(l),hasTour=(l.dealPhotos||[]).length||(l.videoKey);
  return `<div class="section-title">بازدید و بررسی ملک</div><div class="feature-grid">
    <button class="feature-tile" data-tour="${escapeHtml(l.id)}"><span>🎥</span><b>بازدید مجازی</b><small>${hasTour?'مشاهده مرحله‌ای عکس و ویدئو':'محتوای بازدید ثبت نشده'}</small></button>
    <button class="feature-tile" data-boundary-view="${escapeHtml(l.id)}"><span>📍</span><b>محدوده ملک</b><small>${bs.count>=3?formatM2(bs.area):'محدوده ثبت نشده'}</small></button>
    <button class="feature-tile" data-expert="${escapeHtml(l.id)}"><span>⚖️</span><b>کارشناس رسمی</b><small>درخواست کارشناسی</small></button>
    <button class="feature-tile" data-services="1"><span>💚</span><b>هزینه خدمات</b><small>شفاف و مرحله‌ای</small></button>
  </div>${bs.count>=3?`<div class="info-box">📐 مساحت تقریبی محدوده: <b>${formatM2(bs.area)}</b> · محیط: <b>${formatMeters(bs.perimeter)}</b><br><small>این محاسبه بر اساس مختصات انتخاب‌شده روی نقشه است و جایگزین نقشه‌برداری رسمی نیست.</small></div>`:''}`;
}
function viewBoundaryModal(l){
  const p=l.boundary?.points||[];if(p.length<3){toast('برای این ملک هنوز محدوده چندنقطه‌ای ثبت نشده است.');return;}
  const wrap=document.createElement('div');wrap.className='modal-overlay';wrap.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div><div class="drawer-title">محدوده ثبت‌شده ملک <button class="icon-btn modal-close">×</button></div><div id="viewBoundaryMap" class="property-map"></div><div class="info-box" style="margin-top:10px">مساحت تقریبی: <b>${formatM2(polygonAreaM2(p))}</b><br>محیط تقریبی: <b>${formatMeters(polygonPerimeterM(p))}</b><br><small>برای تصمیم حقوقی/ثبتی، نقشه‌برداری و مدارک رسمی را ملاک قرار دهید.</small></div></div>`;document.body.appendChild(wrap);wrap.querySelector('.modal-close').onclick=()=>wrap.remove();loadLeafletForMap().then(()=>{const m=L.map('viewBoundaryMap').fitBounds(p.map(x=>[+x.lat,+x.lng]));L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(m);L.polygon(p,{color:'#27A56A',weight:3,fillOpacity:.2}).addTo(m);p.forEach((x,i)=>L.marker([+x.lat,+x.lng]).addTo(m).bindTooltip(String(i+1),{permanent:true,direction:'top'}));}).catch(()=>toast('نقشه برای نمایش محدوده نیاز به اینترنت دارد.'));}

/* ---------- نسخه جدید step 6 ---------- */
function stepDealPhotos(d){
  d=ensureFeatureShape(d);
  const key=d.videoKey||('draft-'+(d.id||uid()));if(!d.videoKey)d.videoKey=key;
  const video=MEDIA_URLS[key];
  if(!video){mediaGet(key).then(blob=>{if(blob){MEDIA_URLS[key]=URL.createObjectURL(blob);if(state.post.draft===d||state.tenders.draft===d)render();}}).catch(()=>{});}
  return guidanceBox(6)+
    `<label class="field-label">عکس‌های مورد معامله <span class="pill">${d.dealPhotos.length} از ۸</span></label>
     <div class="thumb-grid">${d.dealPhotos.map((src,i)=>`<div class="thumb"><img src="${src}"><button class="rm" data-rmdeal="${i}">✕</button></div>`).join('')}${d.dealPhotos.length<8?`<div class="thumb-add"><span>📷</span><span>افزودن عکس</span><small>کم‌حجم‌سازی تصویر</small><input type="file" accept="image/*" multiple id="dealFileInput"></div>`:''}</div>
     <div class="video-upload-card"><div class="section-title" style="margin-top:0">🎥 ویدئوی معرفی ملک</div><p class="muted">مالک می‌تواند از داخل برنامه فیلم بگیرد یا ویدئوی آماده را انتخاب کند. برای تجربه بهتر، ویدئوی ۳۰ تا ۱۲۰ ثانیه‌ای پیشنهاد می‌شود.</p>
       <div class="btn-row"><label class="btn btn-primary">📹 ضبط با دوربین<input type="file" accept="video/*" capture="environment" id="videoCameraInput" hidden></label><label class="btn btn-outline">📁 انتخاب از گالری<input type="file" accept="video/*" id="videoGalleryInput" hidden></label></div>
       ${video?`<video class="video-preview" controls playsinline preload="metadata" src="${video}"></video>`:d.videos.length?`<div class="info-box">ویدئو ثبت شده: ${escapeHtml(d.videos[0].name||'ویدئوی معرفی')} · ${videoLabel(d.videos[0].size)}</div>`:`<div class="video-empty">هنوز ویدئویی ثبت نشده است.</div>`}
       <div class="field-hint">حداکثر فایل پیشنهادی این نسخه ۱۲۰ مگابایت است. فشرده‌سازی حرفه‌ای و تبدیل کیفیت در Backend نسخه عملیاتی انجام خواهد شد.</div>
       ${d.videos.length?`<button class="btn btn-danger btn-sm" id="removeVideo" style="margin-top:8px">حذف ویدئو</button>`:''}
     </div>
     <div class="tour-plan"><b>🎬 بازدید مجازی</b><span>عکس‌ها و ویدئوی معرفی شما در صفحه ملک به‌صورت مرحله‌ای نمایش داده می‌شوند.</span></div>`;
}

/* ---------- بازنویسی جزئیات آگهی ---------- */
const _baseRenderListingDetail=renderListingDetail;
renderListingDetail=function(l){
  const base=_baseRenderListingDetail(l);
  const extra=featureMediaBlock(l);
  return base.replace('<div class="section-title">قیمت</div>',extra+'<div class="section-title">قیمت</div>');
};

/* ---------- بازنویسی step category برای محدوده ---------- */
const _baseStepCategory=stepCategory;
stepCategory=function(d,isTender){
  const html=_baseStepCategory(d,isTender);
  const land=catInfo(d.category).kind==='land';
  if(isTender||!land)return html;
  const bs=boundarySummary(d);
  return html+`<div class="section-title">📍 محدوده دقیق ملک</div><div class="boundary-card"><b>${bs.count>=3?'محدوده ثبت شده':'اختیاری ولی پیشنهادی برای زمین'}</b><p>${bs.count>=3?`مساحت تقریبی ${formatM2(bs.area)} · محیط ${formatMeters(bs.perimeter)}`:'چهار گوشه یا رأس‌های زمین را روی نقشه انتخاب کنید؛ برای زمین نامنظم نقاط بیشتری اضافه کنید.'}</p><button class="btn btn-secondary" id="pickBoundary">${bs.count>=3?'✏️ ویرایش محدوده':'📍 تعیین محدوده روی نقشه'}</button></div>`;
};

/* ---------- رویدادهای امکانات جدید ---------- */
const _featureBindBase=bindDynamicHandlers;
bindDynamicHandlers=function(){
  _featureBindBase();
  const d=(()=>{try{return state.tab==='post'?getDraft(false):null;}catch(e){return null;}})();
  const pb=document.getElementById('pickBoundary');if(pb&&d)pb.onclick=()=>openBoundaryPicker(d);
  const saveVideo=async(input)=>{
    const file=input?.files?.[0];if(!file)return;
    if(!file.type.startsWith('video/')){toast('لطفاً یک فایل ویدئویی انتخاب کنید.');return;}
    if(file.size>120*1024*1024){toast('حجم ویدئو در این نسخه باید حداکثر ۱۲۰ مگابایت باشد.');return;}
    const draft=getDraft(isTenderScreen);draft.videoKey=draft.videoKey||('draft-'+uid());
    if(MEDIA_URLS[draft.videoKey])URL.revokeObjectURL(MEDIA_URLS[draft.videoKey]);
    MEDIA_URLS[draft.videoKey]=URL.createObjectURL(file);
    draft.videos=[{name:file.name,size:file.size,type:file.type,updatedAt:Date.now()}];
    await mediaPut(draft.videoKey,file);render();
  };
  const vc=document.getElementById('videoCameraInput');if(vc)vc.addEventListener('change',()=>saveVideo(vc));
  const vg=document.getElementById('videoGalleryInput');if(vg)vg.addEventListener('change',()=>saveVideo(vg));
  const rv=document.getElementById('removeVideo');if(rv)rv.onclick=async()=>{const draft=getDraft(isTenderScreen);if(draft.videoKey)await mediaDelete(draft.videoKey);if(MEDIA_URLS[draft.videoKey]){URL.revokeObjectURL(MEDIA_URLS[draft.videoKey]);delete MEDIA_URLS[draft.videoKey];}draft.videos=[];render();};
  viewVideoHandlers();
  const ex=document.querySelector('[data-expert]');if(ex)ex.onclick=()=>expertRequestModal(ex.dataset.expert);
  document.querySelectorAll('[data-tour]').forEach(el=>el.onclick=()=>openVirtualTour(listings.find(x=>x.id===el.dataset.tour)));
  document.querySelectorAll('[data-boundary-view]').forEach(el=>el.onclick=()=>viewBoundaryModal(listings.find(x=>x.id===el.dataset.boundaryView)));
  document.querySelectorAll('[data-services]').forEach(el=>el.onclick=()=>{state.tab='services';render();});
  const ne=document.getElementById('expertNewGlobal');if(ne)ne.onclick=()=>{const l=listings.find(x=>x.status==='approved'&&!x.isTender);expertRequestModal(l?.id||null);};
  const sf=document.getElementById('serviceFirstDeal');if(sf)sf.onclick=()=>toast('تخفیف اولین معامله در نسخه تجاری پس از تعیین خدمت و شرایط پرداخت اعمال می‌شود.');
};
function viewVideoHandlers(){
  document.querySelectorAll('[data-open]').forEach(el=>{
    if(el.dataset.videoBound)return;el.dataset.videoBound='1';
  });
}

/* ---------- منوی خدمات/کارشناسی ---------- */
const _baseDrawerHtml=drawerHtml;
drawerHtml=function(){
  const h=_baseDrawerHtml();
  return h.replace('<button id="menuContracts">','<button id="menuServices"><span class="ml-icon">💚</span><span>هزینه و خدمات</span></button><button id="menuExpert"><span class="ml-icon">⚖️</span><span>درخواست کارشناس رسمی</span></button><button id="menuContracts">');
};
const _baseBindDrawer=bindDrawerHandlers;
bindDrawerHandlers=function(){
  _baseBindDrawer();
  const s=document.getElementById('menuServices');if(s)s.onclick=()=>{state.tab='services';closeDrawer();render();};
  const e=document.getElementById('menuExpert');if(e)e.onclick=()=>{state.tab='expert';closeDrawer();render();};
};

/* ---------- رندر نهایی صفحات جدید ---------- */
const _baseRenderFinal=render;
render=function(){
  Object.values(carouselTimers).forEach(clearInterval);
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
  const view=document.getElementById('view');
  if(state.tab==='services')view.innerHTML=renderServices();
  else if(state.tab==='expert')view.innerHTML=renderExpertRequests();
  else _baseRenderFinal();
  if(state.tab==='services'||state.tab==='expert'){
    bindDynamicHandlers();bindRegionAndMaps();startHeroCarousel();view.scrollTop=0;
  }
};

/* ---------- submit: حفظ ساختار امکانات ---------- */
const _baseSubmitEntry=submitEntry;
submitEntry=function(isTender){
  const st=isTender?state.tenders:state.post;st.draft=ensureFeatureShape(st.draft);
  if(!st.draft.id)st.draft.id=uid();
  _baseSubmitEntry(isTender);
};

/* ---------- migration of older records ---------- */
try{listings=listings.map(ensureFeatureShape);}catch(e){console.warn('Feature migration',e);}
setTimeout(()=>{try{saveListings(listings);}catch(e){}},50);

/* ---------- version label ---------- */
try{document.title='۴ دیواری — املاکی آنلاین شما';}catch(e){}


/* ---------- Hero نهایی: اعتماد + بازدید + هزینه ---------- */
heroCarouselHtml=function(){
  const a=[
    ['hero-art-house','⌂','اعتماد شما، رضایت ما','اطلاعات ملک، مدارک و مسیر معامله در یک پرونده منظم.'],
    ['hero-art-map','⌖','قبل از رفتن، ملک را ببینید','عکس، ویدئو، بازدید مجازی و محدوده ملک را بررسی کنید.'],
    ['hero-art-trust','✓','برای معاملات مهم، کارشناس رسمی','درخواست کارشناسی رسمی را ثبت کنید و گزارش کارشناس را در پرونده نگه دارید.'],
    ['hero-art-3d','◇','بازدید مجازی؛ نزدیک‌تر به بازدید واقعی','از داخل برنامه مرحله‌به‌مرحله ملک را ببینید.'],
    ['hero-art-discount','٪','۷۰٪ تخفیف اولین معامله','پیشنهادهای تخفیفی در زمان پرداخت و طبق شرایط همان خدمت اعمال می‌شوند.']
  ];
  return '<div class="hero-carousel hero-carousel-large">'+a.map((x,i)=>'<div class="hero-slide '+x[0]+' '+(i?'':'show')+'" data-hero-slide="'+i+'"><div class="hero-art-icon">'+x[1]+'</div><div class="hero-slide-copy"><h3>'+x[2]+'</h3><p>'+x[3]+'</p></div></div>').join('')+'<div class="hero-dots">'+a.map((x,i)=>'<span class="hero-dot '+(i?'':'on')+'" data-hero-dot="'+i+'"></span>').join('')+'</div></div><div class="trust-strip"><b>🛡️ حریم خصوصی و شفافیت</b><span>مدارک خصوصی جدا از اطلاعات عمومی نگهداری می‌شوند و هزینه خدمت قبل از پرداخت نمایش داده می‌شود.</span></div><div class="quick-actions"><button class="quick-action" data-quick="post"><span>＋</span><b>ثبت آگهی</b><small>فروش، اجاره یا مشارکت</small></button><button class="quick-action" data-quick="map"><span>⌖</span><b>نقشه املاک</b><small>موقعیت و محدوده</small></button></div><div class="about-toggle" id="aboutToggle">درباره ۴ دیواری و نحوه کار آن بیشتر بدانید ▾</div><div class="about-box" id="aboutBox" style="display:none">'+ABOUT_TEXT.replace(/\n/g,'<br><br>')+'</div>';
};
