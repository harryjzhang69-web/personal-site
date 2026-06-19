/* ===================================================
 *  Compass · MVP 主交互
 *  - 起卦三选一
 *  - 渲染卦象（六爻 SVG + 卦名 + 现代解读）
 *  - AI 对话（规则脚本 + 卦象共情 + 渐进式提问）
 * =================================================== */

let currentHexagram = null;

// ---------- 起卦绑定 ----------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cast-card").forEach(card => {
    card.addEventListener("click", () => {
      const mode = card.dataset.cast;
      if (mode === "random")  doCast(randomCast());
      if (mode === "time")    doCast(timeCast());
      if (mode === "number")  openNumberDialog();
    });
  });

  // 数字起卦 dialog 提交
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cdialog-confirm")) {
      const u = parseInt(document.getElementById("upInput").value, 10);
      const l = parseInt(document.getElementById("loInput").value, 10);
      if (isNaN(u) || isNaN(l) || u < 1 || l < 1) {
        alert("请输入两个 1 以上的数字");
        return;
      }
      closeNumberDialog();
      doCast(numberCast(u, l));
    }
    if (e.target.closest(".cdialog-cancel") || e.target.classList.contains("cdialog")) {
      closeNumberDialog();
    }
  });

  // 聊天发送
  const sendBtn = document.getElementById("chatSend");
  const input = document.getElementById("chatInput");
  if (sendBtn && input) {
    sendBtn.addEventListener("click", handleUserMsg);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserMsg();
    });
  }
});

