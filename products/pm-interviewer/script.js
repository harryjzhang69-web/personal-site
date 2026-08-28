// AI PM 模拟面试官 —— 前端逻辑
// 后端同源：POST /api/interview（每轮出题/追问） + POST /api/report（结束后评估）
// 兜底：若后端不可达（如纯本地 file:// 直接打开），自动切「前端演示模式」跑通全流程。

const API_INTERVIEW = "/api/interview";
const API_REPORT = "/api/report";

const ROLE_LABELS = {
  "ai-pm": "AI 产品经理",
  "pm": "产品经理（通用）",
  "data-pm": "数据产品经理",
  "strategy-pm": "策略产品经理"
};
const TYPE_LABELS = {
  "product-design": "产品设计",
  "business-case": "商业 / Case",
  "behavioral": "行为面试 BQ",
  "ai-product": "AI 产品专项"
};
const MAX_QUESTIONS = 6; // 前端硬上限，防止模型不收尾

// ---------- 状态 ----------
const state = {
  role: "ai-pm",
  type: "product-design",
  history: [],          // [{q, a}]
  currentQuestion: null,
  finished: false,
  busy: false,
  useLocalDemo: false
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const setupEl = $("setup");
const chatEl = $("chat");
const reportEl = $("report");
const streamEl = $("stream");
const answerInput = $("answerInput");
const answerCount = $("answerCount");
const progressText = $("progressText");

// ---------- 选项选择 ----------
function bindOptions(containerId, key) {
  const box = $(containerId);
  box.querySelectorAll(".opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      box.querySelectorAll(".opt").forEach((b) => b.classList.toggle("active", b === btn));
      state[key] = btn.dataset.value;
    });
  });
}
bindOptions("roleOptions", "role");
bindOptions("typeOptions", "type");

// ---------- 气泡渲染 ----------
function scrollStream() { streamEl.scrollTop = streamEl.scrollHeight; }

function addAiComment(text) {
  if (!text) return;
  const wrap = document.createElement("div");
  wrap.className = "msg msg-comment";
  wrap.innerHTML = `<div class="bubble bubble-comment">面试官：${escapeHtml(text)}</div>`;
  streamEl.appendChild(wrap);
  scrollStream();
}

function addAiQuestion(text, isFollowup) {
  const wrap = document.createElement("div");
  wrap.className = "msg msg-ai";
  const flag = isFollowup ? `<span class="followup-flag">↳ 追问</span>` : "";
  wrap.innerHTML = `<div class="avatar">面</div><div class="bubble">${flag}${escapeHtml(text)}</div>`;
  streamEl.appendChild(wrap);
  scrollStream();
}

function addMyAnswer(text) {
  const wrap = document.createElement("div");
  wrap.className = "msg msg-me";
  wrap.innerHTML = `<div class="avatar">我</div><div class="bubble">${escapeHtml(text)}</div>`;
  streamEl.appendChild(wrap);
  scrollStream();
}

let typingEl = null;
function showTyping() {
  hideTyping();
  typingEl = document.createElement("div");
  typingEl.className = "msg msg-ai";
  typingEl.innerHTML = `<div class="avatar">面</div><div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>`;
  streamEl.appendChild(typingEl);
  scrollStream();
}
function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

