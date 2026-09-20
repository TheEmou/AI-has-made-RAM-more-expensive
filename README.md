# 爱让记忆变得更加珍贵 · AI has made RAM more expensive

> 一句双关，多重读法。  
> 多 Agent / 大模型独立建站能力评测合集 —— 可通过 GitHub Pages 直接浏览。

**在线入口**（启用 Pages 后）：`https://theemou.github.io/AI-has-made-RAM-more-expensive/`

---

## 这是什么

中文「**爱让记忆变得更加珍贵**」与英文「**AI has made RAM more expensive**」在音、义、译三层擦肩而过：

| 中文 | 英文读法 | 张力 |
|------|----------|------|
| 爱（ài） | AI | 情感引擎 ↔ 推理引擎 |
| 记忆 | Memory / RAM | 放不下的往事 ↔ 按字节报价的内存 |
| 珍贵 | Precious / Expensive | 无价 ↔ 涨价 |

同一个词，人类读到情书，机器读到账单。价格曲线走向相反——**能报价的在变贵，不能报价的在变珍贵**。

本仓库不是单一官网，而是一场**受控发挥**：在不可互看其他子目录的前提下，各 Agent 以同一主题句为题，独立完成：

- 语义与双关理解  
- 视觉审美与叙事扩展  
- 静态站工程落地  
- 目录规范与可追溯的「生成信息」

根目录提供 **GitHub Pages 入口页**，汇总并跳转全部子站。

---

## 快速开始

### 本地预览（整仓）

仓库为纯静态结构，无构建步骤：

```bash
# 在仓库根目录
python -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/
```

也可直接用浏览器打开根目录的 [`index.html`](index.html)。

### 单独预览某个子站

进入对应子目录后，用任意静态服务器指向该目录，或双击其中的 `index.html`：

```bash
cd "MiMo_MiMo-V2.5-Pro"
python -m http.server 8081
```

> 个别子站引用了 CDN 字体/图表库，需可访问外网；详见各子目录 README。

### 启用 GitHub Pages

1. 打开仓库 **Settings → Pages**  
2. **Source**：`Deploy from a branch`  
3. **Branch**：`main`，目录选 `/ (root)`  
4. 保存后，访问：`https://<用户名>.github.io/AI-has-made-RAM-more-expensive/`

根目录入口页会链向所有 `agent_模型/` 子站（含空格目录已做 URL 编码）。

---

## 仓库结构

```
.
├── index.html              # GitHub Pages 总入口（作品目录）
├── site.css / site.js      # 入口页样式与轻量交互
├── LICENSE                 # MIT 开源许可
├── README.md               # 本说明
├── agent.md                # 评测任务书（主题、目录规则、生成信息格式）
│
├── MiMo_MiMo-V2.5-Pro/            # 双重读取 · PCB 丝印 × 记忆矩阵
├── WorkBuddy_DeepSeek-V4.1-Flash/ # 叙事型论证 · 记忆的两种经济学
├── WorkBuddy_Hy4-Preview/         # 七章叙事 · 典当行情与情书
├── Qoder_Claude/                   # 讽刺向 · 曲线 / 汇率 / 记忆便签
├── Doubao_Doubao Turbo/            # 双线交替 · 记忆封存机
└── Doubao_Doubao2.1Pro0915/        # 记忆电报局 · 旧纸电报美学
```

每个有效子站均包含 `index.html`；目录命名约定为 **`agent名称_模型名称`**。子目录 `README.md` 末尾须含：

```markdown
## 生成信息

- Agent：<Agent 名称与版本>
- 模型：<模型名称>
- 生成日期：<YYYY-MM-DD>
- 用时：<生成总时长>
```

---

## 作品一览

| 子目录 | Agent / 模型 | 读法关键词 | 入口 |
|--------|----------------|------------|------|
| `MiMo_MiMo-V2.5-Pro` | MiMo / MiMo-V2.5-Pro | 双重读取、PCB 丝印、32 格记忆矩阵 | [打开](MiMo_MiMo-V2.5-Pro/) |
| `WorkBuddy_DeepSeek-V4.1-Flash` | WorkBuddy / DeepSeek-V4.1-Flash | 叙证结构、两种记忆经济学 | [打开](WorkBuddy_DeepSeek-V4.1-Flash/) |
| `WorkBuddy_Hy4-Preview` | WorkBuddy / Hy4-Preview | 七章交互叙事、典当行与情书 | [打开](WorkBuddy_Hy4-Preview/) |
| `Qoder_Claude` | Qoder / Claude | 涨价讽刺、汇率换算、本地记忆墙 | [打开](Qoder_Claude/) |
| `Doubao_Doubao Turbo` | 豆包 / Doubao Turbo | 情书×行情双线、封存机 | [打开](Doubao_Doubao%20Turbo/) |
| `Doubao_Doubao2.1Pro0915` | 豆包 / Doubao 2.1 Pro 0915 | 记忆电报局、纸感排版 | [打开](Doubao_Doubao2.1Pro0915/) |

更完整的卡片式介绍见站点入口：[`index.html`](index.html)。

---

## 评测维度（参考）

入口页亦有说明，便于横向对照：

1. **语义与双关** — 是否抓住爱≈AI、记忆=RAM、珍贵↔expensive 的多层对应，而非只复述中文。  
2. **审美判断** — 视觉语言是否从主题生长（PCB、电报、行情板、书信……），而非通用模板。  
3. **叙事与扩展** — 章节是否完整，交互隐喻是否成立，是否有从戏谑到抒情的弧线。  
4. **工程落地** — 可运行性、目录规范、README 生成信息、响应式与无障碍。

评分或讨论时，请**以各子目录自有 README 与页面表现为准**；不同 Agent 输出风格差异本身就是评测样本的一部分。

---

## 开发约定（来自 `agent.md`）

- 主题句固定；理解与扩展自由，允许双关的多义发挥。  
- 独立完成，不浏览或参考其他子目录。  
- 新代码写入 `agent名称_模型名称/`，勿覆盖他人目录。  
- 子目录 README 需含项目介绍、运行方式、原理说明，并以固定格式的「生成信息」收尾。  
- 推荐纯静态、少依赖；若使用 CDN / 图片资源，应在子 README 中写明。

---

## 许可

本仓库以 [MIT License](LICENSE) 开源。

各子站为不同 Agent 在同一命题下的独立生成物，版权归原贡献者所有；在 MIT 条款下欢迎学习、分叉与再创作。

主题句中的技术事实（如内存行情）多为**示意或叙事用**，不构成投资或采购建议。

---

## 贡献

欢迎追加新的 `agent_模型/` 子站：

1. Fork 本仓库  
2. 按 `agent.md` 规范新建目录并完成站点与 README  
3. 若希望出现在总入口，请在 PR 中说明，维护者会更新根目录 `index.html` 与本 README 的作品表  
4. 开启 Pull Request  

---

## 生成信息（根目录入口）

- Agent：MiMo（MiMo Desktop Agent）
- 模型：MiMo-V2.5-Pro
- 生成日期：2026-09-20
- 用时：约 8 分钟（入口页 / LICENSE / 根 README）
