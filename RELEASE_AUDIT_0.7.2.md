# ۴ دیواری — Release Audit 0.7.2

## هدف این نسخه

این نسخه برای تبدیل خروجی 0.7.1 به یک baseline تمیزتر و قابل نگهداری آماده شده است؛ تمرکز روی حذف خطاهای پنهان، یکپارچگی نسخه، امنیت پایه و reproducible build است.

## اصلاحات اصلی

- یکپارچه‌سازی نسخه روی `0.7.2` با `version.json` به‌عنوان مرجع اصلی.
- حذف رمز اپراتور ثابت `1234` از Frontend.
- حذف OTP ثابت از کد Backend؛ OTP توسعه‌ای فقط از environment خوانده می‌شود.
- Production برای Secret نامعتبر JWT یا OTP توسعه‌ای fail-closed است.
- کنترل پایه MIME/signature برای فایل‌های سند اضافه شد.
- `WebViewAssetLoader` جایگزین `file://android_asset` شد.
- `allowFileAccess=false` و Mixed Content غیرفعال شد.
- Back اندروید برای target SDK 36 به predictive back منتقل شد.
- Manifest PWA از مسیرهای absolute به مسیرهای relative منتقل شد تا در GitHub Pages و زیرمسیرها شکننده نباشد.
- خروجی‌های تولیدی `dist` و Web Core موبایل از سورس repository حذف شدند و توسط build script تولید می‌شوند.
- Workflow اندروید به یک فایل واحد و بدون نام‌گذاری اشتباه محدود شد.
- Backend smoke test به CI اضافه می‌شود.
- Docker برای Backend FastAPI واقعیِ موجود در repository اضافه شد.

## محدودیت‌هایی که عمداً حل نشده‌اند

این نسخه هنوز محصول تجاری Production نیست. موارد زیر نیازمند زیرساخت واقعی هستند:

- SMS/OTP واقعی
- PostgreSQL و migration رسمی
- Object Storage خصوصی و lifecycle/backup
- احراز هویت رسمی
- درگاه پرداخت واقعی
- اعلان Push سروری
- قرارداد/ثبت رسمی
- اتصال رسمی به کارشناسان
- observability، rate limiting توزیع‌شده و WAF

این موارد عمداً به‌صورت جعلی «فعال» نشده‌اند.

## تست‌های قابل تکرار

```bash
npm run verify
npm run test:backend
```

GitHub Actions نیز Build Android و smoke test Backend را اجرا می‌کند.

## صداقت انتشار

موفقیت CI به‌تنهایی به معنی تأیید کامل روی گوشی واقعی یا دستگاه iOS نیست. APK باید روی حداقل یک دستگاه Android واقعی تست شود و iOS باید روی macOS/Xcode build و signing شود.
