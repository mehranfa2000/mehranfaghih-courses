# mehranfaghih-courses

سایت دوره هوش مصنوعی مهران فقیه

## 🚀 پروژه‌ها

### 🤖 اینتلی‌نیوز - ایجنت هوشمند اخبار
ایجنت هوش مصنوعی برای جستجوی خودکار اخبار بر اساس کلیدواژه از منابع داخلی و خارجی، هر 1 ساعت، و ارسال به تلگرام.

**ویژگی‌ها:**
- 🔑 کلیدواژه دلخواه کاربر
- 🌍 جستجو در 30+ منبع داخلی (ایرنا، ایسنا، مهر، تسنیم و...) و خارجی (BBC، Reuters، Google News)
- ⏰ زمان‌بندی هر 1 ساعت (قابل تنظیم)
- 📰 خروجی: تیتر + خلاصه + تاریخ شمسی + ساعت + لینک + نام منتشرکننده
- 📱 ارسال خودکار به کانال تلگرام

**اجرا:**
```bash
cd news-agent
chmod +x start.sh
./start.sh
# سپس http://localhost:8000
```

مستندات کامل: [news-agent/README.md](./news-agent/README.md)

---

## 📁 ساختار پروژه

```
mehranfaghih-courses/
├── index.html              # صفحه اصلی (HTML ساختاریافته)
├── style.css               # استایل‌های اصلی (CSS Variables, Responsive)
├── js/                     # Frontend JavaScript (ES6 Modules)
│   ├── app.js             # نقطه ورود + Event Delegation
│   ├── config.js          # تنظیمات سراسری (با validation)
│   ├── modules/           # ماژول‌های مستقل
│   │   ├── header.js      # هدر و نوار ناوبری
│   │   ├── particles.js   # افکت ذرات
│   │   ├── typed.js       # افکت تایپ
│   │   ├── stats.js       # شمارنده‌ها و نوار مهارت
│   │   ├── instructor.js  # بخش معرفی مدرس
│   │   ├── courses.js     # کارت‌های دوره
│   │   ├── whyUs.js       # چرا ما
│   │   ├── testimonials.js # اسلایدر نظرات
│   │   ├── faq.js         # سؤالات متداول
│   │   ├── footer.js      # پاورقی
│   │   ├── modal.js       # مودال ثبت‌نام چندمرحله‌ای
│   │   ├── panel.js       # پنل جزئیات دوره
│   │   ├── accordion.js   # آکاردئون
│   │   ├── clipboard.js   # کپی در کلیپ‌بورد
│   │   ├── toast.js       # نوتیفیکیشن
│   │   ├── aos.js         # Animate On Scroll
│   │   ├── scrollAnimations.js # انیمیشن‌های اسکرول
│   │   └── typed.js       # افکت تایپ متن
│   ├── services/          # سرویس‌ها
│   │   ├── api.js         # کلاینت HTTP + Cloudinary + Google Sheets
│   │   └── validation.js  # اعتبارسنجی فرم‌ها
│   └── utils/             # ابزارهای کمکی
│       ├── dom.js         # توابع کار با DOM
│       └── logger.js      # سیستم لاگ حرفه‌ای
└── news-agent/            # ایجنت خبری Python
    ├── backend/
    │   ├── app.py         # FastAPI + APScheduler
    │   ├── fetcher.py     # استخراج اخبار (Google News + RSS)
    │   ├── database.py    # ذخیره JSON
    │   ├── telegram_bot.py # ارسال به تلگرام
    │   ├── models.py      # Pydantic models
    │   └── sources.py     # لیست منابع
    └── frontend/
        └── index.html     # داشبورد
```

## ✨ ویژگی‌های معماری Frontend

### ماژولار بودن (ES6 Modules)
- استفاده از `import/export` به جای اسکریپت‌های سراسری
- هر قابلیت در فایل جداگانه با مسئولیت واحد
- بارگذاری بهینه فقط ماژول‌های مورد نیاز

### Event Delegation مرکزی
- یک listener مرکزی برای تمام `data-action` ها
- بهبود عملکرد (یک listener به جای ده‌ها listener)
- مدیریت آسان رویدادهای پویا

### امنیت (XSS Protection)
- تمام خروجی‌ها با `escapeHtml` فرار داده می‌شوند
- استفاده از `textContent` به جای `innerHTML` در جاهای ممکن
- حذف `onclick` های inline

### دسترسی‌پذیری (A11y)
- `aria-label` و `aria-expanded` در دکمه‌ها
- `role="dialog"` و `aria-modal` در مودال‌ها
- پشتیبانی از `prefers-reduced-motion`
- `tabindex` و ناوبری با کیبورد
- کنتراست رنگ مناسب

### عملکرد
- `defer` و `type="module"` برای بارگذاری بهینه اسکریپت‌ها
- `preconnect` به CDN ها
- استفاده از `requestAnimationFrame` برای انیمیشن‌ها
- `IntersectionObserver` برای lazy animations
- توقف ذرات هنگام عدم نمایش تب (بهینه‌سازی CPU)

### معماری Backend
- Type Hints کامل در پایتون
- مدیریت خطای قوی (try/except + logging)
- Data Classes برای ساختارهای داده
- تفکیک مسئولیت‌ها (Separation of Concerns)
- Fallback هوشمند برای قطعی اینترنت
- پشتیبانی از Rate Limiting

## 🛠️ تکنولوژی‌ها

### Frontend
- **Vanilla JavaScript ES6+** (بدون فریم‌ورک)
- **CSS3** با CSS Variables
- **HTML5** ساختاریافته
- کتابخانه‌ها: Typed.js, AOS, Font Awesome, Vazirmatn Font

### Backend
- **FastAPI** + **Uvicorn**
- **APScheduler** برای تسک‌های دوره‌ای
- **Pydantic** برای validation
- **feedparser**, **trafilatura**, **BeautifulSoup4** برای پردازش
- **jdatetime** برای تاریخ شمسی

## 📝 استانداردهای کدنویسی

### JavaScript
- ✅ ES6 Modules
- ✅ JSDoc Comments
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Defensive Programming (بررسی خطا)
- ✅ Accessibility First

### Python
- ✅ Type Hints
- ✅ Docstrings
- ✅ PEP 8
- ✅ Error Handling
- ✅ Logging
- ✅ Data Classes

## 🚀 اجرا

### Frontend
```bash
# با Python:
python3 -m http.server 8080

# با Node:
npx serve

# سپس باز کنید: http://localhost:8080
```

### Backend (News Agent)
```bash
cd news-agent
./start.sh
# یا
python3 run.py
# سپس: http://localhost:8000
```

## 📜 مجوز

ساخته شده برای دوره‌های **مهران فقیه**
