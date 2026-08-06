/**
 * ============================================================
 * API Service — سرویس‌های API
 * ============================================================
 */

import { Logger } from '../utils/logger.js';

const logger = new Logger({ prefix: 'API' });

/**
 * کلاس پایه برای خطاهای API
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * درخواست HTTP عمومی
 */
async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // ignore
      }
      const message = errorData?.detail || errorData?.message || response.statusText;
      throw new APIError(message, response.status, errorData);
    }

    // برخی endpointها ممکن است محتوای خالی برگردانند
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    if (err instanceof APIError) throw err;
    logger.error('خطای شبکه:', err);
    throw new APIError(err.message || 'خطای شبکه', 0, null);
  }
}

/**
 * متدهای HTTP
 */
export const httpClient = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, data, options) =>
    request(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options) =>
    request(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data, options) =>
    request(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};

/**
 * سرویس ثبت‌نام (Course Registration)
 */
export const registrationService = {
  /**
   * ارسال اطلاعات ثبت‌نام به Google Sheets
   */
  async submit(data) {
    const url = window.CONFIG?.api?.googleScriptURL || import.meta?.env?.VITE_GOOGLE_SCRIPT_URL;
    if (!url) {
      throw new Error('آدرس Google Script تنظیم نشده است');
    }
    return httpClient.post(url, data, { mode: 'no-cors' });
  },
};

/**
 * سرویس آپلود (Cloudinary)
 */
export const uploadService = {
  /**
   * آپلود فایل به Cloudinary با progress
   */
  uploadToCloudinary(file, { cloudName, uploadPreset, folder = 'receipts' }, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable && onProgress) {
          onProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              resolve(data.secure_url);
            } else {
              reject(new Error('پاسخ نامعتبر از Cloudinary'));
            }
          } catch {
            reject(new Error('خطا در پردازش پاسخ'));
          }
        } else {
          let msg = 'خطا در آپلود';
          try {
            const err = JSON.parse(xhr.responseText);
            if (err.error?.message) msg = err.error.message;
          } catch {
            // ignore
          }
          reject(new Error(msg));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('خطای شبکه در آپلود')));
      xhr.addEventListener('timeout', () => reject(new Error('زمان آپلود تمام شد')));

      xhr.timeout = 60000;
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  },
};

/**
 * سرویس اخبار (News Agent) — اگر در دسترس باشد
 */
export const fetchNewsService = {
  /**
   * بررسی سلامت API
   */
  async healthCheck() {
    try {
      return await httpClient.get('/api/health');
    } catch {
      // ممکن است endpoint وجود نداشته باشد
      return { status: 'unknown' };
    }
  },
};
