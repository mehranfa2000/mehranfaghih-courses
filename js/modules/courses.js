/**
 * ============================================================
 * Courses Module — نمایش دوره‌ها
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml, formatPrice } from '../utils/dom.js';

const STATUS_LABELS = {
  open: 'در حال ثبت‌نام',
  full: 'تکمیل ظرفیت',
  soon: 'به‌زودی',
};

const STATUS_CLASSES = {
  open: 'status-open',
  full: 'status-full',
  soon: 'status-soon',
};

const STATUS_ICONS = {
  open: 'fa-user-plus',
  full: 'fa-lock',
  soon: 'fa-clock',
};

/**
 * رندر کارت‌های دوره
 */
export function renderCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  const courses = CONFIG.courses ?? [];
  grid.innerHTML = courses.map(renderCourseCard).join('');
}

/**
 * رندر یک کارت دوره
 */
function renderCourseCard(course) {
  const statusLabel = STATUS_LABELS[course.status] ?? '';
  const statusClass = STATUS_CLASSES[course.status] ?? '';
  const canRegister = course.status === CONFIG.courseStatus.OPEN;
  const statusIcon = STATUS_ICONS[course.status] ?? 'fa-info-circle';

  return `
    <article class="course-card" data-aos="fade-up" data-id="${escapeHtml(course.id)}">
      <div class="course-poster">
        <div class="course-poster-placeholder">
          <i class="fas fa-brain" aria-hidden="true"></i>
        </div>
        <span class="course-badge" style="background:${escapeHtml(course.badgeColor)}">${escapeHtml(course.badge)}</span>
        <span class="course-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="course-body">
        <h3 class="course-title">${escapeHtml(course.title)}</h3>
        <p class="course-desc">${escapeHtml(course.description)}</p>
        <div class="course-meta">
          <span class="course-meta-item"><i class="fas fa-clock" aria-hidden="true"></i>${escapeHtml(course.duration)}</span>
          <span class="course-meta-item"><i class="fas fa-video" aria-hidden="true"></i>${escapeHtml(course.sessions)}</span>
          <span class="course-meta-item"><i class="fas fa-signal" aria-hidden="true"></i>${escapeHtml(course.level)}</span>
        </div>
        <div class="course-pricing">
          ${course.originalPrice > 0 ? `<span class="price-original">${formatPrice(course.originalPrice)}</span>` : ''}
          <span class="price-discount">${formatPrice(course.discountPrice)}</span>
          <span class="price-unit">تومان</span>
        </div>
        <div class="course-actions">
          <button class="btn-ghost btn-sm btn-detail" data-action="open-panel" data-course-id="${escapeHtml(course.id)}" aria-label="جزئیات ${escapeHtml(course.title)}">
            <i class="fas fa-info-circle" aria-hidden="true"></i> جزئیات
          </button>
          ${renderEnrollButton(course, canRegister, statusLabel, statusIcon)}
        </div>
      </div>
    </article>`;
}

/**
 * رندر دکمه ثبت‌نام
 */
function renderEnrollButton(course, canRegister, statusLabel, statusIcon) {
  if (canRegister) {
    return `
      <button class="btn-primary btn-sm btn-enroll" data-action="open-modal" data-course-id="${escapeHtml(course.id)}" aria-label="ثبت‌نام در ${escapeHtml(course.title)}">
        <i class="fas fa-user-plus" aria-hidden="true"></i> ثبت‌نام
      </button>`;
  }
  return `
    <button class="btn-outline btn-sm btn-enroll" disabled style="opacity:0.5;cursor:not-allowed">
      <i class="fas ${statusIcon}" aria-hidden="true"></i> ${statusLabel}
    </button>`;
}
