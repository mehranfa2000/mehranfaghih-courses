/**
 * ============================================================
 * Modal Module — مودال ثبت‌نام چندمرحله‌ای
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml, formatPrice } from '../utils/dom.js';
import { Logger } from '../utils/logger.js';
import { showToast } from './toast.js';
import { copyText } from './clipboard.js';
import { registrationService, uploadService } from '../services/api.js';
import { validateImageFile, validateRegistrationForm } from '../services/validation.js';

const logger = new Logger({ prefix: 'Modal' });

let selectedCourse = null;
let uploadedFile = null;
let receiptURL = '';
let currentStep = 1;

/**
 * راه‌اندازی مودال
 */
export function initModals() {
  const closeBtn = document.getElementById('modal-close');
  const overlay = document.getElementById('modal-overlay');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  // بستن با Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ساخت مراحل
  buildStep1();
  buildStep2();
  buildStep3();
}

/**
 * باز کردن مودال
 */
export function openModal(courseId = null) {
  selectedCourse = courseId ? CONFIG.courses.find((c) => c.id === courseId) : null;
  resetForm();
  goToStep(1);

  // نمایش
  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.add('active');
  document.body.style.overflow = 'hidden';

  // اگر دوره انتخاب شده، فرم را پر کن
  if (selectedCourse) {
    setTimeout(() => {
      const sel = document.getElementById('reg-course');
      if (sel) sel.value = selectedCourse.title;
    }, 100);
  }
}

/**
 * بستن مودال
 */
export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.remove('active');
  document.body.style.overflow = '';
  resetForm();
}

/**
 * رفتن به مرحله مشخص
 */
export function goToStep(n) {
  currentStep = n;

  document.querySelectorAll('.modal-body').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === n);
  });

  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done', i + 1 < n);
  });
}

/**
 * ساخت مرحله ۱: اطلاعات پرداخت
 */
function buildStep1() {
  const container = document.getElementById('modal-step-1');
  if (!container) return;

  const { cardNumber, accountNumber, sheba, bankName, ownerName } = CONFIG.payment;

  container.innerHTML = `
    <h2 class="modal-title">اطلاعات پرداخت</h2>
    <p class="modal-subtitle">مبلغ دوره را به حساب زیر واریز کنید</p>
    <div class="payment-info-box">
      ${renderPaymentRow('شماره کارت', cardNumber, true)}
      ${renderPaymentRow('شماره حساب', accountNumber)}
      ${renderPaymentRow('شبا', sheba, false, true)}
      ${renderPaymentRow('بانک', bankName)}
      ${renderPaymentRow('صاحب حساب', ownerName)}
    </div>
    <div class="alert-box">
      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <span>لطفاً مبلغ دوره را واریز کرده و رسید را عکس بگیرید</span>
    </div>
    <button class="btn-primary btn-full" data-action="next-step">
      <i class="fas fa-arrow-left" aria-hidden="true"></i> رسید را آپلود کردم، ادامه
    </button>`;
}

/**
 * رندر یک ردیف پرداخت
 */
function renderPaymentRow(label, value, copyable = false, smallFont = false) {
  const valueStyle = smallFont ? ' style="font-size:.82rem"' : '';
  const copyBtn = copyable
    ? `<button class="copy-btn" data-action="copy" data-copy-text="${escapeHtml(value)}" aria-label="کپی ${escapeHtml(label)}">
        <i class="fas fa-copy" aria-hidden="true"></i> کپی
      </button>`
    : '';

  return `
    <div class="payment-row">
      <span class="payment-label">${escapeHtml(label)}</span>
      <span class="payment-value"${valueStyle}>${escapeHtml(value)}</span>
      ${copyBtn}
    </div>`;
}

/**
 * ساخت مرحله ۲: فرم ثبت‌نام
 */
function buildStep2() {
  const container = document.getElementById('modal-step-2');
  if (!container) return;

  const courseOptions = CONFIG.courses
    .filter((c) => c.status === CONFIG.courseStatus.OPEN)
    .map((c) => `<option value="${escapeHtml(c.title)}">${escapeHtml(c.title)} — ${formatPrice(c.discountPrice)} تومان</option>`)
    .join('');

  container.innerHTML = `
    <h2 class="modal-title">اطلاعات ثبت‌نام</h2>
    <p class="modal-subtitle">لطفاً اطلاعات خود را وارد کنید</p>
    <form id="reg-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="reg-name">نام و نام خانوادگی <span>*</span></label>
        <input id="reg-name" class="form-input" type="text" placeholder="مثال: علی رضایی" required aria-required="true"/>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-phone">شماره موبایل <span>*</span></label>
        <input id="reg-phone" class="form-input" type="tel" placeholder="09XXXXXXXXX" pattern="09[0-9]{9}" required aria-required="true"/>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-course">دوره انتخابی <span>*</span></label>
        <select id="reg-course" class="form-select" required aria-required="true">
          <option value="">انتخاب کنید...</option>${courseOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">تصویر رسید پرداخت <span>*</span></label>
        <div class="upload-area" id="upload-area" data-action="upload-click" role="button" aria-label="آپلود تصویر رسید" tabindex="0">
          <div class="upload-icon"><i class="fas fa-cloud-upload-alt" aria-hidden="true"></i></div>
          <p class="upload-text">کلیک کنید یا فایل را اینجا رها کنید<br><small>فقط تصویر، حداکثر ۵ مگابایت</small></p>
        </div>
        <input type="file" id="receipt-input" accept="image/*" style="display:none"/>
        <div class="upload-preview" id="upload-preview" style="display:none"></div>
        <div class="progress-wrap" id="progress-wrap">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
      <button type="submit" id="submit-btn" class="btn-primary btn-full">
        <i class="fas fa-paper-plane" aria-hidden="true"></i> ارسال و تکمیل ثبت‌نام
      </button>
    </form>`;

  // رویدادهای آپلود
  setupUploadEvents();
}

