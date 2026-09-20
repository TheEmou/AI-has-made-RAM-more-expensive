/* =========================================================
   爱让记忆变得更加珍贵 / AI has made RAM more expensive
   原生 JS · 无外部依赖
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var fmt = function (n, d) {
    var v = (typeof d === 'number') ? n.toFixed(d) : String(Math.round(n));
    var parts = v.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  /* ---------------------------------------------------------
     01. 行情跑马灯
     --------------------------------------------------------- */
  var TICKS = [
    ['32GB DDR5 内存套条', '¥800 → ¥3,400', '一年之内'],
    ['1TB 固态硬盘', '¥400 → ¥1,000+', '零售参考'],
    ['2026 Q1 一般型 DRAM 合约价', '环比 +93%~98%', 'TrendForce'],
    ['2026 Q2 合约价', '环比 +58%~63%', '涨势未歇'],
    ['服务器级 DDR5 RDIMM 现货', '$27~37 / GB', '12TB 内存池 ≈ 50 万美元'],
    ['HBM 占 DRAM 晶圆产能', '2% → 25%', '2020 → 2026'],
    ['AI 服务器单机内存搭载量', '8~10 倍', '对比传统服务器'],
    ['AI 相关 DRAM 需求占比', '突破 53%', '2026 年预测'],
    ['人脑等效容量', '约 2.5 PB', '出厂即封顶'],
    ['一份记忆的可复制份数', '1', '无备件'],
    ['终端传导', '手机中端机型普涨 300~1000 元', '2026 年'],
    ['供需明显缓和', '约 2028 年', '多家机构预计']
  ];

  var track = document.getElementById('tickerTrack');
  if (track) {
    var seg = TICKS.map(function (t) {
      return '<span class="tick">' + t[0] + ' <b>' + t[1] + '</b> <i>' + t[2] + '</i></span>';
    }).join('');
    track.innerHTML = seg + seg;           // 复制一份用于无缝循环
  }

  /* ---------------------------------------------------------
     02. Hero 记忆场（canvas）
     --------------------------------------------------------- */
  (function memoryField() {
    var cvs = document.getElementById('memoryField');
    if (!cvs || !cvs.getContext) return;
    var ctx = cvs.getContext('2d');
    var GAP = 30, R = 130;
    var W = 0, H = 0, cells = [], raf = null;
    var t0 = performance.now();
    var mouse = { x: -9999, y: -9999, on: false };
    var visible = true;

    function build() {
      var rect = cvs.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      if (!W || !H) return;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var cols = Math.ceil(W / GAP), rows = Math.ceil(H / GAP);
      var total = cols * rows;
      var memCount = Math.max(16, Math.round(total * 0.024));
      var picked = {};
      var guard = 0;
      while (Object.keys(picked).length < memCount && guard < total * 4) {
        picked[Math.floor(Math.random() * total)] = 1;
        guard++;
      }
      cells = [];
      for (var i = 0; i < total; i++) {
        cells.push({
          x: (i % cols) * GAP + GAP / 2 + 12,
          y: Math.floor(i / cols) * GAP + GAP / 2 + 12,
          mem: !!picked[i],
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.9
        });
      }
    }

    function paint(t) {
      ctx.clearRect(0, 0, W, H);
      var base = 5;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var a = 0.055, col = '26,23,18', s = base;
        if (c.mem) {
          var p = (Math.sin(t * c.speed + c.phase) + 1) / 2;
          a = 0.14 + p * 0.6;
          col = '169,120,31';
          s = base + p * 2.4;
        }
        if (mouse.on) {
          var dx = c.x - mouse.x, dy = c.y - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) {
            var k = 1 - d / R;
            a = Math.min(1, a + k * 0.55);
            if (k > 0.34) col = '207,47,30';
            s = Math.max(s, base + k * 3.4);
          }
        }
        ctx.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(c.x, c.y, s / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      if (!visible) { raf = null; return; }
      paint((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }

    function start() { if (!raf && !reduceMotion) raf = requestAnimationFrame(loop); }

    build();
    if (reduceMotion) {
      paint(0);
    } else {
      start();
      window.addEventListener('resize', function () {
        build();
      });
      var hero = document.querySelector('.hero');
      if (hero) {
        hero.addEventListener('mousemove', function (e) {
          var r = cvs.getBoundingClientRect();
          mouse.x = e.clientX - r.left;
          mouse.y = e.clientY - r.top;
          mouse.on = true;
        });
        hero.addEventListener('mouseleave', function () { mouse.on = false; });
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible) start();
        }, { threshold: 0 }).observe(cvs);
      }
    }
  })();

  /* ---------------------------------------------------------
     03. 滚动进度 + 导航高亮
     --------------------------------------------------------- */
  (function scrollUI() {
    var bar = document.getElementById('progressBar');
    var links = Array.prototype.slice.call(document.querySelectorAll('.topnav a'));
    var sections = links.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    });

    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';

      var y = window.scrollY + window.innerHeight * 0.32;
      var idx = -1;
      sections.forEach(function (s, i) {
        if (s && s.offsetTop <= y) idx = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle('is-current', i === idx);
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  })();

  /* ---------------------------------------------------------
     04. 进场动画
     --------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     05. 数字滚动
     --------------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = pre + fmt(target, dec) + suf;
      return;
    }
    var dur = 1200, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(target * e, dec) + suf;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = pre + fmt(target, dec) + suf;
    })(t0);
  }

  (function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, countUp);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     06. CH02 · 行情柱状图
     --------------------------------------------------------- */
  (function ramChart() {
    var host = document.getElementById('ramChart');
    if (!host) return;

    var SERIES = [
      { q: '2025 Q1', v: 620 },
      { q: '2025 Q2', v: 700 },
      { q: '2025 Q3', v: 800 },
      { q: '2025 Q4', v: 1150 },
      { q: '2026 Q1', v: 2050 },
      { q: '2026 Q2', v: 3050 },
      { q: '2026 Q3', v: 3400 }
    ];
    var max = SERIES[SERIES.length - 1].v;

    host.innerHTML = SERIES.map(function (d, i) {
      return '<div class="bar-col' + (i >= 4 ? ' is-hot' : '') + '">' +
               '<span class="bar-val">¥' + fmt(d.v) + '</span>' +
               '<div class="bar-track">' +
                 '<div class="bar" data-h="' + (d.v / max * 100).toFixed(2) + '"></div>' +
               '</div>' +
               '<span class="bar-x">' + d.q + '</span>' +
             '</div>';
    }).join('');

    var first = SERIES[2].v, last = SERIES[SERIES.length - 1].v;
    var multEl = document.getElementById('ramMultiple');
    if (multEl) multEl.textContent = '+' + Math.round((last - first) / first * 100) + '%';

    function grow() {
      var bars = host.querySelectorAll('.bar');
      Array.prototype.forEach.call(bars, function (b, i) {
        setTimeout(function () { b.style.height = b.getAttribute('data-h') + '%'; },
          reduceMotion ? 0 : i * 90);
      });
      host.classList.add('in');
    }

    if (!('IntersectionObserver' in window)) { grow(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { grow(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(host);
  })();

  /* ---------------------------------------------------------
     07. CH02 · 产能占比条
     --------------------------------------------------------- */
  (function capacity() {
    var tracks = document.querySelectorAll('.cap-track');
    if (!tracks.length) return;
    function fill() {
      Array.prototype.forEach.call(tracks, function (t, i) {
        setTimeout(function () { t.classList.add('in'); }, reduceMotion ? 0 : i * 180);
      });
    }
    if (!('IntersectionObserver' in window)) { fill(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fill(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(tracks[0]);
  })();

  /* ---------------------------------------------------------
     08. CH01 · 同一个词，两个世界
     --------------------------------------------------------- */
  (function wordSwitch() {
    var btn = document.getElementById('wordSwitch');
    if (!btn) return;
    var panels = document.querySelectorAll('.panel');
    var labels = document.querySelectorAll('[data-switch-label]');
    var note = document.getElementById('switchNote');
    var NOTES = [
      '同一个词的两端：一边不可扩容、不可复制、不可报价；一边可以插满 128GB，但断电就忘。',
      '而这一端正在涨价。同一个词，两种命运：能被报价的那一端在变贵，不能被报价的那一端在变珍贵。'
    ];
    var on = false;

    function render() {
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      Array.prototype.forEach.call(panels, function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === (on ? '1' : '0'));
      });
      Array.prototype.forEach.call(labels, function (l) {
        l.classList.toggle('is-on', l.getAttribute('data-switch-label') === (on ? '1' : '0'));
      });
      if (note) note.textContent = NOTES[on ? 1 : 0];
    }

    btn.addEventListener('click', function () { on = !on; render(); });
    render();
  })();

  /* ---------------------------------------------------------
     09. CH03 · 记忆估值器
     --------------------------------------------------------- */
  (function calculator() {
    var range = document.getElementById('ageRange');
    if (!range) return;

    var GB_PER_HOUR = 2.03;     // 1080p / 4.5Mbps
    var YUAN_PER_GB = 106;      // 32GB 套条 ¥3,400 折算
    var HOURS_PER_DAY = 16;

    var outAge = document.getElementById('ageOut');
    var outHours = document.getElementById('calcHours');
    var outGb = document.getElementById('calcGb');
    var outSticks = document.getElementById('calcSticks');
    var outCost = document.getElementById('calcCost');
    var verdict = document.getElementById('calcVerdict');
    var btnQuote = document.getElementById('btnQuote');
    var btnLove = document.getElementById('btnLove');

    var current = { cost: 0, gb: 0, hours: 0 };
    var mode = null;   // null | 'quote' | 'love'

    function calc() {
      var age = parseInt(range.value, 10) || 1;
      var hours = age * 365 * HOURS_PER_DAY;
      var gb = hours * GB_PER_HOUR;
      var sticks = gb / 32;
      var cost = gb * YUAN_PER_GB;

      current = { cost: cost, gb: gb, hours: hours };

      if (outAge) outAge.textContent = age;
      if (outHours) outHours.textContent = fmt(hours) + ' 小时';
      if (outGb) outGb.textContent = fmt(gb) + ' GB';
      if (outSticks) outSticks.textContent = fmt(sticks) + ' 条（32GB）';
      if (outCost) outCost.textContent = '¥' + fmt(cost);
    }

    function showQuote() {
      verdict.className = 'calc-verdict';
      verdict.innerHTML =
        '<p class="verdict-quote">¥' + fmt(current.cost) + '</p>' +
        '<p class="verdict-note">' +
          '按今天的行情，录下你 ' + range.value + ' 年清醒时光所需的存储，大约值这个数。' +
          '折合 ' + fmt(current.gb) + ' GB、' + fmt(current.gb / 32) + ' 条 32GB 内存条。' +
          '<br />这条账单里不包含：走神、心跳、反复回想同一句话的那几个夜晚。' +
          '而且即便你付得起——也没有人会卖给你一份别人的记忆。' +
        '</p>';
    }

    function showLove() {
      verdict.className = 'calc-verdict verdict-love';
      verdict.innerHTML =
        '<p class="verdict-quote">不可定价</p>' +
        '<p class="verdict-note">' +
          '该资产没有替代品，没有备件，不支持复制，不支持退换，' +
          '全世界仅此一份，且正在缓慢损耗。' +
          '<br />估价失败的原因是：<em>它从未被当作商品存在过。</em>' +
        '</p>';
    }

    range.addEventListener('input', function () {
      calc();
      if (mode === 'quote') showQuote();
    });
    calc();

    if (btnQuote) {
      btnQuote.addEventListener('click', function () {
        mode = 'quote';
        calc();
        showQuote();
      });
    }

    if (btnLove) {
      btnLove.addEventListener('click', function () {
        mode = 'love';
        calc();
        showLove();
      });
    }
  })();

  /* ---------------------------------------------------------
     10. CH05 · 记忆标本馆
     --------------------------------------------------------- */
  (function museum() {
    var input = document.getElementById('memoryInput');
    var btn = document.getElementById('btnSave');
    var wall = document.getElementById('museumWall');
    var empty = document.getElementById('museumEmpty');
    var cntEl = document.getElementById('mCount');
    var costEl = document.getElementById('mCost');
    if (!wall || !btn || !input) return;

    var KEY = 'memory-museum-v1';
    var GB_PER_MEMORY = 0.25;          // 约一段 12 秒 4K 片段
    var YUAN_PER_GB = 106;

    var SEED = [
      { t: '她第一次叫我的名字，那天下午光线很短。', at: '2026-09-20T10:00:00' },
      { t: '父亲把自行车后座垫上毛巾的那个夏天。', at: '2026-09-20T10:00:01' },
      { t: '凌晨三点，我们分完最后一块蛋糕。', at: '2026-09-20T10:00:02' }
    ];

    var list = [];

    function load() {
      try {
        var raw = localStorage.getItem(KEY);
        list = raw ? JSON.parse(raw) : null;
      } catch (e) { list = null; }
      if (!Array.isArray(list)) list = SEED.slice();
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 忽略 */ }
    }

    function stamp(iso) {
      var d = new Date(iso);
      if (isNaN(d.getTime())) d = new Date();
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
             ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    }

    function render() {
      var cost = list.length * GB_PER_MEMORY * YUAN_PER_GB;
      if (cntEl) cntEl.textContent = list.length;
      if (costEl) costEl.textContent = '¥' + fmt(cost, 2);

      wall.innerHTML = list.map(function (m, i) {
        return '<article class="mcard">' +
                 '<span class="mcard-flag">存档 · 无替代品</span>' +
                 '<button class="mcard-del" data-i="' + i + '" title="移除" aria-label="移除这条记忆">×</button>' +
                 '<p class="mcard-text">' + esc(m.t) + '</p>' +
                 '<div class="mcard-meta">' +
                   '<span>' + stamp(m.at) + '</span>' +
                   '<span class="mcard-cost">存储成本 ¥' + (GB_PER_MEMORY * YUAN_PER_GB).toFixed(2) + '</span>' +
                 '</div>' +
               '</article>';
      }).join('');

      if (empty) empty.style.display = list.length ? 'none' : 'block';
    }

    function add() {
      var v = (input.value || '').trim();
      if (!v) { input.focus(); return; }
      list.unshift({ t: v, at: new Date().toISOString() });
      if (list.length > 60) list.length = 60;
      input.value = '';
      save();
      render();
    }

    btn.addEventListener('click', add);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); add(); }
    });
    wall.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.classList || !t.classList.contains('mcard-del')) return;
      var i = parseInt(t.getAttribute('data-i'), 10);
      if (isNaN(i)) return;
      list.splice(i, 1);
      save();
      render();
    });

    load();
    render();
  })();

})();
