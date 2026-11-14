/* ==========================================================================
   countdown.js  ·  live countdown with animated number transitions
   Exposes window.Wedding.countdown  and  window.Wedding.getWeddingDate()
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DAY = 86400000, HOUR = 3600000, MIN = 60000;

  /** Absolute moment of the ceremony, honouring the configured UTC offset. */
  W.getWeddingDate = function () {
    var c = (window.WEDDING_CONFIG || {}).wedding || {};
    var date = c.date || '2027-12-15';
    var time = /^\d{1,2}:\d{2}$/.test(c.time || '') ? c.time : '00:00';
    var parts = time.split(':');
    var hh = ('0' + parts[0]).slice(-2);
    var offset = /^[+-]\d{2}:\d{2}$/.test(c.utcOffset || '') ? c.utcOffset : 'Z';
    var d = new Date(date + 'T' + hh + ':' + parts[1] + ':00' + offset);
    return isNaN(d.getTime()) ? new Date('2027-12-15T11:00:00+05:30') : d;
  };

  function pad(n, len) { var s = String(n); while (s.length < len) { s = '0' + s; } return s; }

  var units = {};
  var timer = 0;
  var target = null;
  var started = false;

  function setValue(unit, text, animate) {
    var u = units[unit];
    if (!u) { return; }
    if (u.text === text) { return; }
    var old = u.el.querySelector('span');
    u.text = text;
    if (!animate || reduce || !window.gsap) { old.textContent = text; return; }
    var next = document.createElement('span');
    next.textContent = text;
    u.el.appendChild(next);
    gsap.fromTo(old, { yPercent: 0, opacity: 1 }, { yPercent: -100, opacity: 0, duration: 0.55, ease: 'power3.inOut', onComplete: function () { if (old.parentNode) { old.parentNode.removeChild(old); } } });
    gsap.fromTo(next, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.inOut' });
  }

  function tick(animate) {
    var diff = target.getTime() - Date.now();
    var done = diff <= 0;
    if (done) { diff = 0; }
    var d = Math.floor(diff / DAY);
    var h = Math.floor((diff % DAY) / HOUR);
    var m = Math.floor((diff % HOUR) / MIN);
    var s = Math.floor((diff % MIN) / 1000);
    setValue('days', pad(d, d > 999 ? 4 : 3), animate);
    setValue('hours', pad(h, 2), animate);
    setValue('minutes', pad(m, 2), animate);
    setValue('seconds', pad(s, 2), animate);
    var note = document.getElementById('cdDone');
    if (note) {
      if (done) { note.hidden = false; note.textContent = 'Today we celebrate!'; }
      else { note.hidden = true; }
    }
    return done;
  }

  function loop() {
    var done = tick(!document.hidden);
    if (done) { return; }
    // align to the next whole second so the display never drifts
    timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
  }

  W.countdown = {
    init: function () {
      var root = document.getElementById('countdown');
      if (!root || started) { return; }
      started = true;
      ['days', 'hours', 'minutes', 'seconds'].forEach(function (u) {
        var el = root.querySelector('[data-unit="' + u + '"] .cd-num');
        units[u] = { el: el, text: '' };
      });
      target = W.getWeddingDate();
      tick(false);
      loop();
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { tick(false); }
      });
    },
    /** call after the config date changes (not normally needed) */
    refresh: function () { target = W.getWeddingDate(); tick(false); }
  };
})();
