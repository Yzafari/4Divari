# شروع سریع — ۴ دیواری 0.7.2

این بسته برای ساخت یک repository تازه آماده شده است.

## 1) ایجاد repository تازه

یک repository خالی در GitHub بسازید؛ بهتر است README، .gitignore و License را هنگام ایجاد repository اضافه نکنید تا فایل‌های این بسته بدون تداخل وارد شوند.

## 2) استخراج بسته

این ZIP را روی گوشی/کامپیوتر استخراج کنید و **محتویات داخل پوشه** را در ریشه repository جدید قرار دهید.

این بسته عمداً کمتر از 100 فایل دارد تا محدودیت آپلود مرورگر GitHub مانع انتقال یک‌جای سورس نشود. GitHub برای آپلود از مرورگر حداکثر 100 فایل در هر بار را پشتیبانی می‌کند.

## 3) اولین Commit

پیام پیشنهادی:

`Initialize 4Divari 0.7.2 hardened baseline`

## 4) بعد از Push

Workflow زیر باید خودکار اجرا شود:

`.github/workflows/android-apk.yml`

دو مرحله اصلی دارد:

1. Backend smoke test
2. Web build/verify + Android APK build

Artifact مورد انتظار:

`4divari-0.7.2-debug-apk`

## 5) نکته مهم درباره فایل‌های تولیدی

`dist/` و Web Core داخل Android/iOS در ZIP نیستند؛ این حذف عمدی است. `npm run build` آن‌ها را از Web Core اصلی تولید می‌کند. این کار از نگهداری سه نسخه کپی‌شده و احتمال drift بین Web/Android/iOS جلوگیری می‌کند.

## 6) تست محلی

```bash
npm run verify
npm run test:backend
```

برای Backend:

```bash
cp .env.example .env
# KHB_JWT_SECRET را با مقدار تصادفی حداقل 32 کاراکتری عوض کنید.
python -m pip install -r backend/requirements.txt
python backend/run.py
```

## وضعیت انتشار

این نسخه یک Prototype مهندسی‌شده و قابل Build است؛ هنوز برای انتشار تجاری به SMS واقعی، PostgreSQL، storage خصوصی، payment gateway، احراز هویت رسمی، Push server و تست دستگاه واقعی نیاز دارد. این موارد عمداً به‌صورت جعلی داخل پروژه فعال نشده‌اند.
