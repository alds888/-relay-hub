/* =========================================================
   Relay Hub - 中转站导航
   纯静态 · 无依赖 · 开箱即用
   ========================================================= */

const CATEGORY_META = {
  'all':       { icon: '🌐', label: '全部' },
  'ai':        { icon: '🤖', label: 'AI 中转' }
};

let allSites = [];
let sitesMeta = {};
let currentCategory = 'all';
let currentKeyword = '';

/* ---------- 初始化 ---------- */
async function init() {
  initTheme();
  bindEvents();

  try {
    const res = await fetch('sites.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // 兼容两种格式: { sites: [...] } 或 直接数组 [...]
    allSites = Array.isArray(data) ? data : (data.sites || []);
    sitesMeta = { version: data.version, updated: data.updated };
    renderTabs();
    render();
    updateLastUpdated();
  } catch (err) {
    console.error('加载 sites.json 失败:', err);
    document.getElementById('card-grid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <p>⚠️ 数据加载失败</p>
        <p class="empty-hint">${err.message}</p>
      </div>
    `;
  }
}

/* ---------- 主题切换 ---------- */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'dark'); // 默认暗色
  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ---------- 事件绑定 ---------- */
function bindEvents() {
  // 搜索
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', e => {
    currentKeyword = e.target.value.trim().toLowerCase();
    render();
  });

  // 快捷键 /
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  // 主题
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

/* ---------- 渲染分类 Tab ---------- */
function renderTabs() {
  const tabs = document.getElementById('category-tabs');
  const used = new Set(allSites.map(s => s.category));
  const order = ['all', ...Object.keys(CATEGORY_META).filter(k => k !== 'all' && used.has(k))];

  tabs.innerHTML = order.map(cat => {
    const meta = CATEGORY_META[cat] || { icon: '📦', label: cat };
    const count = cat === 'all'
      ? allSites.length
      : allSites.filter(s => s.category === cat).length;
    return `
      <button class="tab ${cat === currentCategory ? 'active' : ''}" data-cat="${cat}">
        ${meta.icon} ${meta.label} (${count})
      </button>
    `;
  }).join('');

  tabs.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      renderTabs();
      render();
    });
  });
}

/* ---------- 筛选 ---------- */
function filter() {
  return allSites.filter(s => {
    // 分类
    if (currentCategory !== 'all' && s.category !== currentCategory) return false;
    // 关键词
    if (!currentKeyword) return true;
    const haystack = [
      s.name, s.desc || '', s.url,
      ...(s.tags || [])
    ].join(' ').toLowerCase();
    return haystack.includes(currentKeyword);
  });
}

/* ---------- 渲染卡片 ---------- */
function render() {
  const list = filter();
  const grid = document.getElementById('card-grid');
  const empty = document.getElementById('empty-state');
  const stats = document.getElementById('stats');

  stats.textContent = `共 ${allSites.length} 个站点,当前显示 ${list.length} 个`;

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = list.map(site => {
    const meta = CATEGORY_META[site.category] || { icon: '📦' };
    const badges = (site.badges || []).map(b => {
      const cls = `badge-${b}`;
      const txt = { hot: '热门', new: '新', free: '免费' }[b] || b;
      return `<span class="badge ${cls}">${txt}</span>`;
    }).join('');

    const tags = (site.tags || []).slice(0, 4)
      .map(t => `<span class="tag">#${t}</span>`).join('');

    const safeUrl = escapeHtml(site.url);

    return `
      <a class="card" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
        <div class="card-header">
          <div class="card-icon">${meta.icon}</div>
          <div class="card-title">
            <span>${escapeHtml(site.name)}</span>
            <div class="card-badges">${badges}</div>
          </div>
        </div>
        <div class="card-desc">${escapeHtml(site.desc || '')}</div>
        <div class="card-tags">${tags}</div>
        <div class="card-footer">
          <span>${escapeHtml(site.note || '')}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="card-copy" data-url="${safeUrl}" onclick="event.preventDefault();event.stopPropagation();copyUrl(this);">复制</button>
            <span class="card-visit">访问 →</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

/* ---------- 复制链接 ---------- */
async function copyUrl(btn) {
  const url = btn.dataset.url;
  try {
    await navigator.clipboard.writeText(url);
    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.color = 'var(--primary)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1200);
  } catch (e) {
    // 降级方案
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

/* ---------- 元信息 ---------- */
function updateLastUpdated() {
  const el = document.getElementById('last-updated');
  // 优先用 sites.json 顶层的 updated,否则从所有站点里取最新
  if (sitesMeta.updated) {
    el.textContent = sitesMeta.updated;
    return;
  }
  const latest = allSites
    .map(s => s.updated)
    .filter(Boolean)
    .sort()
    .pop();
  if (latest) {
    el.textContent = latest;
  } else {
    el.textContent = new Date().toISOString().slice(0, 10);
  }
}

/* ---------- 工具 ---------- */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 全局暴露
window.copyUrl = copyUrl;

/* 启动 */
document.addEventListener('DOMContentLoaded', init);

/* ---------- 收录表单（AJAX 提交到 Formspree） ---------- */
function initSubmitForm() {
  const form = document.getElementById('submit-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) {
      status.className = 'form-status';
      status.textContent = '提交中...';
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        if (status) {
          status.className = 'form-status success';
          status.textContent = '✅ 提交成功！我们会尽快审核。';
        }
        form.reset();
      } else {
        const data = await resp.json().catch(() => ({}));
        const msg = (data && data.errors && data.errors.map(function(x){return x.message;}).join('; ')) || '提交失败，请稍后重试。';
        if (status) {
          status.className = 'form-status error';
          status.textContent = '❌ ' + msg;
        }
      }
    } catch (err) {
      if (status) {
        status.className = 'form-status error';
        status.textContent = '❌ 网络错误，请稍后重试。';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// 包装原 init，在原逻辑执行后再绑定表单
const _origInit = init;
init = function() {
  _origInit();
  initSubmitForm();
};
