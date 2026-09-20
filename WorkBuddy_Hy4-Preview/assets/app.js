/* ==========================================================================
   爱让记忆变得更加珍贵 / AI has made RAM more expensive
   原生 JavaScript，无任何依赖
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     0 · 滚动进度 & 侧边导航 & 内存条填充
     ------------------------------------------------------------------ */
  var scrollFill = $('#scrollFill');
  var stickPct = $('#stickPct');
  var chips = $$('.stick .chip');
  var navLinks = $$('.sidenav a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var lastLit = -1;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(window.pageYOffset / max, 0, 1) : 0;

    if (scrollFill) scrollFill.style.width = (p * 100).toFixed(2) + '%';

    // 内存条：随进度点亮颗粒
    var lit = Math.round(p * chips.length);
    if (lit !== lastLit) {
      lastLit = lit;
      chips.forEach(function (c, i) {
        c.classList.toggle('lit', i < lit);
        c.classList.toggle('hot', i === chips.length - 1 && lit >= chips.length);
      });
      if (stickPct) stickPct.textContent = Math.round(p * 100) + '%';
    }

    // 侧边导航高亮
    var mid = window.pageYOffset + window.innerHeight * 0.4;
    var active = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].offsetTop <= mid) active = i;
    }
    navLinks.forEach(function (a, i) { a.classList.toggle('on', i === active); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------------------------------------------
     1 · 示意行情计数器（纯虚构，仅用于叙事）
     ------------------------------------------------------------------ */
  var PRICE_START = 1176.0;   // 示意：DDR5 16GB 套装现价
  var PRICE_OPEN = 1089.0;    // 示意：今日开盘
  var price = PRICE_START;
  var priceVal = $('#priceVal');
  var priceUp = $('#priceUp');
  var priceFill = $('#priceFill');

  function fmtPrice(v) {
    var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return '¥\u2009' + s;
  }
  function renderPrice() {
    var up = (price - PRICE_OPEN) / PRICE_OPEN * 100;
    if (priceVal) priceVal.textContent = fmtPrice(price);
    if (priceUp) priceUp.textContent = '▲ ' + up.toFixed(2) + '%';
    if (priceFill) priceFill.style.width = clamp(up * 5.5, 4, 100).toFixed(1) + '%';
  }
  renderPrice();
  setInterval(function () {
    price += Math.random() * 0.34 + 0.02;   // 每秒都在涨
    renderPrice();
  }, 1000);

  /* ------------------------------------------------------------------
     2 · 两种读法切换
     ------------------------------------------------------------------ */
  var modeSwitch = $('#modeSwitch');
  var sides = $$('.reader-side');
  var swapNodes = $$('[data-h][data-m]');
  var machine = false;

  function applyMode() {
    document.body.classList.toggle('machine', machine);
    if (modeSwitch) modeSwitch.setAttribute('aria-checked', machine ? 'true' : 'false');
    sides.forEach(function (s) {
      s.classList.toggle('is-on', (s.dataset.mode === 'machine') === machine);
    });
    swapNodes.forEach(function (n) {
      var next = machine ? n.dataset.m : n.dataset.h;
      if (next && n.textContent !== next) {
        n.style.opacity = '0';
        setTimeout(function () { n.textContent = next; n.style.opacity = ''; }, 180);
      }
    });
    // 卡片标签
    $$('.pun-card').forEach(function (c) {
      var t = $('.pun-tag', c);
      if (t) t.textContent = machine ? c.dataset.tagM : c.dataset.tagH;
    });
    // 标题轻微跳动
    $$('.title .ch').forEach(function (c, i) {
      setTimeout(function () {
        c.classList.add('pulse');
        setTimeout(function () { c.classList.remove('pulse'); }, 420);
      }, i * 60);
    });
  }
  if (modeSwitch) {
    modeSwitch.addEventListener('click', function () { machine = !machine; applyMode(); });
    applyMode();
  }

  /* ------------------------------------------------------------------
     3 · 入场动画
     ------------------------------------------------------------------ */
  var revealSel = [
    '.sec-no', '.sec-title', '.sec-sub', '.pun-card', '.chart', '.tl-item',
    '.bar', '.pawn-input', '.pawn-out', '.ex-scale', '.ex-ctrl', '.pull', '.disclaim'
  ].join(',');

  var revealEls = [];
  $$('.sec').forEach(function (sec) {
    $$(revealSel, sec).forEach(function (el, i) {
      el.classList.add('reveal');
      if (!REDUCED) el.style.transitionDelay = Math.min(i * 55, 400) + 'ms';
      revealEls.push(el);
    });
  });

  // 滚动驱动入场：不依赖 IntersectionObserver，保证任何环境下内容都会出现
  function checkReveal() {
    var h = window.innerHeight;
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var el = revealEls[i];
      var r = el.getBoundingClientRect();
      // 只要元素顶边进入了视口下缘（含已经滚过头的），就揭示，避免锚点跳转时漏掉
      if (r.top < h * 0.9) {
        el.classList.add('in');
        if (el.classList.contains('bar')) {
          var f = $('.bar-fill', el);
          if (f) f.style.width = (el.dataset.w || 10) + '%';
        }
        if (el.classList.contains('chart')) {
          var svg = $('.linechart', el);
          if (svg) svg.classList.add('in');
        }
        revealEls.splice(i, 1);
      }
    }
    var lb = $('#letterBox');
    if (lb && !letterStarted) {
      var lr = lb.getBoundingClientRect();
      if (lr.top < h * 0.85 && lr.bottom > 0) { letterStarted = true; typeLetter(); }
    }
  }
  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('resize', checkReveal);

  if (REDUCED) {
    revealEls.forEach(function (el) {
      el.classList.add('in');
      var f = $('.bar-fill', el); if (f) f.style.width = (el.dataset.w || 10) + '%';
      var svg = $('.linechart', el); if (svg) svg.classList.add('in');
    });
    revealEls.length = 0;
    showLetterAll();
  }
  checkReveal();

  /* ------------------------------------------------------------------
     4 · 记忆典当行
     ------------------------------------------------------------------ */
  var GB = 1024 * 1024 * 1024;
  var RATE = 73.5;          // 示意：元 / GB
  var AI_COST = 0.0006;     // 示意：元 / 秒（大模型思考成本）

  var memText = $('#memText');
  var byteCount = $('#byteCount');
  var charCount = $('#charCount');
  var evalBtn = $('#evalBtn');
  var saveBtn = $('#saveBtn');
  var out = {
    bytes: $('#oBytes'), cap: $('#oCap'), value: $('#oValue'),
    back: $('#oBack'), think: $('#oThink'), verdict: $('#oVerdict')
  };
  var lastReceipt = null;

  function fmtBytes(b) {
    if (b < 1024) return b + ' 字节';
    if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' KB';
    if (b < GB) return (b / 1024 / 1024).toFixed(3) + ' MB';
    return (b / GB).toFixed(6) + ' GB';
  }
  function fmtMoney(v) {
    if (v === 0) return '¥ 0.00';
    if (v < 0.01) return '¥ ' + v.toExponential(2);
    return '¥ ' + v.toFixed(2);
  }
  function fmtDuration(s) {
    if (s < 1) return (s * 1000).toFixed(0) + ' 毫秒';
    if (s < 60) return s.toFixed(2) + ' 秒';
    if (s < 3600) return (s / 60).toFixed(1) + ' 分钟';
    if (s < 86400) return (s / 3600).toFixed(1) + ' 小时';
    if (s < 31536000) return (s / 86400).toFixed(1) + ' 天';
    return (s / 31536000).toFixed(2) + ' 年';
  }

  function countBytes() {
    var t = memText ? memText.value : '';
    if (window.TextEncoder) return new TextEncoder().encode(t).length;
    return unescape(encodeURIComponent(t)).length;
  }

  function updateCount() {
    var t = memText ? memText.value : '';
    var b = countBytes();
    if (byteCount) byteCount.textContent = b.toLocaleString('en-US') + ' 字节';
    if (charCount) charCount.textContent = Array.from(t).length + ' 字';
  }

  function evaluate() {
    var t = (memText && memText.value.trim()) ? memText.value : '';
    var b = countBytes();
    if (!t) {
      out.bytes.textContent = out.cap.textContent = out.value.textContent =
        out.back.textContent = out.think.textContent = '—';
      out.verdict.textContent = '请先写下一段回忆。哪怕三个字。';
      if (saveBtn) saveBtn.disabled = true;
      return;
    }
    var gb = b / GB;
    var value = gb * RATE;
    var secs = value / AI_COST;

    out.bytes.textContent = b.toLocaleString('en-US') + ' 字节';
    out.cap.textContent = gb.toExponential(3) + ' GB';
    out.value.textContent = fmtMoney(value);
    out.back.textContent = fmtBytes(b) + '（刚好是它自己）';
    out.think.textContent = fmtDuration(secs);

    var v;
    if (value < 0.000001) {
      v = '它几乎不占地方，也几乎不值钱。可你写下它的时候，' +
          '犹豫的那几秒钟，AI 已经烧掉了比它贵一千倍的算力。';
    } else if (value < 0.01) {
      v = '按行情，这段回忆换不回一根内存条上的一颗颗粒。' +
          '它能换回的内存，恰好等于它自己占的地方——一个完美的循环论证：卖掉多少，就只能买回多少。';
    } else {
      v = '按行情，这段回忆值 ' + fmtMoney(value) + '，够让 AI 思考 ' + fmtDuration(secs) +
          '。它换回的内存，恰好还是它自己。你看，回忆这种东西，从来只按自己的体积定价。';
    }
    out.verdict.textContent = v;

    lastReceipt = {
      text: t, bytes: b, gb: gb, value: value, secs: secs,
      price: price, rate: RATE
    };
    if (saveBtn) saveBtn.disabled = false;
  }

  if (memText) {
    memText.addEventListener('input', updateCount);
    memText.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') evaluate();
    });
    updateCount();
  }
  if (evalBtn) evalBtn.addEventListener('click', evaluate);
  var fillDemo = $('#fillDemo');
  if (fillDemo) {
    fillDemo.addEventListener('click', function () {
      memText.value = '我记得你';
      updateCount(); evaluate();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (!lastReceipt) return;
      var r = lastReceipt;
      var content = [
        '==================== 当票 / PAWN TICKET ====================',
        '爱让记忆变得更加珍贵 · 记忆典当行',
        '',
        '【当品】',
        r.text,
        '',
        '【计量】',
        '重量：' + r.bytes.toLocaleString('en-US') + ' 字节',
        '容量：' + r.gb.toExponential(3) + ' GB',
        '行情：¥ ' + r.rate + ' / GB（示意）',
        '估值：' + fmtMoney(r.value),
        '可支撑 AI 思考：' + fmtDuration(r.secs),
        '',
        '【附注】',
        '它能换回的内存，恰好等于它自己占的地方。',
        '本当票所有数字均为虚构示意数据，不具现实意义。',
        '出具时刻的示意行情：' + fmtPrice(r.price),
        '============================================================'
      ].join('\r\n');

      var blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pawn-ticket-' + Date.now() + '.txt';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
  }

  /* ------------------------------------------------------------------
     5 · 交换仪式：天平 & 滑块
     ------------------------------------------------------------------ */
  var PER_MEM = 0.02;   // 示意：一段清晰回忆 ≈ 0.02 GB
  var TARGET = 16;      // 目标：16 GB
  var range = $('#memRange');
  var memOut = $('#memOut');
  var exCap = $('#exCap');
  var exPct = $('#exPct');
  var exVerdict = $('#exVerdict');
  var beamG = $('#beamG');

  function renderExchange() {
    var n = range ? parseInt(range.value, 10) : 40;
    var cap = n * PER_MEM;
    var pct = cap / TARGET * 100;

    if (memOut) memOut.textContent = n + ' 段';
    if (exCap) exCap.textContent = cap.toFixed(2) + ' GB';
    if (exPct) exPct.textContent = pct.toFixed(1) + '%';

    if (beamG) {
      var ang = clamp((1 - cap / TARGET) * 14, -16, 16);
      beamG.setAttribute('transform', 'rotate(' + ang.toFixed(2) + ' 210 48)');
    }

    if (exVerdict) {
      if (cap < TARGET) {
        var need = TARGET - cap;
        var more = Math.ceil(need / PER_MEM);
        exVerdict.innerHTML = '还差 <b>' + need.toFixed(2) + ' GB</b>。按每段回忆 ' + PER_MEM +
          ' GB 计，你还得再想起 <b>' + more + '</b> 件事。';
      } else {
        exVerdict.innerHTML = '够了。你交出 <b>' + n + '</b> 段回忆，换回 <b>' + TARGET +
          ' GB</b>。柜台后面的人说：成交。<br>可你把笔放下，说：我再想想。';
      }
    }
  }
  if (range) {
    range.addEventListener('input', renderExchange);
    renderExchange();
  }

  /* ------------------------------------------------------------------
     6 · 情书打字机
     ------------------------------------------------------------------ */
  var letterLines = $$('#letterBox [data-l]');
  var letterStarted = false;
  var typingTimer = null;

  function showLetterAll() {
    letterLines.forEach(function (p) { p.textContent = p.dataset.l; });
  }

  function typeLetter() {
    if (REDUCED) { showLetterAll(); return; }
    letterLines.forEach(function (p) { p.textContent = ''; });
    var li = 0, ci = 0;

    (function step() {
      if (li >= letterLines.length) return;
      var p = letterLines[li];
      var full = p.dataset.l || '';
      if (ci <= full.length) {
        p.innerHTML = '';
        p.appendChild(document.createTextNode(full.slice(0, ci)));
        var cur = document.createElement('i');
        cur.className = 'cursor';
        cur.textContent = '\u00a0';
        p.appendChild(cur);
      }
      ci++;
      if (ci > full.length) {
        p.textContent = full;
        li++; ci = 0;
        typingTimer = setTimeout(step, 420);
      } else {
        typingTimer = setTimeout(step, 46 + Math.random() * 46);
      }
    })();
  }

  var replay = $('#replayBtn');
  if (replay) {
    replay.addEventListener('click', function () {
      clearTimeout(typingTimer);
      letterStarted = true;
      typeLetter();
    });
  }

  /* ------------------------------------------------------------------
     7 · 键盘彩蛋：连按 ↑ 让价格再涨一点
     ------------------------------------------------------------------ */
  var seq = [];
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp') { seq.length = 0; return; }
    seq.push(1);
    if (seq.length === 3) {
      seq.length = 0;
      price += 8.88;
      renderPrice();
    }
  });
})();
