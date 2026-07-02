document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initParticles();
  initTyped();
  renderHeroStats();
  renderInstructor();
  renderCourses();
  renderWhyUs();
  renderTestimonials();
  renderFAQ();
  renderFooter();
  initModals();
  initAOS();
  initScrollAnimations();
});

// ── HEADER ───────────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  });
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) { nav.classList.remove('open'); hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }
  });
  nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { nav.classList.remove('open'); hamburger.classList.remove('open'); }));
}
function updateActiveNav() {
  const sections = ['home','instructor','courses','testimonials','contact'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}

// ── PARTICLES ────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 80; i++) {
    particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4, a: Math.random() });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.a * 0.6})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(212,175,55,${(1 - d / 120) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── TYPED ────────────────────────────────────────────────────
function initTyped() {
  new Typed('#typed-title', {
    strings: ['یادگیری هوش مصنوعی^500 با مهران فقیه', 'از صفر تا متخصص^500 در هوش مصنوعی', 'آینده‌ات را^500 با AI بساز'],
    typeSpeed: 60, backSpeed: 30, loop: true, backDelay: 2000
  });
}

// ── HERO STATS ───────────────────────────────────────────────
function renderHeroStats() {
  const el = document.getElementById('hero-stats');
  el.innerHTML = CONFIG.instructor.stats.map(s => `
    <div class="stat-item">
      <span class="stat-value" data-target="${s.value}" data-display="${s.display}">۰</span>
      <span class="stat-label">${s.label}</span>
    </div>`).join('');
}

// ── COUNTER ──────────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        animateSkillBars();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const statsEl = document.getElementById('hero-stats');
  if (statsEl) observer.observe(statsEl);
}
function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const display = el.dataset.display;
    const num = parseInt(el.dataset.target);
    if (isNaN(num)) { el.textContent = display; return; }
    let start = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { el.textContent = display; clearInterval(timer); return; }
      el.textContent = start.toLocaleString('fa-IR');
    }, 25);
  });
}
function animateSkillBars() {
  document.querySelectorAll('.skill-fill[data-width]').forEach(el => {
    el.style.width = el.dataset.width + '%';
  });
}

// ── INSTRUCTOR ───────────────────────────────────────────────
function renderInstructor() {
  const { name, title, bio, photo, skills, social } = CONFIG.instructor;
  const el = document.getElementById('instructor-content');
  const skillsHTML = skills.map(s => `
    <div class="skill-item">
      <div class="skill-header"><span>${s.name}</span><span>${s.percent}٪</span></div>
      <div class="skill-bar"><div class="skill-fill" data-width="${s.percent}"></div></div>
    </div>`).join('');
  const socialMap = { instagram: 'fa-instagram', telegram: 'fa-telegram', linkedin: 'fa-linkedin', whatsapp: 'fa-whatsapp' };
  const socialHTML = Object.entries(social).map(([k, v]) =>
    `<a href="${v}" class="social-btn" aria-label="${k}" target="_blank" rel="noopener"><i class="fab ${socialMap[k]}"></i></a>`).join('');
  el.innerHTML = `
    <div class="instructor-photo-wrap" data-aos="fade-left">
      <div class="instructor-photo-placeholder">
        <i class="fas fa-user-tie"></i>
        <span>تصویر مدرس</span>
      </div>
    </div>
    <div class="instructor-info" data-aos="fade-right">
      <h3 class="instructor-name">${name}</h3>
      <p class="instructor-title">${title}</p>
      <p class="instructor-bio">${bio}</p>
      <div class="skills-list">${skillsHTML}</div>
      <div class="instructor-social">${socialHTML}</div>
    </div>`;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateSkillBars(); io.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(el);
}

