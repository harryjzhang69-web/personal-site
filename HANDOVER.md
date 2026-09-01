# HANDOVER · Harry 的产品与网站交接索引

> 这份文档用于公开仓库交接。只保留可公开的信息，不记录 API Key、Project ID、服务器地址、登录令牌或本机绝对路径。
>
> 最后更新：2026-08-31

---

## 0. 一句话现状

个人网站是一个「AI 产品橱窗」，托管在 GitHub Pages。所有产品源码都在 GitHub；网页型产品采用静态前端加云函数部署，桌面型产品通过 GitHub 或邮件分发。

- 网站线上地址：https://harryjzhang69-web.github.io/personal-site/
- 网站源码仓库：https://github.com/harryjzhang69-web/personal-site
- GitHub 账号：`harryjzhang69-web`

---

## 1. 产品总清单

| # | 产品 | 状态 | 在线入口说明 | GitHub 源码仓库 |
|---|------|------|-------------|----------------|
| 1 | 坐姿监督员 PostureGuard | v4.2.2 已上线 | 邮件申请下载 | `posture-guard` |
| 2 | 罗盘 Compass | MVP 公测 | `personal-site/products/compass/index.html` 静态体验 | `fortune-ai` |
| 3 | AI 自测宝典 | 已上线 | GitHub 领取 | `personal-site/products/ai-bible` + `ai-study-app` |
| 4 | 内容多面手 Content Studio | 入口维护中 | 等待新正式地址回填 | `content-creator-tool` |
| 5 | 读书行动派 Book Action | 入口维护中 | 等待新正式地址回填 | `book-action-mvp` |
| 6 | AI PM 模拟面试官 | 入口维护中 | 等待新正式地址回填 | `pm-interviewer` |
| 7 | AI 职场人格测试 Career Persona | 入口维护中 | 等待新正式地址回填 | `career-persona` |
| 8 | AI 简历诊断器 Resume Doctor | 入口维护中 | 等待新正式地址回填 | `resume-doctor` |

> 另有 `harry-agent-course` 仓库，暂未在网站上架为产品卡片。

---

## 2. 仓库映射

| 仓库 | 用途 |
|------|------|
| `personal-site` | 网站本体，含静态产品页与产品卡片 |
| `book-action-mvp` | 读书行动派主仓，含 EdgeOne 部署包 |
| `content-creator-tool` | 内容多面手主仓 |
| `pm-interviewer` | AI PM 模拟面试官主仓 |
| `career-persona` | AI 职场人格测试主仓 |
| `resume-doctor` | AI 简历诊断器主仓 |
| `posture-guard` | 坐姿监督员源码 |
| `fortune-ai` | 罗盘完整版源码 |
| `ai-study-app` | AI 自测宝典刷题软件源码 |

---

## 3. 部署原则

### 3.1 EdgeOne Pages

网页型产品优先使用 EdgeOne Pages 的静态前端与 Node Functions。部署时使用：

```powershell
cd <部署目录>
npx --yes edgeone@latest pages deploy . -n <项目名> -a overseas --json
```

注意：

- 不要把带 `eo_token` 的预览链接写进个人站。
- 平台默认域名只用于验证，不作为长期正式入口。
- 最终统一绑定自己的固定子域名，再回填到个人站。
- 环境变量只在控制台配置，不写进源码。

### 3.2 GitHub Pages

个人网站通过 GitHub Pages 发布：

```powershell
git add -A
git commit -m "说明本次修改"
git push
```

发布后检查首页、产品按钮、移动端布局和 Compass 静态页。

---

## 4. 环境变量

所有模型密钥只保存在部署平台环境变量或本机未提交的 `.env` 文件中。仓库只提交 `.env.example`。

常见变量名：

```text
ZHIPU_API_KEY=<在部署平台配置>
LLM_API_KEY=<在部署平台配置>
LLM_MODEL=glm-4.7-flash
```

代码在缺少密钥时应进入演示模式或返回清晰错误，不能回退到源码内置密钥。

---

## 5. 恢复步骤

```powershell
git clone https://github.com/harryjzhang69-web/personal-site.git
git clone https://github.com/harryjzhang69-web/book-action-mvp.git
git clone https://github.com/harryjzhang69-web/content-creator-tool.git
git clone https://github.com/harryjzhang69-web/posture-guard.git
git clone https://github.com/harryjzhang69-web/fortune-ai.git
git clone https://github.com/harryjzhang69-web/ai-study-app.git
git clone https://github.com/harryjzhang69-web/harry-agent-course.git
git clone https://github.com/harryjzhang69-web/pm-interviewer.git
git clone https://github.com/harryjzhang69-web/career-persona.git
git clone https://github.com/harryjzhang69-web/resume-doctor.git
```

克隆后：

1. 先复制 `.env.example` 并在本机或部署平台填入新密钥。
2. 再修改网页与部署配置。
3. 每次部署完成后都先做健康检查，再更新个人站入口。

---

## 6. 发布前检查

```bash
curl -I "https://产品地址"
curl -sL "https://产品地址" | grep -i "Tencent Edgeone"
```

通过标准：

1. HTTP 状态码是 `200`
2. 页面标题不是 `Tencent Edgeone`
3. 核心按钮或输入框可见
4. 控制台无阻塞性错误

---

## 7. 当前待办

- [ ] 重新部署 Content Studio / Book Action / PM Interviewer / Career Persona / Resume Doctor
- [ ] 给五个网页产品绑定固定子域名
- [ ] 回填个人站产品卡片入口
- [ ] 清理旧提交历史中的敏感信息
