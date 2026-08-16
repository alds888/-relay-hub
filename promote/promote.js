// ============================================
// Promote Page - 推广页交互
// 继承主站 theme 切换,加点小跟踪
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // 主题切换按钮(主站 app.js 已绑定过,这里只确保图标对得上)
  const applyThemeIcon = () => {
    const theme = document.documentElement.dataset.theme || 'dark';
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  applyThemeIcon();

  // CTA 按钮点击跟踪(可选,提升发光效果)
  const ctaButtons = document.querySelectorAll('a[href*="agentrouter.org"]');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('[relay-hub] CTA clicked:', btn.textContent.trim().slice(0, 30));
    });
  });

  // FAQ 手风琴效果加强(可选,details 元素已经够用)
  // 暂无额外逻辑
});