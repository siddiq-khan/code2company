/* ============================================================
   C2C — Code To Company | script.js
   ============================================================ */

/* ------------------------------------------------------------------
   1. NAV — scrolled style
   ------------------------------------------------------------------ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* Hamburger toggle */
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* Close menu when a nav link is clicked */
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ------------------------------------------------------------------
   2. HERO — scroll-driven C2C → Code To Company morph
      + city skyline parallax (3 layers at different speeds)
   ------------------------------------------------------------------ */
const heroBrand    = document.getElementById('heroBrand');
const heroTagline  = document.getElementById('heroTagline');
const heroSection  = document.getElementById('hero');

const cityFar  = document.getElementById('cityFar');
const cityMid  = document.getElementById('cityMid');
const cityNear = document.getElementById('cityNear');

// Split group references (left slides left, right slides right)
const farL  = cityFar.querySelector('.split-l');
const farR  = cityFar.querySelector('.split-r');
const midL  = cityMid.querySelector('.split-l');
const midR  = cityMid.querySelector('.split-r');
const nearL = cityNear.querySelector('.split-l');
const nearR = cityNear.querySelector('.split-r');

const START_SIZE = 22;   // vw — large C2C
const END_SIZE   = 7.5;  // vw — compact "Code To Company"

// Mobile-safe font size limits
const isMobile = () => window.innerWidth <= 680;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Build the C2C spans (initial state)
function renderC2C() {
  heroBrand.innerHTML =
    '<span class="hero-c">C</span>' +
    '<span class="hero-two">2</span>' +
    '<span class="hero-c">C</span>';
}

// Build "Code To Company" with black 'TO'
function renderCodeToCompany() {
  heroBrand.innerHTML =
    '<span class="hero-c">Code\u00A0</span>' +
    '<span class="hero-to">To</span>' +
    '<span class="hero-c">\u00A0Company</span>';
}

function updateHero() {
  const scrollY    = window.scrollY;
  const heroH      = heroSection.offsetHeight;
  const stickyH    = window.innerHeight;
  const scrollable = heroH - stickyH;
  const progress   = Math.min(Math.max(scrollY / scrollable, 0), 1);

  // Font size morph — use smaller vw range on mobile to prevent clipping
  const mobile = isMobile();
  const startFs = mobile ? 14 : START_SIZE;
  const endFs   = mobile ? 7  : END_SIZE;
  const fs = lerp(startFs, endFs, progress);
  heroBrand.style.fontSize = fs + 'vw';

  // Text content swap at 30%
  if (progress > 0.3) {
    if (!heroBrand.querySelector('.hero-to')) renderCodeToCompany();
    heroBrand.style.letterSpacing = lerp(0.5, 0.06, (progress - 0.3) / 0.7) + 'em';
    heroTagline.classList.add('visible');
  } else {
    if (!heroBrand.querySelector('.hero-two')) renderC2C();
    heroBrand.style.letterSpacing = '0.05em';
    heroTagline.classList.remove('visible');
  }

  // ── City split: left groups slide left, right groups slide right ──
  // Far: slowest  Mid: medium  Near: fastest
  const maxScroll = scrollable;
  const px = Math.min(scrollY, maxScroll);

  // Gentle vertical lift on whole SVGs (depth feel)
  cityFar.style.transform  = `translateY(${-(px * 0.03)}px)`;
  cityMid.style.transform  = `translateY(${-(px * 0.06)}px)`;
  cityNear.style.transform = `translateY(${-(px * 0.10)}px)`;

  // Horizontal curtain-part per layer
  farL.style.transform   = `translateX(${-(px * 0.10)}px)`;
  farR.style.transform   = `translateX(${  px * 0.10 }px)`;
  midL.style.transform   = `translateX(${-(px * 0.22)}px)`;
  midR.style.transform   = `translateX(${  px * 0.22 }px)`;
  nearL.style.transform  = `translateX(${-(px * 0.42)}px)`;
  nearR.style.transform  = `translateX(${  px * 0.42 }px)`;
}

// Initialise
renderC2C();
heroBrand.style.fontSize = (isMobile() ? 14 : START_SIZE) + 'vw';
window.addEventListener('scroll', updateHero, { passive: true });

/* ------------------------------------------------------------------
   3. INTERSECTION OBSERVER — scroll-reveal (.reveal elements)
   ------------------------------------------------------------------ */
const revealEls = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObs.observe(el));

/* ------------------------------------------------------------------
   4. ANIMATED COUNTERS — count up on scroll-in
   ------------------------------------------------------------------ */
const counters = document.querySelectorAll('.counter');

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1600;
      const step   = dur / target;
      let current  = 0;

      const timer = setInterval(() => {
        current++;
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, step);

      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.4 });

counters.forEach(c => counterObs.observe(c));

/* ------------------------------------------------------------------
   5. PROGRESS BARS — animate width on scroll-in
   ------------------------------------------------------------------ */
const bars = document.querySelectorAll('.dash-bar-fill');

const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width + '%';
      barObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

bars.forEach(b => barObs.observe(b));

/* ------------------------------------------------------------------
   6. 3D PROJECT SLIDER — with AUTO-SLIDE every 3.5 seconds
   ------------------------------------------------------------------ */
let projCurrent  = 0;
const projCards  = document.querySelectorAll('.proj-card');
const projTotal  = projCards.length;
const projDots   = document.getElementById('projDots');
const progressBar = document.getElementById('autoProgressBar');

const AUTO_INTERVAL = 4000; // ms between slides
let autoTimer       = null;
let progressAnim    = null;

