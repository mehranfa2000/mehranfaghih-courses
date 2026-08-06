/**
 * ============================================================
 * Stats Module — آمار و شمارنده‌ها
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { formatPersianNumber, observeElement } from '../utils/dom.js';

/**
 * رندر آمار هیرو
 */
export function renderHeroStats() {
  const el = document.getElementById('hero-stats');
  if (!el) return;

  const stats = CONFIG.instructor?.stats ?? [];

  el.innerHTML = stats
    .map(
      (s) => `
    <div class="stat-item">
      <span class="stat-value" data-target="${s.value}" data-display="${escapeAttr(s.display)}">۰</span>
      <span class="stat-label">${escapeHtml(s.label)}</span>
    </div>`
    )
    .join('');
}

/**
 * انیمیشن شمارنده‌ها
 */
export function animateCounters() {
  const elements = document.querySelectorAll('.stat-value[data-target]');
  elements.forEach(animateCounter);
}

/**
 * انیمیشن یک شمارنده
 */
function animateCounter(el) {
  // جلوگیری از اجرای مجدد
  if (el.dataset.animated === 'true') return;
  el.dataset.animated = 'true';

  const display = el.dataset.display;
  const num = parseInt(el.dataset.target, 10);

  if (isNaN(num)) {
    el.textContent = display;
    return;
  }

  const stepMs = CONFIG.ui?.counterStepMs ?? 25;
  const step = Math.max(1, Math.ceil(num / 60));
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= num) {
      el.textContent = display;
      clearInterval(timer);
      return;
    }
    el.textContent = formatPersianNumber(current);
  }, stepMs);
}

/**
 * انیمیشن نوار مهارت
 */
export function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-fill[data-width]');
  bars.forEach((bar) => {
    if (bar.dataset.animated === 'true') return;
    bar.dataset.animated = 'true';
    bar.style.width = `${bar.dataset.width}%`;
  });
}

/**
 * مشاهده برای فعال‌سازی انیمیشن‌ها
 */
export function initStatsObserver() {
  const statsEl = document.getElementById('hero-stats');
  if (!statsEl) return;

  observeElement(
    statsEl,
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      });
    },
    { threshold: 0.3 }
  );
}

// توابع کمکی
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}
