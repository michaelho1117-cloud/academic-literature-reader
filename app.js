/**
 * 若林ゼミ 先行研究50篇 · 超深度学术精读系统 (Literature Deep-Read Reader)
 * Interactive Controller (SPA with Subpages, Flipping, Search & KaTeX Math)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    papers: [],
    filteredPapers: [],
    currentIndex: 0, // 0 to 49
    currentPaper: null,
    viewMode: 'subpage', // 'subpage' | 'slide' | 'matrix'
    theme: localStorage.getItem('lit_reader_theme') || 'light',
    fontSize: parseInt(localStorage.getItem('lit_reader_fontsize') || '15', 10),
    sidebarCollapsed: false,
    
    // Filters
    searchQuery: '',
    tierFilter: 'ALL', // 'ALL' | 'P1' | 'P2'
    hypFilter: 'ALL',  // 'ALL' | 'H1' | 'H2' | 'H3'
    quickFilter: 'ALL', // 'ALL' | 'starred' | 'unread' | 'annotated'
    sortBy: 'default', // 'default' | 'score_desc' | 'year_desc' | 'citations_desc'
    
    // User progress saved in localStorage
    starredIds: JSON.parse(localStorage.getItem('lit_reader_starred') || '[]'),
    readIds: JSON.parse(localStorage.getItem('lit_reader_read') || '[]'),
    
    // User annotations keyed by paper id
    annotations: JSON.parse(localStorage.getItem('lit_reader_annotations') || '{}')
  };

  // DOM Elements cache
  const dom = {
    body: document.body,
    searchInput: document.getElementById('search-input'),
    paperList: document.getElementById('sidebar-paper-list'),
    paperCountBadge: document.getElementById('paper-count-badge'),
    sortSelect: document.getElementById('sort-select'),
    
    // Mode buttons
    btnModeSubpage: document.getElementById('btn-mode-subpage'),
    btnModeSlide: document.getElementById('btn-mode-slide'),
    btnModeMatrix: document.getElementById('btn-mode-matrix'),
    
    // View containers
    viewSubpage: document.getElementById('view-subpage'),
    viewSlide: document.getElementById('view-slide'),
    viewMatrix: document.getElementById('view-matrix'),
    
    // Theme & Font
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    fontDecBtn: document.getElementById('font-dec-btn'),
    fontIncBtn: document.getElementById('font-inc-btn'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    
    // Reader nav
    btnPrev: document.getElementById('btn-prev-paper'),
    btnNext: document.getElementById('btn-next-paper'),
    jumpSelect: document.getElementById('paper-jump-select'),
    btnStar: document.getElementById('btn-star-paper'),
    btnRead: document.getElementById('btn-read-paper'),
    btnCopyApa: document.getElementById('btn-copy-apa'),
    btnCopyBib: document.getElementById('btn-copy-bib'),
    
    // Article Container
    appContent: document.querySelector('.app-content'),
    articleContainer: document.getElementById('article-content-container'),
    slideContainer: document.getElementById('slide-content-container'),
    matrixContainer: document.getElementById('matrix-content-container'),
    
    // Toast
    toast: document.getElementById('toast-notice')
  };

  // Initialize
  function init() {
    dom.appContent = document.querySelector('.app-content');

    if (!window.PAPERS_DATA || !Array.isArray(window.PAPERS_DATA)) {
      showToast('未检测到文献数据文件，请检查 data/papers_data.js');
      return;
    }

    state.papers = window.PAPERS_DATA;
    applyTheme(state.theme);
    applyFontSize(state.fontSize);

    // Setup Marked Markdown Renderer
    if (window.marked) {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true
      });
    }

    // Hash navigation support: e.g. #P1-01 or #index=5
    handleHashNavigation();

    // Event listeners
    bindEvents();

    // Initial Filter & Render
    applyFilters();
    renderPaper(state.currentIndex);
  }

  // Handle URL Hash
  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      const foundIdx = state.papers.findIndex(p => p.id.toLowerCase() === hash.toLowerCase());
      if (foundIdx !== -1) {
        state.currentIndex = foundIdx;
      }
    }
  }

  // Bind Events
  function bindEvents() {
    // Search input
    dom.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Ignore keyboard shortcuts when typing in search input or annotation textarea
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        goToPrevPaper();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        goToNextPaper();
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        scrollPage(0.75);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        scrollPage(-0.75);
      } else if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        scrollPage(0.35);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        scrollPage(-0.35);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToBottom();
      } else if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        dom.searchInput.focus();
        dom.searchInput.select();
      } else if (e.key === 's' || e.key === 'S') {
        toggleStarCurrentPaper();
      } else if (e.key === 'r' || e.key === 'R') {
        toggleReadCurrentPaper();
      }
    });

    // Tier Filter Pills
    document.querySelectorAll('.filter-pill[data-tier]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill[data-tier]').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.tierFilter = e.currentTarget.dataset.tier;
        applyFilters();
      });
    });

    // Hypothesis Filter Pills
    document.querySelectorAll('.filter-pill[data-hyp]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill[data-hyp]').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.hypFilter = e.currentTarget.dataset.hyp;
        applyFilters();
      });
    });

    // Quick Filter Pills (Starred / Unread / Annotated)
    document.querySelectorAll('.filter-pill[data-quick]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const isCurrentActive = e.currentTarget.classList.contains('active');
        document.querySelectorAll('.filter-pill[data-quick]').forEach(p => p.classList.remove('active'));
        if (isCurrentActive) {
          state.quickFilter = 'ALL';
        } else {
          e.currentTarget.classList.add('active');
          state.quickFilter = e.currentTarget.dataset.quick;
        }
        applyFilters();
      });
    });

    // Sort select
    dom.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFilters();
    });

    // Mode Buttons
    dom.btnModeSubpage.addEventListener('click', () => switchViewMode('subpage'));
    dom.btnModeSlide.addEventListener('click', () => switchViewMode('slide'));
    dom.btnModeMatrix.addEventListener('click', () => switchViewMode('matrix'));

    // Paging
    dom.btnPrev.addEventListener('click', goToPrevPaper);
    dom.btnNext.addEventListener('click', goToNextPaper);
    dom.jumpSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      goToPaperByIndex(idx);
    });

    // Actions
    dom.btnStar.addEventListener('click', toggleStarCurrentPaper);
    dom.btnRead.addEventListener('click', toggleReadCurrentPaper);
    dom.btnCopyApa.addEventListener('click', copyCurrentApa);
    dom.btnCopyBib.addEventListener('click', copyCurrentBibtex);

    // Theme & Font
    dom.themeToggleBtn.addEventListener('click', cycleTheme);
    dom.fontDecBtn.addEventListener('click', () => changeFontSize(-1));
    dom.fontIncBtn.addEventListener('click', () => changeFontSize(1));
    dom.sidebarToggleBtn.addEventListener('click', toggleSidebar);

    // Hash change
    window.addEventListener('hashchange', () => {
      handleHashNavigation();
      renderPaper(state.currentIndex);
    });
  }

  // Robust Markdown Parsing with KaTeX Protection & Pre-rendering
  function renderMarkdown(markdownText) {
    if (!markdownText) return '';
    if (!window.marked) return escapeHtml(markdownText);

    const mathTokens = [];

    // 1. Pre-extract and protect Block Math: $$ ... $$
    let protectedText = markdownText.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
      const tokenId = `@@KATEX_BLOCK_${mathTokens.length}@@`;
      mathTokens.push({
        id: tokenId,
        tex: tex.trim(),
        display: true
      });
      return tokenId;
    });

    // 2. Pre-extract and protect Inline Math: $ ... $ (avoiding double $$)
    protectedText = protectedText.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, tex) => {
      const tokenId = `@@KATEX_INLINE_${mathTokens.length}@@`;
      mathTokens.push({
        id: tokenId,
        tex: tex.trim(),
        display: false
      });
      return tokenId;
    });

    // 3. Parse Markdown with marked (safe from TeX underscores and asterisks)
    let html = window.marked.parse(protectedText);

    // 4. Render each math token via KaTeX and substitute back
    mathTokens.forEach(token => {
      let renderedMath = '';
      if (window.katex && window.katex.renderToString) {
        try {
          renderedMath = window.katex.renderToString(token.tex, {
            displayMode: token.display,
            throwOnError: false,
            output: 'htmlAndMathml'
          });
          if (token.display) {
            renderedMath = `<div class="katex-display-wrapper">${renderedMath}</div>`;
          }
        } catch (err) {
          console.warn('KaTeX render error:', err);
          renderedMath = token.display
            ? `<div class="katex-display-wrapper katex-error">$$ ${escapeHtml(token.tex)} $$</div>`
            : `<span class="katex-error">$${escapeHtml(token.tex)}$</span>`;
        }
      } else {
        renderedMath = token.display
          ? `<div class="katex-display-wrapper">$$ ${escapeHtml(token.tex)} $$</div>`
          : `$${escapeHtml(token.tex)}$`;
      }

      // Replace token in html. If marked wrapped block math in <p>@@KATEX_BLOCK_X@@</p>, strip the <p> wrapper
      if (token.display) {
        const pWrappedRegex = new RegExp(`<p>\\s*${token.id}\\s*<\\/p>`, 'g');
        if (pWrappedRegex.test(html)) {
          html = html.replace(pWrappedRegex, renderedMath);
        } else {
          html = html.split(token.id).join(renderedMath);
        }
      } else {
        html = html.split(token.id).join(renderedMath);
      }
    });

    return html;
  }

  // Filter & Sort Papers
  function applyFilters() {
    let list = [...state.papers];

    // Search filter
    if (state.searchQuery) {
      const q = state.searchQuery;
      list = list.filter(p => {
        const noteText = getPaperAnnotationText(p.id).toLowerCase();
        return (
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q) ||
          (p.full_markdown && p.full_markdown.toLowerCase().includes(q)) ||
          noteText.includes(q)
        );
      });
    }

    // Tier filter
    if (state.tierFilter !== 'ALL') {
      list = list.filter(p => p.tier === state.tierFilter);
    }

    // Hypothesis filter
    if (state.hypFilter !== 'ALL') {
      list = list.filter(p => p.hypotheses.includes(state.hypFilter));
    }

    // Quick filter
    if (state.quickFilter === 'starred') {
      list = list.filter(p => state.starredIds.includes(p.id));
    } else if (state.quickFilter === 'unread') {
      list = list.filter(p => !state.readIds.includes(p.id));
    } else if (state.quickFilter === 'annotated') {
      list = list.filter(p => !!getPaperAnnotationText(p.id).trim());
    }

    // Sorting
    if (state.sortBy === 'score_desc') {
      list.sort((a, b) => b.score - a.score);
    } else if (state.sortBy === 'year_desc') {
      list.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (state.sortBy === 'citations_desc') {
      list.sort((a, b) => b.citations - a.citations);
    } else {
      list.sort((a, b) => a.index - b.index);
    }

    state.filteredPapers = list;
    dom.paperCountBadge.textContent = `${list.length} / ${state.papers.length}`;

    renderSidebarList();
    renderJumpSelect();

    if (state.viewMode === 'matrix') {
      renderMatrixView();
    }
  }

  // Render Sidebar List
  function renderSidebarList() {
    dom.paperList.innerHTML = '';

    if (state.filteredPapers.length === 0) {
      dom.paperList.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          未检索到符合条件的文献
        </div>
      `;
      return;
    }

    state.filteredPapers.forEach((paper) => {
      const isCurrent = state.currentPaper && state.currentPaper.id === paper.id;
      const isStarred = state.starredIds.includes(paper.id);
      const isRead = state.readIds.includes(paper.id);
      const hasNote = !!getPaperAnnotationText(paper.id).trim();

      const card = document.createElement('div');
      card.className = `paper-item-card ${isCurrent ? 'active' : ''}`;
      card.dataset.id = paper.id;

      const badgeClass = paper.tier === 'P1' ? 'badge-p1' : 'badge-p2';
      const scoreClass = paper.score >= 85 ? 'score-high' : 'score-mid';

      const hypTagsHtml = paper.hypotheses.map(h => `<span class="hyp-tag">${h}</span>`).join('');

      card.innerHTML = `
        <div class="paper-item-top">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="paper-id-badge ${badgeClass}">${paper.id}</span>
            <span style="font-size: 12px; opacity: ${isRead ? '1' : '0.2'}; color: var(--accent-emerald);" title="${isRead ? '已读' : '未读'}">✓</span>
            ${hasNote ? `<span class="paper-item-note-badge" title="该文献包含研读批注">✍️ 批注</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="paper-score-badge ${scoreClass}">★ ${paper.score}分</span>
            <span class="sidebar-star-icon" style="cursor: pointer; color: ${isStarred ? 'var(--accent-gold)' : 'var(--text-muted)'};" title="收藏">
              ${isStarred ? '★' : '☆'}
            </span>
          </div>
        </div>
        <div class="paper-item-title">${escapeHtml(paper.title)}</div>
        <div class="paper-item-meta">
          <span>${escapeHtml(getShortAuthors(paper.authors))} (${paper.year})</span>
          <span class="paper-item-journal">${escapeHtml(paper.journal)}</span>
        </div>
        <div class="paper-item-tags">
          ${hypTagsHtml}
        </div>
      `;

      // Click card to open paper
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('sidebar-star-icon')) {
          e.stopPropagation();
          toggleStarPaper(paper.id);
          return;
        }
        const foundIndex = state.papers.findIndex(p => p.id === paper.id);
        if (foundIndex !== -1) {
          goToPaperByIndex(foundIndex);
        }
      });

      dom.paperList.appendChild(card);
    });
  }

  // Render Jump Dropdown
  function renderJumpSelect() {
    dom.jumpSelect.innerHTML = '';
    state.papers.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `[${p.id}] ${p.score}分 - ${p.authors.split(',')[0]} (${p.year})`;
      if (idx === state.currentIndex) {
        opt.selected = true;
      }
      dom.jumpSelect.appendChild(opt);
    });
  }

  // Render Selected Paper (Subpage Reader Mode)
  function renderPaper(index) {
    if (index < 0 || index >= state.papers.length) return;
    
    state.currentIndex = index;
    state.currentPaper = state.papers[index];
    const paper = state.currentPaper;

    // Update URL Hash
    if (window.location.hash !== `#${paper.id}`) {
      history.replaceState(null, null, `#${paper.id}`);
    }

    // Update Jump Select & Nav Buttons
    dom.jumpSelect.value = index;
    dom.btnPrev.disabled = index === 0;
    dom.btnNext.disabled = index === state.papers.length - 1;

    // Update Star & Read State in Nav Bar
    const isStarred = state.starredIds.includes(paper.id);
    const isRead = state.readIds.includes(paper.id);

    dom.btnStar.classList.toggle('active-star', isStarred);
    dom.btnStar.innerHTML = isStarred ? '★ 已收藏' : '☆ 收藏';

    dom.btnRead.classList.toggle('active-read', isRead);
    dom.btnRead.innerHTML = isRead ? '✓ 已读' : '○ 标为已读';

    // Highlight Active Card in Sidebar
    document.querySelectorAll('.paper-item-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === paper.id);
    });

    // Render Subpage View
    if (state.viewMode === 'subpage') {
      renderSubpageView(paper);
    } else if (state.viewMode === 'slide') {
      renderSlideView(paper);
    }

    // Scroll workspace to top
    if (dom.appContent) {
      dom.appContent.scrollTop = 0;
    }
  }

  // Render Subpage HTML Content (Anchor Navigation Pill Bar Removed per user request)
  function renderSubpageView(paper) {
    const tierBadgeClass = paper.tier === 'P1' ? 'tier-badge-p1' : 'tier-badge-p2';

    // Build Hypotheses Pills
    const hypPillsHtml = paper.hypotheses.map(h => {
      let label = h;
      let cssClass = h.toLowerCase();
      return `<div class="hyp-pill-detailed ${cssClass}">🎯 ${label}</div>`;
    }).join('');

    // Annotation Data for this Paper
    const noteText = getPaperAnnotationText(paper.id);
    const noteCharCount = noteText.length;

    // Build Section Cards
    let sectionCardsHtml = '';
    paper.sections.forEach((sec, sIdx) => {
      const anchorId = `sec-part-${sIdx}`;

      // Special highlight card styling
      let extraClass = '';
      if (sec.clean_title.includes('超越空间') || sec.clean_title.includes('空白')) {
        extraClass = 'gap-card';
      } else if (sec.clean_title.includes('因果识别') || sec.clean_title.includes('回归方程')) {
        extraClass = 'model-card';
      }

      // Parse markdown to HTML with KaTeX formulas protected and pre-rendered
      const htmlContent = renderMarkdown(sec.content);

      sectionCardsHtml += `
        <div id="${anchorId}" class="section-card ${extraClass}">
          <div class="section-card-header">
            <div class="section-card-title">
              <span>§${sIdx + 1}.</span>
              <span>${escapeHtml(sec.clean_title)}</span>
            </div>
            <span class="section-card-badge">${paper.id} - Part ${sIdx + 1}</span>
          </div>
          <div class="card-markdown-body">
            ${htmlContent}
          </div>
        </div>
      `;
    });

    // Previous and Next Paper Cards
    const prevPaper = state.currentIndex > 0 ? state.papers[state.currentIndex - 1] : null;
    const nextPaper = state.currentIndex < state.papers.length - 1 ? state.papers[state.currentIndex + 1] : null;

    const bottomDeckHtml = `
      <div class="bottom-paper-deck">
        ${prevPaper ? `
          <div class="bottom-deck-card" onclick="window.litReader.goToPaperByIndex(${state.currentIndex - 1})">
            <span class="deck-dir">◀ 上一篇 (${prevPaper.id})</span>
            <div class="deck-title">${escapeHtml(prevPaper.title)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(prevPaper.authors)} (${prevPaper.year})</div>
          </div>
        ` : '<div></div>'}
        ${nextPaper ? `
          <div class="bottom-deck-card" style="text-align: right;" onclick="window.litReader.goToPaperByIndex(${state.currentIndex + 1})">
            <span class="deck-dir" style="justify-content: flex-end;">下一篇 (${nextPaper.id}) ▶</span>
            <div class="deck-title">${escapeHtml(nextPaper.title)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(nextPaper.authors)} (${nextPaper.year})</div>
          </div>
        ` : '<div></div>'}
      </div>
    `;

    dom.articleContainer.innerHTML = `
      <!-- Hero Header Card -->
      <div class="article-hero-card">
        <div class="hero-top-badges">
          <span class="tier-badge ${tierBadgeClass}">${paper.tier_label}</span>
          <span class="score-badge-large">★ 综合量化评分：${paper.score} 分</span>
          <span style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); margin-left: auto;">
            文献编号：${paper.index} / 50 (${paper.id})
          </span>
        </div>

        <h1 class="hero-paper-title">${escapeHtml(paper.title)}</h1>

        <div class="hero-meta-grid">
          <div class="meta-grid-item">
            <span class="label">著者阵容 / Authors</span>
            <span class="value">${escapeHtml(paper.authors || 'N/A')}</span>
          </div>
          <div class="meta-grid-item">
            <span class="label">发表学刊 / Journal</span>
            <span class="value" style="font-style: italic;">${escapeHtml(paper.journal || 'N/A')}</span>
          </div>
          <div class="meta-grid-item">
            <span class="label">出版年份 / Year</span>
            <span class="value">${paper.year || 'N/A'} 年</span>
          </div>
          <div class="meta-grid-item">
            <span class="label">DOI 外部直达 / Link</span>
            <span class="value">
              ${paper.doi ? `<a href="${paper.doi}" target="_blank" rel="noopener">打开原文 ↗</a>` : 'N/A'}
            </span>
          </div>
          <div class="meta-grid-item">
            <span class="label">被引频次 / Citations</span>
            <span class="value">🔥 ${paper.citations} 次</span>
          </div>
        </div>

        <div class="hero-hypotheses-row">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">核心假说支撑：</span>
          ${hypPillsHtml}
        </div>
      </div>

      <!-- Free Annotation & Note-taking Card -->
      <div class="annotation-card" id="annotation-card-${paper.id}">
        <div class="annotation-card-header">
          <div class="annotation-title-group">
            <span class="annotation-card-title">✍️ 个人学术研读批注 & 思考备忘</span>
            <span class="annotation-status-badge saved" id="annotation-status-badge">✅ 已就绪 (本地实时存储)</span>
          </div>
          <div class="annotation-header-actions">
            <button class="annotation-action-btn export" onclick="window.litReader.exportAnnotationsJson()" title="将所有50篇文献的批注导出为一个独立 JSON 文件备份">
              💾 导出全部批注 JSON
            </button>
            <button class="annotation-action-btn" onclick="window.litReader.triggerImportAnnotations()" title="从已有 JSON 文件恢复或导入批注">
              📥 导入批注 JSON
            </button>
            <button class="annotation-action-btn clear" onclick="window.litReader.clearPaperAnnotation('${paper.id}')" title="清空本篇文献的批注">
              🗑️ 清空本篇
            </button>
          </div>
        </div>

        <!-- Quick Tag Chips -->
        <div class="annotation-quick-tags">
          <span class="quick-tags-label">快捷插入研读标签：</span>
          <button class="tag-chip" onclick="window.litReader.insertAnnotationTag('[🎯 组会必讲] ')">+ 组会必讲</button>
          <button class="tag-chip tag-h1" onclick="window.litReader.insertAnnotationTag('[💡 支撑H1] ')">+ 支撑H1</button>
          <button class="tag-chip tag-h2" onclick="window.litReader.insertAnnotationTag('[💡 支撑H2] ')">+ 支撑H2</button>
          <button class="tag-chip tag-h3" onclick="window.litReader.insertAnnotationTag('[💡 支撑H3] ')">+ 支撑H3</button>
          <button class="tag-chip tag-model" onclick="window.litReader.insertAnnotationTag('[📐 计量模型启发] ')">+ 计量模型</button>
          <button class="tag-chip tag-advisor" onclick="window.litReader.insertAnnotationTag('[❓ 请教若林老师] ')">+ 请教若林老师</button>
          <button class="tag-chip" onclick="window.litReader.insertAnnotationTag('[🔍 本文空白/批判] ')">+ 本文空白</button>
        </div>

        <textarea 
          id="paper-annotation-textarea" 
          class="annotation-textarea" 
          placeholder="在此自由记录你对本文的独到见解、计量识别思考、对毕业论文 H1~H3 假说的启发、组会汇报备忘等...\n输入内容将自动保存在本地浏览器中，可随时一键导出为 JSON 文件备份。"
          oninput="window.litReader.handleAnnotationInput(this.value)"
        >${escapeHtml(noteText)}</textarea>

        <div class="annotation-card-footer">
          <span class="annotation-footer-tip">💡 批注已自动保存在本地浏览器中。点击右上角【💾 导出全部批注 JSON】可随时导出备份，转移电脑也能一键【📥 导入】继续！</span>
          <span class="annotation-char-count" id="annotation-char-count">${noteCharCount} 字</span>
        </div>
      </div>

      <!-- Detailed Section Cards (In-page anchor pill bar removed) -->
      <div class="article-sections-wrap">
        ${sectionCardsHtml}
      </div>

      <!-- Bottom Paging Deck -->
      ${bottomDeckHtml}
    `;
  }

  // Render Slide Mode (Flip Card)
  function renderSlideView(paper) {
    const tierBadgeClass = paper.tier === 'P1' ? 'tier-badge-p1' : 'tier-badge-p2';

    // Extract key sections: Abstract, Model, Findings, Gap
    let abstractContent = '';
    let modelContent = '';
    let findingsContent = '';
    let gapContent = '';

    paper.sections.forEach(sec => {
      if (sec.clean_title.includes('摘要')) abstractContent = sec.content;
      if (sec.clean_title.includes('回归方程') || sec.clean_title.includes('因果识别')) modelContent = sec.content;
      if (sec.clean_title.includes('估计结果') || sec.clean_title.includes('系数拆解')) findingsContent = sec.content;
      if (sec.clean_title.includes('超越空间') || sec.clean_title.includes('空白')) gapContent = sec.content;
    });

    const parsedAbstract = renderMarkdown(abstractContent);
    const parsedModel = renderMarkdown(modelContent);
    const parsedFindings = renderMarkdown(findingsContent);
    const parsedGap = renderMarkdown(gapContent);

    dom.slideContainer.innerHTML = `
      <div class="slide-deck-view">
        <div class="slide-paper-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 8px;">
              <span class="tier-badge ${tierBadgeClass}">${paper.id}</span>
              <span class="score-badge-large">★ ${paper.score} 分</span>
            </div>
            <div style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">
              Slide ${state.currentIndex + 1} of 50
            </div>
          </div>

          <h2 style="font-size: 22px; font-family: var(--font-serif); line-height: 1.4; color: var(--text-primary);">
            ${escapeHtml(paper.title)}
          </h2>

          <div style="font-size: 13.5px; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            👤 ${escapeHtml(paper.authors)} ｜ 🏛️ <em>${escapeHtml(paper.journal)}</em> (${paper.year})
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="section-card" style="margin-bottom: 0;">
              <h4 style="margin-bottom: 10px; color: var(--primary);">📑 核心摘要与立论起点</h4>
              <div class="card-markdown-body" style="font-size: 14px;">${parsedAbstract}</div>
            </div>

            <div class="section-card model-card" style="margin-bottom: 0;">
              <h4 style="margin-bottom: 10px; color: var(--text-highlight);">📐 计量识别模型与方程</h4>
              <div class="card-markdown-body" style="font-size: 14px;">${parsedModel}</div>
            </div>

            <div class="section-card gap-card" style="margin-bottom: 0;">
              <h4 style="margin-bottom: 10px; color: var(--accent-gold);">🚀 何同学修论超越空间 (Research Gap)</h4>
              <div class="card-markdown-body" style="font-size: 14px;">${parsedGap}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <button class="nav-btn" onclick="window.litReader.goToPrevPaper()" ${state.currentIndex === 0 ? 'disabled' : ''}>
              ◀ 上一篇 (A)
            </button>
            <span style="font-size: 12px; color: var(--text-muted);">使用键盘 ← / → 翻页</span>
            <button class="nav-btn" onclick="window.litReader.goToNextPaper()" ${state.currentIndex === state.papers.length - 1 ? 'disabled' : ''}>
              下一篇 (D) ▶
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Render Matrix Mode (50 Papers Comparison Table)
  function renderMatrixView() {
    let rowsHtml = '';
    state.filteredPapers.forEach((paper, i) => {
      const badgeClass = paper.tier === 'P1' ? 'badge-p1' : 'badge-p2';
      const isStarred = state.starredIds.includes(paper.id);
      const isRead = state.readIds.includes(paper.id);
      const hasNote = !!getPaperAnnotationText(paper.id).trim();

      rowsHtml += `
        <tr style="cursor: pointer;" onclick="window.litReader.openPaperFromMatrix('${paper.id}')">
          <td style="font-family: var(--font-mono); font-weight: 600;">${i + 1}</td>
          <td><span class="paper-id-badge ${badgeClass}">${paper.id}</span></td>
          <td>
            <span style="color: ${isStarred ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-size: 14px;">${isStarred ? '★' : '☆'}</span>
            <span style="color: ${isRead ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-size: 12px; margin-left: 4px;">${isRead ? '✓' : '○'}</span>
            ${hasNote ? '<span style="margin-left: 4px;" title="有批注">✍️</span>' : ''}
          </td>
          <td><strong>${paper.score}</strong></td>
          <td style="font-weight: 600; color: var(--text-primary); max-width: 320px;">
            ${escapeHtml(paper.title)}
          </td>
          <td style="white-space: nowrap;">${escapeHtml(getShortAuthors(paper.authors))}</td>
          <td><em>${escapeHtml(paper.journal)}</em></td>
          <td>${paper.year}</td>
          <td>${paper.hypotheses.map(h => `<span class="hyp-tag">${h}</span>`).join(' ')}</td>
          <td>
            <button class="action-btn" style="padding: 3px 8px; font-size: 11px;" onclick="event.stopPropagation(); window.litReader.openPaperFromMatrix('${paper.id}')">
              阅读 ↗
            </button>
          </td>
        </tr>
      `;
    });

    dom.matrixContainer.innerHTML = `
      <div class="matrix-view-container">
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 20px; font-weight: 700;">📊 先行研究 50 篇全景对比总矩阵表</h2>
            <p style="font-size: 13px; color: var(--text-secondary);">共收录 50 篇特级核心实证与理论机制文献，支持按任意字段过滤与快速调阅。</p>
          </div>
          <button class="nav-btn" onclick="window.litReader.exportMatrixCsv()">
            📥 导出到 Excel (CSV)
          </button>
        </div>

        <div class="matrix-table-card">
          <div style="overflow-x: auto;">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>编号</th>
                  <th>状态</th>
                  <th>评分</th>
                  <th>论文原题 (Title)</th>
                  <th>第一著者</th>
                  <th>发表学刊</th>
                  <th>年份</th>
                  <th>假说对应</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Switch View Mode
  function switchViewMode(mode) {
    state.viewMode = mode;

    dom.btnModeSubpage.classList.toggle('active', mode === 'subpage');
    dom.btnModeSlide.classList.toggle('active', mode === 'slide');
    dom.btnModeMatrix.classList.toggle('active', mode === 'matrix');

    dom.viewSubpage.style.display = mode === 'subpage' ? 'block' : 'none';
    dom.viewSlide.style.display = mode === 'slide' ? 'block' : 'none';
    dom.viewMatrix.style.display = mode === 'matrix' ? 'block' : 'none';

    if (mode === 'subpage') {
      renderSubpageView(state.currentPaper);
    } else if (mode === 'slide') {
      renderSlideView(state.currentPaper);
    } else if (mode === 'matrix') {
      renderMatrixView();
    }
  }

  // Navigation functions
  function goToPrevPaper() {
    if (state.currentIndex > 0) {
      renderPaper(state.currentIndex - 1);
    }
  }

  function goToNextPaper() {
    if (state.currentIndex < state.papers.length - 1) {
      renderPaper(state.currentIndex + 1);
    }
  }

  function goToPaperByIndex(idx) {
    if (idx >= 0 && idx < state.papers.length) {
      renderPaper(idx);
    }
  }

  function openPaperFromMatrix(paperId) {
    const idx = state.papers.findIndex(p => p.id === paperId);
    if (idx !== -1) {
      switchViewMode('subpage');
      renderPaper(idx);
    }
  }

  // Star / Bookmark actions
  function toggleStarCurrentPaper() {
    if (!state.currentPaper) return;
    toggleStarPaper(state.currentPaper.id);
  }

  function toggleStarPaper(paperId) {
    const idx = state.starredIds.indexOf(paperId);
    if (idx !== -1) {
      state.starredIds.splice(idx, 1);
      showToast(`已取消收藏 ${paperId}`);
    } else {
      state.starredIds.push(paperId);
      showToast(`★ 已收藏 ${paperId}`);
    }
    localStorage.setItem('lit_reader_starred', JSON.stringify(state.starredIds));
    renderSidebarList();
    renderPaper(state.currentIndex);
  }

  // Read status actions
  function toggleReadCurrentPaper() {
    if (!state.currentPaper) return;
    const paperId = state.currentPaper.id;
    const idx = state.readIds.indexOf(paperId);
    if (idx !== -1) {
      state.readIds.splice(idx, 1);
      showToast(`已标为未读`);
    } else {
      state.readIds.push(paperId);
      showToast(`✓ 已标为已读`);
    }
    localStorage.setItem('lit_reader_read', JSON.stringify(state.readIds));
    renderSidebarList();
    renderPaper(state.currentIndex);
  }

  // ==========================================================================
  // Annotation Management & JSON Persistence
  // ==========================================================================
  let saveDebounceTimer = null;

  function getPaperAnnotationText(paperId) {
    const note = state.annotations[paperId];
    if (!note) return '';
    if (typeof note === 'string') return note;
    return note.text || '';
  }

  function handleAnnotationInput(val) {
    if (!state.currentPaper) return;
    const paperId = state.currentPaper.id;
    const badge = document.getElementById('annotation-status-badge');
    const counter = document.getElementById('annotation-char-count');

    if (badge) {
      badge.textContent = '⏳ 正在保存...';
      badge.className = 'annotation-status-badge saving';
    }
    if (counter) {
      counter.textContent = `${val.length} 字`;
    }

    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      if (!val || val.trim() === '') {
        delete state.annotations[paperId];
      } else {
        state.annotations[paperId] = {
          paperId: paperId,
          paperTitle: state.currentPaper.title,
          authors: state.currentPaper.authors,
          year: state.currentPaper.year,
          text: val,
          updatedAt: new Date().toISOString()
        };
      }
      localStorage.setItem('lit_reader_annotations', JSON.stringify(state.annotations));

      if (badge) {
        badge.textContent = '✅ 已自动保存到本地';
        badge.className = 'annotation-status-badge saved';
      }

      // Update badge in sidebar card
      renderSidebarList();
    }, 350);
  }

  function insertAnnotationTag(tag) {
    const textarea = document.getElementById('paper-annotation-textarea');
    if (!textarea) return;

    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, startPos) + tag + currentVal.substring(endPos);
    textarea.value = newVal;
    textarea.focus();
    textarea.setSelectionRange(startPos + tag.length, startPos + tag.length);

    handleAnnotationInput(newVal);
  }

  function clearPaperAnnotation(paperId) {
    if (!paperId) return;
    if (confirm(`确定要清空文献 [${paperId}] 的所有研读批注吗？`)) {
      delete state.annotations[paperId];
      localStorage.setItem('lit_reader_annotations', JSON.stringify(state.annotations));

      const textarea = document.getElementById('paper-annotation-textarea');
      if (textarea) textarea.value = '';

      const badge = document.getElementById('annotation-status-badge');
      if (badge) {
        badge.textContent = '已清空本篇批注';
        badge.className = 'annotation-status-badge';
      }

      const counter = document.getElementById('annotation-char-count');
      if (counter) counter.textContent = '0 字';

      renderSidebarList();
      showToast(`已清空文献 ${paperId} 的批注`);
    }
  }

  function exportAnnotationsJson() {
    const annotatedKeys = Object.keys(state.annotations);
    const count = annotatedKeys.length;

    const exportData = {
      metadata: {
        project: "Academic Literature Reader",
        description: "Exported literature annotations and reading notes",
        exportTime: new Date().toISOString(),
        totalAnnotated: count,
        totalPapersInSystem: state.papers.length
      },
      annotations: state.annotations
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = `literature_annotations_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`💾 已成功导出 ${count} 篇文献批注为 JSON 文件！`);
  }

  function triggerImportAnnotations() {
    const fileInput = document.getElementById('import-annotation-file-input');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handleAnnotationFileImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        let newAnnotations = {};

        if (parsed.annotations && typeof parsed.annotations === 'object') {
          newAnnotations = parsed.annotations;
        } else if (typeof parsed === 'object') {
          newAnnotations = parsed;
        }

        let importCount = 0;
        Object.keys(newAnnotations).forEach(key => {
          if (newAnnotations[key]) {
            state.annotations[key] = newAnnotations[key];
            importCount++;
          }
        });

        localStorage.setItem('lit_reader_annotations', JSON.stringify(state.annotations));

        // Re-render UI
        renderSidebarList();
        if (state.currentPaper) {
          renderSubpageView(state.currentPaper);
        }

        showToast(`📥 成功导入 ${importCount} 篇文献的研读批注！`);
      } catch (err) {
        alert('导入 JSON 文件失败，请检查文件格式是否有效：' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  // Copy APA Citation
  function copyCurrentApa() {
    if (!state.currentPaper) return;
    const apa = state.currentPaper.apa || `${state.currentPaper.authors} (${state.currentPaper.year}). ${state.currentPaper.title}. ${state.currentPaper.journal}.`;
    navigator.clipboard.writeText(apa).then(() => {
      showToast('📋 已复制 APA 7th 参考文献条目');
    });
  }

  // Copy BibTeX
  function copyCurrentBibtex() {
    if (!state.currentPaper) return;
    const bib = state.currentPaper.bibtex;
    if (bib) {
      navigator.clipboard.writeText(bib).then(() => {
        showToast('📋 已复制 BibTeX 代码');
      });
    } else {
      showToast('未找到该文献的 BibTeX');
    }
  }

  // Export Matrix to CSV
  function exportMatrixCsv() {
    let csv = '序号,编号,著者,年份,学刊,综合评分,论文标题,假说支撑\n';
    state.filteredPapers.forEach((p, idx) => {
      const cleanTitle = `"${p.title.replace(/"/g, '""')}"`;
      const cleanAuthors = `"${p.authors.replace(/"/g, '""')}"`;
      const cleanJournal = `"${p.journal.replace(/"/g, '""')}"`;
      csv += `${idx + 1},${p.id},${cleanAuthors},${p.year},${cleanJournal},${p.score},${cleanTitle},"${p.hypotheses.join(';')}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `先行研究50选_全景矩阵表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('📥 已导出 CSV 表格');
  }

  // Theme Management
  function cycleTheme() {
    const themes = ['light', 'dark', 'sepia'];
    const nextIdx = (themes.indexOf(state.theme) + 1) % themes.length;
    applyTheme(themes[nextIdx]);
  }

  function applyTheme(theme) {
    state.theme = theme;
    dom.body.setAttribute('data-theme', theme);
    localStorage.setItem('lit_reader_theme', theme);
    
    const icons = { light: '☀️', dark: '🌙', sepia: '📜' };
    dom.themeToggleBtn.textContent = icons[theme] || '☀️';
  }

  // Font Size Management
  function changeFontSize(delta) {
    const newSize = Math.max(13, Math.min(20, state.fontSize + delta));
    applyFontSize(newSize);
  }

  function applyFontSize(size) {
    state.fontSize = size;
    document.documentElement.style.setProperty('--reader-font-size', `${size}px`);
    localStorage.setItem('lit_reader_fontsize', size);
  }

  // Sidebar Toggle
  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    dom.body.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  }

  // Toast Notification
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2400);
  }

  // Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getShortAuthors(authors) {
    if (!authors) return '';
    const parts = authors.split(',');
    if (parts.length > 2) {
      return `${parts[0].trim()} et al.`;
    }
    return authors;
  }

  // Scrolling functions
  function scrollPage(ratio) {
    const container = dom.appContent || document.querySelector('.app-content');
    if (!container) return;
    const delta = container.clientHeight * ratio;
    container.scrollBy({ top: delta, behavior: 'smooth' });
  }

  function scrollToTop() {
    const container = dom.appContent || document.querySelector('.app-content');
    if (!container) return;
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToBottom() {
    const container = dom.appContent || document.querySelector('.app-content');
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  // Expose to window for inline onclick & onchange handlers
  window.litReader = {
    goToPrevPaper,
    goToNextPaper,
    goToPaperByIndex,
    openPaperFromMatrix,
    exportMatrixCsv,
    scrollPage,
    scrollToTop,
    scrollToBottom,
    // Annotation methods
    handleAnnotationInput,
    insertAnnotationTag,
    clearPaperAnnotation,
    exportAnnotationsJson,
    triggerImportAnnotations,
    handleAnnotationFileImport
  };

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
