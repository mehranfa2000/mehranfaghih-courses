/**
 * ============================================================
 * Testimonials Module — نظرات دانشجویان
 * ============================================================
 */

import { CONFIG } from '../config.js';
import { escapeHtml } from '../utils/dom.js';

let slideIndex = 0;
let slideTimer = null;

/**
 * رندر نظرات دانشجویان
 */
export function renderTestimonials() {
  const track = document.getElementById('testimonial-track');
  const dots = document.getElementById('testimonial-dots');
  if (!track || !dots) return;

  const testimonials = CONFIG.testimonials ?? [];

  track.innerHTML = testimonials
    .map(
      (t) => `
    <div class="testimonial-slide">
      <div class="testimonial-card">
        <div class="testimonial-stars" aria-label="امتیاز ${t.rating} از ۵">
          ${'<i class="fas fa-star" aria-hidden="true"></i>'.repeat(t.rating)}
        </div>
        <p class="testimonial-text">${escapeHtml(t.text)}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar-placeholder">
            <i class="fas fa-user" aria-hidden="true"></i>
          </div>
          <div>
            <div class="testimonial-name">${escapeHtml(t.name)}</div>
            <div class="testimonial-course">${escapeHtml(t.course)}</div>
          </div>
        </div>
      </div>
    </div>`
    )
    .join('');

  dots.innerHTML = testimonials
    .map(
      (_, i) => `
    <button class="dot ${i === 0 ? 'active' : ''}"
      data-action="go-slide" data-slide-index="${i}"
      aria-label="اسلاید ${i + 1}"></button>`
    )
    .join('');

  slideIndex = 0;
}

/**
 * رفتن به اسلاید مشخص
 */
export function goSlide(index) {
  const total = CONFIG.testimonials?.length ?? 0;
  if (total === 0) return;

  slideIndex = ((index % total) + total) % total;
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('.dot');

  if (track) {
    track.style.transform = `translateX(${slideIndex * 100}%)`;
  }

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === slideIndex);
  });
}

/**
 * شروع اسلایدر خودکار
 */
export function startSlider() {
  stopSlider();
  const interval = CONFIG.ui?.testimonialIntervalMs ?? 5000;
  slideTimer = setInterval(() => {
    goSlide(slideIndex + 1);
  }, interval);
}

/**
 * توقف اسلایدر
 */
export function stopSlider() {
  if (slideTimer) {
    clearInterval(slideTimer);
    slideTimer = null;
  }
}
