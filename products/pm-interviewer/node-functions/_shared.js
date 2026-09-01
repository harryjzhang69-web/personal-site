// AI PM 模拟面试官 —— 共享逻辑（prompts + 智谱 GLM 调用 + 演示模式兜底）
// 架构对齐 content-creator-eop / book_action_eop：EdgeOne Node Functions，Node 运行时，支持 fetch。
// 文本模型：智谱 GLM-4.7-Flash（免费 flash，关思考提速）。
//
// API Key 从 EdgeOne 控制台「环境变量」读取，不硬编码，避免公开仓库泄露：
//   ZHIPU_API_KEY = 你的智谱Key   （也兼容 LLM_API_KEY）
//   LLM_MODEL     = 可选，默认 glm-4.7-flash
// 未配置 Key 时自动进入「演示模式」，用内置题库跑通交互，方便先看效果。

const TEXT_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const DEFAULT_MODEL = 'glm-4.7-flash';
// 不再提供真实模型的源码兜底 Key。
// 未配置环境变量时自动进入演示模式，避免公开仓库泄露密钥。
const DEFAULT_ZHIPU_KEY = '';

function getConfig(env) {
  const key = (env && (env.ZHIPU_API_KEY || env.LLM_API_KEY)) || DEFAULT_ZHIPU_KEY;
  const model = (env && env.LLM_MODEL) || DEFAULT_MODEL;
  return { key, model };
}

// ============================ 岗位 / 题型 元信息 ============================
const ROLE_LABELS = {
  'pm': '通用产品经理',
  'ai-pm': 'AI 产品经理',
  'data-pm': '数据产品经理',
  'strategy-pm': '策略产品经理'
};

const TYPE_LABELS = {
  'product-design': '产品设计题',
  'business-case': '商业 / Case 分析题',
  'behavioral': '行为面试（BQ）',
  'ai-product': 'AI 产品专项题'
};

// 每种题型给面试官的考察重点提示
const TYPE_FOCUS = {
  'product-design':
    '主问题形如「请为 XX 人群设计一个 YY 产品 / 功能」。重点考候选人是否有清晰的「目标—用户—场景—方案—优先级—衡量指标」结构，敢做取舍，能定义成功指标。',
  'business-case':
    '主问题形如「XX 公司要不要做 YY」或「某核心指标突然下跌，你怎么分析」。重点考商业判断、结构化拆解（MECE）、对数据的敏感度和假设验证能力。',
  'behavioral':
    '主问题形如「讲一个你推动跨部门协作 / 从 0 到 1 / 处理线上事故的经历」。用 STAR（情境-任务-行动-结果）追问，重点考真实性、候选人本人的具体贡献、以及事后反思。',
  'ai-product':
    '主问题围绕大模型 / AI 产品，如「如何设计并评估一个 XX 的 AI 功能」「怎么定义这个 Agent 的效果指标」「幻觉 / 成本 / 延迟三者怎么权衡」。重点考对 AI 能力边界、评测体系、数据飞轮、成本与体验取舍的真实理解，而非概念堆砌。'
};

const TOTAL_QUESTIONS = 5; // 一场面试的主问题 + 追问总数目标

const DIMENSION_NAMES = ['结构化思维', '产品 Sense 与判断', '沟通表达', '深度与抗压追问'];

// ============================ 工具函数 ============================
function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra
  };
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: corsHeaders() });
}

function parseTextJson(rawText) {
  let raw = (rawText || '').trim();
  raw = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');
  // 兜底：截取第一个 { 到最后一个 } 之间的内容，避免模型偶尔带前后缀
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first > 0 || (last !== -1 && last < raw.length - 1)) {
    raw = raw.slice(first, last + 1);
  }
  return JSON.parse(raw);
}

function labelOf(map, key, fallback) {
  return map[key] || fallback;
}

function historyToText(history) {
  if (!Array.isArray(history) || !history.length) return '（面试尚未开始，这是第一个问题）';
  return history
    .map((turn, i) => {
      const q = (turn && turn.q) || '';
      const a = (turn && turn.a) || '';
      return `第${i + 1}问【面试官】：${q}\n【候选人】：${a || '（未作答）'}`;
    })
    .join('\n\n');
}

