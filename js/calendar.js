/* ==========================================================================
   calendar.js  ·  Add to Calendar  (.ics generated in the browser + Google link)
   Exposes window.Wedding.calendar
   Date / time / venue / description all come from js/config.js
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /** 20271215T053000Z */
  function utcStamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  /** RFC 5545 text escaping */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  /** fold lines to 75 octets (spec) */
  function fold(line) {
    var out = [], enc = window.TextEncoder ? new TextEncoder() : null;
    if (!enc) { return line; }
    var cur = '', len = 0;
    for (var i = 0; i < line.length;) {
      var cp = line.codePointAt(i), ch = String.fromCodePoint(cp);
      var bytes = enc.encode(ch).length;
      if (len + bytes > (out.length ? 74 : 75)) { out.push(cur); cur = ''; len = 0; }
      cur += ch; len += bytes; i += ch.length;
    }
    out.push(cur);
    return out.join('\r\n ');
  }

  function isPlaceholder(s) { return !s || /^\s*\[.*\]\s*$/.test(s); }

  function details() {
    var cfg = window.WEDDING_CONFIG || {};
    var w = cfg.wedding || {}, v = cfg.venue || {};
    var start = W.getWeddingDate();
    var end = new Date(start.getTime() + (w.durationMinutes || 180) * 60000);

    var locParts = [];
    if (v.name) { locParts.push(v.name); }
    if (v.place) { locParts.push(v.place); }
    if (!isPlaceholder(v.address)) { locParts.push(v.address); }
    var location = locParts.join(', ');

    var desc = w.calendarDescription || 'Join us to celebrate the wedding.';
    if (v.mapsUrl) { desc += '\n\nLocation: ' + v.mapsUrl; }

    return {
      title: w.calendarTitle || 'Wedding Celebration',
      description: desc,
      location: location,
      start: start,
      end: end,
      url: v.mapsUrl || ''
    };
  }

  function buildICS() {
    var d = details();
    var uid = 'wedding-' + utcStamp(d.start) + '@juliana-pedro.invitation';
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Juliana and Pedro//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART:' + utcStamp(d.start),
      'DTEND:' + utcStamp(d.end),
      'SUMMARY:' + esc(d.title),
      'DESCRIPTION:' + esc(d.description),
      d.location ? 'LOCATION:' + esc(d.location) : null,
      d.url ? 'URL:' + d.url : null,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      // gentle reminders: one week and one day before
      'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(d.title + ' is in one week'), 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(d.title + ' is tomorrow'), 'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).map(fold);
    return lines.join('\r\n') + '\r\n';
  }

  function googleUrl() {
    var d = details();
    var p = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent(d.title),
      'dates=' + utcStamp(d.start) + '/' + utcStamp(d.end),
      'details=' + encodeURIComponent(d.description)
    ];
    if (d.location) { p.push('location=' + encodeURIComponent(d.location)); }
    return 'https://calendar.google.com/calendar/render?' + p.join('&');
  }

  function download() {
    var ics = buildICS();
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var name = 'Juliana-and-Pedro-Wedding.ics';
    if (window.navigator && navigator.msSaveOrOpenBlob) { navigator.msSaveOrOpenBlob(blob, name); return; }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
  }

  function init() {
    var btn = document.getElementById('addToCal');
    var menu = document.getElementById('calMenu');
    var ics = document.getElementById('calIcs');
    var g = document.getElementById('calGoogle');
    if (!btn || !menu) { return; }

    g.href = googleUrl();

    var isMenuOpen = false;
    function setMenu(open) {
      isMenuOpen = open;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(menu, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      }
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!isMenuOpen); if (isMenuOpen) { ics.focus({ preventScroll: true }); } });
    ics.addEventListener('click', function () { download(); setMenu(false); btn.focus({ preventScroll: true }); if (W.toast) { W.toast('Calendar file ready – open it to save the date'); } });
    g.addEventListener('click', function () { g.href = googleUrl(); setMenu(false); });
    document.addEventListener('click', function (e) { if (isMenuOpen && !menu.contains(e.target) && e.target !== btn) { setMenu(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isMenuOpen) { setMenu(false); btn.focus(); } });
  }

  W.calendar = { init: init, buildICS: buildICS, googleUrl: googleUrl };
})();
