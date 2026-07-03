# Harry 独立产品全集 · 总索引

> 这是所有产品的唯一入口文档。任何新会话/新电脑，只要读这一份文件，就能知道 Harry 名下所有独立产品的现状、代码仓库、部署情况，并能顺着链接进每个仓库看更详细的 `STATUS.md`。
> 最后更新：2026-07-03
> GitHub 账号：https://github.com/harryjzhang69-web

## 产品总览

| 产品 | 一句话定位 | 代码仓库 | 线上/分发方式 | 详细状态 |
|---|---|---|---|---|
| 📖 读书行动派 | 把一本书变成"跟你有关的启发+能立刻做的事" | [book-action-mvp](https://github.com/harryjzhang69-web/book-action-mvp) | 网页版，直连 `http://21.91.155.2:5800/`（推荐，零确认页）；也有 `https://harry-product.loca.lt`（好记名字但有确认页） | 仓库内 `STATUS.md` |
| 🔮 命由我造 Fortune AI | 懂你的 AI 命理树洞（八字+易经+对话） | [fortune-ai](https://github.com/harryjzhang69-web/fortune-ai) | 仅本地 CLI/API，**未部署公网** | 仓库内 `STATUS.md` |
| 🎓 AI 学习宝典 | 离线 AI 全栈学习软件（驾考宝典式） | [ai-study-app](https://github.com/harryjzhang69-web/ai-study-app) | Windows 桌面 `.exe`，直接分发文件 | 仓库内 `STATUS.md` |
| 🐱 坐姿监督员 | 摄像头AI坐姿监督 + 养成系桌宠 | [posture-guard](https://github.com/harryjzhang69-web/posture-guard) | Windows 桌面 `.exe`，直接分发文件 | 仓库内 `STATUS.md` |
| 🌐 个人网站（本仓库） | 产品橱窗型个人品牌站 | [personal-site](https://github.com/harryjzhang69-web/personal-site) | ⚠️ 部署链路混乱未理清，见本仓库 `STATUS.md` | 仓库内 `STATUS.md` |

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
