/**
 * ============================================================
 * Header Module — مدیریت هدر و نوار ناوبری
 * ============================================================
 */

import { $, $$, debounce } from '../utils/dom.js';
import { CONFIG } from '../config.js';

const SECTIONS = ['home', 'instructor', 'courses', 'testimonials', 'contact'];

/**
 * راه‌اندازی هدر
 */
export function initHeader() {
  const header = $('#header');
  const hamburger = $('#hamburger');
  const nav = $('#nav');

  if (!header || !hamburger || !nav) {
    console.warn('المان‌های هدر یافت نشد');
    return;
  }

  // تغییر استایل هدر هنگام اسکرول
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // مقداردهی اولیه

  // باز/بستن منوی موبایل
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // بستن منو با کلیک بیرون
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      closeMobileMenu(nav, hamburger);
    }
  });

  // بستن منو با کلیک روی لینک
  $$('.nav-link', nav).forEach((link) => {
    link.addEventListener('click', () => closeMobileMenu(nav, hamburger));
  });

  // بستن منو با کلید Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMobileMenu(nav, hamburger);
    }
  });
}

/**
 * بستن منوی موبایل
 */
function closeMobileMenu(nav, hamburger) {
  nav.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

/**
 * به‌روزرسانی لینک فعال در نوار ناوبری بر اساس موقعیت اسکرول
 */
export function updateActiveNav() {
  const navLinks = $$('.nav-link');
  if (navLinks.length === 0) return;

  const offset = CONFIG.ui?.navScrollOffset ?? 100;
  let currentSection = '';

  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - offset) {
      currentSection = id;
    }
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentSection}`;
    link.classList.toggle('active', isActive);
  });
}
