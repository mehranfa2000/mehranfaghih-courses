/**
 * ============================================================
 * Footer Module — پاورقی
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml } from '../utils/dom.js';

const SOCIAL_ICONS = {
  instagram: 'fa-instagram',
  telegram: 'fa-telegram',
  linkedin: 'fa-linkedin',
  whatsapp: 'fa-whatsapp',
};

/**
 * رندر پاورقی
 */
export function renderFooter() {
  renderFooterBio();
  renderFooterSocial();
  renderFooterContact();
}

/**
 * رندر بیو پاورقی
 */
function renderFooterBio() {
  const el = document.getElementById('footer-bio');
  if (el) {
    el.textContent = CONFIG.instructor.bio;
  }
}

/**
 * رندر لینک‌های اجتماعی پاورقی
 */
function renderFooterSocial() {
  const container = document.getElementById('footer-social');
  if (!container) return;

  const social = CONFIG.instructor.social ?? {};
  container.innerHTML = Object.entries(social)
    .map(([key, url]) => {
      const icon = SOCIAL_ICONS[key] ?? 'fa-link';
      return `
        <a href="${escapeHtml(url)}" class="social-btn" aria-label="${key}" target="_blank" rel="noopener">
          <i class="fab ${icon}" aria-hidden="true"></i>
        </a>`;
    })
    .join('');
}

/**
 * رندر اطلاعات تماس پاورقی
 */
function renderFooterContact() {
  const container = document.getElementById('footer-contact');
  if (!container) return;

  const { contact } = CONFIG;

  container.innerHTML = `
    <h4 class="footer-heading">ارتباط با ما</h4>
    <div class="contact-item">
      <i class="fas fa-phone" aria-hidden="true"></i>
      <a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>
    </div>
    <div class="contact-item">
      <i class="fab fa-telegram" aria-hidden="true"></i>
      <a href="${escapeHtml(contact.telegram)}" target="_blank" rel="noopener">تلگرام</a>
    </div>
    <div class="contact-item">
      <i class="fas fa-envelope" aria-hidden="true"></i>
      <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
    </div>`;
}
