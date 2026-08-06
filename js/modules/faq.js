/**
 * ============================================================
 * FAQ Module — سؤالات متداول
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml } from '../utils/dom.js';

/**
 * رندر لیست FAQ
 */
export function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;

  const faqs = CONFIG.faq ?? [];
  list.innerHTML = faqs
    .map(
      (f, i) => `
    <div class="faq-item" data-aos="fade-up">
      <button class="faq-question"
        data-action="toggle-faq"
        data-faq-index="${i}"
        aria-expanded="false"
        aria-controls="faq-answer-${i}">
        <span>${escapeHtml(f.q)}</span>
        <i class="fas fa-plus" aria-hidden="true"></i>
      </button>
      <div class="faq-answer" id="faq-answer-${i}" role="region">
        <p>${escapeHtml(f.a)}</p>
      </div>
    </div>`
    )
    .join('');
}

/**
 * باز/بستن یک آیتم FAQ
 */
export function toggleFAQ(button) {
  if (!button) return;
  const answer = button.nextElementSibling;
  if (!answer) return;

  const isOpen = button.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  } else {
    answer.style.maxHeight = '0';
  }
}
