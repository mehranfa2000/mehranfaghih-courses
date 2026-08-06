/**
 * ============================================================
 * Panel Module — پنل جزئیات دوره
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml } from '../utils/dom.js';
import { openModal } from './modal.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger({ prefix: 'Panel' });

/**
 * راه‌اندازی پنل
 */
export function initPanel() {
  const closeBtn = document.getElementById('panel-close');
  const overlay = document.getElementById('panel-overlay');

  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  if (overlay) {
    overlay.addEventListener('click', closePanel);
  }

  // بستن با کلید Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePanel();
    }
  });
}

/**
 * باز کردن پنل برای دوره مشخص
 */
export function openPanel(courseId) {
  const course = CONFIG.courses.find((c) => c.id === courseId);
  if (!course) {
    logger.warn(`دوره با شناسه ${courseId} یافت نشد`);
    return;
  }

  const content = document.getElementById('panel-content');
  const registerBtn = document.getElementById('panel-register-btn');

  if (content) {
    content.innerHTML = renderPanelContent(course);
  }

  if (registerBtn) {
    const canRegister = course.status === CONFIG.courseStatus.OPEN;
    registerBtn.disabled = !canRegister;
    registerBtn.onclick = () => {
      closePanel();
      openModal(courseId);
    };

    if (!canRegister) {
      registerBtn.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i> ثبت‌نام امکان‌پذیر نیست';
    } else {
      registerBtn.innerHTML = '<i class="fas fa-user-plus" aria-hidden="true"></i> ثبت‌نام در این دوره';
    }
  }

  // نمایش پنل
  const overlay = document.getElementById('panel-overlay');
  const panel = document.getElementById('course-panel');
  overlay?.classList.add('active');
  panel?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * بستن پنل
 */
export function closePanel() {
  const overlay = document.getElementById('panel-overlay');
  const panel = document.getElementById('course-panel');

  overlay?.classList.remove('active');
  panel?.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * رندر محتوای پنل
 */
function renderPanelContent(course) {
  return `
    <h2 class="panel-course-title">${escapeHtml(course.title)}</h2>
    <p class="panel-course-desc">${escapeHtml(course.description)}</p>

    <p class="panel-section-title">
      <i class="fas fa-list-check" aria-hidden="true"></i> آنچه یاد می‌گیرید
    </p>
    <div class="features-list">${renderFeatures(course.features)}</div>

    <p class="panel-section-title">
      <i class="fas fa-book-open" aria-hidden="true"></i> سرفصل‌های دوره
    </p>
    ${renderSyllabus(course.syllabus)}
  `;
}

/**
 * رندر ویژگی‌ها
 */
function renderFeatures(features = []) {
  return features
    .map(
      (f) => `
    <div class="feature-item">
      <i class="fas fa-check-circle" aria-hidden="true"></i>
      <span>${escapeHtml(f)}</span>
    </div>`
    )
    .join('');
}

/**
 * رندر سرفصل‌ها
 */
function renderSyllabus(syllabus = []) {
  if (syllabus.length === 0) {
    return `<p style="color:var(--text-secondary);font-size:.9rem;padding:8px 0">سرفصل‌ها به زودی اضافه می‌شود.</p>`;
  }

  return syllabus
    .map(
      (s) => `
    <div class="accordion-item">
      <button class="accordion-btn" data-action="toggle-accordion" aria-expanded="false">
        <span>جلسه ${s.session}: ${escapeHtml(s.title)}</span>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
      </button>
      <div class="accordion-body">
        <ul class="accordion-topics">
          ${s.topics.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
    </div>`
    )
    .join('');
}
