# AI PM 模拟面试官 · PM Interviewer —— EdgeOne Pages 全栈部署版

AI 扮演大厂产品面试官：选岗位 + 题型 → 出主问题 → **像真面试官一样追问深挖** → 约 5 题后生成一份结构化面试评估报告（4 维度打分 + 亮点 / 短板 + 3 条可执行建议 + 高分答题框架）。

和「AI 自测宝典」组成一条 `学知识 → 实战演练 → 拿 offer` 的 AI PM 求职工具链。

## 目录结构

```
pm-interviewer-eop/
  index.html                    # 前端单页（配置 / 面试对话 / 报告 三段式）
  style.css                     # 样式（浅色专业风 + 品牌紫）
  script.js                     # 前端逻辑 + 无后端时的演示兜底
  edgeone.json                  # EdgeOne 项目配置（写死项目名 + Node maxDuration）
  node-functions/
    _shared.js                  # 共享：prompts + 智谱 GLM 调用 + 演示模式兜底
    api/interview.js            # POST /api/interview  每轮出题 / 追问 / 收尾
    api/report.js               # POST /api/report     生成结构化面试报告
```

## 技术架构

与 `content-creator-eop`、`book_action_eop` 完全同源：EdgeOne Pages Node Functions，
前端与 `/api/*` 同域部署，后端代理调用智谱，API Key 走环境变量不入代码。

- 文本模型：智谱 **GLM-4.7-Flash**（免费 flash，关思考提速），命中 1305「访问量过大」会自动重试
- 两个接口都接收 `{ role, type, history }`，`history` 是 `[{q, a}]` 的完整问答记录
- 面试官引擎让模型输出 `{action, comment, question, is_followup, round}`，前端据此渲染追问节奏
- 报告引擎固定 4 个维度：结构化思维 / 产品 Sense 与判断 / 沟通表达 / 深度与抗压追问

## 部署前必须配置的环境变量

在 EdgeOne Pages 控制台的项目设置 → 环境变量里添加（不要写进代码）：

| 变量名 | 说明 | 示例 |
|---|---|---|
| `ZHIPU_API_KEY` | 智谱 API Key（必填，缺失则进入「演示模式」） | `xxxxxxxx.xxxx` |
| `LLM_MODEL` | 可选，文本模型，默认 `glm-4.7-flash` | `glm-4.7-flash` |

> 未配置 Key 时：后端会返回内置演示题库与示例报告，页面仍可完整跑通交互，方便先看效果。
> 纯本地双击 `index.html`（file://，无后端）时：前端也内置了同样的演示兜底。

## 岗位 / 题型

- 岗位 role：`ai-pm`（AI 产品经理）、`pm`（通用）、`data-pm`（数据）、`strategy-pm`（策略）
- 题型 type：`product-design`（产品设计）、`business-case`（商业 Case）、`behavioral`（行为面试）、`ai-product`（AI 产品专项）

## 本地预览

直接双击 `index.html` 即可体验完整流程（走前端演示兜底，非真实 AI）。
要跑真实 AI，部署到 EdgeOne Pages 并配好 `ZHIPU_API_KEY`。

## 出处

- 作者：Harry（清华硕士 · 前腾讯 PM · 转型 AI 产品）
- 个人产品橱窗：https://harryjzhang69-web.github.io/personal-site/
