/**
 * ============================================================
 * Clipboard Module — کپی در کلیپ‌بورد
 * ============================================================
 */

import { showToast } from './toast.js';

/**
 * کپی متن در کلیپ‌بورد با fallback
 * @param {string} text - متن برای کپی
 * @param {string} message - پیام موفقیت (اختیاری)
 */
export async function copyText(text, message) {
  if (!text) return false;

  try {
    // روش مدرن با Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(message ?? 'کپی شد', 'success');
      return true;
    }

    // Fallback برای مرورگرهای قدیمی
    return legacyCopy(text, message);
  } catch (err) {
    console.warn('خطا در کپی مدرن، استفاده از روش قدیمی:', err);
    return legacyCopy(text, message);
  }
}

/**
 * روش قدیمی کپی با استفاده از textarea مخفی
 */
function legacyCopy(text, message) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (success) {
      showToast(message ?? 'کپی شد', 'success');
      return true;
    }
    throw new Error('execCommand failed');
  } catch (err) {
    console.error('خطا در کپی:', err);
    showToast('خطا در کپی', 'error');
    return false;
  }
}
