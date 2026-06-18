# Harry · Personal Site

> 一个产品经理的个人品牌站。
> 极简、克制、自有可控。

🌐 **Live**: [https://harry-site.edgeone.app](#) （部署后填）

---

## 🛠️ 技术栈

- **零依赖**纯静态 HTML / CSS / JS
- 设计语言参考 [Linear](https://linear.app)
- 字体：Inter + JetBrains Mono + Noto Serif SC
- 托管：[EdgeOne Pages](https://pages.edgeone.com/) （腾讯，国内访问快）
- 仓库：GitHub

---

## 📁 文件结构

```
personal_site/
├── index.html          # 主页（单页，含全部 section）
├── assets/
│   ├── style.css       # 样式（CSS 变量驱动主题切换）
│   ├── main.js         # 交互（主题、滚动高亮、入场动画）
│   └── favicon.svg     # 站点图标
├── deploy.ps1          # 一键打包 zip
├── push.ps1            # 一键 git push
└── README.md
```

---

## ⚡ 本地预览

```powershell
cd personal_site
py -m http.server 8080
# 浏览器打开 http://localhost:8080
```

---

## 🚀 部署流程

### 第一次：

1. 安装 Git: https://git-scm.com/download/win
2. 注册 GitHub 账号: https://github.com/signup
3. 创建仓库 `personal-site`
4. 跑 `.\push.ps1`（按提示输入仓库地址）
5. 在 EdgeOne Pages 后台关联仓库

### 后续：

改完任何文件，跑：
```powershell
.\push.ps1 "更新了关于页"
```

EdgeOne 会自动检测到 push，几秒后全网更新。

---

## ✏️ 文案替换

打开 `index.html`，搜索 `{{`，替换占位符：

| 占位符 | 含义 |
|---|---|
| `{{your@email.com}}` | 邮箱 |
| `{{wechat_id}}` | 微信号 |
| `{{玄镜 Harry}}` | 公众号名 |
| `{{https://...}}` | 各平台主页链接 |
| `{{Shenzhen}}` | 城市 |
| `{{2026.06.18}}` | 更新日期 |

---

## 📜 License

MIT — 你看到的所有代码都可以自由复用。
