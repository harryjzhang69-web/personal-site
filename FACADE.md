# FACADE

这份文件是整个产品矩阵的统一续做入口。

任何新的 agent 或维护者，不要先全仓乱翻；先读这份文件，再决定去哪个仓库、哪个页面、哪段代码继续。

## 目的

- 避免重复排查、重复修复、重复读代码
- 明确“哪个产品对应哪个仓库 / 页面 / 公开入口”
- 明确“哪里是当前真源，哪里只是展示入口”
- 保证每次修完后，GitHub 远端最终能成为最新可交接状态

## 续做顺序

1. 先读 `FACADE.md`
2. 再读 `HANDOVER.md`
3. 再看 `personal-site/index.html` 的产品卡片入口是否和真实产品状态一致
4. 如果某个产品要继续修，直接进入对应仓库，不要在无关目录反复搜索

## 真源原则

- 产品矩阵入口真源：`personal-site/index.html`
- 线上地址说明真源：`personal-site/HANDOVER.md`
- 某个产品的功能真源：该产品自己的仓库或 `personal-site/products/<product>/`
- 若公开 API 不可用：前端必须优先保证可访问，并自动降级到 demo / 演示模式

## 产品路由表

| 产品 | 主仓入口 | 代码真源 | 当前公开方式 | 说明 |
|---|---|---|---|---|
| 读书行动派 `Book Action` | `personal-site/products/book-action/index.html` | `book-action-mvp/` + `personal-site/products/book-action/` | 站内公开页 + demo fallback | 远端服务受限时自动展示演示结果 |
| AI PM 模拟面试官 `PM Interviewer` | `personal-site/products/pm-interviewer/index.html` | `pm-interviewer/` + `personal-site/products/pm-interviewer/` | 站内公开页 + demo fallback | 已可直接体验 |
| AI 职场人格测试 `Career Persona` | `personal-site/products/career-persona/index.html` | `career-persona/` + `personal-site/products/career-persona/` | 站内公开页 + demo fallback | 本轮已落到主站 products 目录 |
| AI 简历诊断器 `Resume Doctor` | `personal-site/products/resume-doctor/index.html` | `resume-doctor/` + `personal-site/products/resume-doctor/` | 站内公开页 + demo fallback | 本轮已落到主站 products 目录 |
| 罗盘 `Compass` | `personal-site/products/compass/index.html` | `personal-site/products/compass/` | 站内公开页 | 当前可直接访问 |
| AI 学习宝典 | `personal-site/products/ai-bible/` | `personal-site/products/ai-bible/` | GitHub 下载区 / 资源目录 | 不是交互式 web app |

## 维护规则

### 1. 先保入口，再保深功能

如果一个产品的远端服务挂了、401 了、域名失效了：

- 第一优先级：不要让用户点进死链
- 第二优先级：在站内给出公开页
- 第三优先级：即使后端不可用，也要能展示 demo 结果

### 2. 一处修入口，多处对齐

如果产品状态变了，至少同步这几个位置：

- `personal-site/index.html`
- `personal-site/HANDOVER.md`
- 对应产品页的 CTA / crosslink / backlink

### 3. GitHub 最新态原则

每次修完后：

1. 先本地验证
2. 再提交到对应仓库
3. 最后 push 到 GitHub

如果 push 失败，不要假装远端已更新；必须明确记录：

- 哪个仓库本地领先远端
- 哪些页面只是本地预览版
- 哪些公网链接仍是旧版本

## 当前已知事实

- 本地预览地址 `127.0.0.1` 只对当前电脑可见，不等于公网可访问
- 当前多个仓库存在“本地已提交、远端未更新”的情况
- GitHub push 目前仍受鉴权限制，恢复公网最新版本前必须先完成远端推送

## 给未来 agent 的一句话

不要从“全盘重新理解项目”开始，而是从“这次要修哪一个产品入口 / 哪一条真实用户路径”开始。