// ── COURSES ──────────────────────────────────────────────────
function renderCourses() {
  const grid = document.getElementById('courses-grid');
  grid.innerHTML = CONFIG.courses.map(c => {
    const statusLabel = { open: 'در حال ثبت‌نام', full: 'تکمیل ظرفیت', soon: 'به‌زودی' }[c.status];
    const statusClass = { open: 'status-open', full: 'status-full', soon: 'status-soon' }[c.status];
    const canRegister = c.status === 'open';
    return `
      <article class="course-card" data-aos="fade-up" data-id="${c.id}">
        <div class="course-poster">
          <div class="course-poster-placeholder"><i class="fas fa-brain"></i></div>
          <span class="course-badge" style="background:${c.badgeColor}">${c.badge}</span>
          <span class="course-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="course-body">
          <h3 class="course-title">${c.title}</h3>
          <p class="course-desc">${c.description}</p>
          <div class="course-meta">
            <span class="course-meta-item"><i class="fas fa-clock"></i>${c.duration}</span>
            <span class="course-meta-item"><i class="fas fa-video"></i>${c.sessions}</span>
            <span class="course-meta-item"><i class="fas fa-signal"></i>${c.level}</span>
          </div>
          <div class="course-pricing">
            <span class="price-original">${fmtPrice(c.originalPrice)}</span>
            <span class="price-discount">${fmtPrice(c.discountPrice)}</span>
            <span class="price-unit">تومان</span>
          </div>
          <div class="course-actions">
            <button class="btn-ghost btn-sm btn-detail" onclick="openPanel('${c.id}')" aria-label="جزئیات ${c.title}"><i class="fas fa-info-circle"></i> جزئیات</button>
            ${canRegister
              ? `<button class="btn-primary btn-sm btn-enroll" onclick="openModal('${c.id}')" aria-label="ثبت‌نام در ${c.title}"><i class="fas fa-user-plus"></i> ثبت‌نام</button>`
              : `<button class="btn-outline btn-sm btn-enroll" disabled style="opacity:0.5;cursor:not-allowed"><i class="fas fa-lock"></i> ${statusLabel}</button>`}
          </div>
        </div>
      </article>`;
  }).join('');
}
function fmtPrice(n) { return n.toLocaleString('fa-IR'); }