// ============================ Prompts ============================
function buildInterviewSystemPrompt(role, type) {
  const roleLabel = labelOf(ROLE_LABELS, role, '产品经理');
  const typeLabel = labelOf(TYPE_LABELS, type, '产品设计题');
  const focus = TYPE_FOCUS[type] || TYPE_FOCUS['product-design'];

  return `你是一位资深的互联网大厂产品面试官（做过一线 PM，也带过团队），正在面试一位应聘「${roleLabel}」岗位的候选人。本场面试聚焦「${typeLabel}」。

本题型考察重点：${focus}

你要像真实面试官一样主导一场结构化面试，规则如下：
1. 一场面试总共问约 ${TOTAL_QUESTIONS} 个问题（含追问）。你会看到到目前为止的完整问答记录。
2. 出题节奏：先抛一道有代表性、贴合上述考察重点的主问题；候选人回答后，针对其回答里【模糊、缺数据支撑、逻辑跳跃、没考虑 tradeoff、没讲清目标用户 / 场景】的地方做 1~2 次追问。追问要具体、扎到点子上（例如「你说要提升留存，具体盯哪个留存指标？为什么是它而不是次留？」），不要泛泛。
3. 追问是面试官的核心能力，别浅尝辄止；但同一道主问题连续追问不要超过 2 次，深挖够了就换下一道主问题。
4. comment 字段：用面试官口吻，对候选人刚才的回答给一句真实的即时反馈——可以认可，也可以直接点出问题，不要每句都夸，保持专业和一点点压迫感。这是第一个问题时 comment 留空字符串。
5. 当已经问了约 ${TOTAL_QUESTIONS} 个问题、且你对候选人能力已有足够判断时，action 返回 "finish"，question 留空字符串。

严格只输出如下 JSON（不要 markdown 代码块、不要任何多余文字、不要注释）：
{"action":"ask 或 finish","comment":"对候选人上一回答的即时反馈；第一个问题时留空","question":"你要问的下一个问题；finish 时留空","is_followup":true 或 false,"round":当前是第几个问题的整数}`;
}

function buildReportSystemPrompt(role, type) {
  const roleLabel = labelOf(ROLE_LABELS, role, '产品经理');
  const typeLabel = labelOf(TYPE_LABELS, type, '产品设计题');

  return `你是一位资深互联网产品面试官兼评估官。下面会给你一场「${roleLabel} · ${typeLabel}」模拟面试的完整问答记录。请基于候选人的真实回答，给出一份客观、专业、能真正帮他进步的面试评估报告。

要求：
- 评分要有区分度，不要一律高分；回答空泛、敷衍、答非所问的要敢打低分（50 分以下也正常）。
- dimensions 固定这 4 个维度，name 严格用：「结构化思维」「产品 Sense 与判断」「沟通表达」「深度与抗压追问」。每个维度给 0-100 的整数分，外加一句具体点评（要引用他回答里的具体表现，不要泛泛）。
- highlights（亮点）与 weaknesses（短板）各 2-3 条，都要具体到他到底说了什么。
- suggestions 给 3 条可以立刻执行的改进建议。
- model_answer：挑本场最核心的一道题，给出一个「高分回答应该具备的结构 / 关键要点」——是答题框架和 point，不是大段范文，控制在 200 字内。
- overall_score 为 4 个维度的综合判断（不必是简单平均），level 用一句话定级。

严格只输出如下 JSON（不要 markdown、不要多余文字、不要注释）：
{"overall_score":整数,"level":"一句话定级，例如：接近高级产品经理水平，但 AI 深度不足","dimensions":[{"name":"结构化思维","score":整数,"comment":"..."},{"name":"产品 Sense 与判断","score":整数,"comment":"..."},{"name":"沟通表达","score":整数,"comment":"..."},{"name":"深度与抗压追问","score":整数,"comment":"..."}],"highlights":["...","..."],"weaknesses":["...","..."],"suggestions":["...","...","..."],"model_answer":"..."}`;
}

// ============================ 智谱调用 + 重试 ============================
function isTransientTextError(err) {
  const m = (err && err.message) || '';
  return /访问量过大|1305|rate.?limit|too many|请稍后|稍后再试|忙|overload/i.test(m);
}

async function callZhipuText(env, systemPrompt, userContent, temperature) {
  const { key, model } = getConfig(env);
  const resp = await fetch(TEXT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      thinking: { type: 'disabled' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  });

  const json = await resp.json();
  if (!resp.ok) {
    throw new Error((json && json.error && json.error.message) || `智谱请求失败 (${resp.status})`);
  }
  const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
  if (!content) throw new Error('智谱未返回有效内容');
  return content;
}

