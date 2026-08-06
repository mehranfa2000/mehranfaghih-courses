/**
 * ============================================================
 * Typed Module — افکت تایپ در هیرو
 * ============================================================
 */

const TYPED_STRINGS = [
  'یادگیری هوش مصنوعی^500 با مهران فقیه',
  'از صفر تا متخصص^500 در هوش مصنوعی',
  'آینده‌ات را^500 با AI بساز',
];

/**
 * راه‌اندازی افکت تایپ
 */
export function initTyped() {
  const target = document.getElementById('typed-title');
  if (!target) return;

  // بررسی اینکه کتابخانه Typed بارگذاری شده باشد
  if (typeof window.Typed === 'undefined') {
    // Fallback: متن اول را مستقیم نمایش بده
    target.textContent = TYPED_STRINGS[0].replace(/\^500/g, '');
    console.warn('کتابخانه Typed.js بارگذاری نشده');
    return;
  }

  new window.Typed('#typed-title', {
    strings: TYPED_STRINGS,
    typeSpeed: 60,
    backSpeed: 30,
    loop: true,
    backDelay: 2000,
    smartBackspace: true,
  });
}
