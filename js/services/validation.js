/**
 * ============================================================
 * Validation Service — اعتبارسنجی
 * ============================================================
 */

const PERSIAN_PHONE_REGEX = /^09[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)/;

/**
 * اعتبارسنجی شماره موبایل ایرانی
 */
export function isValidPhone(phone) {
  return PERSIAN_PHONE_REGEX.test(phone);
}

/**
 * اعتبارسنجی ایمیل
 */
export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

/**
 * اعتبارسنجی URL
 */
export function isValidUrl(url) {
  return URL_REGEX.test(url);
}

/**
 * اعتبارسنجی فایل تصویر
 */
export function validateImageFile(file, { maxSizeMB = 5, allowedTypes = ['image/'] } = {}) {
  if (!file) {
    return { valid: false, error: 'فایلی انتخاب نشده' };
  }

  if (!allowedTypes.some((type) => file.type.startsWith(type))) {
    return { valid: false, error: 'فقط فایل تصویر مجاز است' };
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد` };
  }

  return { valid: true, file };
}

/**
 * اعتبارسنجی فرم ثبت‌نام
 */
export function validateRegistrationForm({ name, phone, course, file }) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('نام و نام خانوادگی الزامی است');
  }

  if (!phone) {
    errors.push('شماره موبایل الزامی است');
  } else if (!isValidPhone(phone)) {
    errors.push('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
  }

  if (!course) {
    errors.push('انتخاب دوره الزامی است');
  }

  if (!file) {
    errors.push('تصویر رسید پرداخت الزامی است');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
