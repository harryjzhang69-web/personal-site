# Harry 独立产品全集 · 总索引

> 这是所有产品的唯一入口文档。任何新会话/新电脑，只要读这一份文件，就能知道 Harry 名下所有独立产品的现状、代码仓库、部署情况，并能顺着链接进每个仓库看更详细的 `STATUS.md`。
> 最后更新：2026-07-03
> GitHub 账号：https://github.com/harryjzhang69-web

## 产品总览

| 产品 | 一句话定位 | 代码仓库 | 线上/分发方式 | 详细状态 |
|---|---|---|---|---|
| 🎯 AI PM 模拟面试官 | AI 扮演大厂面试官，会追问 + 出结构化面试报告，和 AI 自测宝典组成求职工具链 | [pm-interviewer](https://github.com/harryjzhang69-web/pm-interviewer)（待建） | 网页版全栈，目标 EdgeOne Pages（**待部署**）；本地 `pm-interviewer-eop/` 已完成，`node _serve_pm.js` 可预览 | 仓库内 `README.md` |
| 📖 读书行动派 | 把一本书变成"跟你有关的启发+能立刻做的事" | [book-action-mvp](https://github.com/harryjzhang69-web/book-action-mvp) | 网页版，当前正式地址为 `https://farrahli-59gv2jsp.edgeone.app/` | 仓库内 `STATUS.md` |
| 🔮 命由我造 Fortune AI | 懂你的 AI 命理树洞（八字+易经+对话） | [fortune-ai](https://github.com/harryjzhang69-web/fortune-ai) | 仅本地 CLI/API，**未部署公网** | 仓库内 `STATUS.md` |
| 🎓 AI 学习宝典 | 离线 AI 全栈学习软件（驾考宝典式） | [ai-study-app](https://github.com/harryjzhang69-web/ai-study-app) | Windows 桌面 `.exe`，直接分发文件 | 仓库内 `STATUS.md` |
| 🐱 坐姿监督员 | 摄像头AI坐姿监督 + 养成系桌宠 | [posture-guard](https://github.com/harryjzhang69-web/posture-guard) | Windows 桌面 `.exe`，直接分发文件 | 仓库内 `STATUS.md` |
| 🌐 个人网站（本仓库） | 产品橱窗型个人品牌站 | [personal-site](https://github.com/harryjzhang69-web/personal-site) | ✅ https://harryjzhang69-web.github.io/personal-site/ （已修复，push即自动更新） | 仓库内 `STATUS.md` |

## ⚠️ 藏在 personal-site 仓库里的两个"半成品子产品"（容易漏看，2026-07-03 发现）

不是独立仓库，是 `personal-site/products/` 目录下的子页面，首页已经链接过去了：

| 子产品 | 位置 | 状态 |
|---|---|---|
| 罗盘 · Compass | `personal-site/products/compass/` | 纯前端静态网页（易经起卦+AI对话），**AI对话是写死脚本，没接真实大模型**。跟「命由我造 Fortune AI」概念重合但代码不通用，需决定合并还是各自发展 |
| AI 自测宝典下载区 | `personal-site/products/ai-bible/` | 只是把 `ai-study-app` 仓库的发行版 exe+资料又存了一份在这里方便下载，**跟独立仓库是同一产品，两处都要同步更新** |

## 资源管理原则（独立开发者标准做法）

- **每个产品各自一个独立 GitHub 仓库**，不混在一起 —— 方便单独迭代、单独开源/私有、单独部署
- **打包产物（exe/zip/dist，几百MB级别）一律 `.gitignore` 排除**，仓库里只存源码，避免超过 GitHub 100MB 单文件限制
- **`.env`（API Key等敏感信息）一律 `.gitignore` 排除**，不进公开仓库；换电脑/环境需要照 `.env.example` 手动重建
- **本地路径统一在** `c:\Users\Harryjzhang\CodeBuddy\Claw\<product_folder>\`
- Git 凭证已用 Git Credential Manager 缓存登录状态，push 不需要每次重新登录

## 换电脑 / 新会话的标准恢复流程

1. 打开这份文件（或让 AI 读这份文件），了解全部产品现状
2. 需要改哪个产品，`git clone` 对应仓库到本地
3. 读该仓库的 `STATUS.md` 了解详细的部署地址、已知问题、决策原因
4. 该产品如果需要 `.env`，照 `.env.example` 重新配置（不会自动带过来，这是特意设计的安全隔离）
5. 云端服务（目前只有"读书行动派"部署在 AnyDev 云服务器）不受本地电脑影响，随时能访问

## 每次产品有重大变更时的维护约定

改完一个产品的架构/部署方式/踩过的坑之后，**同步更新该仓库的 `STATUS.md`**，而不是只让 AI 记在对话记忆里——这样下次换电脑/换会话，任何人指向 GitHub 都能立刻读懂全部上下文。
