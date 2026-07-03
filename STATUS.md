# 个人网站 · 运营状态存档

> 最后更新：2026-07-03。这份文件记录部署链路的真实现状（包括没搞清楚的部分），避免每次换会话都从头排查一遍。

## 1. 当前的真实困境（重要，先看这个）

这个网站有**两套完全独立的托管方案**，目前状态混乱，还没彻底理清：

| 方案 | 状态 | 证据 |
|---|---|---|
| **GitHub Pages**（`harryjzhang69-web.github.io/personal-site`） | 能打开，但内容**停留在 2026-06-19**，此后十几次 git push（含 2026-07-03 加的"读书行动派"产品卡）全部没有反映上去 | 直接查 `Last-Modified` 响应头确认；`raw.githubusercontent.com` 上的源文件是最新的，证明 push 本身成功，只是 Pages 没有重新构建 |
| **EdgeOne Pages**（README 里写的正式方案，`harry-site.edgeone.app`） | **从未真正部署成功过** —— README 里这行链接从第一次提交到现在都是占位符"（部署后填）"，20次提交里 README 只被改过1次，从没填上过真实地址 | 翻了全部 git log，没有任何 `.github/workflows`、EdgeOne 配置文件、或 commit message 提到部署 |

**结论：这个网站现在对外可能其实是"半失效"状态**——GitHub Pages 链接能打开但内容旧；EdgeOne 从没配完。需要人工去两边控制台各确认一次：
1. `https://github.com/harryjzhang69-web/personal-site/settings/pages` —— 看 Source 配置、有没有报错提示
2. `https://console.cloud.tencent.com/edgeone/pages` —— 看项目列表是否存在，是否关联了 GitHub 仓库

## 2. MCP 自动部署工具的已知坑

CodeBuddy 里的 EdgeOne `deploy_folder` 工具，在当前环境下调用会报错缺少 `EDGEONE_PAGES_PROJECT_NAME` 参数——官方文档说这个参数可选（不设置应该会弹浏览器让你选/建项目），但当前集成环境里这个跳转没有触发，工具本身也没开放"直接传项目名"的参数，AI 侧目前无法绕过。

**可行的替代方案**：手动打包 zip 拖拽上传到 EdgeOne Pages 控制台。已经生成过一份 `personal_site/harry-site.zip`（含最新代码），但**最后一步"拖到控制台"用户还没确认完成**。

## 3. 已知内容改动（代码层面确认已完成，只是不确定线上是否反映）

- 2026-07-03：在 Case Studies 板块加了"读书行动派"产品卡（Mac 窗口壳 Demo + 4项数据标签 + 双按钮CTA），代码已 push 到 GitHub 确认成功

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

**这两块内容能不能被外部人正常访问，取决于第1节说的部署问题**——如果 GitHub Pages 没刷新/EdgeOne 没配完，这两个子页面外部也大概率打不开或者是旧版本。

## 4. 技术栈 & 文件结构

纯静态 HTML/CSS/JS，零依赖，设计参考 Linear。详见 `README.md`。

## 5. 下次接手时该做的第一件事

不要再假设"push 了就会自动生效"。先让用户去上面两个控制台各截一张图，根据实际情况判断是：
(a) 修复 GitHub Pages 构建 ，还是
(b) 重新走一遍 EdgeOne 手动部署，还是
(c) 干脆两个都保留、其中一个当 staging
