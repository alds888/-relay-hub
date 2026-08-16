# ⚡ Relay Hub - 中转站聚合导航

一个干净、快速、可定制的中转站资源聚合站。Cloudflare Pages 免费部署,全球 CDN 加速。

## ✨ 特性

- 🌓 **暗色模式** (默认开,跟随系统)
- 🔍 **实时搜索** (标题/标签/描述模糊匹配)
- 📑 **分类筛选** (AI/API/网盘/下载/工具)
- 📋 **一键复制链接**
- 📱 **移动端适配**
- ⚡ **零依赖,纯静态** (一个 JSON 文件就能改全部内容)
- 🚀 **CDN 全球加速** (Cloudflare Pages)

## 📁 文件结构

```
relay-hub/
├── index.html         # 主页
├── sites.json         # 👈 在这里改站点数据
├── assets/
│   ├── style.css      # 样式
│   └── app.js         # 渲染逻辑
└── README.md
```

## 🚀 部署到 Cloudflare Pages

### 方式 1: GitHub 连接 (推荐,自动部署)

1. **上传到 GitHub**
   ```bash
   cd relay-hub
   git init
   git add .
   git commit -m "init: relay hub"
   git branch -M main
   git remote add origin https://github.com/你的用户名/relay-hub.git
   git push -u origin main
   ```

2. **登录 Cloudflare Dashboard**
   - 进入 [dash.cloudflare.com](https://dash.cloudflare.com)
   - 左侧菜单 **Workers 和 Pages** → **创建** → **Pages** → **连接到 Git**

3. **配置构建**
   - 选择刚创建的仓库
   - 构建命令:**留空** (纯静态)
   - 构建输出目录:**留空** 或填 `/`
   - 点击 **保存并部署**

4. **完成**
   - 1-2 分钟后会得到 `xxx.pages.dev` 域名
   - 以后 `git push` 自动触发部署

### 方式 2: 直接拖拽上传

1. Cloudflare Dashboard → **Workers 和 Pages** → **创建** → **Pages** → **直接上传**
2. 把整个 `relay-hub/` 文件夹压缩成 zip 拖进去
3. 完成

## 🌐 绑定自定义域名

1. Cloudflare Pages 项目页 → **自定义域** → **设置自定义域**
2. 输入你的域名 → Cloudflare 会自动添加 DNS 记录
3. 等几分钟 SSL 证书自动签发,搞定

## 📝 添加/修改站点

编辑 `sites.json`,按格式添加:

```json
{
  "name": "站点名",
  "url": "https://...",
  "category": "ai",          // ai / api / cloud / download / tools
  "desc": "站点描述",
  "tags": ["标签1", "标签2"],
  "badges": ["hot"],          // 可选: hot / new / free
  "note": "💎 高质量",        // 卡片底部小字
  "updated": "2026-08-16"     // 更新日期
}
```

加完直接 `git push`,1 分钟后自动上线。

## 🎨 自定义主题

编辑 `assets/style.css` 顶部的 CSS 变量:

```css
:root {
  --primary: #f6821f;    /* 主色 (默认 Cloudflare 橙) */
}
```

## 📜 License

MIT - 拿去用,不用客气。