/**
 * ============================================================
 * تنظیمات سراسری اپلیکیشن
 * ============================================================
 * تمام مقادیر قابل تنظیم در این فایل قرار دارند.
 */

export const CONFIG = Object.freeze({
  instructor: {
    name: 'مهران فقیه',
    title: 'مدرس و متخصص هوش مصنوعی',
    bio: 'متخصص هوش مصنوعی با بیش از ۱۰ سال تجربه آموزشی و اجرایی در حوزه ML و Deep Learning. تدریس در دانشگاه‌های معتبر و شرکت‌های فناوری پیشرو.',
    photo: 'images/instructor.jpg',
    skills: [
      { name: 'Machine Learning', percent: 95 },
      { name: 'Deep Learning', percent: 90 },
      { name: 'Python', percent: 98 },
      { name: 'Computer Vision', percent: 85 },
      { name: 'NLP', percent: 80 },
    ],
    stats: [
      { value: 500, display: '۵۰۰+', label: 'دانشجوی موفق' },
      { value: 3, display: '۳', label: 'دوره تخصصی' },
      { value: 10, display: '۱۰+', label: 'سال تجربه' },
      { value: 98, display: '۹۸٪', label: 'رضایت دانشجویان' },
    ],
    social: {
      instagram: 'https://instagram.com/mehran_faghih1',
      telegram: 'https://t.me/mehranfaghih',
      whatsapp: 'https://wa.me/09177727730',
    },
  },

  payment: {
    cardNumber: '6104-3389-8278-4965',
    accountNumber: '4905770204',
    sheba: 'IR670120000000004905770204',
    bankName: 'بانک ملت',
    ownerName: 'مهران فقیه',
  },

  courses: [
    {
      id: 'beginner',
      title: 'هوش مصنوعی مقدماتی',
      badge: 'مبتدی',
      badgeColor: '#22c55e',
      poster: 'images/course-beginner.jpg',
      description: 'آشنایی با مفاهیم پایه هوش مصنوعی، یادگیری ماشین و ابزارهای اولیه',
      duration: '۲۰ ساعت',
      sessions: '۱۰ جلسه',
      level: 'بدون پیش‌نیاز',
      originalPrice: 1500000,
      discountPrice: 990000,
      status: 'open',
      features: [
        'آشنایی با Python پایه',
        'مفاهیم Machine Learning',
        'کار با NumPy و Pandas',
        'پروژه عملی نهایی',
        'گواهینامه پایان دوره',
      ],
      syllabus: [
        { session: 1, title: 'مقدمه‌ای بر هوش مصنوعی', topics: ['تاریخچه AI', 'کاربردها', 'مسیر یادگیری'] },
        { session: 2, title: 'مبانی Python', topics: ['نصب محیط', 'متغیرها', 'حلقه‌ها'] },
        { session: 3, title: 'کتابخانه NumPy', topics: ['آرایه‌ها', 'عملیات ماتریسی'] },
      ],
    },
    {
      id: 'intermediate',
      title: 'هوش مصنوعی متوسطه',
      badge: 'متوسط',
      badgeColor: '#3b82f6',
      poster: 'images/course-intermediate.jpg',
      description: 'یادگیری الگوریتم‌های پیشرفته‌تر، کار با داده‌های واقعی و پیاده‌سازی مدل‌ها',
      duration: '۳۰ ساعت',
      sessions: '۱۵ جلسه',
      level: 'نیاز به دوره مقدماتی',
      originalPrice: 2500000,
      discountPrice: 1800000,
      status: 'open',
      features: [
        'الگوریتم‌های Supervised Learning',
        'کار با Scikit-learn',
        'پردازش داده‌های واقعی',
        'ارزیابی و بهینه‌سازی مدل',
        'گواهینامه پایان دوره',
      ],
      syllabus: [
        { session: 1, title: 'Supervised Learning', topics: ['Regression', 'Classification'] },
        { session: 2, title: 'Scikit-learn عمیق', topics: ['Pipeline', 'GridSearch'] },
      ],
    },
    {
      id: 'advanced',
      title: 'هوش مصنوعی پیشرفته',
      badge: 'پیشرفته',
      badgeColor: '#a855f7',
      poster: 'images/course-advanced.jpg',
      description: 'Deep Learning، شبکه‌های عصبی، NLP و Computer Vision در سطح حرفه‌ای',
      duration: '۴۰ ساعت',
      sessions: '۲۰ جلسه',
      level: 'نیاز به دوره متوسطه',
      originalPrice: 4000000,
      discountPrice: 2900000,
      status: 'soon',
      features: [
        'شبکه‌های عصبی عمیق با TensorFlow',
        'Computer Vision با OpenCV',
        'پردازش زبان طبیعی (NLP)',
        'پروژه صنعتی واقعی',
        'گواهینامه پایان دوره',
      ],
      syllabus: [],
    },
    {
      id: 'news-agent',
      title: 'اینتلی‌نیوز - ایجنت هوشمند اخبار',
      badge: 'جدید ✨',
      badgeColor: '#f5c518',
      poster: 'images/course-beginner.jpg',
      description:
        'ایجنت AI که بر اساس کلیدواژه شما هر ۱ ساعت اخبار داخلی و خارجی را استخراج و به تلگرام ارسال می‌کند - تیتر، خلاصه، تاریخ، لینک، ناشر',
      duration: 'نامحدود',
      sessions: 'API + داشبورد',
      level: 'پروژه عملی',
      originalPrice: 0,
      discountPrice: 0,
      status: 'open',
      features: [
        'جستجوی کلیدواژه دلخواه',
        '۳۰+ منبع داخلی و خارجی',
        'هر ۱ ساعت خودکار',
        'ارسال به تلگرام',
        'داشبورد فارسی مدرن',
        'خروجی: تیتر، خلاصه، تاریخ، لینک، ناشر',
      ],
      syllabus: [
        { session: 1, title: 'معماری ایجنت', topics: ['Google News RSS', 'RSS مستقیم', 'Trafilatura خلاصه‌ساز', 'APScheduler'] },
        { session: 2, title: 'تلگرام', topics: ['BotFather', 'ارسال تکی و Digest', 'فرمت HTML زیبا'] },
        { session: 3, title: 'داشبورد', topics: ['FastAPI', 'مدیریت کلیدواژه', 'فیلتر داخلی/خارجی'] },
      ],
    },
  ],

  testimonials: [
    {
      name: 'علی رضایی',
      course: 'دوره مقدماتی',
      avatar: 'images/student1.jpg',
      rating: 5,
      text: 'بهترین دوره‌ای که تا به حال گذروندم. استاد فقیه با صبر و حوصله همه چیز رو توضیح میده.',
    },
    {
      name: 'سارا محمدی',
      course: 'دوره متوسطه',
      avatar: 'images/student2.jpg',
      rating: 5,
      text: 'پشتیبانی عالی، محتوای کاربردی، واقعاً ارزش پول رو داره.',
    },
    {
      name: 'رضا کریمی',
      course: 'دوره مقدماتی',
      avatar: 'images/student3.jpg',
      rating: 5,
      text: 'از صفر تا قهرمان! الان راحت پروژه‌های ML اجرا می‌کنم. ممنون استاد.',
    },
  ],

  faq: [
    { q: 'آیا دوره‌ها آنلاین هستند؟', a: 'بله، تمام دوره‌ها به صورت آنلاین و ضبط‌شده ارائه می‌شود.' },
    { q: 'بعد از پرداخت چقدر طول می‌کشد دسترسی بگیرم؟', a: 'حداکثر ۲۴ ساعت بعد از تأیید پرداخت.' },
    { q: 'آیا گواهینامه معتبر است؟', a: 'بله، گواهینامه با امضای مدرس صادر می‌شود.' },
    { q: 'امکان قسط‌بندی وجود دارد؟', a: 'برای اطلاع از شرایط اقساط با ما تماس بگیرید.' },
    { q: 'آیا به فایل‌های دوره دسترسی مادام‌العمر دارم؟', a: 'بله، بعد از خرید دسترسی مادام‌العمر به محتوا خواهید داشت.' },
  ],

  api: {
    googleScriptURL: 'https://script.google.com/macros/s/AKfycbwoLMCn4q9314jx3gpc8eJj-HQtotyafNqouSoLGn6mtUN7QnSYZOJy5JpD61ifiU6-dQ/exec',
    cloudinary: {
      cloudName: 'u2ah0tbg',
      uploadPreset: 'mehran-receipts',
    },
  },

  contact: {
    phone: '09177727730',
    telegram: 'https://t.me/mehranfaghih',
    email: 'mehran.fa@gmail.com',
  },

  ui: {
    navScrollOffset: 100,
    counterStepMs: 25,
    skillBarTransitionMs: 1200,
    testimonialIntervalMs: 5000,
    particlesCount: 80,
    maxFileSizeMB: 5,
    uploadTimeoutMs: 60000,
  },

  // وضعیت‌های دوره
  courseStatus: Object.freeze({
    OPEN: 'open',
    FULL: 'full',
    SOON: 'soon',
  }),
});

/**
 * بررسی صحت تنظیمات قبل از بارگذاری
 */
export function validateConfig() {
  const errors = [];

  if (!CONFIG.api?.googleScriptURL || CONFIG.api.googleScriptURL.includes('YOUR_')) {
    errors.push('googleScriptURL تنظیم نشده است');
  }
  if (!CONFIG.api?.cloudinary?.cloudName || CONFIG.api.cloudinary.cloudName.includes('YOUR_')) {
    errors.push('cloudinaryCloudName تنظیم نشده است');
  }
  if (!CONFIG.api?.cloudinary?.uploadPreset || CONFIG.api.cloudinary.uploadPreset.includes('YOUR_')) {
    errors.push('cloudinaryUploadPreset تنظیم نشده است');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