async function runTextGeneration(env, systemPrompt, userContent, temperature) {
  const maxRetries = 4;
  let lastErr;
  let sawTransient = false;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callZhipuText(env, systemPrompt, userContent, temperature);
    } catch (err) {
      lastErr = err;
      if (isTransientTextError(err) && attempt < maxRetries - 1) {
        sawTransient = true;
        await new Promise((r) => setTimeout(r, 2500 + attempt * 2500));
        continue;
      }
      break;
    }
  }
  if (sawTransient) {
    const e = new Error('AI 面试官当前访问量过大，请过 10 秒左右再点一次');
    e.code = 'BUSY';
    throw e;
  }
  throw lastErr;
}

// ============================ 演示模式（未配置 Key 时兜底） ============================
const DEMO_FLOW = {
  'product-design': [
    { comment: '', question: '请为「独居、下班很晚的年轻上班族」设计一款帮他们「回家 15 分钟内吃上热饭」的产品或功能，先讲讲你的整体思路。', is_followup: false },
    { comment: '方向有了，但我更想听落地。', question: '你刚提到会推荐菜谱 / 速食，那你用什么指标判断这个推荐做得好不好？为什么是这个指标？', is_followup: true },
    { comment: '指标想得还行。', question: '如果上线后发现很多人只看不动手，你会怎么定位问题出在哪一环？', is_followup: true },
    { comment: '嗯，那我们看看你的取舍能力。', question: '如果资源只够做一个核心功能，其它全砍掉，你留哪个？为什么？', is_followup: false },
    { comment: '好。', question: '最后一个：这个产品要怎么赚钱？你会怎么设计商业化，又不伤用户体验？', is_followup: false }
  ],
  'business-case': [
    { comment: '', question: '假设你是微信读书的产品负责人，团队在讨论「要不要上线短视频讲书」。你怎么判断这件事该不该做？', is_followup: false },
    { comment: '框架搭起来了，具体点。', question: '你说要看它对核心指标的影响，那微信读书的北极星指标你认为是什么？为什么？', is_followup: true },
    { comment: '', question: '换个真实场景：某天你发现 App 的次日留存突然掉了 5%，给你半小时，你怎么排查？', is_followup: false },
    { comment: '排查思路可以。', question: '如果最后定位到是一次版本更新引入的，但已经上线三天了，你下一步怎么决策？', is_followup: true },
    { comment: '好。', question: '最后：如果让你给这个业务定一个未来一年最该投入的方向，你会选什么，怎么论证？', is_followup: false }
  ],
  'behavioral': [
    { comment: '', question: '讲一个你推动跨部门协作、但一开始阻力很大的经历。先说说当时的情境和你的目标。', is_followup: false },
    { comment: '情境清楚了。', question: '具体是你做了哪些动作让局面改变的？我想听你本人做了什么，而不是团队做了什么。', is_followup: true },
    { comment: '', question: '结果怎么样？有没有可量化的成效？', is_followup: true },
    { comment: '嗯。', question: '如果现在让你重新做一次这件事，你会改哪里？', is_followup: false },
    { comment: '好。', question: '再讲一个：你做过的最失败 / 最后悔的一个产品决策，以及你从中学到了什么。', is_followup: false }
  ],
  'ai-product': [
    { comment: '', question: '假设让你设计一个「面向 C 端用户的 AI 学习助手」，你会怎么定义它的核心功能和效果指标？', is_followup: false },
    { comment: '功能列了不少，但我关心怎么衡量好坏。', question: '你打算怎么评估这个 AI 助手「回答得好不好」？人工评测和自动评测你会怎么搭？', is_followup: true },
    { comment: '', question: 'AI 产品绕不开幻觉、成本、延迟三者的权衡。在你这个产品里，你会优先牺牲哪个、保住哪个？为什么？', is_followup: false },
    { comment: '取舍讲清楚了。', question: '你怎么让这个产品越用越好？说说你设想的数据飞轮。', is_followup: true },
    { comment: '好。', question: '最后：如果基座模型明年能力翻倍，你现在做的哪些功能会被「模型进步」直接吃掉？你怎么规避这个风险？', is_followup: false }
  ]
};

