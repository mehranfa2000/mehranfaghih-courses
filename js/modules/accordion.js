/**
 * ============================================================
 * Accordion Module — آکاردئون (برای سرفصل‌ها)
 * ============================================================
 */

/**
 * راه‌اندازی آکاردئون‌ها
 */
export function initAccordion() {
  // آکاردئون‌ها به صورت data-action مدیریت می‌شوند
  // از طریق event delegation در main.js
}

/**
 * باز/بستن یک آیتم آکاردئون
 */
export function toggleAccordion(button) {
  if (!button) return;

  const body = button.nextElementSibling;
  if (!body) return;

  const isOpen = button.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    body.style.maxHeight = `${body.scrollHeight}px`;
  } else {
    body.style.maxHeight = '0';
  }
}
