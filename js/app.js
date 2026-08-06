/**
 * ============================================================
 * App Entry Point — اپلیکیشن اصلی
 * ============================================================
 * نقطه شروع اپلیکیشن. تمام ماژول‌ها را بارگذاری و اجرا می‌کند.
 */

import { CONFIG, validateConfig } from './config.js';
import { initHeader, updateActiveNav } from './modules/header.js';
import { initParticles } from './modules/particles.js';
import { initTyped } from './modules/typed.js';
import { renderHeroStats, animateCounters, animateSkillBars } from './modules/stats.js';
import { renderInstructor } from './modules/instructor.js';
import { renderCourses } from './modules/courses.js';
import { renderWhyUs } from './modules/whyUs.js';
import { renderTestimonials, startSlider, goSlide } from './modules/testimonials.js';
import { renderFAQ, toggleFAQ } from './modules/faq.js';
import { renderFooter } from './modules/footer.js';
import { initModals, openModal, closeModal, goToStep } from './modules/modal.js';
import { initAOS } from './modules/aos.js';
import { initScrollAnimations } from './modules/scrollAnimations.js';
import { showToast } from './modules/toast.js';
import { copyText } from './modules/clipboard.js';
import { initAccordion, toggleAccordion } from './modules/accordion.js';
import { initPanel, openPanel, closePanel } from './modules/panel.js';
import { fetchNewsService } from './services/api.js';
import { Logger } from './utils/logger.js';

// ایجاد Logger جهانی برای دیباگ
const logger = new Logger({ prefix: 'App', enabled: true });

/**
 * راه‌اندازی اولیه اپلیکیشن پس از بارگذاری DOM
 */
async function bootstrap() {
  try {
    logger.info('🚀 شروع راه‌اندازی اپلیکیشن...');

    // اعتبارسنجی تنظیمات
    const configCheck = validateConfig();
    if (!configCheck.isValid) {
      logger.warn('تنظیمات ناقص:', configCheck.errors);
    }

    // بارگذاری تنظیمات AOS (انیمیشن‌ها)
    initAOS();

    // هدر و نوار ناوبری
    initHeader();

    // افکت‌های بصری
    initParticles();
    initTyped();

    // رندر محتوا
    renderHeroStats();
    renderInstructor();
    renderCourses();
    renderWhyUs();
    renderTestimonials();
    renderFAQ();
    renderFooter();

    // پنل و مودال
    initPanel();
    initModals();
    initAccordion();

    // انیمیشن‌های اسکرول
    initScrollAnimations();

    // شروع اسلایدر خودکار
    startSlider();

    // بررسی سلامت API در پس‌زمینه (بدون بلاک کردن UI)
    fetchNewsService.healthCheck().catch((err) => {
      logger.warn('API در دسترس نیست:', err.message);
    });

    logger.info('✅ اپلیکیشن با موفقیت راه‌اندازی شد');
  } catch (error) {
    logger.error('خطا در راه‌اندازی:', error);
    showToast('خطا در بارگذاری اپلیکیشن', 'error');
  }
}

// ── رویدادهای سراسری ─────────────────────────────────────────

// به‌روزرسانی فعال بودن لینک نوار ناوبری هنگام اسکرول
window.addEventListener('scroll', updateActiveNav, { passive: true });

// تغییر سایز پنجره - بهینه‌سازی رندر
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    logger.debug('پنجره تغییر سایز داد');
  }, 250);
});

// ── Event Delegation مرکزی ─────────────────────────────────
/**
 * مدیریت تمام data-action ها با یک listener مرکزی
 * این روش بهتر از اتصال listener به هر دکمه است
 */
function setupGlobalEventDelegation() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const courseId = target.dataset.courseId;
    const slideIndex = target.dataset.slideIndex;
    const copyTextValue = target.dataset.copyText;

    switch (action) {
      case 'open-modal':
        e.preventDefault();
        openModal(courseId || null);
        break;

      case 'open-panel':
        e.preventDefault();
        if (courseId) openPanel(courseId);
        break;

      case 'next-step':
        e.preventDefault();
        goToStep(2);
        break;

      case 'go-slide':
        e.preventDefault();
        if (slideIndex !== undefined) {
          goSlide(parseInt(slideIndex, 10));
        }
        break;

      case 'toggle-faq':
        e.preventDefault();
        toggleFAQ(target);
        break;

      case 'toggle-accordion':
        e.preventDefault();
        toggleAccordion(target);
        break;

      case 'copy':
        e.preventDefault();
        if (copyTextValue) {
          copyText(copyTextValue, 'کپی شد');
        }
        break;

      case 'upload-click':
        // مدیریت در ماژول modal انجام می‌شود
        break;

      default:
        logger.warn(`عمل ناشناس: ${action}`);
    }
  });

  logger.debug('Event Delegation راه‌اندازی شد');
}

// رویداد بارگذاری DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupGlobalEventDelegation();
    bootstrap();
  });
} else {
  setupGlobalEventDelegation();
  bootstrap();
}

// ── توابع سراسری (برای دسترسی از HTML قدیمی) ─────────────

// اگر HTML هنوز از onclick استفاده می‌کند، در دسترس باشد
window.openModal = openModal;
window.closeModal = closeModal;
window.goToStep = goToStep;
window.openPanel = openPanel;
window.closePanel = closePanel;
window.copyText = copyText;
window.showToast = showToast;
window.toggleFAQ = toggleFAQ;
window.toggleAccordion = toggleAccordion;

// برای دیباگ در محیط توسعه
if (import.meta.env?.DEV) {
  window.__APP__ = {
    CONFIG,
    logger,
    openModal,
    openPanel,
    showToast,
  };
}

export { logger };
