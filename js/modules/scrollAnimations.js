/**
 * ============================================================
 * Scroll Animations Module — انیمیشن‌های اسکرول
 * ============================================================
 */

import { observeElement } from '../utils/dom.js';
import { animateCounters, animateSkillBars } from './stats.js';

/**
 * راه‌اندازی انیمیشن‌های مبتنی بر اسکرول
 */
export function initScrollAnimations() {
  const statsEl = document.getElementById('hero-stats');
  if (!statsEl) return;

  observeElement(
    statsEl,
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          animateSkillBars();
        }
      });
    },
    { threshold: 0.3 }
  );
}
