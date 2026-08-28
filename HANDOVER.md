# HANDOVER · Harry 的产品与网站交接索引

> 这份文档是给「未来的 Harry / 换电脑后的任何 AI Agent」看的**总索引**。
> 只要读这一份，就能知道：有哪些产品、每个产品的源码在哪个 GitHub 仓库、
> 线上地址是什么、怎么重新部署、需要什么密钥。**不依赖任何本地聊天记录。**
>
> 最后更新：2026-08-28

---

## 0. 一句话现状

个人网站是一个「AI 产品橱窗」，托管在 GitHub Pages，展示 6 个自研 AI 产品。
所有产品源码都在 GitHub（换电脑 `git clone` 即可恢复），在线体验托管在 EdgeOne Pages。

- 网站线上地址：https://harryjzhang69-web.github.io/personal-site/
- 网站源码仓库：https://github.com/harryjzhang69-web/personal-site
- GitHub 账号：`harryjzhang69-web`

---

## 1. 产品总清单（网站 Case Studies）

| # | 产品 | 状态 | 在线体验（公开可访问） | GitHub 源码仓库 |
|---|------|------|----------------------|----------------|
| 1 | 坐姿监督员 PostureGuard | v4.2.2 已上线 | 邮件申请下载（395MB exe，不上网/GitHub） | `posture-guard`（Python） |
| 2 | 罗盘 Compass | MVP 公测 | `/products/compass/index.html`（随站静态版） | `fortune-ai`（Python，完整版） |
| 3 | AI 自测宝典 | 已上线 | GitHub 领取（35MB exe + 13 docx + 350 题） | `personal-site/products/ai-bible` + 独立仓库 `ai-study-app`（刷题软件源码） |
| 4 | 内容多面手 Content Studio | MVP 公测 | https://content-creator-b2t3mvre.edgeone.dev | `content-creator-tool`（JS） |
| 5 | 读书行动派 Book Action | MVP 公测 | https://book-action-hdimehxt.edgeone.dev | `book-action-mvp`（HTML） |
| 6 | AI PM 模拟面试官 | MVP 公测 | https://pm-mock-interview-exqcihvq.edgeone.dev | `pm-interviewer`（独立仓库）+ `personal-site/products/pm-interviewer`（随站镜像） |
| 7 | AI 职场人格测试 Career Persona | MVP 公测 | https://career-persona-zvkhs7bt.edgeone.dev | `career-persona`（独立仓库，本地 `career-persona-eop/`） |
| 8 | AI 简历诊断器 Resume Doctor | MVP 公测 | https://resume-doctor-5cc5rzsf.edgeone.dev | `resume-doctor`（独立仓库，本地 `resume-doctor-eop/`） |

> 另有 `harry-agent-course` 仓库（本地目录 `agentcraft/`）是「Harry Agent 课程」，暂未在网站上架为产品卡片。

---

## 2. 本地目录 → GitHub 仓库 映射（换电脑前对照）

> 说明：这是「上一台电脑」工作区 `CodeBuddy/20260703194511` 下的目录情况。
> 换电脑后不要依赖本地目录，一切以 GitHub 仓库为准（见第 4 节恢复步骤）。

| 本地目录 | GitHub 仓库 | 用途 |
|---------|------------|------|
| `personal-site/` | `personal-site` | 网站本体（含 ai-bible / compass 静态版 / pm-interviewer 源码归档） |
| `book_action_full/` | `book-action-mvp` | 读书行动派：源码主仓（含 `eop_deploy/`） |
| `book_action_eop/` | （无独立 git，=部署包） | 读书行动派：EdgeOne 部署包 |
| `content-creator-tool/` | `content-creator-tool` | 内容多面手：源码主仓 |
| `content-creator-eop/` | （无独立 git，=部署包） | 内容多面手：EdgeOne 部署包 |
| `pm-interviewer-eop/` | `pm-interviewer` | AI PM 面试官：源码主仓 + EdgeOne 部署包（也随站镜像在 personal-site/products/pm-interviewer） |
| `agentcraft/` | `harry-agent-course` | Agent 课程 |
| 坐姿监督员源码 | `posture-guard` | 本工作区无，只在 GitHub |
| 罗盘完整版源码 | `fortune-ai` | 本工作区无，只在 GitHub |
| 自测宝典刷题软件 | `ai-study-app` | 本工作区无，只在 GitHub |

---

## 3. 通用技术信息（部署 / 密钥 / 区域）

