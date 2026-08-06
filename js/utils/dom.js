/**
 * ============================================================
 * DOM Utilities — ابزارهای کمکی DOM
 * ============================================================
 */

/**
 * انتخاب المان با پشتیبانی از خطا
 */
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * ایجاد المان با ویژگی‌ها و فرزندان
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.html !== undefined) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        el.setAttribute(key, value);
      }
    });
  }
  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      el.style[key] = value;
    });
  }
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      el.dataset[key] = value;
    });
  }
  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      el.addEventListener(event, handler);
    });
  }
  if (options.children) {
    options.children.forEach((child) => {
      if (child instanceof Node) {
        el.appendChild(child);
      } else if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      }
    });
  }
  if (options.parent) {
    options.parent.appendChild(el);
  }

  return el;
}

/**
 * فرار از کاراکترهای HTML برای جلوگیری از XSS
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

/**
 * Debounce - اجرای تابع پس از توقف فراخوانی‌ها
 */
export function debounce(fn, wait = 300) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle - محدودسازی نرخ اجرای تابع
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * IntersectionObserver wrapper
 */
export function observeElement(element, callback, options = {}) {
  if (!element || !('IntersectionObserver' in window)) {
    if (element && callback) callback([{ isIntersecting: true, target: element }]);
    return null;
  }

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    callback(entries);
  }, defaultOptions);

  observer.observe(element);
  return observer;
}

/**
 * اسکرول نرم به المان
 */
export function scrollToElement(element, offset = 0) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * بررسی موبایل
 */
export function isMobile() {
  return window.innerWidth <= 768;
}

/**
 * قالب‌بندی اعداد به فارسی
 */
export function formatPersianNumber(num) {
  return num.toLocaleString('fa-IR');
}

/**
 * قالب‌بندی قیمت
 */
export function formatPrice(price) {
  return formatPersianNumber(price);
}
