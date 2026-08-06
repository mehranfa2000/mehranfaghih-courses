/**
 * ============================================================
 * AOS Module — Animate On Scroll
 * ============================================================
 */

/**
 * راه‌اندازی AOS
 */
export function initAOS() {
  if (typeof window.AOS === 'undefined') {
    console.warn('کتابخانه AOS بارگذاری نشده');
    return;
  }

  window.AOS.init({
    duration: 700,
    once: true,
    offset: 80,
    easing: 'ease-out-cubic',
  });
}

/**
 * رفرش AOS (برای محتوای داینامیک)
 */
export function refreshAOS() {
  if (typeof window.AOS !== 'undefined') {
    window.AOS.refresh();
  }
}
