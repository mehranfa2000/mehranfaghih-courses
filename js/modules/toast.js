/**
 * ============================================================
 * Toast Module — نوتیفیکیشن
 * ============================================================
 */

let toastTimer = null;
const TOAST_DURATION = 3000;

/**
 * نمایش پیام toast
 * @param {string} message - پیام
 * @param {'success'|'error'|'info'} type - نوع پیام
 */
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.warn('المان toast یافت نشد');
    return;
  }

  toast.textContent = message;
  toast.className = `toast toast-${type} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, TOAST_DURATION);
}

/**
 * مخفی کردن toast
 */
export function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.remove('show');
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}
