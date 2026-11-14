/* ==========================================================================
   gallery.js  ·  editorial collage builder + full-screen lightbox
   Exposes window.Wedding.gallery
   Images come from WEDDING_CONFIG.gallery — change paths there.
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;

  var photos = [];
  var current = 0;
  var lastFocus = null;
  var isOpen = false;
  var busy = false;

  var lb, img, idxEl, totalEl;

  /* ---------------------------------------------------------------- build */
  function build() {
    var host = document.getElementById('collage');
    var cfg = (window.WEDDING_CONFIG || {}).gallery || [];
    if (!host) { return; }
    photos = cfg.slice(0, 16);
    host.innerHTML = '';
    var frag = document.createDocumentFragment();

    photos.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'g-item g' + (i + 1);
      b.setAttribute('aria-label', 'Open photo ' + (i + 1) + ' of ' + photos.length);
      b.setAttribute('data-index', String(i));
      var par = document.createElement('span'); par.className = 'g-par';
      var im = new Image();
      im.src = p.src; im.alt = p.alt || '';
      im.decoding = 'async';
      if (i > 0) { im.loading = 'lazy'; }
      par.appendChild(im); b.appendChild(par);
      frag.appendChild(b);
    });
    host.appendChild(frag);

    host.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.g-item') : null;
      if (b) { open(parseInt(b.getAttribute('data-index'), 10), b); }
    });
  }

  /* ------------------------------------------------------------- lightbox */
  function show(i, dir, instant) {
    if (!photos.length) { return; }
    i = (i + photos.length) % photos.length;
    var src = photos[i].src, alt = photos[i].alt || '';
    current = i;
    idxEl.textContent = String(i + 1);

    var swap = function () {
      img.src = src; img.alt = alt;
      if (!hasGSAP || reduce || instant) { img.style.opacity = '1'; busy = false; return; }
      gsap.fromTo(img, { opacity: 0, x: dir * 60, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'power3.out', onComplete: function () { busy = false; } });
    };

    if (!hasGSAP || reduce || instant) { swap(); }
    else {
      busy = true;
      gsap.to(img, { opacity: 0, x: -dir * 50, duration: 0.25, ease: 'power2.in', onComplete: swap });
    }

    // warm the neighbours
    [1, -1].forEach(function (d) { var n = new Image(); n.src = photos[(i + d + photos.length) % photos.length].src; });
  }

  function open(i, trigger) {
    if (isOpen) { return; }
    isOpen = true;
    lastFocus = trigger || document.activeElement;
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    totalEl.textContent = String(photos.length);
    show(i, 0, true);
    if (hasGSAP && !reduce) {
      gsap.fromTo(lb.querySelector('.lb-backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.45 });
      gsap.fromTo(img, { opacity: 0, scale: 0.88, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from(lb.querySelectorAll('.lb-btn, .lb-count'), { opacity: 0, duration: 0.6, delay: 0.25, stagger: 0.05 });
    }
    lb.querySelector('.lb-close').focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) { return; }
    isOpen = false;
    var done = function () {
      lb.hidden = true;
      document.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); }
    };
    if (hasGSAP && !reduce) {
      gsap.to(img, { opacity: 0, scale: 0.92, duration: 0.3, ease: 'power2.in' });
      gsap.to(lb.querySelector('.lb-backdrop'), { opacity: 0, duration: 0.4, onComplete: done });
    } else { done(); }
  }

  function next() { if (!busy) { show(current + 1, 1); } }
  function prev() { if (!busy) { show(current - 1, -1); } }

  function bind() {
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-next').addEventListener('click', next);
    lb.querySelector('.lb-prev').addEventListener('click', prev);
    lb.querySelector('.lb-backdrop').addEventListener('click', close);
    lb.querySelector('.lb-stage').addEventListener('click', function (e) { if (e.target === this) { close(); } });

    document.addEventListener('keydown', function (e) {
      if (!isOpen) { return; }
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Tab') {   // keep focus inside the dialog
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* touch swipe */
    var sx = 0, sy = 0, st = 0, tracking = false;
    lb.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (!tracking) { return; }
      tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Date.now() - st > 700) { return; }
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) { next(); } else { prev(); } }
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) { close(); }
    }, { passive: true });
  }

  W.gallery = {
    init: function () {
      lb = document.getElementById('lightbox');
      if (!lb) { return; }
      img = lb.querySelector('.lb-img');
      idxEl = document.getElementById('lbIndex');
      totalEl = document.getElementById('lbTotal');
      build();
      bind();
    },
    open: open,
    close: close
  };
})();
