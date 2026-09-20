(() => {
  "use strict";

  /* ---------- 价格曲线（原生 canvas，无依赖） ---------- */
  const DATA = [
    ["2024-01", 305], ["2024-04", 288], ["2024-07", 296], ["2024-10", 342],
    ["2025-01", 468], ["2025-04", 612], ["2025-07", 899], ["2025-10", 1288],
    ["2026-01", 1666], ["2026-04", 1899], ["2026-07", 1999], ["2026-09", 1788],
  ];
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  const PAD = { l: 62, r: 24, t: 24, b: 44 };
  let anim = 0; // 0..1 绘制进度

  function drawChart() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientWidth * 0.4;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const max = 2100;
    const x = i => PAD.l + (W - PAD.l - PAD.r) * i / (DATA.length - 1);
    const y = v => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);

    ctx.strokeStyle = "rgba(154,163,199,.18)";
    ctx.fillStyle = "rgba(154,163,199,.85)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let g = 0; g <= max; g += 700) {
      ctx.beginPath(); ctx.moveTo(PAD.l, y(g)); ctx.lineTo(W - PAD.r, y(g)); ctx.stroke();
      ctx.fillText("¥" + g, PAD.l - 8, y(g) + 4);
    }
    ctx.textAlign = "center";
    DATA.forEach((d, i) => {
      if (i % 3 === 0 || i === DATA.length - 1)
        ctx.fillText(d[0], x(i), H - PAD.b + 20);
    });

    const shown = Math.max(2, Math.round(DATA.length * anim));
    const pts = DATA.slice(0, shown).map((d, i) => [x(i), y(d[1])]);

    const grad = ctx.createLinearGradient(0, PAD.t, 0, H - PAD.b);
    grad.addColorStop(0, "rgba(255,92,138,.35)");
    grad.addColorStop(1, "rgba(255,92,138,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0][0], H - PAD.b);
    pts.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(pts[pts.length - 1][0], H - PAD.b);
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    const line = ctx.createLinearGradient(PAD.l, 0, W - PAD.r, 0);
    line.addColorStop(0, "#5ce1ff");
    line.addColorStop(.5, "#ff5c8a");
    line.addColorStop(1, "#ffc75c");
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();

    pts.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7);
      ctx.fillStyle = "#0b0e1a"; ctx.fill();
      ctx.strokeStyle = "#ffc75c"; ctx.lineWidth = 2; ctx.stroke();
    });

    if (anim >= 1) {
      const peak = DATA.reduce((a, b) => b[1] > a[1] ? b : a);
      const pi = DATA.indexOf(peak);
      ctx.fillStyle = "#ffc75c";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("峰值 ¥" + peak[1], x(pi), y(peak[1]) - 14);
    }
  }

  function animateChart() {
    const t0 = performance.now();
    const step = now => {
      anim = Math.min(1, (now - t0) / 1600);
      drawChart();
      if (anim < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  drawChart();
  window.addEventListener("resize", drawChart);

  /* ---------- 内存汇率换算器 ---------- */
  const PRICE_PER_GB = 125;
  const UNITS = [
    { icon: "🧋", name: "杯奶茶", price: 18, fmt: n => Math.round(n) },
    { icon: "🎬", name: "张电影票", price: 45, fmt: n => Math.round(n) },
    { icon: "🍳", name: "顿早餐", price: 12, fmt: n => Math.round(n) },
    { icon: "🎫", name: "场演唱会", price: 680, fmt: n => n.toFixed(1) },
    { icon: "✈️", name: "次说走就走的旅行(往返)", price: 2400, fmt: n => n.toFixed(2) },
    { icon: "💍", name: "枚求婚钻戒", price: 8800, fmt: n => "第 " + (n * 100).toFixed(1) + "% 期" },
  ];
  const cap = document.getElementById("capacity");
  const capOut = document.getElementById("capOut");
  const results = document.getElementById("calcResults");

  function renderCalc() {
    const gb = +cap.value;
    const total = gb * PRICE_PER_GB;
    capOut.textContent = gb;
    results.innerHTML = `
      <div class="calc-item"><b>¥${total.toLocaleString()}</b><span>${gb}GB 内存 · 按示意价 ¥${PRICE_PER_GB}/GB</span></div>
      ${UNITS.map(u => `<div class="calc-item"><b>${u.icon} ${u.fmt(total / u.price)}</b><span>≈ 等值的${u.name}（¥${u.price}）</span></div>`).join("")}`;
  }
  cap.addEventListener("input", renderCalc);
  renderCalc();

  /* ---------- 记忆便签（localStorage） ---------- */
  const KEY = "priceless-memories-v1";
  const SEEDS = [
    { text: "高考后那个夏天，用第一台电脑存下了全班合照。硬盘换过四次，照片一张没丢。", date: "2026-06", seed: true },
    { text: "给异地恋的 TA 打包了 64G 的视频聊天记录，客服问我为什么要备份这么多。因为每一帧都是我们。", date: "2026-08", seed: true },
    { text: "我爸问我内存条为什么这么贵。我说因为 AI。他想了想说：那机器也开始记东西了，好事。", date: "2026-09", seed: true },
  ];

  const input = document.getElementById("noteInput");
  const count = document.getElementById("noteCount");
  const saveBtn = document.getElementById("noteSave");
  const list = document.getElementById("noteList");

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const persist = arr => localStorage.setItem(KEY, JSON.stringify(arr));

  function renderNotes() {
    const mine = load();
    const all = [...mine, ...SEEDS.map(s => ({ ...s }))];
    list.innerHTML = all.map((n, i) => `
      <li style="--tilt:${(i % 3 - 1) * 1.2}deg">
        <div>${escapeHtml(n.text)}</div>
        <div class="note-meta">
          <span>${n.date}${n.seed ? " · 网友记忆" : " · 我的记忆"}</span>
          ${n.seed ? "" : `<button class="note-del" data-i="${i}" type="button">删除</button>`}
        </div>
      </li>`).join("");
    list.querySelectorAll(".note-del").forEach(btn =>
      btn.addEventListener("click", () => {
        const arr = load();
        arr.splice(+btn.dataset.i, 1);
        persist(arr);
        renderNotes();
      }));
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  input.addEventListener("input", () => count.textContent = `${input.value.length} / 140`);
  saveBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const arr = load();
    arr.unshift({ text, date: new Date().toISOString().slice(0, 7) });
    persist(arr);
    input.value = "";
    count.textContent = "0 / 140";
    renderNotes();
  });
  renderNotes();

  /* ---------- 滚动进场动画 + 图表触发 ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("on");
      if (e.target.id === "price") animateChart();
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  const priceSec = document.getElementById("price");
  const chartIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateChart(); chartIO.disconnect(); } });
  }, { threshold: .3 });
  chartIO.observe(canvas);
  io.observe(priceSec);
})();