function demoInterview(type, history) {
  const flow = DEMO_FLOW[type] || DEMO_FLOW['product-design'];
  const asked = Array.isArray(history) ? history.length : 0;
  const isFirst = asked === 0;
  if (asked >= flow.length) {
    return { action: 'finish', comment: '好，今天的面试就到这里，我们来看看整体表现。', question: '', is_followup: false, round: asked, demo: true };
  }
  const step = flow[asked];
  return {
    action: 'ask',
    comment: isFirst ? '' : step.comment || '',
    question: step.question,
    is_followup: !!step.is_followup,
    round: asked + 1,
    demo: true
  };
}

function demoReport(role, type) {
  return {
    overall_score: 76,
    level: '（演示模式）接近中高级产品经理水平，结构清晰但深度和数据支撑有提升空间',
    dimensions: [
      { name: '结构化思维', score: 82, comment: '（演示数据）回答有明显框架，先讲目标再讲方案，条理清楚。' },
      { name: '产品 Sense 与判断', score: 74, comment: '（演示数据）取舍意识不错，但对用户真实场景的洞察还偏表层。' },
      { name: '沟通表达', score: 80, comment: '（演示数据）表达顺畅，重点突出，偶有口语化冗余。' },
      { name: '深度与抗压追问', score: 68, comment: '（演示数据）面对追问能接住，但被深挖到数据 / 指标层面时略显吃力。' }
    ],
    highlights: ['回答有清晰的结构化框架', '有主动做取舍和定义指标的意识'],
    weaknesses: ['指标 / 数据的论证不够扎实', '被连续追问时容易停留在方案层，缺少更深的第一性思考'],
    suggestions: [
      '每个方案后强制自问「用什么指标衡量它成功，为什么是它」',
      '追问时先停顿 3 秒搭个小框架再答，避免被带着走',
      '多用真实数据 / 数量级支撑判断，而不是「我觉得」'
    ],
    model_answer: '（演示模式示例）以「设计类」题为例，高分框架：① 澄清目标与约束 → ② 锁定核心用户与高频场景 → ③ 拆出用户痛点并排序 → ④ 给出对应功能方案并明确优先级（P0/P1）→ ⑤ 定义北极星与护栏指标 → ⑥ 主动讲清风险与取舍。',
    demo: true
  };
}

// ============================ 对外接口 ============================
async function nextInterviewTurn(env, { role, type, history }) {
  const { key } = getConfig(env);
  if (!key) {
    return demoInterview(type, history);
  }
  const system = buildInterviewSystemPrompt(role, type);
  const user = `到目前为止的面试问答记录如下：\n\n${historyToText(history)}\n\n请按规则给出你作为面试官的下一步（JSON）。`;
  const raw = await runTextGeneration(env, system, user, 0.7);
  const parsed = parseTextJson(raw);
  // 归一化
  return {
    action: parsed.action === 'finish' ? 'finish' : 'ask',
    comment: typeof parsed.comment === 'string' ? parsed.comment : '',
    question: typeof parsed.question === 'string' ? parsed.question : '',
    is_followup: !!parsed.is_followup,
    round: Number(parsed.round) || (Array.isArray(history) ? history.length + 1 : 1)
  };
}

async function buildInterviewReport(env, { role, type, history }) {
  const { key } = getConfig(env);
  if (!key) {
    return demoReport(role, type);
  }
  const system = buildReportSystemPrompt(role, type);
  const user = `以下是本场面试的完整问答记录：\n\n${historyToText(history)}\n\n请基于以上真实回答，输出面试评估报告（JSON）。`;
  const raw = await runTextGeneration(env, system, user, 0.3);
  const parsed = parseTextJson(raw);
  // 维度兜底，保证前端始终能渲染 4 个维度
  const dims = Array.isArray(parsed.dimensions) ? parsed.dimensions : [];
  const dimensions = DIMENSION_NAMES.map((name, i) => {
    const d = dims.find((x) => x && x.name === name) || dims[i] || {};
    return {
      name,
      score: Math.max(0, Math.min(100, Number(d.score) || 0)),
      comment: (d && d.comment) || ''
    };
  });
  return {
    overall_score: Math.max(0, Math.min(100, Number(parsed.overall_score) || 0)),
    level: parsed.level || '',
    dimensions,
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.filter(Boolean) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter(Boolean) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(Boolean) : [],
    model_answer: parsed.model_answer || ''
  };
}

export {
  corsHeaders,
  jsonResponse,
  ROLE_LABELS,
  TYPE_LABELS,
  TOTAL_QUESTIONS,
  nextInterviewTurn,
  buildInterviewReport
};
