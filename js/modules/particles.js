/**
 * ============================================================
 * Particles Module — افکت ذرات
 * ============================================================
 * افکت ذرات متصل‌شونده در پس‌زمینه هیرو
 */

import { CONFIG } from '../config.js';
import { debounce } from '../utils/dom.js';

const CONNECTION_DISTANCE = 120;
const PARTICLE_SPEED_RANGE = 0.4;

/**
 * راه‌اندازی canvas ذرات
 */
export function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = CONFIG.ui?.particlesCount ?? 80;
  const particles = createParticles(count, canvas);
  let animationId = null;
  let isVisible = true;

  /**
   * تنظیم سایز canvas
   */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * ایجاد ذرات اولیه
   */
  function createParticles(n, c) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * PARTICLE_SPEED_RANGE,
      dy: (Math.random() - 0.5) * PARTICLE_SPEED_RANGE,
      alpha: Math.random(),
    }));
  }

  /**
   * رسم یک ذره
   */
  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,175,55,${p.alpha * 0.6})`;
    ctx.fill();
  }

  /**
   * رسم خطوط اتصال بین ذرات نزدیک
   */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p = particles[i];
        const q = particles[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);

        if (distance < CONNECTION_DISTANCE) {
          const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(212,175,55,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /**
   * به‌روزرسانی موقعیت ذرات
   */
  function updateParticles() {
    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
  }

  /**
   * حلقه اصلی انیمیشن
   */
  function animate() {
    if (!isVisible) {
      animationId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(drawParticle);
    drawConnections();
    updateParticles();

    animationId = requestAnimationFrame(animate);
  }

  /**
   * توقف موقت انیمیشن هنگام عدم نمایش (بهینه‌سازی عملکرد)
   */
  function handleVisibility() {
    isVisible = !document.hidden;
    if (isVisible && !animationId) {
      animate();
    }
  }

  // تنظیم اولیه
  resize();
  window.addEventListener('resize', debounce(resize, 200));
  document.addEventListener('visibilitychange', handleVisibility);

  // شروع انیمیشن
  animate();
}
