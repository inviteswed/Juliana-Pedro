/* ==========================================================================
   rsvp.js  ·  Share Invitation  (Web Share API → copy-link fallback, WhatsApp)
   File name is kept from the requested structure. There is intentionally no
   RSVP form: the brief asks only for sharing. No download features exist.
   Exposes window.Wedding.share
   ========================================================================== */
(function () {
  'use strict';

  var W = (window.Wedding = window.Wedding || {});

  function cfg() { return (window.WEDDING_CONFIG || {}).share || {}; }
  function pageUrl() {
    var c = cfg();
    if (c.url) { return c.url; }
    return location.href.split('#')[0];
  }
  function message() { return cfg().message || ''; }

  function whatsappUrl() {
    var text = message() + ' ' + pageUrl();
    return 'https://wa.me/?text=' + encodeURIComponent(text.trim());
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy failed')); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function copyLink() {
    var text = message() + '\n' + pageUrl();
    return copy(text).then(function () { W.toast && W.toast('Invitation link copied'); })
      .catch(function () { W.toast && W.toast('Copy this link: ' + pageUrl()); });
  }

  function share() {
    var data = { title: cfg().title || document.title, text: message(), url: pageUrl() };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      return navigator.share(data).catch(function (err) {
        if (err && err.name === 'AbortError') { return; }   // user closed the sheet
        return copyLink();
      });
    }
    return copyLink();
  }

  function init() {
    var s = document.getElementById('shareBtn');
    var c = document.getElementById('copyBtn');
    var w = document.getElementById('whatsappBtn');
    if (s) { s.addEventListener('click', share); }
    if (c) { c.addEventListener('click', copyLink); }
    if (w) {
      w.href = whatsappUrl();
      w.addEventListener('click', function () { w.href = whatsappUrl(); });
    }
  }

  W.share = { init: init, share: share, copyLink: copyLink };
})();
