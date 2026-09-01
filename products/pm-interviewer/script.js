// AI PM 模拟面试官 —— 前端逻辑
// 后端同源：POST /api/interview（每轮出题/追问） + POST /api/report（结束后评估）
// 前端调用同源后端：POST /api/interview（每轮出题/追问） + POST /api/report（结束后评估）

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
  } catch (err) {
    hideTyping();
    setBusy(false);
    showChatError("当前公开服务未稳定开放，请稍后再试或先查看 GitHub 源码");
    return;
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
    const json = await callApi(API_REPORT, {
      role: state.role, type: state.type, history: state.history
    });
    if (json.code !== 0) throw new Error(json.message || "报告接口异常");
    data = json.data;
  } catch (err) {
    reportEl.classList.add("hidden");
    chatEl.classList.remove("hidden");
    state.finished = false;
    showChatError("当前报告服务未稳定开放，请稍后再试或先查看 GitHub 源码");
    return;
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