/**
 * تنظیم رویدادهای آپلود
 */
function setupUploadEvents() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('receipt-input');
  if (!uploadArea || !fileInput) return;

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  });
}

/**
 * مدیریت انتخاب فایل
 */
function handleFileSelect(file) {
  const validation = validateImageFile(file, { maxSizeMB: CONFIG.ui?.maxFileSizeMB ?? 5 });
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }

  uploadedFile = validation.file;

  // پیش‌نمایش
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('upload-preview');
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" alt="پیش‌نمایش رسید پرداخت"/>`;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

/**
 * ارسال فرم ثبت‌نام
 */
async function submitRegistration(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name')?.value.trim() ?? '';
  const phone = document.getElementById('reg-phone')?.value.trim() ?? '';
  const course = document.getElementById('reg-course')?.value ?? '';

  // اعتبارسنجی
  const validation = validateRegistrationForm({ name, phone, course, file: uploadedFile });
  if (!validation.isValid) {
    validation.errors.forEach((err) => showToast(err, 'error'));
    return;
  }

  // بررسی تنظیمات
  if (
    !CONFIG.api.googleScriptURL ||
    CONFIG.api.googleScriptURL.includes('YOUR_') ||
    !CONFIG.api.cloudinary?.cloudName ||
    CONFIG.api.cloudinary.cloudName.includes('YOUR_') ||
    !CONFIG.api.cloudinary?.uploadPreset ||
    CONFIG.api.cloudinary.uploadPreset.includes('YOUR_')
  ) {
    showToast('تنظیمات سیستم ناقص است. لطفاً با مدیر سایت تماس بگیرید.', 'error');
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;

  try {
    // مرحله ۱: آپلود تصویر
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال آپلود رسید...';

    receiptURL = await uploadService.uploadToCloudinary(
      uploadedFile,
      CONFIG.api.cloudinary,
      (percent) => {
        const progressBar = document.getElementById('progress-fill');
        const progressWrap = document.getElementById('progress-wrap');
        if (progressWrap) progressWrap.style.display = 'block';
        if (progressBar) progressBar.style.width = `${percent}%`;
      }
    );

    // مرحله ۲: ارسال به Google Sheets
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت اطلاعات...';

    await registrationService.submit({
      name,
      phone,
      course,
      receiptURL,
      timestamp: new Date().toLocaleString('fa-IR'),
    });

    // مرحله ۳: نمایش موفقیت
    showSuccessStep({ name, phone, course });
  } catch (err) {
    logger.error('خطا در ثبت‌نام:', err);

    let errorMsg = 'خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.';
    if (err.message?.includes('Cloudinary') || err.message?.includes('آپلود')) {
      errorMsg = 'خطا در آپلود تصویر. اتصال اینترنت را چک کنید.';
    } else if (err.message?.includes('شبکه')) {
      errorMsg = 'خطای شبکه. اتصال اینترنت را بررسی کنید.';
    }
    showToast(errorMsg, 'error');

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال و تکمیل ثبت‌نام';
  }
}

/**
 * نمایش مرحله موفقیت
 */
function showSuccessStep(data) {
  buildStep3();
  const summary = document.getElementById('success-summary');
  if (summary) {
    summary.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">نام</span>
        <span class="summary-value">${escapeHtml(data.name)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">موبایل</span>
        <span class="summary-value">${escapeHtml(data.phone)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">دوره</span>
        <span class="summary-value">${escapeHtml(data.course)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">وضعیت</span>
        <span class="summary-value" style="color:var(--success)">در انتظار تأیید</span>
      </div>`;
  }
  goToStep(3);
}

/**
 * ساخت مرحله ۳: موفقیت
 */
function buildStep3() {
  const container = document.getElementById('modal-step-3');
  if (!container) return;

  container.innerHTML = `
    <div class="success-wrap">
      <svg class="success-svg" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="success-circle" cx="26" cy="26" r="25" fill="none" stroke="#22c55e" stroke-width="2"/>
        <path class="success-check" d="M14 27l8 8 16-16" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 class="success-title">ثبت‌نام موفق!</h3>
      <p class="success-msg">ثبت‌نام شما دریافت شد. حداکثر ۲۴ ساعت دیگر دسترسی شما فعال می‌شود.</p>
      <div class="success-summary" id="success-summary"></div>
      <a href="${escapeHtml(CONFIG.contact.telegram)}" target="_blank" rel="noopener" class="btn-primary btn-full">
        <i class="fab fa-telegram" aria-hidden="true"></i> ارتباط با پشتیبانی تلگرام
      </a>
    </div>`;
}

/**
 * بازنشانی فرم
 */
function resetForm() {
  uploadedFile = null;
  receiptURL = '';

  const form = document.getElementById('reg-form');
  if (form) form.reset();

  const preview = document.getElementById('upload-preview');
  if (preview) {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }

  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-fill');
  if (progressWrap) progressWrap.style.display = 'none';
  if (progressBar) progressBar.style.width = '0%';
}

// اتصال event listener فرم
document.addEventListener('submit', (e) => {
  if (e.target.id === 'reg-form') {
    submitRegistration(e);
  }
});
