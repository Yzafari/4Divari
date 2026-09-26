# ۴ دیواری — املاکی آنلاین شما

نسخه پایدارسازی‌شده **0.7.2** از پروتوتایپ ۴ دیواری.

## وضعیت واقعی این نسخه

این repository یک **Prototype واقعی و قابل Build** است، نه یک سامانه تجاری آماده انتشار. Web/PWA، پروژه Android، پروژه پایه iOS و Backend FastAPI در مخزن وجود دارند. Backend از SQLite استفاده می‌کند و برای Production هنوز به سرویس SMS واقعی، PostgreSQL، ذخیره‌سازی خصوصی فایل، درگاه پرداخت، احراز هویت رسمی و زیرساخت عملیاتی نیاز دارد.

هیچ رمز اپراتوری داخل Frontend نگهداری نمی‌شود. OTP توسعه‌ای فقط وقتی فعال است که `KHB_DEV_OTP` صراحتاً تنظیم شده باشد و در Production برنامه در صورت نبود سرویس OTP واقعی fail-closed می‌کند.

## ساخت محلی

```bash
npm run verify
npm run test:backend
```

`npm run verify` ابتدا Web/PWA و خروجی‌های Android/iOS را همگام می‌کند و سپس کنترل‌های ساختاری و syntax را اجرا می‌کند.

## Android

Workflow گیت‌هاب در `.github/workflows/android-apk.yml` قرار دارد و این مسیر را می‌سازد:

Project → GitHub Actions → Android SDK → Gradle → `app-debug.apk`

Android از `WebViewAssetLoader` استفاده می‌کند و دیگر محتوای محلی را با `file://` بارگذاری نمی‌کند. این کار با راهنمای رسمی Android برای محتوای محلی WebView هم‌راستا است. همچنین Back برای target SDK 36 به API جدید predictive back منتقل شده است.

## Backend

اجرای محلی:

```bash
cp .env.example .env
# KHB_JWT_SECRET را با یک مقدار تصادفی حداقل ۳۲ کاراکتری جایگزین کنید.
# برای تست محلی می‌توانید KHB_DEV_OTP=123456 بگذارید.
python -m pip install -r backend/requirements.txt
python backend/run.py
```

در Production، `KHB_ENV=production` و Secret معتبر الزامی است و OTP توسعه‌ای نباید تنظیم شود.

## Docker

```bash
cp .env.example .env
# مقدار KHB_JWT_SECRET را تغییر دهید.
docker compose up --build
```

Frontend روی پورت 8080 و Backend روی پورت 8000 اجرا می‌شوند.

## iOS

ابتدا:

```bash
npm run build
```

سپس `ios/KhanehBeKhaneh.xcodeproj` را در Xcode/macOS باز کنید. ساخت و signing واقعی iOS در محیط Linux این repository قابل تأیید نیست و باید روی macOS انجام شود.

## نکات معماری

- `version.json` منبع اصلی نسخه است.
- `dist/` و Web Core داخل Android/iOS خروجی تولیدشده‌اند و در repository نگهداری نمی‌شوند؛ `scripts/build.js` آن‌ها را بازسازی می‌کند.
- داده‌های runtime در `backend/data` و فایل‌های آپلودی در `backend/uploads` در Git نگهداری نمی‌شوند.
- امکانات تجاری آینده مانند SMS واقعی، پرداخت، PostgreSQL، storage خصوصی، احراز هویت رسمی، چت و اعلان سروری باید به‌صورت Feature مستقل اضافه شوند؛ در این نسخه به‌صورت جعلی فعال نشده‌اند.