function showChatError(msg) {
  let box = $("chatError");
  if (!box) {
    box = document.createElement("div");
    box.id = "chatError";
    box.className = "chat-error";
    chatEl.querySelector(".composer").before(box);
  }
  box.textContent = msg;
  box.classList.remove("hidden");
}
function clearChatError() { const box = $("chatError"); if (box) box.remove(); }

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ---------- API ----------
async function callApi(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

function updateProgress() {
  const n = Math.min(state.history.length + 1, MAX_QUESTIONS);
  progressText.textContent = `第 ${n} 问`;
}

function setBusy(b) {
  state.busy = b;
  $("sendBtn").disabled = b;
  $("startBtn").disabled = b;
  answerInput.disabled = b;
}

// ---------- 面试流程 ----------
async function startInterview() {
  state.history = [];
  state.currentQuestion = null;
  state.finished = false;
  streamEl.innerHTML = "";
  clearChatError();

  $("tagRole").textContent = ROLE_LABELS[state.role] || "产品经理";
  $("tagType").textContent = TYPE_LABELS[state.type] || "产品设计";

  setupEl.classList.add("hidden");
  reportEl.classList.add("hidden");
  chatEl.classList.remove("hidden");
  updateProgress();

  await fetchNextTurn();
}

async function fetchNextTurn() {
  // 硬上限：问够了直接收尾
  if (state.history.length >= MAX_QUESTIONS) { return onFinish(); }

  clearChatError();
  setBusy(true);
  showTyping();

  let data;
  try {
    if (state.useLocalDemo) {
      data = localInterview();
    } else {
      const json = await callApi(API_INTERVIEW, {
        role: state.role, type: state.type, history: state.history
      });
      if (json.code === 1) { // BUSY
        hideTyping(); setBusy(false);
        showChatError(json.message || "AI 面试官访问量过大，请过 10 秒再点「提交回答」");
        return;
      }
      if (json.code !== 0) { throw new Error(json.message || "接口异常"); }
      data = json.data;
    }
  } catch (err) {
    // 网络不可达 → 切前端演示模式
    state.useLocalDemo = true;
    data = localInterview();
  }

  hideTyping();
  setBusy(false);

  if (!data || data.action === "finish") { return onFinish(); }

  if (data.comment) addAiComment(data.comment);
  state.currentQuestion = data.question;
  addAiQuestion(data.question, data.is_followup);
  updateProgress();
  answerInput.focus();
}

async function submitAnswer() {
  if (state.busy) return;
  const ans = answerInput.value.trim();
  if (!ans) { answerInput.focus(); return; }
  if (!state.currentQuestion) return;

  addMyAnswer(ans);
  state.history.push({ q: state.currentQuestion, a: ans });
  state.currentQuestion = null;
  answerInput.value = "";
  answerCount.textContent = "0 字";

  await fetchNextTurn();
}

async function onFinish() {
  if (state.finished) return;
  if (!state.history.length) {
    showChatError("还没有作答，先答一道题再看报告吧");
    return;
  }
  state.finished = true;
  hideTyping();

  chatEl.classList.add("hidden");
  reportEl.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  $("rptRole").textContent = ROLE_LABELS[state.role] || "产品经理";
  $("rptType").textContent = TYPE_LABELS[state.type] || "产品设计";
  $("scoreNum").textContent = "···";
  $("reportLevel").textContent = "AI 正在复盘你的整场表现……";
  $("dims").innerHTML = "";
  ["highlights", "weaknesses", "suggestions"].forEach((id) => ($(id).innerHTML = ""));
  $("modelAnswer").textContent = "";

  let data;
  try {
    if (state.useLocalDemo) {
      data = localReport();
    } else {
      const json = await callApi(API_REPORT, {
        role: state.role, type: state.type, history: state.history
      });
      if (json.code !== 0) throw new Error(json.message || "报告接口异常");
      data = json.data;
    }
  } catch (err) {
    state.useLocalDemo = true;
    data = localReport();
  }

  renderReport(data);
}

function renderReport(d) {
  const score = Math.round(d.overall_score || 0);
  $("scoreNum").textContent = score;
  $("reportLevel").textContent = d.level || "";
  const ring = $("scoreRing");
  ring.style.setProperty("--deg", (score / 100 * 360).toFixed(1) + "deg");

  // 维度
  const dimsBox = $("dims");
  dimsBox.innerHTML = "";
  (d.dimensions || []).forEach((dim) => {
    const row = document.createElement("div");
    row.className = "dim-row";
    row.innerHTML =
      `<div class="dim-top"><span class="dim-name">${escapeHtml(dim.name)}</span><span class="dim-score">${Math.round(dim.score || 0)}</span></div>` +
      `<div class="dim-track"><div class="dim-fill"></div></div>` +
      `<p class="dim-cmt">${escapeHtml(dim.comment || "")}</p>`;
    dimsBox.appendChild(row);
    requestAnimationFrame(() => {
      row.querySelector(".dim-fill").style.width = Math.max(0, Math.min(100, dim.score || 0)) + "%";
    });
  });

  fillList("highlights", d.highlights);
  fillList("weaknesses", d.weaknesses);
  fillList("suggestions", d.suggestions);
  $("modelAnswer").textContent = d.model_answer || "";
}

function fillList(id, arr) {
  const box = $(id);
  box.innerHTML = "";
  (arr || []).forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    box.appendChild(li);
  });
}

