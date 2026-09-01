# 个人网站 · 运营状态存档

> 最后更新：2026-07-03 19:30。这份文件记录部署链路的真实现状，避免每次换会话都从头排查一遍。

## 0. ✅ 正式对外链接（2026-07-03 已修复，直接用这个）

**https://harryjzhang69-web.github.io/personal-site/**

GitHub Pages 现在是正常工作的，`git push` 后 1-2 分钟自动更新，不需要走任何临时方案。

### 根因 + 修复方式（重要，别再踩同一个坑）
- **根因**：GitHub Pages 默认用 Jekyll 处理静态站点；这是个纯 HTML/CSS/JS 项目，没有 `.nojekyll` 时 Jekyll 构建在某次之后开始**静默失败**，导致站点停在最后一次成功构建（卡在 2026-06-19，此后十几次 push 全部没生效，包括加的"读书行动派"卡片）
- **修复**：在仓库根目录加一个空文件 `.nojekyll`，跳过 Jekyll 处理，直接输出原始文件。提交后验证 `Last-Modified` 头变成当天日期，内容确认最新
- **如果以后又卡住**：先检查 `.nojekyll` 文件是否还在仓库根目录（别不小心被删/被 .gitignore 掉），这是最大概率的复发原因

### 临时应急方案（已弃用，仅记录）
问题修复前，为了让用户立刻看到效果，曾经把网站也临时挂到一台旧云服务器的静态端口上（`python3 -m http.server`，非持久化，服务器重启会挂）。GitHub Pages 修好后这条不再是主链路。

### EdgeOne Pages（README 里写的"正式方案"，实际从未配完，现在也不需要它了）
`harry-site.edgeone.app` 这个链接从第一次提交到现在都是占位符，从没真正部署成功过。既然 GitHub Pages 已经修好且稳定，**不再需要折腾 EdgeOne**，除非以后想要国内访问加速这类额外收益。

## 2. MCP 自动部署工具的已知坑（EdgeOne相关，现已不需要，仅存档）

CodeBuddy 里的 EdgeOne `deploy_folder` 工具，在当前环境下调用会报错缺少 `EDGEONE_PAGES_PROJECT_NAME` 参数——工具本身没开放"直接传项目名"的参数，AI 侧目前无法绕过。既然 GitHub Pages 已修好，这个坑不再影响主链路，除非未来主动想启用 EdgeOne。

## 3. 已知内容改动（已确认线上生效）

- 2026-07-03：Case Studies 板块加了"读书行动派"产品卡，已确认在 https://harryjzhang69-web.github.io/personal-site/ 上正常显示

## 3.5 仓库内藏的两个产品子页面（容易被漏看，2026-07-03 才重新发现）

`personal_site` 仓库根目录下有个 `products/` 文件夹，装了两个之前做的东西，首页已经链接过去了，但很容易在"梳理全部产品"时漏掉：

### `products/compass/`（罗盘 · Compass）
- 一个**独立可跑的静态网页小产品**：易经起卦（摇钱/报数/时间三种起卦法）+ AI对话镜子
- 首页 Case Studies 的"罗盘·Compass"卡片两个按钮都指向 `./products/compass/index.html`
- ⚠️ **AI 对话目前是写死的脚本演示版（4轮固定对话），没有接真实大模型**——页面自己承认"完整版接入 DeepSeek/通义千问后才会真正基于问题回应"
- ⚠️ **与 `fortune_ai` 仓库是两个互不相关的半成品**：`fortune_ai` 是 Python 后端+真实八字/易经计算引擎，但没做网页/没部署；`compass` 是纯前端网页+假AI脚本，但没接真实后端。两者概念高度重合（都是"易经+AI"），需要决定是"打通合并"还是"各自独立发展成不同产品"
- 卦象历史存 localStorage（浏览器本地），不上服务器

### `products/ai-bible/`
- 不是网页，是 GitHub 仓库内的**下载区**：`AI学习宝典.exe` + 使用说明 + 10章学习资料 docx
- 首页按钮直链到 `github.com/harryjzhang69-web/personal-site/tree/main/products/ai-bible` 供人下载
- 跟独立的 `ai-study-app` 仓库是同一个产品，这里只是把发行版文件也放了一份在 personal-site 仓库里方便下载（有点冗余，两处都要同步更新才不会给出旧版本）

这两块内容现在跟着 GitHub Pages 一起正常访问了（部署问题已在第0节修复）。

## 4. 技术栈 & 文件结构

纯静态 HTML/CSS/JS，零依赖，设计参考 Linear。详见 `README.md`。

## 5. 日常更新流程（现在就是标准 git 工作流，不用再折腾别的）

```powershell
cd c:\Users\Harryjzhang\CodeBuddy\Claw\personal_site
git add .
git commit -m "说明改了什么"
git push
```
1-2 分钟后 https://harryjzhang69-web.github.io/personal-site/ 自动更新。**别删 `.nojekyll` 文件**。