/* Build dots */
for (let i = 0; i < projTotal; i++) {
  const d = document.createElement('div');
  d.className = 'sl-dot';
  d.addEventListener('click', () => {
    projGoTo(i);
    resetAutoSlide();
  });
  projDots.appendChild(d);
}

function projGetPos(i) {
  const diff = ((i - projCurrent) % projTotal + projTotal) % projTotal;
  if (diff === 0)              return 'active';
  if (diff === 1)              return 'next';
  if (diff === 2)              return 'next2';
  if (diff === projTotal - 1)  return 'prev';
  if (diff === projTotal - 2)  return 'prev2';
  return 'hidden';
}

function projUpdate() {
  projCards.forEach(card => {
    card.dataset.pos = projGetPos(parseInt(card.dataset.index, 10));
  });
  document.querySelectorAll('.sl-dot').forEach((d, i) => {
    d.classList.toggle('active', i === projCurrent);
  });
}

function projGoTo(idx) {
  projCurrent = ((idx % projTotal) + projTotal) % projTotal;
  projUpdate();
}

/* Auto-slide: restart progress bar animation + interval */
function startAutoSlide() {
  // Reset bar
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  // Force reflow so the transition-none takes effect before we animate
  void progressBar.offsetWidth;

  // Animate bar to 100% over AUTO_INTERVAL ms
  progressBar.style.transition = `width ${AUTO_INTERVAL}ms linear`;
  progressBar.style.width = '100%';

  // Advance slide after interval
  autoTimer = setTimeout(() => {
    projGoTo(projCurrent + 1);
    startAutoSlide();
  }, AUTO_INTERVAL);
}

function resetAutoSlide() {
  clearTimeout(autoTimer);
  startAutoSlide();
}

/* Side card click */
projCards.forEach(card => {
  card.addEventListener('click', () => {
    const idx = parseInt(card.dataset.index, 10);
    if (idx !== projCurrent) {
      projGoTo(idx);
      resetAutoSlide();
    }
  });
});

/* Arrow buttons */
document.getElementById('projPrev').addEventListener('click', () => {
  projGoTo(projCurrent - 1);
  resetAutoSlide();
});
document.getElementById('projNext').addEventListener('click', () => {
  projGoTo(projCurrent + 1);
  resetAutoSlide();
});

/* Keyboard arrows */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { projGoTo(projCurrent - 1); resetAutoSlide(); }
  if (e.key === 'ArrowRight') { projGoTo(projCurrent + 1); resetAutoSlide(); }
});

/* Touch / swipe */
let touchStartX = 0;
const sliderTrack = document.getElementById('projTrack');

sliderTrack.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

sliderTrack.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    dx < 0 ? projGoTo(projCurrent + 1) : projGoTo(projCurrent - 1);
    resetAutoSlide();
  }
});

/* Pause auto-slide when mouse is over slider, resume on leave */
document.querySelector('.slider-scene').addEventListener('mouseenter', () => {
  clearTimeout(autoTimer);
  progressBar.style.animationPlayState = 'paused';
  // Freeze the bar at its current visual width
  const currentWidth = parseFloat(progressBar.style.width) || 0;
  progressBar.style.transition = 'none';
  progressBar.style.width = currentWidth + '%';
});

document.querySelector('.slider-scene').addEventListener('mouseleave', () => {
  resetAutoSlide();
});

/* Init */
projUpdate();
startAutoSlide();

/* ------------------------------------------------------------------
   7. CONTACT FORM — EmailJS (sends directly to your inbox, no backend)
   ── Paste your IDs from emailjs.com into the 3 constants below ──
   ------------------------------------------------------------------ */
const EMAILJS_SERVICE_ID  = 'service_wohrdqf';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_7e76gzq';  // e.g. 'template_xyz789'
// Public key is already set in index.html <head>
 
const sendBtn       = document.getElementById('sendBtn');
const sendIcon      = document.getElementById('sendIcon');
const sendLabel     = document.getElementById('sendLabel');
const formSuccess   = document.getElementById('formSuccess');
const formError     = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');
 
function setLoading(on) {
  if (on) {
    sendBtn.classList.add('loading');
    sendIcon.className = 'fa fa-spinner';
    sendLabel.textContent = 'Sending…';
  } else {
    sendBtn.classList.remove('loading');
    sendIcon.className = 'fa fa-paper-plane';
    sendLabel.textContent = 'Send Message';
  }
}
 
sendBtn.addEventListener('click', () => {
  // Hide any previous feedback
  formSuccess.classList.remove('show');
  formError.classList.remove('show');
 
  const name  = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const req   = document.getElementById('cReq').value.trim();
 
  // Basic validation
  if (!name || !email) {
    sendBtn.style.transform = 'translateX(-6px)';
    setTimeout(() => { sendBtn.style.transform = ''; }, 150);
    formErrorText.textContent = 'Please fill in your name and email.';
    formError.classList.add('show');
    return;
  }
 
  // EmailJS template parameters — must match your template variable names
  const templateParams = {
    from_name  : name,
    from_email : email,
    phone      : phone || 'Not provided',
    message    : req   || 'No requirements specified',
  };
 
  setLoading(true);
 
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      setLoading(false);
      formSuccess.classList.add('show');
      // Clear the form
      document.getElementById('cName').value  = '';
      document.getElementById('cEmail').value = '';
      document.getElementById('cPhone').value = '';
      document.getElementById('cReq').value   = '';
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    })
    .catch((err) => {
      setLoading(false);
      console.error('EmailJS error:', err);
      formErrorText.textContent = 'Failed to send. Check your EmailJS keys or try again.';
      formError.classList.add('show');
      setTimeout(() => formError.classList.remove('show'), 6000);
    });
});