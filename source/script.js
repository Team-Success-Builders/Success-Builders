/* Team Success Builders – site behaviour (vanilla JS) */
(function () {
  'use strict';

  var WA_LINK = 'https://chat.whatsapp.com/JD8WUuZkmwMCDGZLpJdcLF?s=cl&p=i&mlu=4&ilr=4&iam=2';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* footer year */
  $('#year').textContent = new Date().getFullYear();

  /* mobile menu */
  var burger = $('#burger'), menu = $('#menu'), nav = $('#nav');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMenu(); });

  /* scroll: progress bar, nav state, parallax */
  var bar = $('#progress'), layers = $$('[data-speed]'), ticking = false;
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('solid', y > 40);
    if (!reduce) {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var host = el.parentElement, r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var offset = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.speed);
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* reveal on scroll + counters */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), n = 0;
    if (reduce) { el.textContent = target; return; }
    var step = Math.max(1, Math.round(target / 24));
    var t = setInterval(function () {
      n = Math.min(target, n + step);
      el.textContent = n;
      if (n >= target) clearInterval(t);
    }, 50);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        var c = $('[data-count]', en.target);
        if (c) countUp(c);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
  }

  /* feedback form -> WhatsApp group
     WhatsApp group invite links cannot be pre-filled with text, so the message is
     copied to the clipboard and the group is opened for the student to paste & send. */
  var form = $('#voiceForm'), done = $('#done'), preview = $('#preview'),
      err = $('#err'), waLink = $('#waLink');
  waLink.href = WA_LINK;

  function buildMessage(d) {
    var lines = [
      '📣 *Team Success Builders – ' + d.type + '*',
      ''
    ];
    lines.push('👤 Name: ' + (d.name || 'Anonymous'));
    if (d.level) lines.push('🎓 Class: ' + d.level);
    if (d.contact) lines.push('📞 Contact: ' + d.contact);
    lines.push('', '💬 Message:', d.message, '', '— Sent from the Team Success Builders website');
    return lines.join('\n');
  }

  function copyText(text) {
    var ok = false;
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { ok = false; }
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      ok = true;
    }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {
      name: $('#name').value.trim(),
      level: $('#level').value,
      type: $('#type').value,
      contact: $('#contact').value.trim(),
      message: $('#message').value.trim()
    };
    if (d.message.length < 5) {
      err.textContent = 'Please type your message (at least a few words).';
      $('#message').focus();
      return;
    }
    err.textContent = '';
    var msg = buildMessage(d);
    preview.value = msg;
    copyText(msg);
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    window.open(WA_LINK, '_blank', 'noopener');
  });

  $('#copyAgain').addEventListener('click', function () {
    var b = this; copyText(preview.value);
    b.textContent = 'Copied ✓';
    setTimeout(function () { b.textContent = 'Copy again'; }, 1800);
  });
  $('#newMsg').addEventListener('click', function () {
    form.reset(); form.hidden = false; done.hidden = true;
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
})();
