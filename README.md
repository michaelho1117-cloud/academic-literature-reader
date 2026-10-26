# 🎓 Academic Literature Reader (超深度学术文献精读系统)

> **A modern, offline-first interactive literature review, annotation & seminar dashboard for graduate researchers, PhD students, and academic scholars.**  
> 专为硕士/博士研究生、学术学者量身打造的**完全离线、开箱即用**的文献深度精读与组会汇报仪表盘模版。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependency](https://img.shields.io/badge/Server-Zero%20Dependency%20(Pure%20Local)-green.svg)](index.html)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX%20Offline-orange.svg)](assets/katex.min.js)

---

## 🌟 核心特性 (Key Features)

- **100% 本地纯离线运行 (Zero-Server / Offline-First)**:
  - 无需安装 Node.js、Python 或任何后端服务；
  - 内置所有前端依赖（Marked.js Markdown 引擎、KaTeX LaTeX 数学引擎及离线矢量字体文件）；
  - 直接双击 `index.html` 即可在 Chrome、Edge、Safari 或 Firefox 中流畅打开。无网络环境（如飞机、新干线、图书馆）全功能可用。
- **三种沉浸式视图模式 (Three View Modes)**:
  1. **📑 单篇子页面精读 (Subpage Mode)**: 完整展开论文元数据、官方摘要解构、理论机制对立力量、微观数据与变量、因果识别模型、核心回归系数表、研究空白 (Research Gap)、假说支撑与 APA/BibTeX 引用；
  2. **🎴 翻页卡片模式 (Slide Flip Deck Mode)**: 专为组会汇报、导师演练与快速检索设计的全屏卡片，支持键盘左右翻页（`A`/`D` 或 `←`/`→`）；
  3. **📊 全景对比大矩阵 (Master Matrix Table Mode)**: 50+ 篇文献横向大表，支持按量化评分、出版年份、被引频次实时排序与一键导出为 Excel (CSV)。
- **原生 KaTeX 数学公式渲染 (Flawless LaTeX Rendering)**:
  - 完美支持多重下标回归模型（如计量经济学双差模型、固定效应方程）：
    $$Y_{ijt} = \beta_0 + \beta_1 Telework_{it}^H + \beta_2 Telework_{jt}^W + \mathbf{X}_{ijt}'\boldsymbol{\gamma} + \alpha_{ij} + \delta_t + \varepsilon_{ijt}$$
  - 内置长公式横向平滑滚动容器，自适应排版不换行截断。
- **✍️ 自由学术批注与备忘系统 (Private Annotations & JSON Sync)**:
  - 每篇文献专属笔记卡片，实时自动防抖落盘至浏览器 `localStorage`；
  - 快捷插入研读标签：`[🎯 组会必讲]`、`[💡 支撑H1]`、`[📐 计量模型]`、`[❓ 请教导师]`、`[🔍 本文空白]`；
  - **一键备份导出为 JSON**：点击【💾 导出全部批注 JSON】，生成结构化数据文件；
  - **一键导入恢复**：换电脑或在新设备打开时，一键【📥 导入批注 JSON】无缝同步笔记进度。
- **三重视觉主题与无障碍辅助**:
  - ☀️ 极简学术亮白 (Light Academic)
  - 🌙 护眼暗夜蓝黑 (Midnight Blue Dark)
  - 📜 经典纸书羊皮纸 (Warm Sepia)
  - 字体大小无级微调（`A-` / `A+`）与全键盘/无滚轮翻页悬浮支持。

---

## ⌨️ 键盘快捷键导航 (Keyboard Shortcuts)

| 快捷键 | 对应操作 |
| :---: | :--- |
| `←` / `A` | 快速翻至上一篇文献 |
| `→` / `D` | 快速翻至下一篇文献 |
| `PageDown` / `空格` / `J` | 页面向下滚动半屏（适合无滚轮鼠标） |
| `PageUp` / `Shift+空格` / `K` | 页面向上滚动半屏 |
| `Home` / `End` | 一秒回到页面顶部 / 底部 |
| `/` 或 `Ctrl + K` | 聚焦顶部全局瞬时搜索框 |
| `S` | 快速收藏 / 取消收藏当前文献（⭐） |
| `R` | 切换标记当前文献为“已读 / 未读” |
| `Esc` | 退出搜索框焦点 |

---

## 🚀 快速开始 (Quick Start)

### 1. 克隆或下载本仓库
```bash
git clone https://github.com/michaelho1117-cloud/academic-literature-reader.git
cd academic-literature-reader
```

### 2. 打开阅读面板
直接双击打开 `index.html`（或在浏览器中打开 `file:///.../index.html`），即可看到预装的 2 篇高质量示例文献（包含经济学因果推断模型、LaTeX 方程与理论机制剖析）！

---

## 🛠️ 如何定制为你自己的文献集 (How to Customize)

所有文献数据均存放在 `data/papers_data.js` 和 `data/papers_data.json` 中。每个文献条目为一个标准的 JSON 对象：

```json
{
  "id": "PAPER-01",
  "index": 1,
  "title": "Your Paper Title",
  "authors": "First Author, Second Author",
  "journal": "American Economic Review",
  "year": 2024,
  "doi": "https://doi.org/10.xxxx/...",
  "citations": 120,
  "tier": "P1",
  "tier_label": "P1 · 核心实证靶向",
  "score": 95.0,
  "hypotheses": ["H1", "H2"],
  "apa": "Author, A. (2024). Title... Journal...",
  "bibtex": "@article{...}",
  "sections": [
    {
      "clean_title": "官方摘要与学术解构",
      "content": "### Abstract\nMarkdown content here..."
    },
    {
      "clean_title": "计量经济学识别与模型方程",
      "content": "$$\nY_{it} = \\beta_0 + \\beta_1 D_{it} + \\alpha_i + \\varepsilon_{it}\n$$"
    }
  ]
}
```

### 使用辅助脚本快速生成
修改 `data/papers_data.json` 后，运行：
```bash
python scripts/build_papers_data.py
```
脚本将自动同步更新 `data/papers_data.js`，供本地浏览器直接读取。

---

## 📂 项目工程目录 (Directory Tree)

```text
academic-literature-reader/
├── index.html                  # 主面板单页应用入口（无后端，双击直接运行）
├── styles.css                  # 现代化响应式学术卡片样式表（明亮/暗夜/羊皮纸）
├── app.js                      # 核心交互控制器（KaTeX 编译、批注管理、翻页与筛选）
├── README.md                   # 项目说明与指引文档
├── LICENSE                     # MIT 开源许可证
├── data/
│   ├── papers_data.js          # 本地文献数据集（支持 file:/// 离线无缝加载）
│   ├── papers_data.json        # 标准 JSON 文献源数据
│   └── my_annotations.json     # 批注导入导出模板样例
├── assets/
│   ├── marked.min.js           # 离线 Markdown 解析引擎
│   ├── katex.min.js            # 离线 KaTeX LaTeX 数学编译引擎
│   ├── katex.min.css           # 离线 KaTeX 数学样式表
│   ├── auto-render.min.js      # 离线自动公式渲染器
│   └── fonts/                  # KaTeX 离线矢量字体集
└── scripts/
    ├── build_papers_data.py    # 文献数据自动构建脚本
    └── generate_demo_data.py   # 示例数据生成脚本
```

---

## 📄 开源许可证 (License)

本项目基于 [MIT 许可证](LICENSE) 开源，欢迎自由 Fork、修改与用于个人毕业论文（修论/博论）文献研读、课题组组会分享。
