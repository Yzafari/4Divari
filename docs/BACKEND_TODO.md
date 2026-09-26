# نقشه راه Backend و Database — «۴ دیواری»

این سند وضعیت فعلی Prototype را با الزامات Production مقایسه می‌کند. Backend پایه اکنون وجود دارد، اما اتصال کامل سرویس‌های عملیاتی و زیرساخت Production هنوز مرحله بعدی است.

---

## ۱. وضعیت فعلی (آنچه واقعاً در repository وجود دارد)

- Frontend/PWA هنوز Local-first است و برای تجربه آفلاین از `localStorage` و IndexedDB استفاده می‌کند.
- یک Backend FastAPI واقعی در `backend/app/main.py` وجود دارد و SQLite را به‌عنوان دیتابیس prototype استفاده می‌کند.
- Backend دارای OTP توسعه‌ای، JWT، آگهی، علاقه‌مندی، بازدید، پیام، قرارداد، اعلان، Audit و آپلود محدود اسناد است.
- OTP توسعه‌ای فقط با `KHB_DEV_OTP` فعال می‌شود؛ در Production وجود آن ممنوع است و بدون سرویس OTP واقعی endpoint ارسال OTP عمداً fail-closed می‌کند.
- رمز اپراتور داخل Frontend وجود ندارد. نقش `operator` باید از Backend/JWT تأمین شود.
- داده‌های runtime و فایل‌های آپلودی در Git نگهداری نمی‌شوند.
- هنوز اتصال Frontend به همه endpointهای Backend به‌صورت یکپارچه و کامل انجام نشده است؛ بنابراین Backend موجود را نباید با سامانه تجاری Production اشتباه گرفت.

## ۲. مدل داده فعلی (از `blankDraft()` در app.js استخراج شده)

هر آگهی/مناقصه یک شیء با این ساختار است (کلید اصلی آرایه `listings`):

```
{
  id, isTender, orgName,
  category, province, city, title, desc,
  phone, answerMode,           // 'self' | 'company'
  postalCode,
  structural: {
    yearBuilt, landArea, buildArea, rooms, terrace, floor, parking, storage,
    furnished, elevator, elevatorPhotos[],
    water, power, gas,
    coolingTypes[], coolingPhotos[], heatingTypes[], heatingPhotos[],
    bathArea, bathPhotos[],
    poolArea, poolPhotos[], greenhouseArea, greenhousePhotos[],
    cabinetryPhotos[], audioPhotos[], lightingPhotos[],
    securityTypes[], securityPhotos[],
    accessRoadWidth, accessRoadType,
    strengthTags[], strengthOther
  },
  landInfo: { area, landUse },
  pricing: { total, perMeter, deposit, monthly },
  identity: { national, birth, sana },      // هر کدام یک Data URL عکس یا null
  property: { ownership[], construction[], permits[] }, // آرایه‌ای از Data URL
  dealPhotos: [],                            // حداکثر ۸ عکس
  status,            // 'draft' | 'pending' | 'approved' | 'rejected'
  rejectReason, publishCode, contract, contractPercent,
  createdAt, __mine
}
```

## ۳. طرح پیشنهادی پایگاه داده (PostgreSQL) — هنوز ساخته نشده

