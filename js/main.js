/* ==========================================================================
   main.js  ·  boot, config binding, navigation, music, opening sequence
   Loaded last. Uses window.WEDDING_CONFIG and the Wedding.* modules.
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});
  var A = W.anim || {};
  var CFG = window.WEDDING_CONFIG || {};

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function safe(fn) { try { return fn(); } catch (e) { return undefined; } }
  function isPlaceholder(s) { return typeof s === 'string' && /^\s*\[.*\]\s*$/.test(s); }

  /* ------------------------------------------------------------------ toast */
  var toastTimer = 0;
  W.toast = function (msg) {
    var t = $('#toast'); if (!t) { return; }
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-show'); }, 3600);
  };

  /* ------------------------------------------------------------ date helpers */
  function dateParts() {
    var w = CFG.wedding || {};
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(w.date || '') || [0, 2027, 12, 15];
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    return { y: y, m: mo, d: d, dow: dt.getUTCDay() };
  }
  function timeLabel() {
    var w = CFG.wedding || {};
    if (w.timeLabel) { return w.timeLabel; }
    var m = /^(\d{1,2}):(\d{2})$/.exec(w.time || '');
    if (!m) { return '[Add Time]'; }
    var h = +m[1], min = m[2], ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (min === '00' ? '' : ':' + min) + ' ' + ap;
  }
  function computed(key) {
    var p = dateParts();
    switch (key) {
      case 'date.long': return p.d + ' ' + MONTHS[p.m - 1] + ' ' + p.y;
      case 'date.short': return ('0' + p.d).slice(-2) + '.' + ('0' + p.m).slice(-2) + '.' + p.y;
      case 'date.day': return String(p.d);
      case 'date.month': return MONTHS[p.m - 1];
      case 'date.monthUpper': return MONTHS[p.m - 1].toUpperCase();
      case 'date.year': return String(p.y);
      case 'date.weekday': return DAYS[p.dow];
      case 'date.time': return timeLabel();
    }
    return undefined;
  }

  /* ------------------------------------------------------------ config binding */
  function get(path) {
    if (path.charAt(0) === '@') { return computed(path.slice(1)); }
    if (path === 'couple.both') {
      var c = CFG.couple || {};
      return (c.bride || '') + ' & ' + (c.groom || '');
    }
    var cur = CFG, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) { return undefined; }
      cur = cur[parts[i]];
    }
    return cur;
  }

  function bindAll() {
    // story: an empty date on the wedding-day card falls back to the real wedding date
    var st = CFG.story || [];
    if (st[2] && !st[2].date) { st[2].date = computed('date.long'); }

    $$('[data-bind]').forEach(function (el) {
      var v = get(el.getAttribute('data-bind'));
      if (v == null || v === '') { return; }
      el.textContent = v;
      if (isPlaceholder(v)) { el.classList.add('placeholder'); } else { el.classList.remove('placeholder'); }
    });
    $$('[data-img]').forEach(function (el) {
      var v = get(el.getAttribute('data-img'));
      if (v) { el.src = v; }
    });
    $$('[data-bg]').forEach(function (el) {
      var v = get(el.getAttribute('data-bg'));
      if (v) { el.style.backgroundImage = 'url("' + v + '")'; }
    });
    var link = $('#viewLocation');
    var url = (CFG.venue || {}).mapsUrl;
    if (link && url) { link.href = url; }
  }

  var FACTS = [
    ['Full Name', 'fullName'], ['Date of Birth', 'dob'], ['Place', 'place'], ['Education', 'education'],
    ['Profession', 'profession'], ['Father', 'father'], ['Mother', 'mother'], ['Siblings', 'siblings']
  ];

  function buildProfiles() {
    ['bride', 'groom'].forEach(function (who) {
      var data = CFG[who] || {};
      var dl = $('[data-facts="' + who + '"]');
      if (dl) {
        dl.innerHTML = '';
        FACTS.forEach(function (f) {
          var val = data[f[1]];
          if (val == null || val === '') { return; }
          var row = document.createElement('div'); row.className = 'fact';
          var dt = document.createElement('dt'); dt.textContent = f[0];
          var dd = document.createElement('dd'); dd.textContent = val;
          if (isPlaceholder(val)) { dd.className = 'placeholder'; }
          row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
        });
      }
      var box = $('[data-extra="' + who + '"]');
      if (!box) { return; }
      var insta = $('[data-extra-instagram]', box);
      if (data.instagram && insta) {
        var h = String(data.instagram).trim();
        insta.href = /^https?:\/\//i.test(h) ? h : 'https://www.instagram.com/' + h.replace(/^@/, '').replace(/\/$/, '');
        insta.querySelector('span').textContent = /^https?:\/\//i.test(h) ? 'Instagram' : '@' + h.replace(/^@/, '');
        insta.hidden = false;
      }
      var fill = function (sel, text, quote) {
        var el = $(sel, box); if (!el || !text) { return; }
        var target = el.querySelector('span') || el;
        target.textContent = quote ? '“' + text.replace(/^["“]|["”]$/g, '') + '”' : text;
        el.hidden = false;
      };
      fill('[data-extra-interests]', data.interests);
      fill('[data-extra-quote]', data.quote, true);
      fill('[data-extra-message]', data.message);
    });
  }

  function buildCalendarGrid() {
    var grid = $('#calGrid'); if (!grid) { return; }
    var p = dateParts();
    var first = new Date(Date.UTC(p.y, p.m - 1, 1)).getUTCDay();
    var days = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
    var html = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<span class="dow">' + d + '</span>'; }).join('');
    for (var i = 0; i < first; i++) { html += '<span class="d"></span>'; }
    for (var d = 1; d <= days; d++) { html += '<span class="d' + (d === p.d ? ' is-day' : '') + '">' + d + '</span>'; }
    grid.innerHTML = html;
    var mark = $('.cal-ring-mark'), cell = $('.is-day', grid);
    if (mark && cell) { cell.appendChild(mark); }
  }

  /* -------------------------------------------------------------- navigation */
  var nav, toggle, menu, menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open && hasGSAP && !reduce) {
      gsap.fromTo('#mobileMenu nav a', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.25, clearProps: 'transform' });
    }
    // keep keyboard focus out of the hidden menu
    $$('a', menu).forEach(function (a) { a.tabIndex = open ? 0 : -1; });
  }

  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) { return; }
    var top = target.getBoundingClientRect().top + window.pageYOffset - (id === 'home' ? 0 : 56);
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }

  function initNav() {
    nav = $('#nav'); toggle = $('#navToggle'); menu = $('#mobileMenu');
    if (!nav) { return; }
    nav.inert = true;
    setMenu(false);

    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (menuOpen && window.innerWidth > 1100) { setMenu(false); } });

    $$('[data-nav-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) !== '#') { return; }
        e.preventDefault();
        var id = href.slice(1);
        if (menuOpen) { setMenu(false); setTimeout(function () { scrollToId(id); }, 350); }
        else { scrollToId(id); }
      });
    });

    var onScroll = function () { nav.classList.toggle('is-scrolled', window.pageYOffset > 60); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // active section
    var links = $$('[data-nav]');
    var setActive = function (id) {
      links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-nav') === id); });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { setActive(en.target.getAttribute('data-section')); } });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('[data-section]').forEach(function (s) { io.observe(s); });
    }
    setActive('home');

    var top = $('#toTop');
    if (top) { top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); }
  }

  /* ------------------------------------------------------------------- music */
  var Music = (function () {
    var KEY = 'jp-wedding-music';
    var audio, root, toggleBtn, muteBtn;
    var state = { on: true, muted: false, t: 0 };
    var targetVol = 0.45;
    var started = false, playing = false, autoPaused = false, errored = false;

    function load() { var s = safe(function () { return JSON.parse(localStorage.getItem(KEY) || 'null'); }); if (s) { state.on = s.on !== false; state.muted = !!s.muted; state.t = +s.t || 0; } }
    function save() { safe(function () { localStorage.setItem(KEY, JSON.stringify({ on: state.on, muted: state.muted, t: audio ? Math.floor(audio.currentTime || 0) : 0 })); }); }

    function ui() {
      root.classList.toggle('is-playing', playing);
      root.classList.toggle('has-started', started);
      toggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
      muteBtn.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
      muteBtn.setAttribute('aria-label', state.muted ? 'Unmute music' : 'Mute music');
    }
    function fade(to, dur, done) {
      if (hasGSAP && !reduce) { gsap.to(audio, { volume: to, duration: dur, ease: 'none', onComplete: done }); }
      else { audio.volume = to; if (done) { done(); } }
    }
    function play() {
      if (errored) { return; }
      audio.preload = 'auto';
      audio.muted = state.muted;
      if (state.t && !started) { var seek = function () { try { audio.currentTime = state.t % (audio.duration || 1e9); } catch (e) { } }; if (audio.readyState > 0) { seek(); } else { audio.addEventListener('loadedmetadata', seek, { once: true }); } }
      audio.volume = 0;
      var p = audio.play();
      var ok = function () { started = true; playing = true; state.on = true; fade(targetVol, 2.2); ui(); save(); };
      if (p && p.then) {
        p.then(ok).catch(function () { playing = false; ui(); W.toast('Tap the music button to play'); });
      } else { ok(); }
    }
    function pause() {
      playing = false; state.on = false; ui(); save();
      fade(0, 0.6, function () { audio.pause(); save(); });
    }

    return {
      init: function () {
        audio = $('#bgm'); root = $('#music'); toggleBtn = $('#musicToggle'); muteBtn = $('#musicMute');
        if (!audio || !root) { return; }
        var m = CFG.music || {};
        if (typeof m.volume === 'number') { targetVol = Math.max(0, Math.min(1, m.volume)); }
        audio.src = m.src || 'assets/music/wedding-music.mp3';
        load();
        ui();
        audio.addEventListener('error', function () { errored = true; playing = false; root.classList.add('is-error'); ui(); W.toast('Music file not found – check js/config.js'); });
        toggleBtn.addEventListener('click', function () { if (playing) { pause(); } else { play(); } });
        muteBtn.addEventListener('click', function () { state.muted = !state.muted; audio.muted = state.muted; ui(); save(); });
        audio.addEventListener('timeupdate', function () { if (Math.floor(audio.currentTime) % 5 === 0) { save(); } });
        window.addEventListener('pagehide', save);
        // be polite: silence when the tab is hidden, resume when it returns
        document.addEventListener('visibilitychange', function () {
          if (document.hidden && playing) { autoPaused = true; audio.pause(); }
          else if (!document.hidden && autoPaused) { autoPaused = false; if (playing) { audio.play().catch(function () { }); } }
        });
      },
      /** called from a real click (the Explore button): browsers allow audio now */
      startFromGesture: function () { if (state.on) { play(); } },
      reveal: function () { root.classList.add('is-ready'); }
    };
  })();

  /* --------------------------------------------------------- opening sequence */
  var opened = false;

  function waitForAssets() {
    var heroSrc = (CFG.images || {}).hero;
    var tasks = [];
    if (heroSrc) { tasks.push(new Promise(function (res) { var i = new Image(); i.onload = i.onerror = function () { res(); }; i.src = heroSrc; })); }
    if (document.fonts && document.fonts.ready) { tasks.push(document.fonts.ready); }
    var all = Promise.all(tasks);
    var cap = new Promise(function (res) { setTimeout(res, 6000); });
    var min = new Promise(function (res) { setTimeout(res, reduce ? 300 : 2600); });
    return Promise.all([Promise.race([all, cap]), min]);
  }

  function unlock() {
    document.body.classList.remove('is-locked');
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    var inv = document.getElementById('invitation');
    if (inv) { window.scrollTo(0, inv.getBoundingClientRect().top + window.pageYOffset - (window.innerWidth > 1100 ? 0 : 0)); }
    html.style.scrollBehavior = prev;
    if (nav) { nav.inert = false; nav.classList.add('is-ready'); nav.classList.add('is-scrolled'); }
    A.initSway && A.initSway();
    A.initScroll && A.initScroll();
    A.refresh && A.refresh();
    Music.reveal();
  }

  function openInvitation() {
    var btn = $('#openInvitation');
    if (opened) { scrollToId('invitation'); return; }
    opened = true;
    if (btn) { btn.setAttribute('aria-disabled', 'true'); }
    Music.startFromGesture();       // user interaction → audio is allowed
    if (A.openEnvelope) { A.openEnvelope(unlock, function () { var inv = $('#invitation h2'); if (inv) { inv.setAttribute('tabindex', '-1'); } }); }
    else { unlock(); }
  }

  /* -------------------------------------------------------------------- boot */
  function boot() {
    bindAll();
    buildProfiles();
    buildCalendarGrid();
    A.prepareText && A.prepareText();
    A.initFrames && A.initFrames();

    W.gallery && W.gallery.init();
    W.countdown && W.countdown.init();
    W.calendar && W.calendar.init();
    W.share && W.share.init();
    initNav();
    Music.init();

    A.initParticles && A.initParticles();
    A.initButterflies && A.initButterflies();
    A.initMagnetic && A.initMagnetic();
    if (A.reduce || !A.hasGSAP) { A.showFinalState && A.showFinalState(); }

    var btn = $('#openInvitation');
    if (btn) { btn.addEventListener('click', openInvitation); }

    A.loader && A.loader.start();
    waitForAssets().then(function () {
      A.loader.finish(function () { A.heroIntro && A.heroIntro(); });
    });

    // safety net: if anything above throws before the loader hides, never trap the visitor
    setTimeout(function () { var l = $('#loader'); if (l && l.style.display !== 'none' && l.getBoundingClientRect().top > -10 && !hasGSAP) { l.style.display = 'none'; } }, 9000);
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