### 3.1 智谱 API Key（所有 AI 产品共用，免费 GLM）
```
Key       : c663637ee1e04f53888de5818b0d3283.gDm5WG1iuCyMCEgv
Base URL  : https://open.bigmodel.cn/api/paas/v4
文本模型  : glm-4-flash / glm-4.7-flash
生图模型  : cogview-3-flash
多模态    : glm-4v-flash
```
- 该 Key 已**硬编码兜底**进各 EdgeOne 部署包的 `node-functions/_shared.js`，所以部署后开箱即用、无需在控制台配环境变量。
- 更安全的做法：在 EdgeOne Pages 项目「环境变量」里配 `ZHIPU_API_KEY` / `LLM_API_KEY` 覆盖。

### 3.2 EdgeOne Pages 部署命令（全栈：静态前端 + node-functions 后端）
```powershell
cd <部署包目录>   # 如 book_action_eop / content-creator-eop / pm-interviewer-eop
npx --yes edgeone@latest pages deploy . -n <项目名> -a overseas --json
```
- **务必带 `-a overseas`**：得到 `*.edgeone.dev` 域名，海外网络可公开访问（无需 token）。
- **不要用默认/global**：会得到 `*.edgeone.cool` 域名，任何访问都要带「3 小时就失效的 eo_token」，无法公开挂网站。
- CLI 返回的 URL 末尾 `?eo_token=...` 只是首访预览参数，`.dev` 域名去掉它也能打开。
- ⚠️ `.dev` 公开域名**中国大陆网络访问会 401**（EdgeOne 合规机制）。想让大陆也能稳定访问，唯一正规办法是**绑自定义域名**（overseas 区免备案）。
- 登录态：CLI 用本地 login token。换电脑需重新登录（`npx edgeone login` 或在 IDE 里连接 EdgeOne 集成）。

### 3.3 各产品 EdgeOne 项目对照
| 产品 | EdgeOne 项目名 | Project ID | 区域 |
|------|--------------|-----------|------|
| 读书行动派 | book-action | makers-hauppjlfxrg0 | overseas（.dev 公开）|
| 内容多面手 | content-creator | makers-2th2rehtra2b | overseas（.dev 公开）|
| AI PM 面试官 | pm-mock-interview | makers-jom5ez82vory | overseas（.dev 公开）|
| AI 职场人格测试 | career-persona | makers-sncqiwgt4rs8 | overseas（.dev 公开）|
| AI 简历诊断器 | resume-doctor | makers-quqopdjvpkdz | overseas（.dev 公开）|

> 注：曾建过 `book-action-mvp`(global,.cool) 和 `pm-interviewer`(global,.cool) 两个「需 token」的废项目，已弃用，可在控制台删除，不要用它们的地址。
> ★ 部署新产品时若拿到 `.edgeone.cool` 域名（需 token）而非 `.edgeone.dev`，换一个项目名重新 deploy 一次通常就会给 `.dev` 公开域名。

### 3.4 网站发布（GitHub Pages）
```powershell
cd personal-site
git add -A
git commit -m "说明这次改了什么"
git push
# GitHub Pages 1-3 分钟自动重建；HTML 有 CDN 缓存，最长约 10 分钟全量生效
```
> `push.ps1` 脚本第 47 行有个未转义单引号的 bug，直接用上面的 git 命令即可。

---

## 4. 换电脑后的恢复步骤（照做即可）

```powershell
# 1. 把所有仓库 clone 到新电脑
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

# 2. 改网站：编辑 personal-site/index.html → git push（见 3.4）
# 3. 重新部署某个 AI 产品：进对应部署包目录跑 3.2 的命令
#    - 读书行动派：book-action-mvp 仓库里的 eop_deploy/ 就是部署包
#    - 内容多面手：content-creator-tool 仓库（如无 eop 包，参考 personal-site 里的结构）
#    - AI PM 面试官：pm-interviewer 仓库本身就是完整可部署源码（也在 personal-site/products/pm-interviewer/ 有镜像）
# 4. 智谱 Key 已内置，部署完直接能用真实 AI
```

### 待办 / 已知缺口
- [x] ~~AI PM 面试官独立仓库~~ 已建好：https://github.com/harryjzhang69-web/pm-interviewer （2026-08-28）
- [ ] 三个公开产品的 `.dev` 域名在中国大陆会 401，若要面向大陆用户，需绑自定义域名。
- [ ] 坐姿监督员成品 exe（395MB）走邮件分发，未在任何仓库；源码在 `posture-guard`。