```sql
-- کاربران (متقاضی/اپراتور/سازمان)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(15) UNIQUE NOT NULL,
  full_name     VARCHAR(150),
  role          VARCHAR(20) NOT NULL DEFAULT 'applicant', -- applicant | operator | org
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- آگهی‌ها و مناقصات (یک جدول، با فلگ is_tender)
CREATE TABLE listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  is_tender         BOOLEAN NOT NULL DEFAULT false,
  org_name          VARCHAR(200),
  category          VARCHAR(40) NOT NULL,
  province          VARCHAR(60) NOT NULL,
  city              VARCHAR(60) NOT NULL,
  title             VARCHAR(200) NOT NULL,
  description       VARCHAR(2000),
  phone             VARCHAR(15),
  answer_mode       VARCHAR(10) DEFAULT 'self', -- self | company
  postal_code       VARCHAR(10),
  status            VARCHAR(15) NOT NULL DEFAULT 'pending', -- draft|pending|approved|rejected
  reject_reason     TEXT,
  publish_code      VARCHAR(20) UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- مشخصات سازه (یک‌به‌یک با listings، فقط برای دسته خانه/آپارتمان)
CREATE TABLE listing_structural (
  listing_id        UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  year_built        SMALLINT, land_area NUMERIC, build_area NUMERIC,
  rooms             SMALLINT, terrace NUMERIC, floor SMALLINT,
  parking           NUMERIC, storage NUMERIC, bath_area NUMERIC,
  furnished         BOOLEAN DEFAULT false,
  elevator          BOOLEAN DEFAULT false,
  water BOOLEAN DEFAULT false, power BOOLEAN DEFAULT false, gas BOOLEAN DEFAULT false,
  cooling_types     TEXT[], heating_types TEXT[],
  pool_area         NUMERIC, greenhouse_area NUMERIC,
  security_types    TEXT[],
  access_road_width NUMERIC, access_road_type VARCHAR(30),
  strength_tags     TEXT[], strength_other VARCHAR(500)
);

-- اطلاعات زمین (برای دسته‌های زمین)
CREATE TABLE listing_land (
  listing_id  UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  area        NUMERIC,
  land_use    VARCHAR(100)
);

-- قیمت‌ها
CREATE TABLE listing_pricing (
  listing_id  UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  total       BIGINT,
  per_meter   BIGINT,
  deposit     BIGINT,
  monthly     BIGINT
);

-- مدارک هویتی (دسترسی محدود به اپراتور)
CREATE TABLE identity_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID REFERENCES listings(id) ON DELETE CASCADE,
  doc_type      VARCHAR(20) NOT NULL, -- national | birth | sana
  file_url      TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- اسناد ملک (مالکیت/ساخت‌وساز/مجوزات) — تعداد نامحدود
CREATE TABLE property_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID REFERENCES listings(id) ON DELETE CASCADE,
  doc_group     VARCHAR(20) NOT NULL, -- ownership | construction | permits
  file_url      TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- عکس‌های عمومی (هر بخش با یک group_name و سقف تعداد در سطح اپلیکیشن اعمال می‌شود)
CREATE TABLE listing_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID REFERENCES listings(id) ON DELETE CASCADE,
  group_name    VARCHAR(30) NOT NULL, -- deal | elevator | cooling | heating | bath | pool | greenhouse | cabinetry | audio | lighting | security
  file_url      TEXT NOT NULL,
  sort_order    SMALLINT DEFAULT 0
);

-- قراردادها
CREATE TABLE contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID REFERENCES listings(id) ON DELETE CASCADE,
  party_a       VARCHAR(150) NOT NULL,
  party_b       VARCHAR(150) NOT NULL,
  percent       NUMERIC(5,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- تنظیمات کلی (تک‌ردیفی یا Key/Value)
CREATE TABLE app_settings (
  key           VARCHAR(50) PRIMARY KEY,
  value         JSONB NOT NULL
);
```

> Migration و Seed واقعی وجود ندارد؛ SQL بالا را می‌توانید مستقیماً به عنوان Migration اول
> (مثلاً با Prisma/TypeORM/Knex) استفاده کنید.

## ۴. Endpointهای پیشنهادی API (هنوز پیاده‌سازی نشده)

```
POST   /api/auth/otp/request        { phone }              → ارسال کد OTP
POST   /api/auth/otp/verify         { phone, code }         → دریافت JWT

GET    /api/listings                ?province&city&category&priceMin&priceMax&areaMin&areaMax&rooms
GET    /api/listings/:id
POST   /api/listings                (نیاز به احراز هویت متقاضی)
PATCH  /api/listings/:id            (فقط توسط مالک، وقتی status=rejected)

POST   /api/listings/:id/documents/identity      multipart/form-data
POST   /api/listings/:id/documents/property      multipart/form-data
POST   /api/listings/:id/photos/:group           multipart/form-data (سقف تعداد بر اساس group)

GET    /api/tenders                 ?province&category
POST   /api/tenders

-- اپراتور (نیاز به نقش operator):
GET    /api/operator/listings       ?status=pending|approved|rejected
POST   /api/operator/listings/:id/approve
POST   /api/operator/listings/:id/reject        { reason }
POST   /api/operator/listings/:id/contract      { partyA, partyB, percent }
GET    /api/operator/listings/:id/print         → PDF
PATCH  /api/operator/settings                   { defaultPercent, contact }

GET    /api/settings/contact        (عمومی، فقط خواندنی)
```

