/* ==========================================================================
   animations.js  ·  GSAP + ScrollTrigger choreography
   Exposes window.Wedding.anim
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});
  var A = (W.anim = {});

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var isSmall = function () { return window.innerWidth < 768; };

  A.reduce = reduce;
  A.hasGSAP = hasGSAP;
  if (hasGSAP) { gsap.registerPlugin(ScrollTrigger); }

  /* ------------------------------------------------------------------ text */
  function splitWords(el) {
    if (el.getAttribute('data-split-done')) { return; }
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'w';
      var n = document.createElement('span'); n.className = 'wi'; n.textContent = w;
      o.appendChild(n); el.appendChild(o);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
    });
    el.setAttribute('data-split-done', '1');
  }

  /** wraps handwritten names + splits headings (call after text has been bound) */
  A.prepareText = function () {
    $$('.hand').forEach(function (el) {
      if (el.querySelector('.hand-in')) { return; }
      var i = document.createElement('span'); i.className = 'hand-in';
      while (el.firstChild) { i.appendChild(el.firstChild); }
      el.appendChild(i);
    });
    $$('[data-split]').forEach(splitWords);
  };

  var HIDE_CLIP = 'inset(-20% 101% -30% -12%)';
  var SHOW_CLIP = 'inset(-20% -12% -30% -12%)';
  function handwrite(el, dur, vars) {
    return gsap.fromTo(el, { clipPath: HIDE_CLIP }, Object.assign({ clipPath: SHOW_CLIP, duration: dur, ease: 'power1.inOut', clearProps: 'clipPath' }, vars || {}));
  }

  /* --------------------------------------------------- reduced / no-GSAP end state */
  A.showFinalState = function () {
    $$('.link-path, .frame-line, .cal-ellipse').forEach(function (p) { p.style.strokeDashoffset = '0'; p.__drawn = true; });
    var prog = $('.tl-progress'); if (prog) { prog.style.transform = 'scaleY(1)'; }
    $$('.tl-dot').forEach(function (d) { d.classList.add('is-active'); });
    var nav = $('#nav'); if (nav) { nav.classList.add('is-ready'); }
  };

  /* ---------------------------------------------------------------- loader */
  A.loader = {
    start: function () {
      if (!hasGSAP || reduce) { return; }
      gsap.to('.loader .ring', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.3 });
      gsap.from('.loader-letters', { opacity: 0, scale: 0.92, duration: 1.4, ease: 'power3.out' });
      gsap.from('.loader-text', { opacity: 0, y: 10, duration: 1, delay: 0.4 });
      A._bar = gsap.to('.loader-bar span', { scaleX: 0.85, duration: 3.2, ease: 'power1.out' });
    },
    finish: function (onLiftStart) {
      var el = $('#loader');
      var hide = function () { if (el) { el.style.display = 'none'; } };
      if (!hasGSAP || reduce) {
        if (el) { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(hide, 450); }
        if (onLiftStart) { onLiftStart(); }
        return;
      }
      if (A._bar) { A._bar.kill(); }
      gsap.to('.loader-bar span', { scaleX: 1, duration: 0.4, ease: 'power2.out' });
      gsap.timeline({ delay: 0.45 })
        .to('.loader-inner', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' })
        .add(function () { if (onLiftStart) { onLiftStart(); } }, '-=0.1')
        .to(el, { yPercent: -100, duration: 1.2, ease: 'power4.inOut', onComplete: hide }, '<');
    }
  };

  /* ------------------------------------------------------------------ hero */
  A.heroIntro = function () {
    if (!hasGSAP || reduce) { return; }
    var corners = $$('.hero .deco');
    var dirs = [[-80, -80], [80, -80], [-80, 80], [80, 80]];
    var tl = gsap.timeline({ delay: 0.5 });
    A.heroTl = tl;

    tl.from('.hero-bg', { scale: 1.18, duration: 3.2, ease: 'power2.out' }, 0)
      .from('.hero-overlay', { opacity: 0, duration: 1.6, ease: 'none' }, 0)
      .from('.rays', { opacity: 0, duration: 2.4 }, 0.4)
      .from(corners, {
        opacity: 0,
        x: function (i) { return dirs[i % 4][0]; },
        y: function (i) { return dirs[i % 4][1]; },
        rotation: function (i) { return i % 2 ? 6 : -6; },
        duration: 2, ease: 'power3.out', stagger: 0.18
      }, 0.5)
      .from('.hero-eyebrow', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out' }, 1.2)
      .from('.hero-tag', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out' }, 1.55);

    var names = $$('.hero-names .hand-in');
    var t = 2.0;
    if (names[0]) { tl.add(handwrite(names[0], 1.9), t); }
    tl.from('.hero-names .amp', { opacity: 0, scale: 0.2, rotation: -40, duration: 0.9, ease: 'back.out(2.2)' }, t + 1.7);
    if (names[1]) { tl.add(handwrite(names[1], 1.9), t + 1.9); }

    tl.from('.hero-date .eyebrow', { opacity: 0, y: 14, duration: 0.9 }, t + 3.5)
      .from('.hero-date-main', { opacity: 0, y: 14, letterSpacing: '.6em', duration: 1.3, ease: 'power3.out' }, t + 3.7)
      .from('#openInvitation', { opacity: 0, y: 24, duration: 1, ease: 'power3.out' }, t + 4.3);
    tl.from('.fly', { opacity: 0, duration: 1.6 }, t + 3);
  };

  /* ----------------------------------------------- invitation envelope open */
  A.openEnvelope = function (onOpen, onDone) {
    var stage = $('#envelope');
    if (!stage) { if (onOpen) { onOpen(); } if (onDone) { onDone(); } return; }
    if (A.heroTl) { A.heroTl.progress(1); }
    stage.classList.add('is-active');

    var finish = function () {
      stage.classList.remove('is-active');
      stage.style.display = 'none';
      if (onDone) { onDone(); }
    };

    if (!hasGSAP || reduce) {
      stage.style.opacity = '1';
      setTimeout(function () {
        if (onOpen) { onOpen(); }
        stage.style.transition = 'opacity .5s';
        stage.style.opacity = '0';
        setTimeout(finish, 520);
      }, 700);
      return;
    }

    var env = $('.env', stage), flap = $('.env-flap', stage), seal = $('.env-seal', stage);
    var card = $('.env-card', stage), glow = $('.env-glow', stage);
    gsap.set(stage, { opacity: 0 });
    gsap.set(env, { y: 90, scale: 0.8, rotationX: 14, opacity: 0 });
    gsap.set(flap, { transformPerspective: 1100, rotationX: 0, zIndex: 3 });
    gsap.set(glow, { scale: 0.6, opacity: 0 });

    var tl = gsap.timeline({ onComplete: finish });
    tl.to(stage, { opacity: 1, duration: 0.5, ease: 'none' })
      .to(glow, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' }, 0)
      .to(env, { y: 0, scale: 1, rotationX: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.15)
      .to(seal, { scale: 1.14, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, '+=0.15')
      .to(seal, { scale: 0, rotation: 110, opacity: 0, duration: 0.5, ease: 'back.in(2)' }, '+=0.05')
      .to(flap, { rotationX: 180, duration: 1.05, ease: 'power2.inOut' }, '-=0.15')
      .set(flap, { zIndex: 0 }, '-=0.5')
      .to(card, { y: '-58%', duration: 1.1, ease: 'power2.out' }, '-=0.35')
      .set(card, { zIndex: 6 })
      .to(card, { y: '-30%', scale: 1.35, duration: 0.9, ease: 'power2.inOut' }, '+=0.15')
      .to(env, { y: 140, opacity: 0, duration: 0.9, ease: 'power2.in' }, '<')
      .add(function () { if (onOpen) { onOpen(); } }, '+=0.25')
      .to(glow, { scale: 2.2, duration: 1, ease: 'power2.in' }, '<')
      .to(stage, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '<0.1');
  };

  /* ------------------------------------------------------- decorative frames
     Each frame is an SVG rect whose viewBox is kept equal to its pixel size, so
     the gold line stays crisp and the "draw-on" dash animation traces the full
     rectangle at any width (kept in sync with ResizeObserver). */
  A.initFrames = function () {
    var svgs = $$('.frame-svg');
    if (!svgs.length) { return; }
    var layout = function () {
      svgs.forEach(function (svg) {
        var rect = svg.querySelector('.frame-line');
        var r = svg.getBoundingClientRect();
        if (!rect || !r.width || !r.height) { return; }
        var w = Math.round(r.width), h = Math.round(r.height);
        var len = 2 * ((w - 1.4) + (h - 1.4));
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.setAttribute('preserveAspectRatio', 'none');
        rect.setAttribute('x', '0.7'); rect.setAttribute('y', '0.7');
        rect.setAttribute('width', String(w - 1.4)); rect.setAttribute('height', String(h - 1.4));
        var prevLen = rect.__len || len;
        var cur = parseFloat(rect.style.strokeDashoffset);
        rect.style.strokeDasharray = len + ' ' + len;
        if (!hasGSAP || reduce || rect.__drawn) { rect.style.strokeDashoffset = '0'; }
        else if (isNaN(cur)) { rect.style.strokeDashoffset = String(len); }
        else { rect.style.strokeDashoffset = String(cur * (len / prevLen)); }
        rect.__len = len;
      });
    };
    layout();
    if ('ResizeObserver' in window) {
      var t = 0;
      var ro = new ResizeObserver(function () { cancelAnimationFrame(t); t = requestAnimationFrame(layout); });
      svgs.forEach(function (s) { ro.observe(s.parentNode); });
    } else { window.addEventListener('resize', layout); }
  };
  var markDrawn = function () { this.targets().forEach(function (t) { t.__drawn = true; }); };

  /* ------------------------------------------------------- scroll choreography */
  function onceAt(trigger, start, vars) {
    return Object.assign({ trigger: trigger, start: start || 'top 82%', once: true }, vars || {});
  }

  A.initScroll = function () {
    if (!hasGSAP) { A.showFinalState(); return; }
    if (reduce) { A.showFinalState(); return; }

    /* generic [data-reveal] */
    $$('[data-reveal]').forEach(function (el) {
      var type = el.getAttribute('data-reveal');
      var from = { opacity: 0 };
      if (type === 'up') { from.y = 46; }
      if (type === 'left') { from.x = -70; }
      if (type === 'right') { from.x = 70; }
      if (type === 'scale') { from.scale = 0.9; }
      gsap.from(el, Object.assign({ duration: 1.2, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: onceAt(el, 'top 88%') }, from));
    });

    /* split-word headings */
    $$('[data-split]').forEach(function (el) {
      gsap.from($$('.wi', el), { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.07, scrollTrigger: onceAt(el, 'top 86%') });
    });

    /* handwritten names outside the hero */
    $$('.hand').forEach(function (el) {
      if (el.closest('.hero')) { return; }
      var inner = $('.hand-in', el);
      if (!inner) { return; }
      gsap.set(inner, { clipPath: HIDE_CLIP });
      ScrollTrigger.create(onceAt(el, 'top 88%', { onEnter: function () { handwrite(inner, 1.9); } }));
    });

    /* floral arch : grows down the page, birds appear */
    var arch = $('.arch-img');
    if (arch) {
      gsap.fromTo(arch, { clipPath: 'inset(0 0 100% 0)', opacity: 0 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 2.6, ease: 'power2.inOut', clearProps: 'clipPath', scrollTrigger: onceAt('.arch-wrap', 'top 72%') });
      gsap.from('.bird', { opacity: 0, duration: 1.6, delay: 1.2, stagger: 0.3, scrollTrigger: onceAt('.arch-wrap', 'top 72%') });
    }

    /* couple introduction */
    var cg = $('.couple-grid');
    if (cg) {
      gsap.to('.link-path', { strokeDashoffset: 0, duration: 2.8, ease: 'power2.inOut', scrollTrigger: onceAt(cg, 'top 66%') });
      gsap.from('.portrait-bride', { x: -90, opacity: 0, duration: 1.5, ease: 'power3.out', scrollTrigger: onceAt(cg, 'top 78%') });
      gsap.from('.portrait-groom', { x: 90, opacity: 0, duration: 1.5, ease: 'power3.out', scrollTrigger: onceAt(cg, 'top 78%') });
      gsap.from('.couple-amp span', { scale: 0, rotation: -35, opacity: 0, duration: 1.3, ease: 'back.out(1.8)', scrollTrigger: onceAt(cg, 'top 66%') });
    }

    /* profiles */
    gsap.from('.profile-bride .profile-photo', { x: -130, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: onceAt('.profile-bride', 'top 62%') });
    gsap.from('.profile-groom .profile-photo', { x: 130, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: onceAt('.profile-groom', 'top 62%') });
    gsap.from('.medallion', { scale: 0, rotation: -90, opacity: 0, duration: 1.2, delay: 0.8, ease: 'back.out(1.6)', scrollTrigger: onceAt('.profile-groom', 'top 55%') });
    ['.profile-bride', '.profile-groom'].forEach(function (sel) {
      var sec = $(sel); if (!sec) { return; }
      gsap.from($$('.eyebrow, .profile-role, .profile-intro', sec), { opacity: 0, y: 28, duration: 1.1, ease: 'power3.out', stagger: 0.15, scrollTrigger: onceAt(sec, 'top 58%') });
      gsap.from($$('.fact', sec), { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: onceAt($('.facts', sec), 'top 86%') });
      gsap.from($$('.profile-extra > *', sec), { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, scrollTrigger: onceAt($('.profile-extra', sec), 'top 92%') });
    });

    /* love-story timeline */
    var tlEl = $('#timeline');
    if (tlEl) {
      gsap.to('.tl-progress', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 55%', end: 'bottom 60%', scrub: 0.6 } });
      $$('.tl-item', tlEl).forEach(function (item) {
        var side = item.getAttribute('data-side') === 'left' ? -1 : 1;
        var text = $('.tl-text', item), card = $('.tl-card', item), dot = $('.tl-dot', item);
        var wide = window.innerWidth > 820;
        gsap.from(text, { opacity: 0, x: wide ? side * -70 : 0, y: wide ? 0 : 40, duration: 1.3, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: onceAt(item, 'top 72%') });
        gsap.from(card, { opacity: 0, x: wide ? side * 80 : 0, y: wide ? 0 : 50, rotation: side * 5, duration: 1.5, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: onceAt(item, 'top 70%') });
        ScrollTrigger.create({ trigger: item, start: 'top 55%', onEnter: function () { dot.classList.add('is-active'); }, onLeaveBack: function () { dot.classList.remove('is-active'); } });
      });
    }

    /* gallery : staggered reveal */
    ScrollTrigger.batch('.g-item', {
      start: 'top 92%', once: true,
      onEnter: function (els) {
        gsap.fromTo(els, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', stagger: 0.12, clearProps: 'clipPath' });
        gsap.fromTo($$('.g-par img', els[0].parentNode).filter(function (i) { return els.indexOf(i.closest('.g-item')) > -1; }),
          { scale: 1.3 }, { scale: 1, duration: 1.9, ease: 'power3.out', stagger: 0.12, clearProps: 'transform' });
      }
    });
    gsap.set('.g-item', { clipPath: 'inset(100% 0% 0% 0%)' });

    /* save the date */
    var std = $('.std');
    if (std) {
      gsap.to('.std .frame-line', { strokeDashoffset: 0, duration: 3, ease: 'power2.inOut', onComplete: markDrawn, scrollTrigger: onceAt('.std-frame', 'top 78%') });
      gsap.from('.std-type > *', { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out', stagger: 0.14, scrollTrigger: onceAt('.std-top', 'top 74%') });
      gsap.from('.cal-page', { opacity: 0, y: 90, duration: 1.4, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: onceAt('.std-top', 'top 70%') });
      gsap.from('.cal-rings i', { scaleY: 0, transformOrigin: '50% 0', duration: 0.6, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: onceAt('.std-top', 'top 66%') });
      gsap.to('.cal-ellipse', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 1.4, scrollTrigger: onceAt('.std-top', 'top 62%') });
      gsap.from('.cd-unit', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.12, clearProps: 'transform,opacity', scrollTrigger: onceAt('#countdown', 'top 90%') });
      gsap.from('.cal-action', { opacity: 0, y: 24, duration: 1, scrollTrigger: onceAt('.cal-action', 'top 95%') });
    }

    /* wedding details */
    gsap.from('.detail-card', { opacity: 0, y: 70, duration: 1.1, ease: 'power3.out', stagger: 0.15, clearProps: 'transform,opacity', scrollTrigger: onceAt('.detail-cards', 'top 82%') });

    /* venue */
    var venue = $('.venue');
    if (venue) {
      gsap.to('.venue .frame-line', { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', onComplete: markDrawn, scrollTrigger: onceAt('.venue-frame', 'top 78%') });
      gsap.from('.vf-corner', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.1, delay: 0.4, scrollTrigger: onceAt('.venue-frame', 'top 78%') });
      gsap.from('.pin', { y: -90, opacity: 0, duration: 1.3, ease: 'bounce.out', scrollTrigger: onceAt('.venue-frame', 'top 74%') });
      gsap.from('.venue-frame > .eyebrow, .vn-1, .vn-2, .venue-address, #viewLocation', { opacity: 0, y: 34, duration: 1.1, ease: 'power3.out', stagger: 0.14, scrollTrigger: onceAt('.venue-frame', 'top 68%') });
    }

    /* closing */
    var closing = $('.closing');
    if (closing) {
      gsap.from('.closing-date, .closing-thanks, .closing .divider', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', stagger: 0.18, scrollTrigger: onceAt('.closing-inner', 'top 60%') });
      gsap.from('.heart', { scale: 0, duration: 1, ease: 'elastic.out(1, .5)', scrollTrigger: onceAt('.closing-inner', 'top 40%') });
      gsap.from('.share-row > *', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: onceAt('.share-row', 'top 94%') });
      gsap.from('.closing-flora', { opacity: 0, duration: 2, stagger: 0.2, scrollTrigger: onceAt(closing, 'top 70%') });
    }
    gsap.from('.footer > *', { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, scrollTrigger: onceAt('.footer', 'top 96%') });

    /* parallax — desktop / tablet only */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', function () {
      gsap.to('.hero-bg', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-content', { yPercent: -10, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.venue-bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.venue', start: 'top bottom', end: 'bottom top', scrub: true } });
      $$('.portrait-frame img, .photo-shape img').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('.g-item').forEach(function (item, i) {
        var par = $('.g-par', item);
        var amt = (i % 3 === 0 ? 7 : (i % 3 === 1 ? 5 : 6)) * (i % 2 ? -1 : 1);
        gsap.fromTo(par, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
      });
      gsap.to('.profile-bride .watermark', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.profile-bride', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.profile-groom .watermark', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.profile-groom', start: 'top bottom', end: 'bottom top', scrub: true } });
      $$('.profile-flora').forEach(function (f, i) {
        gsap.to(f, { y: i % 2 ? -40 : 40, ease: 'none', scrollTrigger: { trigger: f.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.to('.photo-flower', { y: -30, ease: 'none', scrollTrigger: { trigger: '.profile-bride', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  };

  /* ------------------------------------------------------- idle sway + flights */
  A.initSway = function () {
    if (!hasGSAP || reduce) { return; }
    // keep mirrored corners mirrored once GSAP owns the transform
    gsap.set('.deco-tr, .cf-tr, .std-flora-r', { scaleX: -1 });
    gsap.set('.deco-bl, .cf-bl', { scaleY: -1 });
    gsap.set('.deco-br, .cf-br', { scaleX: -1, scaleY: -1 });
    $$('.deco, .closing-flora, .std-flora, .photo-flower, .mm-flora').forEach(function (el) {
      gsap.to(el, { rotation: '+=' + rand(1.6, 3), duration: rand(4.5, 7), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand(0, 2) });
    });
    $$('.dc-flora').forEach(function (el) {
      gsap.to(el, { rotation: '+=6', duration: rand(5, 8), ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
  };

  A.initButterflies = function () {
    if (!hasGSAP || reduce) { return; }
    var sections = {};
    $$('[data-fly]').forEach(function (el, idx) {
      var host = el.parentElement;
      if (!host.__flies) { host.__flies = []; }
      host.__flies.push(el);
      if (isSmall() && host.__flies.length > 1) { el.style.display = 'none'; return; }
      var state = { x: 0, y: 0 };
      var place = function (first) {
        var w = host.clientWidth, h = host.clientHeight;
        var nx = rand(w * 0.04, w * 0.9), ny = rand(h * 0.06, h * 0.88);
        var dx = nx - state.x, dy = ny - state.y;
        var rot = clamp(Math.atan2(dx, -dy) * 180 / Math.PI, -50, 50);
        if (first) { gsap.set(el, { x: nx, y: ny, rotation: rot }); state.x = nx; state.y = ny; return; }
        var d = rand(6, 10);
        gsap.to(el, { x: nx, duration: d, ease: 'sine.inOut' });
        gsap.to(el, { y: ny, duration: d, ease: 'power1.inOut' });
        gsap.to(el, { rotation: rot, duration: d * 0.35, ease: 'sine.inOut', onComplete: function () { gsap.delayedCall(d * 0.65, function () { place(false); }); } });
        state.x = nx; state.y = ny;
      };
      state.x = rand(0, 200); state.y = rand(0, 200);
      place(true);
      gsap.delayedCall(rand(0.2, 2), function () { place(false); });
      el.__place = place;
      sections[idx] = host;
    });
    // pause flights when their section is off-screen
    if ('IntersectionObserver' in window) {
      var seen = [];
      $$('[data-fly]').forEach(function (el) { if (seen.indexOf(el.parentElement) < 0) { seen.push(el.parentElement); } });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          (en.target.__flies || []).forEach(function (f) {
            gsap.getTweensOf(f).forEach(function (t) { if (en.isIntersecting) { t.resume(); } else { t.pause(); } });
          });
        });
      }, { rootMargin: '100px' });
      seen.forEach(function (h) { io.observe(h); });
    }
  };

  /* ---------------------------------------------------------- magnetic buttons */
  A.initMagnetic = function () {
    if (!hasGSAP || reduce || !fine) { return; }
    $$('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  };

  /* ------------------------------------------------------ canvas particle fields */
  var petalImgs = [];
  var glow = null;
  function loadSprites() {
    if (petalImgs.length) { return; }
    for (var i = 1; i <= 4; i++) { var im = new Image(); im.src = 'assets/flowers/petal-' + i + '.svg'; petalImgs.push(im); }
    glow = document.createElement('canvas'); glow.width = glow.height = 64;
    var g = glow.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,236,190,1)'); grd.addColorStop(0.25, 'rgba(226,193,128,.75)');
    grd.addColorStop(0.55, 'rgba(196,164,107,.25)'); grd.addColorStop(1, 'rgba(196,164,107,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  }

  function Field(canvas, kind) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2);
    var w = 0, h = 0, items = [], raf = 0, running = false, visible = false, last = 0, time = 0;
    var withPetals = kind === 'petals' || kind === 'sparkles-light';
    var withSparks = kind !== 'petals';
    var nPetals = kind === 'petals' ? (isSmall() ? 14 : 30) : (kind === 'sparkles-light' ? (isSmall() ? 5 : 10) : 0);
    var nSparks = withSparks ? (isSmall() ? 22 : 54) : 0;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make() {
      items = [];
      var i;
      for (i = 0; i < nPetals; i++) {
        items.push({ t: 'p', img: petalImgs[i % petalImgs.length], x: rand(0, w), y: rand(-h * 0.2, h), s: rand(11, 24), vy: rand(16, 42), vx: rand(-8, 12), sw: rand(0.5, 1.4), sa: rand(12, 38), ph: rand(0, 6.28), rot: rand(0, 360), vr: rand(-45, 45), fl: rand(0, 6.28), vf: rand(1, 2.8), a: rand(0.55, 0.95) });
      }
      for (i = 0; i < nSparks; i++) {
        items.push({ t: 's', x: rand(0, w), y: rand(0, h), r: rand(1.6, 5.2), vy: -rand(5, 20), vx: rand(-5, 5), ph: rand(0, 6.28), tw: rand(0.8, 2.6), a: rand(0.35, 0.95) });
      }
    }
    function frame(now) {
      if (!running) { return; }
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        if (p.t === 'p') {
          p.y += p.vy * dt; p.x += (p.vx + Math.sin(time * p.sw + p.ph) * p.sa) * dt; p.rot += p.vr * dt; p.fl += p.vf * dt;
          if (p.y > h + 30) { p.y = -30; p.x = rand(0, w); }
          if (p.x > w + 40) { p.x = -30; } else if (p.x < -40) { p.x = w + 30; }
          if (p.img.complete && p.img.naturalWidth) {
            ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
            ctx.scale(Math.max(0.18, Math.abs(Math.cos(p.fl))), 1);
            ctx.drawImage(p.img, -p.s / 2, -p.s * 0.8, p.s, p.s * 1.6);
            ctx.restore();
          }
        } else {
          p.y += p.vy * dt; p.x += p.vx * dt;
          if (p.y < -12) { p.y = h + 12; p.x = rand(0, w); }
          var a = p.a * (0.45 + 0.55 * Math.sin(time * p.tw + p.ph));
          ctx.globalAlpha = Math.max(0, a);
          ctx.drawImage(glow, p.x - p.r * 3, p.y - p.r * 3, p.r * 6, p.r * 6);
        }
      }
      ctx.globalAlpha = 1;
    }
    function start() { if (running || !visible || document.hidden) { return; } running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    size(); make();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { start(); } else { stop(); } }, { rootMargin: '80px' }).observe(canvas);
    } else { visible = true; start(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { size(); make(); }, 200); });
  }

  A.initParticles = function () {
    if (reduce) { return; }
    loadSprites();
    $$('canvas[data-fx]').forEach(function (c) { Field(c, c.getAttribute('data-fx')); });
  };

  /* ---------------------------------------------------------------- refresh */
  A.refresh = function () { if (hasGSAP) { ScrollTrigger.refresh(); } };
})();