// ---------- 前端演示兜底（与后端 DEMO 一致） ----------
const LOCAL_FLOW = {
  "product-design": [
    { comment: "", question: "请为「独居、下班很晚的年轻上班族」设计一款帮他们「回家 15 分钟内吃上热饭」的产品或功能，先讲讲整体思路。", is_followup: false },
    { comment: "方向有了，但我更想听落地。", question: "你提到推荐菜谱 / 速食，那你用什么指标判断这个推荐做得好不好？为什么是它？", is_followup: true },
    { comment: "指标想得还行。", question: "如果上线后发现很多人只看不动手，你会怎么定位问题出在哪一环？", is_followup: true },
    { comment: "那我们看看你的取舍能力。", question: "如果资源只够做一个核心功能，其它全砍掉，你留哪个？为什么？", is_followup: false },
    { comment: "好。", question: "最后一个：这个产品怎么赚钱？怎么设计商业化又不伤体验？", is_followup: false }
  ],
  "business-case": [
    { comment: "", question: "假设你是微信读书产品负责人，团队在讨论「要不要上线短视频讲书」。你怎么判断这件事该不该做？", is_followup: false },
    { comment: "框架有了，具体点。", question: "你说要看对核心指标的影响，那微信读书的北极星指标你认为是什么？为什么？", is_followup: true },
    { comment: "", question: "换个场景：某天 App 次日留存突然掉 5%，给你半小时，你怎么排查？", is_followup: false },
    { comment: "排查思路可以。", question: "如果定位到是一次已上线三天的版本更新引入的，你下一步怎么决策？", is_followup: true },
    { comment: "好。", question: "最后：给这个业务定未来一年最该投入的方向，你会选什么，怎么论证？", is_followup: false }
  ],
  "behavioral": [
    { comment: "", question: "讲一个你推动跨部门协作、但一开始阻力很大的经历。先说当时的情境和你的目标。", is_followup: false },
    { comment: "情境清楚了。", question: "具体是你做了哪些动作让局面改变的？我想听你本人做了什么。", is_followup: true },
    { comment: "", question: "结果怎么样？有没有可量化的成效？", is_followup: true },
    { comment: "嗯。", question: "如果现在重新做一次，你会改哪里？", is_followup: false },
    { comment: "好。", question: "再讲一个：你最后悔的一个产品决策，以及从中学到了什么。", is_followup: false }
  ],
  "ai-product": [
    { comment: "", question: "让你设计一个「面向 C 端的 AI 学习助手」，你会怎么定义它的核心功能和效果指标？", is_followup: false },
    { comment: "功能不少，但我关心怎么衡量好坏。", question: "你打算怎么评估它「回答得好不好」？人工评测和自动评测怎么搭？", is_followup: true },
    { comment: "", question: "AI 产品绕不开幻觉、成本、延迟的权衡。在你这个产品里，你会优先牺牲哪个、保住哪个？为什么？", is_followup: false },
    { comment: "取舍讲清楚了。", question: "你怎么让它越用越好？说说你设想的数据飞轮。", is_followup: true },
    { comment: "好。", question: "最后：如果基座模型明年能力翻倍，你现在做的哪些功能会被模型进步直接吃掉？怎么规避？", is_followup: false }
  ]
};

function localInterview() {
  const flow = LOCAL_FLOW[state.type] || LOCAL_FLOW["product-design"];
  const asked = state.history.length;
  if (asked >= flow.length) {
    return { action: "finish" };
  }
  const step = flow[asked];
  return {
    action: "ask",
    comment: asked === 0 ? "（演示模式：未连后端，以下为预置示例题）" : step.comment,
    question: step.question,
    is_followup: step.is_followup,
    round: asked + 1
  };
}

function localReport() {
  return {
    overall_score: 76,
    level: "（演示模式）接近中高级产品经理水平，结构清晰但深度和数据支撑有提升空间",
    dimensions: [
      { name: "结构化思维", score: 82, comment: "（演示数据）回答有明显框架，先讲目标再讲方案，条理清楚。" },
      { name: "产品 Sense 与判断", score: 74, comment: "（演示数据）取舍意识不错，但对用户真实场景的洞察偏表层。" },
      { name: "沟通表达", score: 80, comment: "（演示数据）表达顺畅、重点突出，偶有口语化冗余。" },
      { name: "深度与抗压追问", score: 68, comment: "（演示数据）能接住追问，但被深挖到数据 / 指标层面时略显吃力。" }
    ],
    highlights: ["回答有清晰的结构化框架", "有主动做取舍和定义指标的意识"],
    weaknesses: ["指标 / 数据的论证不够扎实", "被连续追问时容易停留在方案层，缺少更深的第一性思考"],
    suggestions: [
      "每个方案后强制自问「用什么指标衡量它成功，为什么是它」",
      "追问时先停顿 3 秒搭个小框架再答，别被带着走",
      "多用真实数据 / 数量级支撑判断，而不是「我觉得」"
    ],
    model_answer: "（演示模式示例）以设计类题为例，高分框架：① 澄清目标与约束 → ② 锁定核心用户与高频场景 → ③ 拆痛点并排序 → ④ 给功能方案并标优先级（P0/P1）→ ⑤ 定义北极星与护栏指标 → ⑥ 主动讲清风险与取舍。"
  };
}

// ---------- 事件 ----------
$("startBtn").addEventListener("click", startInterview);
$("sendBtn").addEventListener("click", submitAnswer);
$("finishBtn").addEventListener("click", onFinish);
$("againBtn").addEventListener("click", () => {
  reportEl.classList.add("hidden");
  setupEl.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
answerInput.addEventListener("input", () => { answerCount.textContent = answerInput.value.length + " 字"; });
answerInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submitAnswer(); }
});