### احراز هویت و سطح دسترسی (Authorization)
- **عمومی/مهمان:** فقط `GET /api/listings` با status=approved و بدون دیدن مدارک هویتی/مالکیتی.
- **متقاضی وارد‌شده:** ثبت/ویرایش آگهی خودش، دیدن وضعیت آگهی‌های خودش.
- **اپراتور:** دسترسی کامل به بررسی، تایید/رد، مدیریت قرارداد و Audit — فقط با نقش `role='operator'` و JWT معتبر Backend. هیچ رمز ثابت یا رمز اپراتوری در Frontend نباید وجود داشته باشد.

### اعتبارسنجی (Validation) — نکات مهم برای پیاده‌سازی واقعی
- `description` حداکثر ۲۰۰۰ کاراکتر (همان محدودیت Frontend، باید در Backend هم تکرار شود).
- هر گروه عکس (`elevator`, `cooling`, `heating`, `bath`, `pool`, `greenhouse`, `cabinetry`, `audio`, `lighting`, `security`) حداکثر ۴ فایل.
- `dealPhotos` حداکثر ۸ فایل.
- `property.ownership/construction/permits` بدون محدودیت تعداد (طبق درخواست اولیه کارفرما) — اما محدودیت حجم فایل و نوع فایل (فقط تصویر) باید در Backend اعمال شود.
- شماره تلفن باید با الگوی موبایل ایران اعتبارسنجی شود (`^09\d{9}$`).

## ۵. سرویس‌های خارجی مورد نیاز (فعلاً هیچ‌کدام وصل نیستند)
| سرویس | برای چه کاری | وضعیت |
|---|---|---|
| OTP پیامکی (کاوه‌نگار/قاصدک/ملی‌پیامک) | ورود کاربر، اطلاع تایید/رد آگهی | شبیه‌سازی با `toast()` |
| درگاه پرداخت (زرین‌پال/آیدی‌پی) | دریافت حق انتشار آگهی | پیاده‌سازی نشده |
| Object Storage (S3-Compatible / Liara / آروان) | نگهداری واقعی عکس‌ها و اسناد | فعلاً Base64 در localStorage |
| سامانه کاتب (kateb.ir) | ثبت رسمی قولنامه | فقط لینک خروجی؛ اتصال واقعی نیازمند مجوز دفترخانه/مشاور املاک است |
| ستاد (setadiran.ir) | اطلاع خودکار از مناقصات دولتی | بدون API عمومی؛ فقط ثبت دستی توسط سازمان‌ها در همین اپ امکان‌پذیر است |

## ۶. برای انتشار در کافه‌بازار / مایکت چه چیزی باقی مانده؟
1. ساخت کامل Backend + Database طبق بخش‌های بالا.
2. اتصال واقعی OTP، پرداخت، Storage.
3. تبدیل PWA به APK/AAB واقعی (بخش «تبدیل به اپلیکیشن اندروید» در README.md را ببینید).
4. تست امنیتی (اعتبارسنجی ورودی‌ها، محدودسازی حجم و نوع فایل آپلودی، جلوگیری از حملات رایج وب).
5. بررسی حقوقی موارد فصل «نکات حقوقی» در README.md (مجوز مشاور املاک، امانت‌داری وجه، انطباق با سامانه کاتب و قانون مناقصات).
6. ایجاد حساب توسعه‌دهنده در کافه‌بازار/مایکت و آماده‌سازی صفحه معرفی، آیکون نهایی، اسکرین‌شات‌ها و سیاست حریم خصوصی.
