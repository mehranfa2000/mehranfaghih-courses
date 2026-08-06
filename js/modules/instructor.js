/**
 * ============================================================
 * Instructor Module — بخش معرفی مدرس
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml, observeElement } from '../utils/dom.js';
import { animateSkillBars } from './stats.js';

const SOCIAL_ICONS = {
  instagram: 'fa-instagram',
  telegram: 'fa-telegram',
  linkedin: 'fa-linkedin',
  whatsapp: 'fa-whatsapp',
};

/**
 * رندر بخش معرفی مدرس
 */
export function renderInstructor() {
  const container = document.getElementById('instructor-content');
  if (!container) return;

  const { name, title, bio, skills, social } = CONFIG.instructor;

  container.innerHTML = `
    <div class="instructor-photo-wrap" data-aos="fade-left">
      <div class="instructor-photo-placeholder">
        <i class="fas fa-user-tie" aria-hidden="true"></i>
        <span>تصویر مدرس</span>
      </div>
    </div>
    <div class="instructor-info" data-aos="fade-right">
      <h3 class="instructor-name">${escapeHtml(name)}</h3>
      <p class="instructor-title">${escapeHtml(title)}</p>
      <p class="instructor-bio">${escapeHtml(bio)}</p>
      <div class="skills-list">${renderSkills(skills)}</div>
      <div class="instructor-social">${renderSocial(social)}</div>
    </div>
  `;

  // فعال‌سازی انیمیشن نوار مهارت هنگام دیده شدن
  observeElement(
    container,
    (entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars();
      }
    },
    { threshold: 0.4 }
  );
}

/**
 * رندر نوار مهارت‌ها
 */
function renderSkills(skills) {
  return skills
    .map(
      (s) => `
    <div class="skill-item">
      <div class="skill-header">
        <span>${escapeHtml(s.name)}</span>
        <span>${s.percent}٪</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" data-width="${s.percent}"></div>
      </div>
    </div>`
    )
    .join('');
}

/**
 * رندر لینک‌های اجتماعی
 */
function renderSocial(social) {
  return Object.entries(social)
    .map(([key, url]) => {
      const icon = SOCIAL_ICONS[key] ?? 'fa-link';
      return `
        <a href="${escapeHtml(url)}" class="social-btn" aria-label="${key}" target="_blank" rel="noopener">
          <i class="fab ${icon}" aria-hidden="true"></i>
        </a>`;
    })
    .join('');
}
