/**
 * ============================================================
 * WhyUs Module — چرا ما
 * ============================================================
 */

import { escapeHtml } from '../utils/dom.js';

const WHY_US_ITEMS = [
  {
    icon: 'fa-certificate',
    title: 'گواهینامه معتبر',
    desc: 'گواهینامه رسمی با امضای مدرس پس از اتمام دوره',
  },
  {
    icon: 'fa-headset',
    title: 'پشتیبانی ۲۴/۷',
    desc: 'پشتیبانی آنلاین در تلگرام و واتساپ',
  },
  {
    icon: 'fa-infinity',
    title: 'دسترسی مادام‌العمر',
    desc: 'یکبار بخر، برای همیشه دسترسی داشته باش',
  },
  {
    icon: 'fa-laptop-code',
    title: 'پروژه عملی',
    desc: 'پروژه‌های واقعی برای تقویت رزومه',
  },
  {
    icon: 'fa-users',
    title: 'جامعه دانشجویان',
    desc: 'گروه اختصاصی دانشجویان برای تبادل تجربه',
  },
  {
    icon: 'fa-arrows-rotate',
    title: 'آپدیت رایگان',
    desc: 'محتوای دوره همواره به‌روز می‌شود',
  },
];

/**
 * رندر بخش چرا ما
 */
export function renderWhyUs() {
  const grid = document.getElementById('why-grid');
  if (!grid) return;

  grid.innerHTML = WHY_US_ITEMS.map((item, i) => `
    <div class="why-card" data-aos="fade-up" data-aos-delay="${i * 80}">
      <div class="why-icon">
        <i class="fas ${item.icon}" aria-hidden="true"></i>
      </div>
      <h4 class="why-title">${escapeHtml(item.title)}</h4>
      <p class="why-desc">${escapeHtml(item.desc)}</p>
    </div>
  `).join('');
}