// ---------- 数字起卦 dialog（动态创建） ----------
function openNumberDialog() {
  let dialog = document.getElementById("numDialog");
  if (!dialog) {
    dialog = document.createElement("div");
    dialog.id = "numDialog";
    dialog.className = "cdialog";
    dialog.innerHTML = `
      <div class="cdialog-card" onclick="event.stopPropagation()">
        <h3>报数起卦</h3>
        <p>不要思考，<br/>说出脑子里冒出的<strong>第一个</strong>两个数字。</p>
        <div class="cdialog-inputs">
          <input type="number" min="1" id="upInput" class="cdialog-input" placeholder="数字 1" />
          <input type="number" min="1" id="loInput" class="cdialog-input" placeholder="数字 2" />
        </div>
        <div class="cdialog-actions">
          <button class="cdialog-cancel">取消</button>
          <button class="cdialog-confirm">起卦</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  }
  dialog.classList.add("open");
  setTimeout(() => document.getElementById("upInput") && document.getElementById("upInput").focus(), 100);
}
function closeNumberDialog() {
  const d = document.getElementById("numDialog");
  if (d) d.classList.remove("open");
}

// ---------- 起卦 → 渲染 ----------
function doCast(hex) {
  currentHexagram = hex;
  renderHexagram(hex);
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("dialog").classList.remove("hidden");

  // 清空旧对话，AI 主动开口
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  setTimeout(() => addMsg("ai", hex.empathy), 400);
  setTimeout(() => addMsg("ai",
    "你抽到的是 <strong>" + hex.name + "</strong> · " + hex.short +
    "<br/><br/>这一卦给到的是这样的提醒——<br/><em>" + hex.advice + "</em>" +
    "<br/><br/>说说看，你具体在想哪件事？"
  ), 1400);

  // 滚到结果区
  setTimeout(() => {
    document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

function renderHexagram(hex) {
  // 卦象六爻
  const stack = document.getElementById("yaoStack");
  stack.innerHTML = "";
  // binary 是 6 位，从下到上对应爻位（卦书惯例）
  for (let i = 0; i < 6; i++) {
    const yao = document.createElement("div");
    yao.className = "yao " + (hex.binary[i] === "1" ? "yao-yang" : "yao-yin");
    stack.appendChild(yao);
  }

  document.getElementById("hexGlyph").textContent = hex.name;
  document.getElementById("hexId").textContent = "第 " + hex.id + " 卦";
  document.getElementById("hexSymbol").textContent = hex.symbol;
  document.getElementById("hexName").textContent = hex.name;
  document.getElementById("hexShort").textContent = hex.short;
  document.getElementById("hexAdvice").textContent = hex.advice;
}

// ---------- 对话引擎（脚本式 + 渐进） ----------
let dialogTurn = 0;

function addMsg(who, html) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "msg msg-" + who;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function handleUserMsg() {
  const input = document.getElementById("chatInput");
  const text = (input.value || "").trim();
  if (!text) return;
  addMsg("user", escapeHtml(text));
  input.value = "";
  dialogTurn++;

  setTimeout(() => {
    addMsg("ai", aiReply(text, dialogTurn));
  }, 700 + Math.random() * 600);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 罗盘式 AI 回复（MVP 脚本版）
 * 核心原则：先共情，再提问，不下结论
 */
function aiReply(userText, turn) {
  const hex = currentHexagram;

  // 关键词命中规则
  const isWork    = /工作|公司|老板|同事|项目|裁员|跳槽|升职|绩效/.test(userText);
  const isLove    = /感情|对象|男朋友|女朋友|前任|分手|结婚|喜欢|爱/.test(userText);
  const isMoney   = /钱|赚|亏|投资|股票|创业|生意|破产/.test(userText);
  const isFamily  = /父母|家人|爸|妈|孩子|家里/.test(userText);
  const isSelf    = /我自己|迷茫|焦虑|累|抑郁|没意思|不知道/.test(userText);

  // Turn 1：共情 + 第一个反问
  if (turn === 1) {
    let prefix = "听到了。";
    if (isWork)   prefix = "工作上的事，往往不是表面那一层。";
    if (isLove)   prefix = "感情这事，理性不出来。";
    if (isMoney)  prefix = "钱的事会放大焦虑——但焦虑会让你做更糟的决定。";
    if (isFamily) prefix = "家里事最难，因为没法用利益逻辑算清。";
    if (isSelf)   prefix = "你这个状态我懂——不是你『出问题』了，是你『在变化』。";

    return prefix +
      "<br/><br/>结合你抽到的 <strong>" + hex.name + "</strong> 卦——<em>" + hex.short + "</em>。" +
      "<br/><br/>我想先问你一句：<strong>这件事你是从什么时候开始觉得不对劲的？</strong>";
  }

  // Turn 2：基于卦象给一个具体角度
  if (turn === 2) {
    const firstSentence = hex.advice.split("。")[0];
    return "嗯，时间线很重要。" +
      "<br/><br/>" + hex.name + " 卦里有句话特别打你——<em>『" + firstSentence + "』</em>。" +
      "<br/><br/>我换个角度问你：<strong>如果半年后回看现在，你最不想后悔的是什么？</strong>";
  }

  // Turn 3：让用户自己说出答案
  if (turn === 3) {
    return "你刚才说的，其实你心里已经有答案了。" +
      "<br/><br/>" + hex.name + " 卦不是替你决定，它只是把你<em>没想清楚的那一层</em>翻给你看。" +
      "<br/><br/>如果让你用一句话总结你现在该做的事——<strong>会是哪句？</strong>";
  }

  // Turn 4+：温和收尾
  if (turn >= 4) {
    const lines = [
      "<em>『" + userText + "』</em>——这就是你的卦辞了。<br/><br/>罗盘到这里就够了。<br/>剩下的，得你自己走。",
      "这一句，可以记下来。<br/><br/>" + hex.name + " 卦给的不是答案，是<strong>提醒</strong>。<br/>你想清楚了——就够了。",
      "好。<br/><br/>这个对话结束之后，建议你把这次起卦的<strong>问题</strong>和<strong>那句结论</strong>记在一个地方。<br/><br/>3 个月后，回来再看一眼。",
    ];
    return lines[(turn - 4) % lines.length];
  }

  return "嗯，继续说。";
}

// ---------- 重置 ----------
function resetCompass() {
  currentHexagram = null;
  dialogTurn = 0;
  document.getElementById("result").classList.add("hidden");
  document.getElementById("dialog").classList.add("hidden");
  document.getElementById("chat").innerHTML = "";
  document.getElementById("cast").scrollIntoView({ behavior: "smooth" });
}
