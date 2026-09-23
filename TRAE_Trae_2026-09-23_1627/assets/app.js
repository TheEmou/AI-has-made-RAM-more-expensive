/* ============================================================
   记忆星图 · MEMORY ATLAS — app.js
   零依赖 · 原生 Canvas + DOM 交互
   ============================================================ */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ============================================================
     0 · 开屏
     ============================================================ */
  (function boot() {
    const el = $("#boot");
    const txt = $("#bootTxt");
    if (REDUCED) { el.classList.add("gone"); return; }
    const msgs = ["正在唤醒两种记忆", "正在点亮硅基地址", "正在取出心里的片段", "记忆就绪"];
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (msgs[i]) { txt.textContent = msgs[i]; }
    }, 480);
    const finish = () => {
      clearInterval(timer);
      el.classList.add("gone");
    };
    const min = new Promise((r) => setTimeout(r, 1300));
    const loaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener("load", r));
    Promise.all([min, loaded]).then(finish);
    setTimeout(finish, 3200);
  })();

  /* ============================================================
     1 · HERO 标题逐字登场
     ============================================================ */
  (function heroTitle() {
    const h1 = $("#heroTitle");
    const text = h1.textContent.trim();
    h1.textContent = "";
    Array.from(text).forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "ch";
      if (i === 0) span.classList.add("ch-love");
      if (i === 2 || i === 3) span.classList.add("ch-mem");
      span.style.setProperty("--d", 0.35 + i * 0.09 + "s");
      span.textContent = ch;
      h1.appendChild(span);
    });

    const en = $("#heroEn");
    en.innerHTML = en.innerHTML.replace(/^AI/, '<span class="en-ai">AI</span>');
  })();

  /* ============================================================
     2 · 自定义光标
     ============================================================ */
  (function cursor() {
    if (!FINE || REDUCED) return;
    document.body.classList.add("has-cursor");
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const hot = e.target.closest("a,button,textarea,[role='slider'],canvas");
      document.body.classList.toggle("cursor-hot", !!hot);
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
  })();

  /* ============================================================
     3 · 导航状态 + 滚动进度
     ============================================================ */
  (function scrollUI() {
    const nav = $("#nav");
    const bar = $("#progressBar");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        nav.classList.toggle("scrolled", y > 40);
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? clamp(y / h, 0, 1) : 0})`;
        ticking = false;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ============================================================
     4 · 入场动画 / 计数器
     ============================================================ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });
  $$(".rv").forEach((el) => io.observe(el));

  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counterIO.unobserve(e.target);
      const el = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || "";
      if (REDUCED) { el.textContent = target + suffix; return; }
      const t0 = performance.now(), dur = 1500;
      (function tick(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$(".counter").forEach((el) => counterIO.observe(el));

  /* ============================================================
     5 · 磁吸按钮
     ============================================================ */
  if (FINE && !REDUCED) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px,${dy * 0.28}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ============================================================
     6 · 全局星图粒子（两种记忆族群）
     ============================================================ */
  (function starfield() {
    const cv = $("#starfield");
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, DPR = 1, stars = [], shooting = null, shootTimer = rand(4, 9);
    const mouse = { x: 0.5, y: 0.4 };
    const COL = {
      gold: "233,180,76",
      rose: "226,109,123",
      cyan: "87,199,232"
    };

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = clamp(Math.round((W * H) / 11500), 50, 170);
      stars = Array.from({ length: n }, () => makeStar(true));
    }

    function makeStar(any) {
      const roll = Math.random();
      const kind = roll < 0.5 ? "gold" : roll < 0.72 ? "rose" : "cyan";
      return {
        x: rand(0, W), y: rand(0, H),
        r: kind === "cyan" ? rand(0.7, 1.5) : rand(0.7, 2.1),
        vx: rand(-0.05, 0.05), vy: rand(-0.09, -0.02),
        depth: rand(0.35, 1),
        tw: rand(0, Math.PI * 2),
        tws: rand(0.008, 0.022),
        kind
      };
    }

    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX / innerWidth;
      mouse.y = e.clientY / innerHeight;
    }, { passive: true });

    function frame() {
      ctx.clearRect(0, 0, W, H);

      // 暖色星之间的暗连线（人类记忆彼此牵连）
      const warm = stars.filter((s) => s.kind !== "cyan");
      for (let i = 0; i < warm.length; i++) {
        for (let j = i + 1; j < warm.length; j++) {
          const a = warm[i], b = warm[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const o = (1 - Math.sqrt(d2) / 120) * 0.1;
            ctx.strokeStyle = `rgba(${COL.gold},${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      const px = (mouse.x - 0.5) * 26, py = (mouse.y - 0.4) * 18;

      for (const s of stars) {
        if (!REDUCED) {
          s.x += s.vx; s.y += s.vy;
          s.tw += s.tws;
          if (s.y < -8) { s.y = H + 8; s.x = rand(0, W); }
          if (s.x < -8) s.x = W + 8;
          if (s.x > W + 8) s.x = -8;
        }
        const a = REDUCED ? 0.7 : 0.35 + Math.sin(s.tw) * 0.3 + 0.35;
        const ox = px * s.depth, oy = py * s.depth;
        const rgb = COL[s.kind];
        ctx.fillStyle = `rgba(${rgb},${clamp(a, 0.1, 0.95)})`;
        ctx.shadowColor = `rgba(${rgb},0.9)`;
        ctx.shadowBlur = s.r * 5;
        ctx.beginPath();
        ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 流星：硅基记忆里逃逸的一条
      if (!REDUCED) {
        shootTimer -= 0.016;
        if (!shooting && shootTimer <= 0) {
          shooting = {
            x: rand(W * 0.2, W * 0.95), y: rand(0, H * 0.3),
            vx: rand(-7, -4.5), vy: rand(2.6, 4), life: 1
          };
        }
        if (shooting) {
          const s = shooting;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
          grad.addColorStop(0, "rgba(148,226,244,0.9)");
          grad.addColorStop(1, "rgba(148,226,244,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
          ctx.stroke();
          s.x += s.vx; s.y += s.vy; s.life -= 0.012;
          if (s.life <= 0) { shooting = null; shootTimer = rand(6, 14); }
        }
      }

      if (!REDUCED) requestAnimationFrame(frame);
    }

    resize();
    addEventListener("resize", resize);
    frame();
  })();

  /* ============================================================
     7 · HERO 脉冲线：心跳 ⇄ 行情 交替
     ============================================================ */
  (function ecg() {
    const cv = $("#ecg");
    const ctx = cv.getContext("2d");
    const tagH = $("#traceTagH"), tagS = $("#traceTagS");
    let W = 0, H = 0, DPR = 1;

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const g = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2));
    function heartY(x, beatLen, mid) {
      const t = (x % beatLen) / beatLen;
      return mid
        - 8 * g(t, 0.22, 0.035)
        + 9 * g(t, 0.36, 0.012)
        - 44 * g(t, 0.40, 0.016)
        + 13 * g(t, 0.45, 0.014)
        - 10 * g(t, 0.62, 0.045);
    }
    function marketY(x, w, mid) {
      const t = x / w;
      const stair = Math.floor(t * 14) * 0.8;
      const noise = Math.sin(t * 40) * 2.2 + Math.sin(t * 87) * 1.4;
      const dip = -12 * g(t, 0.30, 0.03);
      return mid + 46 - Math.pow(t, 1.55) * 78 - stair + noise + dip;
    }

    let mode = "heart";
    let start = performance.now();
    const DRAW = 5200, HOLD = 1100;

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;

      // 基线
      ctx.strokeStyle = "rgba(239,230,212,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid); ctx.lineTo(W, mid);
      ctx.stroke();

      const elapsed = now - start;
      let p = clamp(elapsed / DRAW, 0, 1);
      if (elapsed > DRAW + HOLD) {
        mode = mode === "heart" ? "market" : "heart";
        start = now;
        p = 0;
      }
      tagH.classList.toggle("show", mode === "heart");
      tagS.classList.toggle("show", mode === "market");

      const headX = p * W;
      const color = mode === "heart" ? "226,109,123" : "87,199,232";
      const beatLen = W / 3.2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, headX + 2, H);
      ctx.clip();

      ctx.strokeStyle = `rgba(${color},0.95)`;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = `rgba(${color},0.9)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = mode === "heart" ? heartY(x, beatLen, mid) : marketY(x, W, mid);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 头部光点
      if (headX > 1 && headX < W) {
        const hy = mode === "heart" ? heartY(headX, beatLen, mid) : marketY(headX, W, mid);
        const grd = ctx.createRadialGradient(headX, hy, 0, headX, hy, 14);
        grd.addColorStop(0, `rgba(${color},1)`);
        grd.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(headX, hy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      requestAnimationFrame(draw);
    }

    function drawStatic() {
      const mid = H / 2;
      const beatLen = W / 3.2;
      ctx.strokeStyle = "rgba(226,109,123,0.85)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = heartY(x, beatLen, mid);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      tagH.classList.add("show");
    }

    resize();
    addEventListener("resize", resize);
    if (REDUCED) drawStatic(); else requestAnimationFrame(draw);
  })();

  /* ============================================================
     8 · TICKER 无缝复制
     ============================================================ */
  (function ticker() {
    const track = $(".ticker-track");
    track.innerHTML += track.innerHTML;
  })();

  /* ==============================================================
     9 · 一字两读 · 拖拽分屏
     ============================================================ */
  (function splitRead() {
    const stage = $("#splitStage");
    const handle = $("#splitHandle");
    let dragging = false;

    function set(clientX) {
      const r = stage.getBoundingClientRect();
      const p = clamp(((clientX - r.left) / r.width) * 100, 4, 96);
      stage.style.setProperty("--split", p + "%");
      handle.setAttribute("aria-valuenow", Math.round(p));
    }
    stage.addEventListener("pointerdown", (e) => {
      dragging = true;
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      set(e.clientX);
    });
    addEventListener("pointermove", (e) => dragging && set(e.clientX));
    addEventListener("pointerup", () => { dragging = false; });
    handle.addEventListener("keydown", (e) => {
      const cur = parseFloat(stage.style.getPropertyValue("--split")) || 50;
      if (e.key === "ArrowLeft") { setBy(cur - 6); e.preventDefault(); }
      if (e.key === "ArrowRight") { setBy(cur + 6); e.preventDefault(); }
      function setBy(v) {
        const p = clamp(v, 4, 96);
        stage.style.setProperty("--split", p + "%");
        handle.setAttribute("aria-valuenow", Math.round(p));
      }
    });
  })();

  /* ============================================================
     10 · 记忆星云（可点击探索）
     ============================================================ */
  (function atlas() {
    const cv = $("#atlasCanvas");
    const ctx = cv.getContext("2d");
    const section = $("#atlas");
    let W = 0, H = 0, DPR = 1, nodes = [], inView = true;

    const FRAGMENTS = [
      { k: "h", zh: "外婆站在楼下喊你的全名", en: "Grandma calling your full name from downstairs.", addr: "ADDRESS · 不在任何地址总线上 / NOT ON ANY BUS" },
      { k: "h", zh: "没打通就赶紧挂断的电话", en: "A call you cancelled before it even rang.", addr: "ADDRESS · 通话记录之外 / BEYOND THE CALL LOG" },
      { k: "h", zh: "晚自习窗外，烧得很慢的晚霞", en: "A dusk that burned so slowly outside the window.", addr: "ADDRESS · 一九九几年的窗边 / A WINDOW, 1990s" },
      { k: "h", zh: "那只在雨里陪你走了半条街的猫", en: "A stray cat that walked half the street with you.", addr: "ADDRESS · 雨里 / RAIN-SOAKED STREET" },
      { k: "h", zh: "旧书里掉出的一张褪色车票", en: "A faded ticket stub falling out of an old book.", addr: "ADDRESS · 第 47 页 / PAGE 47" },
      { k: "h", zh: "每次出门那句「路上小心」", en: "\"Take care.\" — every single time you left home.", addr: "ADDRESS · 玄关 / THE ENTRYWAY" },
      { k: "h", zh: "第一次牵手时下过的那座天桥", en: "The footbridge raining the night hands first met.", addr: "ADDRESS · 心跳 127 BPM / HEARTBEAT 127 BPM" },
      { k: "h", zh: "医院走廊里整夜没灭的灯", en: "The hallway lamp that stayed on the whole night.", addr: "ADDRESS · 无眠坐标 / COORDINATE OF NO SLEEP" },
      { k: "h", zh: "输入法还记得、你快忘了的昵称", en: "A nickname the keyboard still remembers.", addr: "ADDRESS · 词库缓存第 3 条 / IME CACHE #3" },
      { k: "s", zh: "0x7FFE2A19 · 一次未被保留的推理", en: "An inference generated, then never stored.", addr: "0x7FFE2A19 · EPHEMERAL · GC SOON" },
      { k: "s", zh: "HBM 堆叠里 0.3 纳秒的等待", en: "A 0.3-nanosecond wait inside the HBM stack.", addr: "BANK 3 · ROW 0x2A1F · tWTR" },
      { k: "s", zh: "L3 缓存命中的那 12 MB", en: "Twelve megabytes served warm from L3.", addr: "CACHE-L3 · HIT · 0.000000011 s" },
      { k: "s", zh: "第 4096 个 token 的注意力权重", en: "Attention weight riding on the 4096th token.", addr: "LAYER 24 · HEAD 7 · α = 0.0317" },
      { k: "s", zh: "断电前最后一条 flush 指令", en: "The very last flush command before power-down.", addr: "CMD 0xEA · FLUSHDATA · 23:59:59.997" },
      { k: "s", zh: "显存里没来得及释放的张量", en: "A tensor nobody freed before the process died.", addr: "VRAM 0x9C…E4 · OOM · ORPHANED" },
      { k: "s", zh: "被丢弃的那一位 ECC 校验码", en: "The single parity bit that got corrected away.", addr: "ECC BIT 42 · CORRECTED · DISCARDED" },
      { k: "s", zh: "训练日志第 8848 步的 loss", en: "The loss curve at training step 8848.", addr: "STEP 8848 · LOSS 0.0314 · L.R. 2e-5" },
      { k: "s", zh: "被覆盖前最后一页 page cache", en: "The last page-cache page before overwrite.", addr: "PAGE 0xABCD10 · LAST READ 12ms AGO" }
    ];

    const lit = new Set();
    let selected = -1, hovered = -1;
    const pointer = { x: -999, y: -999, down: false, sx: 0, sy: 0, moved: false };

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      const oldW = W || r.width, oldH = H || r.height;
      W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!nodes.length) {
        nodes = FRAGMENTS.map((f, i) => ({
          x: rand(40, W - 40), y: rand(40, H - 40),
          vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18),
          tw: rand(0, Math.PI * 2), id: i
        }));
      } else {
        nodes.forEach((n) => {
          n.x = n.x / oldW * W;
          n.y = n.y / oldH * H;
        });
      }
      $("#litTotal").textContent = FRAGMENTS.length;
    }

    function nearest(x, y, max) {
      let best = -1, bd = max * max;
      nodes.forEach((n, i) => {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }

    cv.addEventListener("pointerdown", (e) => {
      const r = cv.getBoundingClientRect();
      pointer.down = true; pointer.moved = false;
      pointer.sx = pointer.x = e.clientX - r.left;
      pointer.sy = pointer.y = e.clientY - r.top;
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", (e) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (pointer.down && (Math.abs(x - pointer.sx) > 6 || Math.abs(y - pointer.sy) > 6)) {
        pointer.moved = true;
      }
      pointer.x = x; pointer.y = y;
      if (pointer.moved) {
        nodes.forEach((n) => {
          var px = pointer._lx == null ? x : pointer._lx;
          var py = pointer._ly == null ? y : pointer._ly;
          n.x = clamp(n.x + (x - px) * 0.6, 14, W - 14);
          n.y = clamp(n.y + (y - py) * 0.6, 14, H - 14);
        });
      }
      pointer._lx = x; pointer._ly = y;
      hovered = nearest(x, y, 20);
      cv.style.cursor = hovered >= 0 ? "pointer" : "grab";
    });
    cv.addEventListener("pointerup", () => {
      if (!pointer.moved) {
        const hit = nearest(pointer.x, pointer.y, 22);
        if (hit >= 0) select(hit);
      }
      pointer.down = false;
      pointer._lx = pointer._ly = null;
    });
    cv.addEventListener("pointerleave", () => { hovered = -1; pointer._lx = pointer._ly = null; });

    function select(i) {
      selected = i;
      lit.add(i);
      const f = FRAGMENTS[i];
      $("#panelPlaceholder").hidden = true;
      const detail = $("#panelDetail");
      detail.hidden = false;
      const kind = $("#detailKind");
      kind.textContent = f.k === "h" ? "人类记忆 · HUMAN" : "硅基地址 · SILICON";
      kind.className = "detail-kind " + (f.k === "h" ? "k-human" : "k-silicon");
      $("#detailZh").textContent = f.zh;
      $("#detailEn").textContent = f.en;
      $("#detailAddr").textContent = f.addr;
      $("#litCount").textContent = lit.size;
    }

    function frame() {
      if (!inView) { requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, W, H);
      const now = performance.now() * 0.001;

      if (!REDUCED) {
        nodes.forEach((n) => {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 16 || n.x > W - 16) n.vx *= -1;
          if (n.y < 16 || n.y > H - 16) n.vy *= -1;
          n.x = clamp(n.x, 16, W - 16);
          n.y = clamp(n.y, 16, H - 16);
        });
      }

      // 同族连线
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          if (FRAGMENTS[a.id].k !== FRAGMENTS[b.id].k) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            const active = selected === i || selected === j;
            const o = (1 - d / 130) * (active ? 0.5 : 0.13);
            const c = FRAGMENTS[a.id].k === "h" ? "233,180,76" : "87,199,232";
            ctx.strokeStyle = `rgba(${c},${o})`;
            ctx.lineWidth = active ? 1.3 : 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      nodes.forEach((n, i) => {
        const f = FRAGMENTS[n.id];
        const isSel = selected === i;
        const isHov = hovered === i;
        const rgb = f.k === "h" ? "233,180,76" : "87,199,232";
        const tw = 0.55 + Math.sin(now * 1.6 + n.tw) * 0.35;
        const r = f.k === "h" ? 2.6 : 2.1;

        ctx.shadowColor = `rgba(${rgb},0.9)`;
        ctx.shadowBlur = isSel ? 22 : 10;
        ctx.fillStyle = `rgba(${rgb},${clamp(tw, 0.25, 0.95)})`;

        if (f.k === "h") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + (isSel || isHov ? 1.6 : 0), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(Math.PI / 4);
          const s = (r + (isSel || isHov ? 1.6 : 0)) * 1.5;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
        }

        if (isSel || isHov) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(${rgb},0.8)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 9 + (isSel ? Math.sin(now * 4) * 2 : 0), 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.shadowBlur = 0;

      // 选中点的短标签
      if (selected >= 0) {
        const n = nodes[selected];
        const label = FRAGMENTS[selected].zh.length > 10
          ? FRAGMENTS[selected].zh.slice(0, 10) + "…"
          : FRAGMENTS[selected].zh;
        ctx.font = "11px 'Space Mono', monospace";
        const tw = ctx.measureText(label).width;
        const lx = clamp(n.x + 14, 8, W - tw - 14);
        const ly = clamp(n.y - 16, 16, H - 8);
        ctx.fillStyle = "rgba(7,8,13,0.82)";
        ctx.fillRect(lx - 6, ly - 13, tw + 12, 20);
        ctx.strokeStyle = "rgba(239,230,212,0.25)";
        ctx.strokeRect(lx - 6, ly - 13, tw + 12, 20);
        ctx.fillStyle = FRAGMENTS[selected].k === "h" ? "#f7d68a" : "#94e2f4";
        ctx.fillText(label, lx, ly + 1);
      }

      requestAnimationFrame(frame);
    }

    new IntersectionObserver((es) => { inView = es[0].isIntersecting; }, { threshold: 0.05 })
      .observe(section);

    addEventListener("resize", resize);
    resize();
    requestAnimationFrame(frame);
  })();

  /* ============================================================
     11 · 双指数曲线
     ============================================================ */
  (function chart() {
    const cv = $("#chartCanvas");
    const ctx = cv.getContext("2d");
    const section = $("#market");
    let W = 0, H = 0, DPR = 1, progress = 0, started = false, inView = false;

    const YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    const DRAM = [100, 96, 88, 95, 122, 168, 206, 245];
    const AIDX = [100, 145, 210, 330, 520, 770, 1005, 1240];
    const MAX = 1300;
    const EVENTS = [
      { i: 2, c: "#57c7e8", t: "芯片短缺" },
      { i: 4, c: "#57c7e8", t: "生成式 AI 爆发" },
      { i: 6, c: "#e9b44c", t: "HBM 被包产" },
      { i: 5, c: "#e26d7b", t: "「你翻到一个名字」", human: true }
    ];

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function geo() {
      const padL = 46, padR = 18, padT = 26, padB = 38;
      return {
        x0: padL, x1: W - padR, y0: padT, y1: H - padB,
        px: (i) => padL + (i / (YEARS.length - 1)) * (W - padL - padR),
        py: (v) => H - padB - (v / MAX) * (H - padT - padB)
      };
    }

    function drawSeries(data, color, p) {
      const g = geo();
      const pts = data.map((v, i) => ({ x: g.px(i), y: g.py(v) }));
      const headX = g.x0 + p * (g.x1 - g.x0);

      // 区域填充
      const ag = ctx.createLinearGradient(0, g.y0, 0, g.y1);
      ag.addColorStop(0, color.replace(")", ",0.22)").replace("rgb", "rgba"));
      ag.addColorStop(1, color.replace(")", ",0)").replace("rgb", "rgba"));
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, g.y1);
      pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(pts[pts.length - 1].x, g.y1);
      ctx.closePath();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, headX, H);
      ctx.clip();
      ctx.fill();

      // 平滑曲线（catmull-rom → 折线近似）
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        for (let s = 0; s <= 12; s++) {
          const t = s / 12;
          const t2 = t * t, t3 = t2 * t;
          const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
          const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 端点
      const last = pts[Math.min(pts.length - 1, Math.floor(p * (pts.length - 1) + 0.001))];
      if (last && headX >= last.x - 2) {
        ctx.shadowBlur = 16;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    function render(p) {
      ctx.clearRect(0, 0, W, H);
      const g = geo();

      // 网格 + Y 轴
      ctx.font = "10px 'Space Mono', monospace";
      ctx.textAlign = "right";
      for (let i = 0; i <= 4; i++) {
        const v = (MAX / 4) * i;
        const y = g.py(v);
        ctx.strokeStyle = "rgba(239,230,212,0.08)";
        ctx.beginPath();
        ctx.moveTo(g.x0, y); ctx.lineTo(g.x1, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(239,230,212,0.4)";
        ctx.fillText(String(Math.round(v)), g.x0 - 10, y + 3);
      }

      // X 轴年份
      ctx.textAlign = "center";
      YEARS.forEach((yr, i) => {
        ctx.fillStyle = "rgba(239,230,212,0.5)";
        ctx.fillText(yr, g.px(i), g.y1 + 22);
      });

      // 事件标注
      EVENTS.forEach((ev) => {
        const x = g.px(ev.i);
        if (g.x0 + p * (g.x1 - g.x0) < x) return;
        ctx.save();
        ctx.setLineDash([3, 5]);
        const rgb = hexToRgb(ev.c);
        ctx.strokeStyle = `rgba(${rgb},0.5)`;
        ctx.beginPath();
        ctx.moveTo(x, g.y0 + 4);
        ctx.lineTo(x, g.y1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px 'Noto Serif SC', serif";
        ctx.textAlign = "center";
        ctx.fillStyle = ev.human ? "rgba(226,109,123,0.9)" : ev.c;
        ctx.fillText(ev.t, x, ev.human ? g.y0 + 30 : g.y0 + 14);
        ctx.restore();
      });

      drawSeries(DRAM, "rgb(87,199,232)", p);
      drawSeries(AIDX, "rgb(233,180,76)", p);
    }

    function hexToRgb(hex) {
      const n = parseInt(hex.slice(1), 16);
      return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    }

    let t0 = 0;
    function loop(now) {
      if (started && progress < 1 && inView) progress = clamp((now - t0) / 2200, 0, 1);
      if (inView || progress < 1) render(REDUCED ? 1 : progress);
      requestAnimationFrame(loop);
    }

    new IntersectionObserver((es) => {
      es.forEach((e) => {
        inView = e.isIntersecting;
        if (inView && !started) { started = true; t0 = performance.now(); }
      });
    }, { threshold: 0.25 }).observe(section);

    addEventListener("resize", () => { resize(); render(progress); });
    resize();
    if (REDUCED) render(1); else requestAnimationFrame(loop);
  })();

  /* ============================================================
     12 · 记忆封存机（localStorage 典藏）
     ============================================================ */
  (function seal() {
    const KEY = "memory-atlas-v1";
    const input = $("#memInput");
    const btn = $("#sealBtn");
    const stream = $("#bitstream");
    const listEl = $("#vaultList");
    const emptyEl = $("#vaultEmpty");
    const cellsEl = $("#dimmCells");
    const CELLS = 64;

    for (let i = 0; i < CELLS; i++) {
      const c = document.createElement("i");
      cellsEl.appendChild(c);
    }
    const cells = $$("i", cellsEl);

    let items = [];
    try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }

    const byteLen = (s) => {
      try { return new TextEncoder().encode(s).length; }
      catch (e) { return s.length; }
    };
    function hash8(s) {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return ("00000000" + (h >>> 0).toString(16)).slice(-8).toUpperCase();
    }
    const pad = (n) => String(n).padStart(2, "0");
    function fmtDate(ts) {
      const d = new Date(ts);
      return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function render(pulseLast) {
      listEl.innerHTML = "";
      emptyEl.hidden = items.length > 0;

      items.slice().reverse().forEach((it, revIdx) => {
        const li = document.createElement("li");
        const isLast = pulseLast && revIdx === 0;
        li.innerHTML = `
          <span class="vault-stamp">珍</span>
          <div class="vault-body">
            <p class="vault-text"></p>
            <div class="vault-meta">
              <span class="v-addr">0x${it.addr}</span>
              <span>${fmtDate(it.ts)}</span>
              <span>${it.bytes} B</span>
              <span class="v-price">估值 · 无价 / NOT FOR SALE</span>
            </div>
          </div>
          <button class="vault-release" type="button">释放 · RELEASE</button>`;
        $(".vault-text", li).textContent = it.t;
        $(".vault-release", li).addEventListener("click", () => {
          items = items.filter((x) => x.addr !== it.addr || x.ts !== it.ts);
          save();
          render(false);
        });
        listEl.appendChild(li);
        if (isLast) li.style.animationDelay = "0.5s";
      });

      $("#sealedCount").textContent = items.length;
      const kb = items.reduce((s, x) => s + x.bytes, 0) / 1024;
      $("#sealedBytes").textContent = kb.toFixed(2);

      cells.forEach((c, i) => {
        const lit = i < Math.min(items.length, CELLS);
        c.classList.toggle("lit", lit);
        if (pulseLast && lit) c.style.transitionDelay = (i * 0.012) + "s";
        else c.style.transitionDelay = "0s";
      });
    }

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* 配额满时静默 */ }
    }

    input.addEventListener("input", () => {
      $("#charCount").textContent = input.value.length;
    });

    let busy = false;
    btn.addEventListener("click", () => {
      const t = input.value.trim();
      if (!t || busy) return;
      busy = true;
      btn.disabled = true;

      // 编码：把记忆转成二进制流，闪烁后入藏
      const bytes = byteLen(t);
      const bits = Array.from(t).slice(0, 18).map((ch) =>
        ch.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
      stream.textContent = "ENCODING » " + bits + (t.length > 18 ? " …" : "");
      stream.classList.add("live");

      setTimeout(() => {
        const now = Date.now();
        items.push({ t, ts: now, bytes, addr: hash8(t + now) });
        save();
        render(true);
        stream.classList.remove("live");
        stream.textContent = "";
        input.value = "";
        $("#charCount").textContent = "0";
        btn.disabled = false;
        busy = false;
      }, REDUCED ? 60 : 1250);
    });

    render(false);
  })();

  /* ============================================================
     13 · 尾声打字机
     ============================================================ */
  (function coda() {
    const zh = "内存会涨价，但总有些记忆，宁可占着一整颗心，也不肯被折价转售。—— 爱，是那个永不释放的进程。";
    const en = "RAM keeps getting pricier; yet some memories occupy the whole heart and refuse to be flushed.";
    const elZh = $("#codaZh");
    const elEn = $("#codaEn");
    let done = false;

    function showAll() {
      elZh.textContent = zh;
      elEn.textContent = en;
    }

    function run() {
      if (done) return;
      done = true;
      if (REDUCED) { showAll(); return; }

      const caret = document.createElement("span");
      caret.className = "caret-c";
      caret.textContent = "▌";
      const zhNode = document.createTextNode("");
      elZh.appendChild(zhNode);
      elZh.appendChild(caret);

      let i = 0;
      (function typeZh() {
        if (i <= zh.length) {
          zhNode.nodeValue = zh.slice(0, i);
          i++;
          setTimeout(typeZh, 34 + Math.random() * 40);
        } else {
          caret.remove();
          let j = 0;
          const c2 = document.createElement("span");
          c2.className = "caret-c";
          c2.textContent = "▌";
          const enNode = document.createTextNode("");
          elEn.appendChild(enNode);
          elEn.appendChild(c2);
          (function typeEn() {
            if (j <= en.length) {
              enNode.nodeValue = en.slice(0, j);
              j++;
              setTimeout(typeEn, 22);
            } else { c2.remove(); }
          })();
        }
      })();
    }

    new IntersectionObserver((es) => {
      if (es[0].isIntersecting) run();
    }, { threshold: 0.35 }).observe($("#coda"));
  })();

  /* ============================================================
     14 · 年份
     ============================================================ */
  $("#year").textContent = new Date().getFullYear();

})();
