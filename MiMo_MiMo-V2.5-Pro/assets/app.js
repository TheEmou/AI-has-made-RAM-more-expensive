/* Dual Read interactions — UTF-8 */

(function () {
  "use strict";

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (new URLSearchParams(location.search).get("verify") === "1") {
    document.documentElement.classList.add("is-verify");
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  var FRAGMENTS = {
    human: [
      {
        title: "未接来电",
        body: "那天下午手机震了三次。后来才知道，那是妈妈想问晚饭要不要加汤。记忆不贵，可有些话一旦错过，标价就变成了永远。"
      },
      {
        title: "旧车站",
        body: "站台的钟停在 6:17。你说这是城市最不重要的时间表。后来所有告别的画面，都停在那一分钟。"
      },
      {
        title: "手写地址",
        body: "搬家时翻出一张信封，字迹已经晕开。地址对的，人却不在了。爱让记忆珍贵——珍贵在于，它提醒你曾经有地方可回。"
      },
      {
        title: "雨天电话",
        body: "信号很差，你的声音被雨点敲碎成好几段。我却把每一秒都存了下来——不是录音，是心跳的采样率。"
      },
      {
        title: "空相册",
        body: "相机坏掉了，照片一张也没导出。奇怪的是，关于那天阳光的角度，反而比任何照片都清楚。"
      },
      {
        title: "共享一首歌",
        body: "耳机分你一只的那三分钟，后来在任何平台都找不到同款音质。因为真正的编曲，是两个人的沉默。"
      },
      {
        title: "门牌号",
        body: "老家的门牌换了三次，我却仍能闭眼走到。记忆不需要 UUID，爱本身就是地址。"
      },
      {
        title: "最后一次拥抱",
        body: "力度、衣料的温度、走廊消毒水的气味——大脑用多通道冗余写入。它知道，有些地址只读一次。"
      }
    ],
    silicon: [
      {
        title: "HBM · 2024",
        body: "AI 训练集群把高带宽内存的产能吃干抹净。同一颗硅片，昨天还是显卡里的配角，今天成了算力的入场券。"
      },
      {
        title: "DRAM Spot",
        body: "现货市场不会写诗。它只记录：本周合约价又涨了 12%。数据无情，但每一次波动背后都有一座正在冒烟的数据中心。"
      },
      {
        title: "ECC · 校验",
        body: "Error-Correcting Code 会修复位翻转，却修复不了人类的遗忘曲线。机器怕 bit flip，我们怕的是想不起来为什么难过。"
      },
      {
        title: "GB → $",
        body: "AI has made RAM more expensive. 服务器要更多内存，消费级笔记本跟着涨价。经济学很简单：当欲望写进硬件，价格就会写进生活。"
      },
      {
        title: "Latency",
        body: "内存延迟以纳秒计。人类的情绪延迟以年计。两种时钟，都在等待一次 read。"
      },
      {
        title: "Fab · 产能",
        body: "一座先进内存工厂的投资以百亿计。爱不建厂，爱建人。可两者都在赌：未来会不会有人记得现在的投入。"
      },
      {
        title: "Context Window",
        body: "模型的上下文窗口有限，所以检索和压缩变成了产业。人类何尝不是？我们用故事压缩一生，用关键词检索悲伤。"
      },
      {
        title: "Refresh Cycle",
        body: "DRAM 每隔几毫秒就要刷新一次，否则数据蒸发。爱也需要 refresh：一通电话，一顿饭，一句「还在」。"
      }
    ]
  };

  var cellGrid = document.getElementById("cell-grid");
  var readout = document.getElementById("bank-readout");
  if (!cellGrid || !readout) return;

  var TOTAL = 32;
  var cells = [];

  function renderEmpty() {
    readout.innerHTML =
      '<div class="slot">SLOT · 待读取</div>' +
      '<div class="empty">选择一个记忆单元。<br>红色是人类写入，蓝色是硅基写入。<br>同一块介质，两种标价。</div>';
  }

  function renderFragment(idx, frag, kind) {
    var kindClass = kind === "human" ? "is-human" : "is-silicon";
    var kindLabel = kind === "human" ? "HUMAN ARCHIVE" : "SILICON LEDGER";
    var bodyClass = kind === "human" ? "body" : "body mono";
    var addr = "0x" + (0x7a00 + idx * 16).toString(16).toUpperCase();

    readout.innerHTML =
      '<div class="slot">SLOT ' +
      String(idx).padStart(2, "0") +
      " · " +
      addr +
      "</div>" +
      '<div class="kind ' +
      kindClass +
      '">' +
      kindLabel +
      "</div>" +
      "<h4>" +
      frag.title +
      "</h4>" +
      '<div class="' +
      bodyClass +
      '">' +
      frag.body +
      "</div>";
  }

  for (var i = 0; i < TOTAL; i++) {
    var row = Math.floor(i / 8);
    var col = i % 8;
    var kind = row % 2 === 0 ? "human" : "silicon";
    var pool = FRAGMENTS[kind];
    var frag = pool[(i + col) % pool.length];
    var unread = i % 5 === 3 || i % 11 === 7;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "cell" + (unread ? "" : " " + (kind === "human" ? "human-lit" : "silicon-lit"));
    btn.setAttribute("aria-label", "记忆单元 " + String(i).padStart(2, "0"));
    btn.dataset.index = String(i);
    btn.dataset.kind = kind;

    btn.addEventListener(
      "click",
      (function (index, fragment, cellKind, node) {
        return function () {
          cells.forEach(function (c) {
            c.classList.remove("active");
          });
          node.classList.add("active");
          if (!node.classList.contains("human-lit") && !node.classList.contains("silicon-lit")) {
            node.classList.add(cellKind === "human" ? "human-lit" : "silicon-lit");
          }
          renderFragment(index, fragment, cellKind);
        };
      })(i, frag, kind, btn)
    );

    cellGrid.appendChild(btn);
    cells.push(btn);
  }

  renderEmpty();

  cellGrid.addEventListener("keydown", function (e) {
    var active = document.activeElement;
    if (!active || !active.classList.contains("cell")) return;
    var idx = Number(active.dataset.index);
    var next = null;
    if (e.key === "ArrowRight") next = idx + 1;
    if (e.key === "ArrowLeft") next = idx - 1;
    if (e.key === "ArrowDown") next = idx + 8;
    if (e.key === "ArrowUp") next = idx - 8;
    if (next === null) return;
    if (next < 0 || next >= TOTAL) return;
    e.preventDefault();
    cells[next].focus();
  });
})();
