# معماری Production پیشنهادی ۴ دیواری

## اصل طراحی
Frontend فعلی به‌صورت PWA سبک باقی می‌ماند. داده‌های عملیاتی باید از مرورگر جدا شوند:

`PWA → HTTPS API → Authentication → PostgreSQL`

و فایل‌ها:

`PWA → Signed Upload URL → Private Object Storage`

## داده‌های اصلی
- users: شناسه، تلفن، وضعیت احراز هویت، نقش
- listings: مالک پرونده، نوع آگهی، موقعیت، قیمت، وضعیت انتشار
- listing_documents: نوع سند، مسیر فایل، checksum، سطح محرمانگی، تاریخ بارگذاری
- listing_media: تصاویر، thumbnail، اندازه، checksum
- listing_audit_log: چه کسی، چه زمانی، چه چیزی را تغییر داده است
- payments: مبلغ، شناسه درگاه، authority، وضعیت callback، زمان تایید
- listing_locations: lat/lng، دقت موقعیت و سطح نمایش عمومی

## پرداخت
کلید درگاه نباید در JavaScript یا APK قرار گیرد. Frontend فقط از API درخواست ایجاد پرداخت می‌کند. Backend authority را از درگاه می‌گیرد و callback را اعتبارسنجی می‌کند.

## به‌روزرسانی
نسخه PWA با cache version مستقل منتشر می‌شود. Service Worker نسخه جدید را دریافت و cache قبلی را پاک می‌کند. API و Database مستقل از نسخه UI هستند.

## اسناد
مدارک هویتی و مالکیتی عمومی نیستند. فایل‌ها باید private باشند و دسترسی با signed URL کوتاه‌عمر و مجوز Backend انجام شود.

## نقشه
برای MVP از OpenStreetMap/Leaflet استفاده شده است. برای نمای 3D داخلی می‌توان در فاز بعد Cesium یا سرویس 3D مجاز را اضافه کرد. لینک Google Earth می‌تواند به‌صورت خروجی/ارجاع باشد، نه وابستگی اجباری به رابط برنامه.