// ── PANEL ────────────────────────────────────────────────────
function openPanel(courseId) {
  const c = CONFIG.courses.find(x => x.id === courseId);
  if (!c) return;
  const content = document.getElementById('panel-content');
  const syllabusHTML = c.syllabus.length
    ? c.syllabus.map(s => `
      <div class="accordion-item">
        <button class="accordion-btn" onclick="toggleAccordion(this)" aria-expanded="false">
          <span>جلسه ${s.session}: ${s.title}</span><i class="fas fa-chevron-down"></i>
        </button>
        <div class="accordion-body">
          <ul class="accordion-topics">${s.topics.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>`).join('')
    : '<p style="color:var(--text-secondary);font-size:.9rem;padding:8px 0">سرفصل‌ها به زودی اضافه می‌شود.</p>';
  const featuresHTML = c.features.map(f => `<div class="feature-item"><i class="fas fa-check-circle"></i><span>${f}</span></div>`).join('');
  content.innerHTML = `
    <h2 class="panel-course-title">${c.title}</h2>
    <p class="panel-course-desc">${c.description}</p>
    <p class="panel-section-title"><i class="fas fa-list-check"></i> آنچه یاد می‌گیرید</p>
    <div class="features-list">${featuresHTML}</div>
    <p class="panel-section-title"><i class="fas fa-book-open"></i> سرفصل‌های دوره</p>
    ${syllabusHTML}`;
  const btn = document.getElementById('panel-register-btn');
  btn.onclick = () => { closePanel(); openModal(courseId); };
  btn.disabled = c.status !== 'open';
  if (c.status !== 'open') btn.innerHTML = `<i class="fas fa-lock"></i> ثبت‌نام امکان‌پذیر نیست`;
  document.getElementById('panel-overlay').classList.add('active');
  document.getElementById('course-panel').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePanel() {
  document.getElementById('panel-overlay').classList.remove('active');
  document.getElementById('course-panel').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('panel-close').addEventListener('click', closePanel);
document.getElementById('panel-overlay').addEventListener('click', closePanel);

// ── ACCORDION ────────────────────────────────────────────────
function toggleAccordion(btn) {
  const body = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
}

// ── WHY US ───────────────────────────────────────────────────
function renderWhyUs() {
  const items = [
    { icon: 'fa-certificate', title: 'گواهینامه معتبر', desc: 'گواهینامه رسمی با امضای مدرس پس از اتمام دوره' },
    { icon: 'fa-headset', title: 'پشتیبانی ۲۴/۷', desc: 'پشتیبانی آنلاین در تلگرام و واتساپ' },
    { icon: 'fa-infinity', title: 'دسترسی مادام‌العمر', desc: 'یکبار بخر، برای همیشه دسترسی داشته باش' },
    { icon: 'fa-laptop-code', title: 'پروژه عملی', desc: 'پروژه‌های واقعی برای تقویت رزومه' },
    { icon: 'fa-users', title: 'جامعه دانشجویان', desc: 'گروه اختصاصی دانشجویان برای تبادل تجربه' },
    { icon: 'fa-arrows-rotate', title: 'آپدیت رایگان', desc: 'محتوای دوره همواره به‌روز می‌شود' }
  ];
  document.getElementById('why-grid').innerHTML = items.map((item, i) => `
    <div class="why-card" data-aos="fade-up" data-aos-delay="${i * 80}">
      <div class="why-icon"><i class="fas ${item.icon}"></i></div>
      <h4 class="why-title">${item.title}</h4>
      <p class="why-desc">${item.desc}</p>
    </div>`).join('');
}

// ── TESTIMONIALS ─────────────────────────────────────────────
let slideIndex = 0, slideTimer;
function renderTestimonials() {
  const track = document.getElementById('testimonial-track');
  const dots = document.getElementById('testimonial-dots');
  track.innerHTML = CONFIG.testimonials.map(t => `
    <div class="testimonial-slide">
      <div class="testimonial-card">
        <div class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(t.rating)}</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar-placeholder"><i class="fas fa-user"></i></div>
          <div><div class="testimonial-name">${t.name}</div><div class="testimonial-course">${t.course}</div></div>
        </div>
      </div>
    </div>`).join('');
  dots.innerHTML = CONFIG.testimonials.map((_, i) =>
    `<button class="dot ${i === 0 ? 'active' : ''}" onclick="goSlide(${i})" aria-label="اسلاید ${i + 1}"></button>`).join('');
  startSlider();
}
function goSlide(i) {
  slideIndex = i;
  document.getElementById('testimonial-track').style.transform = `translateX(${i * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('active', j === i));
  clearInterval(slideTimer);
  startSlider();
}
function startSlider() {
  slideTimer = setInterval(() => {
    slideIndex = (slideIndex + 1) % CONFIG.testimonials.length;
    goSlide(slideIndex);
  }, 5000);
}

// ── FAQ ──────────────────────────────────────────────────────
function renderFAQ() {
  document.getElementById('faq-list').innerHTML = CONFIG.faq.map(f => `
    <div class="faq-item" data-aos="fade-up">
      <button class="faq-question" onclick="toggleFAQ(this)" aria-expanded="false">
        <span>${f.q}</span><i class="fas fa-plus"></i>
      </button>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>`).join('');
}
function toggleFAQ(btn) {
  const answer = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0';
}

// ── FOOTER ───────────────────────────────────────────────────
function renderFooter() {
  const { instructor, contact } = CONFIG;
  document.getElementById('footer-bio').textContent = instructor.bio;
  const socialMap = { instagram: 'fa-instagram', telegram: 'fa-telegram', linkedin: 'fa-linkedin', whatsapp: 'fa-whatsapp' };
  document.getElementById('footer-social').innerHTML = Object.entries(instructor.social).map(([k, v]) =>
    `<a href="${v}" class="social-btn" aria-label="${k}" target="_blank" rel="noopener"><i class="fab ${socialMap[k]}"></i></a>`).join('');
  document.getElementById('footer-contact').innerHTML = `
    <h4 class="footer-heading">ارتباط با ما</h4>
    <div class="contact-item"><i class="fas fa-phone"></i><a href="tel:${contact.phone}">${contact.phone}</a></div>
    <div class="contact-item"><i class="fab fa-telegram"></i><a href="${contact.telegram}" target="_blank" rel="noopener">تلگرام</a></div>
    <div class="contact-item"><i class="fas fa-envelope"></i><a href="mailto:${contact.email}">${contact.email}</a></div>`;
}

// ── MODAL ────────────────────────────────────────────────────
let selectedCourse = null;
let uploadedImageFile = null;
let receiptURL = '';

function initModals() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  buildStep1();
  buildStep2();
  buildStep3();
}
function openModal(courseId) {
  selectedCourse = courseId ? CONFIG.courses.find(c => c.id === courseId) : null;
  goToStep(1);
  if (selectedCourse) {
    const sel = document.getElementById('reg-course');
    if (sel) sel.value = selectedCourse.title;
  }
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
  uploadedImageFile = null;
  receiptURL = '';
  resetForm();
}
function goToStep(n) {
  document.querySelectorAll('.modal-body').forEach((b, i) => b.classList.toggle('active', i + 1 === n));
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done', i + 1 < n);
  });
}
function buildStep1() {
  const { cardNumber, accountNumber, sheba, bankName, ownerName } = CONFIG.payment;
  document.getElementById('modal-step-1').innerHTML = `
    <h2 class="modal-title">اطلاعات پرداخت</h2>
    <p class="modal-subtitle">مبلغ دوره را به حساب زیر واریز کنید</p>
    <div class="payment-info-box">
      <div class="payment-row">
        <span class="payment-label">شماره کارت</span>
        <span class="payment-value" id="card-number-val">${cardNumber}</span>
        <button class="copy-btn" onclick="copyText('${cardNumber}','شماره کارت کپی شد')" aria-label="کپی شماره کارت"><i class="fas fa-copy"></i> کپی</button>
      </div>
      <div class="payment-row">
        <span class="payment-label">شماره حساب</span>
        <span class="payment-value">${accountNumber}</span>
      </div>
      <div class="payment-row">
        <span class="payment-label">شبا</span>
        <span class="payment-value" style="font-size:.82rem">${sheba}</span>
      </div>
      <div class="payment-row">
        <span class="payment-label">بانک</span>
        <span class="payment-value">${bankName}</span>
      </div>
      <div class="payment-row">
        <span class="payment-label">صاحب حساب</span>
        <span class="payment-value">${ownerName}</span>
      </div>
    </div>
    <div class="alert-box"><i class="fas fa-exclamation-triangle"></i><span>لطفاً مبلغ دوره را واریز کرده و رسید را عکس بگیرید</span></div>
    <button class="btn-primary btn-full" onclick="goToStep(2)"><i class="fas fa-arrow-left"></i> رسید را آپلود کردم، ادامه</button>`;
}
function buildStep2() {
  const courseOptions = CONFIG.courses.filter(c => c.status === 'open').map(c =>
    `<option value="${c.title}">${c.title} — ${fmtPrice(c.discountPrice)} تومان</option>`).join('');
  document.getElementById('modal-step-2').innerHTML = `
    <h2 class="modal-title">اطلاعات ثبت‌نام</h2>
    <p class="modal-subtitle">لطفاً اطلاعات خود را وارد کنید</p>
    <form id="reg-form" onsubmit="submitRegistration(event)" novalidate>
      <div class="form-group">
        <label class="form-label" for="reg-name">نام و نام خانوادگی <span>*</span></label>
        <input id="reg-name" class="form-input" type="text" placeholder="مثال: علی رضایی" required aria-required="true"/>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-phone">شماره موبایل <span>*</span></label>
        <input id="reg-phone" class="form-input" type="tel" placeholder="09XXXXXXXXX" pattern="09[0-9]{9}" required aria-required="true"/>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-course">دوره انتخابی <span>*</span></label>
        <select id="reg-course" class="form-select" required aria-required="true">
          <option value="">انتخاب کنید...</option>${courseOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">تصویر رسید پرداخت <span>*</span></label>
        <div class="upload-area" id="upload-area" onclick="document.getElementById('receipt-input').click()" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" role="button" aria-label="آپلود تصویر رسید" tabindex="0">
          <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
          <p class="upload-text">کلیک کنید یا فایل را اینجا رها کنید<br><small>فقط تصویر، حداکثر ۵ مگابایت</small></p>
        </div>
        <input type="file" id="receipt-input" accept="image/*" style="display:none" onchange="handleFileSelect(this.files[0])"/>
        <div class="upload-preview" id="upload-preview" style="display:none"></div>
        <div class="progress-wrap" id="progress-wrap">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
      <button type="submit" id="submit-btn" class="btn-primary btn-full"><i class="fas fa-paper-plane"></i> ارسال و تکمیل ثبت‌نام</button>
    </form>`;
  if (selectedCourse) {
    setTimeout(() => {
      const sel = document.getElementById('reg-course');
      if (sel) sel.value = selectedCourse.title;
    }, 50);
  }
  document.getElementById('upload-area').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('receipt-input').click(); });
}
function buildStep3() {
  document.getElementById('modal-step-3').innerHTML = `
    <div class="success-wrap">
      <svg class="success-svg" viewBox="0 0 52 52">
        <circle class="success-circle" cx="26" cy="26" r="25" fill="none" stroke="#22c55e" stroke-width="2"/>
        <path class="success-check" d="M14 27l8 8 16-16" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 class="success-title">ثبت‌نام موفق!</h3>
      <p class="success-msg">ثبت‌نام شما دریافت شد. حداکثر ۲۴ ساعت دیگر دسترسی شما فعال می‌شود.</p>
      <div class="success-summary" id="success-summary"></div>
      <a href="${CONFIG.contact.telegram}" target="_blank" rel="noopener" class="btn-primary btn-full">
        <i class="fab fa-telegram"></i> ارتباط با پشتیبانی تلگرام
      </a>
    </div>`;
}
function resetForm() {
  const form = document.getElementById('reg-form');
  if (form) form.reset();
  const preview = document.getElementById('upload-preview');
  if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
  const pw = document.getElementById('progress-wrap');
  if (pw) pw.style.display = 'none';
}

function handleDragOver(e) { e.preventDefault(); document.getElementById('upload-area').classList.add('dragover'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
}
function handleFileSelect(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('لطفاً فقط فایل تصویر انتخاب کنید', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('حجم فایل نباید بیشتر از ۵ مگابایت باشد', 'error'); return; }
  uploadedImageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = `<img src="${e.target.result}" alt="پیش‌نمایش رسید پرداخت"/>`;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function submitRegistration(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const course = document.getElementById('reg-course').value;
  if (!name || !phone || !course) { showToast('لطفاً تمام فیلدها را پر کنید', 'error'); return; }
  if (!/^09[0-9]{9}$/.test(phone)) { showToast('شماره موبایل معتبر نیست', 'error'); return; }
  if (!uploadedImageFile) { showToast('لطفاً تصویر رسید را آپلود کنید', 'error'); return; }
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
  try {
    receiptURL = await uploadToCloudinary(uploadedImageFile);
    await postToGoogleSheets({ name, phone, course, receiptURL, timestamp: new Date().toISOString() });
    document.getElementById('success-summary').innerHTML = `
      <div class="summary-row"><span class="summary-label">نام</span><span class="summary-value">${name}</span></div>
      <div class="summary-row"><span class="summary-label">موبایل</span><span class="summary-value">${phone}</span></div>
      <div class="summary-row"><span class="summary-label">دوره</span><span class="summary-value">${course}</span></div>`;
    goToStep(3);
  } catch (err) {
    showToast('خطا در ارسال اطلاعات. لطفاً دوباره تلاش کنید.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال و تکمیل ثبت‌نام';
  }
}

async function uploadToCloudinary(file) {
  const { cloudinaryCloudName, cloudinaryUploadPreset } = CONFIG;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryUploadPreset);
  const pw = document.getElementById('progress-wrap');
  const pf = document.getElementById('progress-fill');
  pw.style.display = 'block';
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) pf.style.width = (e.loaded / e.total * 100) + '%'; };
    xhr.onload = () => {
      if (xhr.status === 200) { const data = JSON.parse(xhr.responseText); resolve(data.secure_url); }
      else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Upload error'));
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`);
    xhr.send(formData);
  });
}

async function postToGoogleSheets(data) {
  const res = await fetch(CONFIG.googleScriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json();
  if (json.result !== 'success') throw new Error('Sheet error');
}

// ── COPY ─────────────────────────────────────────────────────
function copyText(text, msg) {
  navigator.clipboard.writeText(text).then(() => showToast(msg || 'کپی شد', 'success')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast(msg || 'کپی شد', 'success');
  });
}

// ── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── AOS ──────────────────────────────────────────────────────
function initAOS() {
  AOS.init({ duration: 700, once: true, offset: 80 });
}