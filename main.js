/* ============================================================
   SMILE DENTAL CARE — main.js
   ============================================================ */

/* ── EmailJS Setup ──────────────────────────────────────────────
   HOW TO CONFIGURE:
   1. Create a FREE account at https://www.emailjs.com
   2. Add Email Service → Gmail → Connect drjakaria1993@gmail.com
      Note the Service ID (e.g. "service_abc123")
   3. Create Email Template with these variables:
        {{patient_name}}, {{age}}, {{gender}}, {{phone}},
        {{email}}, {{treatment}}, {{date}}, {{time}}, {{notes}}
      Set "To" field to: drjakaria1993@gmail.com
      Note the Template ID (e.g. "template_xyz456")
   4. Account → General → Public Key (e.g. "abc_XYZ789")
   5. Replace the three constants below:
   ─────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← Replace
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← Replace
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← Replace
const CLINIC_WHATSAPP     = '918822363706';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Init EmailJS ── */
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  /* ── Navbar scroll behaviour ── */
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    // Scroll-to-top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Hamburger → Cross + Dropdown menu ── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when link clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── Hero Slider ── */
  const slides     = document.querySelectorAll('.hero-slide');
  const dotsWrap   = document.getElementById('slideDots');
  const counterEl  = document.getElementById('slideCounter');
  let   current    = 0;
  let   autoTimer;

  if (slides.length && dotsWrap) {
    // Build dot indicators
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function updateCounter() {
      if (counterEl) {
        counterEl.innerHTML =
          `<span class="current">${String(current + 1).padStart(2,'0')}</span> / ${String(slides.length).padStart(2,'0')}`;
      }
    }

    function goToSlide(n) {
      slides[current].classList.remove('active');
      dotsWrap.children[current].classList.remove('active');
      current = n;
      slides[current].classList.add('active');
      dotsWrap.children[current].classList.add('active');
      updateCounter();
      resetTimer();
    }

    function nextSlide() { goToSlide((current + 1) % slides.length); }
    function resetTimer() {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 5500);
    }

    updateCounter();
    resetTimer();
  }

  /* ── Clinic open/closed status ── */
  function updateStatus() {
    const now  = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const isOpen = (mins >= 600 && mins < 840) || (mins >= 960 && mins < 1200);
    const badge  = document.getElementById('statusBadge');
    const text   = document.getElementById('statusText');
    if (badge && text) {
      badge.className = 'status-badge ' + (isOpen ? 'open' : 'closed');
      text.textContent = isOpen ? 'Open Now' : 'Currently Closed';
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ── Min date for appointment form ── */
  const dateInput = document.getElementById('f_date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ── Form submission ── */
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }

  async function handleSubmit() {
    const name  = document.getElementById('f_name')?.value.trim() || '';
    const age   = document.getElementById('f_age')?.value.trim()  || '';
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const phone = document.getElementById('f_phone')?.value.trim() || '';
    const email = document.getElementById('f_email')?.value.trim() || '';
    const treat = document.getElementById('f_treatment')?.value   || '';
    const date  = document.getElementById('f_date')?.value        || '';
    const time  = document.getElementById('f_time')?.value        || '';
    const notes = document.getElementById('f_notes')?.value.trim() || '';

    /* Validation */
    if (!name || !age || !genderEl || !phone || !treat || !date || !time) {
      shake(submitBtn);
      alert('Please fill in all required fields (marked with *).');
      return;
    }

    const gender = genderEl.value;

    /* Loading state */
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="spinner"></div> Sending...`;

    /* ── 1. Email via EmailJS ── */
    let emailOk = false;
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          patient_name: name,
          age,
          gender,
          phone,
          email: email || 'Not provided',
          treatment: treat,
          date,
          time,
          notes: notes || 'None',
        });
        emailOk = true;
      } catch (err) {
        console.warn('EmailJS error:', err);
      }
    }

    /* ── 2. WhatsApp message ── */
    const waMessage =
      `🦷 *New Appointment Request*\n` +
      `*Smile Dental Care — Dr. S Al Jakaria*\n\n` +
      `👤 *Patient:* ${name}\n` +
      `🎂 *Age:* ${age}  |  ⚧ *Gender:* ${gender}\n` +
      `📞 *Phone:* ${phone}\n` +
      (email ? `✉️ *Email:* ${email}\n` : '') +
      `💉 *Treatment:* ${treat}\n` +
      `📅 *Date:* ${date}  |  🕐 *Time:* ${time}\n` +
      (notes ? `📝 *Notes:* ${notes}` : '');

    setTimeout(() => {
      window.open(`https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(waMessage)}`, '_blank');
    }, 300);

    /* ── Reset button ── */
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      Send Appointment Request`;

    /* ── Show success ── */
    const successEl = document.getElementById('formSuccess');
    const errorEl   = document.getElementById('formError');
    if (successEl) { successEl.style.display = 'block'; }
    if (errorEl)   { errorEl.style.display = 'none'; }
    successEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    /* ── Reset form fields ── */
    setTimeout(() => {
      ['f_name','f_age','f_phone','f_email','f_treatment','f_date','f_time','f_notes']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      if (genderEl) genderEl.checked = false;
    }, 800);
  }

  /* ── Shake animation for validation ── */
  function shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  /* ── Scroll to top ── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});