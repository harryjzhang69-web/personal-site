/* ===================================================
 *  Compass · MVP v0.2 主交互
 *  - 起卦三选一（摇钱 / 报数 / 时间）
 *  - 卦象渲染（六爻 + 卦名 + 现代解读）
 *  - AI 共情对话（脚本 4 轮 + 可选 LLM 接口）
 *  - 卦象历史（localStorage）
 *  - 复制卦辞、再起一卦、Toast
 * =================================================== */

(function () {
  'use strict';

  let currentHexagram = null;
  let dialogTurn = 0;
  const HISTORY_KEY = 'compass:history';
  const HISTORY_MAX = 10;

  // ===== DOM 引用 =====
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== 入口 =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // 检查依赖
    if (typeof HEXAGRAMS === 'undefined') {
      console.error('[Compass] HEXAGRAMS 数据未加载');
      showToast('数据加载失败，请刷新');
      return;
    }
    bindCastCards();
    bindNumberDialog();
    bindChat();
    bindHexActions();
    bindResetBtn();
    renderHistory();
  }

  // ===== 起卦卡片绑定 =====
  function bindCastCards() {
    $$('.cast-card').forEach((card) => {
      card.addEventListener('click', () => {
        const mode = card.dataset.cast;
        if (mode === 'random') {
          doCast(randomCast(), 'random');
        } else if (mode === 'time') {
          doCast(timeCast(), 'time');
        } else if (mode === 'number') {
          openNumberDialog();
        }
      });
    });
  }

  // ===== 报数起卦弹窗 =====
  function bindNumberDialog() {
    const dialog = $('numDialog');
    const confirmBtn = dialog.querySelector('.cdialog-confirm');
    const cancelBtn = dialog.querySelector('.cdialog-cancel');
    const upInput = $('upInput');
    const loInput = $('loInput');

    confirmBtn.addEventListener('click', () => {
      const u = parseInt(upInput.value, 10);
      const l = parseInt(loInput.value, 10);
      if (isNaN(u) || isNaN(l) || u < 1 || l < 1) {
        showToast('请输入两个 1 以上的数字');
        return;
      }
      closeNumberDialog();
      doCast(numberCast(u, l), 'number');
    });

    cancelBtn.addEventListener('click', closeNumberDialog);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeNumberDialog();
    });

    // Enter 提交
    [upInput, loInput].forEach((inp) => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmBtn.click();
      });
    });
  }

  function openNumberDialog() {
    const dialog = $('numDialog');
    $('upInput').value = '';
    $('loInput').value = '';
    dialog.classList.add('open');
    setTimeout(() => $('upInput').focus(), 100);
  }

  function closeNumberDialog() {
    $('numDialog').classList.remove('open');
  }

  // ===== 卦象动作（再摇 / 复制） =====
  function bindHexActions() {
    $('btnRecast').addEventListener('click', () => {
      if (!currentHexagram) return;
      doCast(randomCast(), 'random');
    });

    $('btnShare').addEventListener('click', () => {
      if (!currentHexagram) return;
      const h = currentHexagram;
      const text =
        '【罗盘 · ' + h.name + ' 卦】\n' +
        h.symbol + ' · ' + h.short + '\n\n' +
        h.advice + '\n\n' +
        '— 来自 Harry 的罗盘 Compass';
      copyText(text).then(() => showToast('卦辞已复制，可分享给朋友'));
    });
  }

  // ===== 重置按钮 =====
  function bindResetBtn() {
    $('btnReset').addEventListener('click', resetCompass);
  }

  // ===== 起卦执行 → 渲染 + 启动对话 =====
  function doCast(hex, mode) {
    currentHexagram = hex;
    dialogTurn = 0;

    renderHexagram(hex);
    $('result').classList.remove('hidden');
    $('dialog').classList.remove('hidden');

    // 清空旧对话
    const chat = $('chat');
    chat.innerHTML = '';

    // AI 主动开口（2 条消息分时显示）
    setTimeout(() => addMsg('ai', hex.empathy), 400);
    setTimeout(() => {
      const html =
        '你抽到的是 <strong>' + hex.name + '</strong> · ' + hex.short +
        '<br/><br/>这一卦给到的提醒是——<br/>' +
        '<em>' + hex.advice + '</em>' +
        '<br/><br/>说说看，你具体在想哪件事？';
      addMsg('ai', html);
    }, 1400);

    // 保存历史
    saveHistory(hex, mode);

    // 平滑滚动
    setTimeout(() => {
      $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }

  function renderHexagram(hex) {
    // 六爻栈（自下而上）
    const stack = $('yaoStack');
    stack.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const yao = document.createElement('div');
      yao.className = 'yao ' + (hex.binary[i] === '1' ? 'yao-yang' : 'yao-yin');
      stack.appendChild(yao);
    }
    $('hexGlyph').textContent = hex.name;
    $('hexId').textContent = '第 ' + hex.id + ' 卦';
    $('hexSymbol').textContent = hex.symbol;
    $('hexName').textContent = hex.name;
    $('hexShort').textContent = hex.short;
    $('hexAdvice').textContent = hex.advice;
  }

  // ===== 对话 =====
  function bindChat() {
    const sendBtn = $('chatSend');
    const input = $('chatInput');
    if (!sendBtn || !input) return;
    sendBtn.addEventListener('click', handleUserMsg);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserMsg();
      }
    });
  }

  function handleUserMsg() {
    const input = $('chatInput');
    const text = (input.value || '').trim();
    if (!text) return;
    addMsg('user', escapeHtml(text));
    input.value = '';
    dialogTurn++;

    // 加 typing 占位
    const typingId = 'typing-' + Date.now();
    addMsg('ai', '<span class="typing-dots"><i></i><i></i><i></i></span>', typingId);

    const delay = 700 + Math.random() * 800;
    setTimeout(() => {
      removeMsg(typingId);
      const reply = aiReply(text, dialogTurn);
      addMsg('ai', reply);
    }, delay);
  }

  function addMsg(who, html, id) {
    const chat = $('chat');
    const div = document.createElement('div');
    div.className = 'msg msg-' + who;
    if (id) div.dataset.msgId = id;
    div.innerHTML = html;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function removeMsg(id) {
    const el = document.querySelector('[data-msg-id="' + id + '"]');
    if (el) el.remove();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ===== AI 回复（脚本版） =====
  function aiReply(userText, turn) {
    const h = currentHexagram;
    const isWork = /工作|公司|老板|同事|项目|裁员|跳槽|升职|绩效|加班|领导/.test(userText);
    const isLove = /感情|对象|男朋友|女朋友|前任|分手|结婚|喜欢|爱|她|他/.test(userText);
    const isMoney = /钱|赚|亏|投资|股票|创业|生意|破产|收入|工资/.test(userText);
    const isFamily = /父母|家人|爸|妈|孩子|家里|老婆|老公/.test(userText);
    const isSelf = /我自己|迷茫|焦虑|累|抑郁|没意思|不知道|emo/.test(userText);
    const isShort = userText.length < 6;

    if (turn === 1) {
      let prefix = '听到了。';
      if (isWork) prefix = '工作上的事，往往不是表面那一层。';
      else if (isLove) prefix = '感情这事，理性不出来。';
      else if (isMoney) prefix = '钱的事会放大焦虑——但焦虑会让你做更糟的决定。';
      else if (isFamily) prefix = '家里事最难，因为没法用利益逻辑算清。';
      else if (isSelf) prefix = '你这个状态我懂——不是你『出问题』了，是你『在变化』。';
      else if (isShort) prefix = '说得简单，但能感觉你在想很多。';

      return prefix +
        '<br/><br/>结合你抽到的 <strong>' + h.name + '</strong> 卦——<em>' + h.short + '</em>。' +
        '<br/><br/>我想先问你一句：<strong>这件事你是从什么时候开始觉得不对劲的？</strong>';
    }

    if (turn === 2) {
      const firstSentence = h.advice.split(/[。！？]/)[0];
      return '嗯，时间线很重要。' +
        '<br/><br/>' + h.name + ' 卦里有一句话——<em>『' + firstSentence + '』</em>。' +
        '<br/><br/>我换个角度问你：<strong>如果半年后回看现在，你最不想后悔的是什么？</strong>';
    }

    if (turn === 3) {
      return '你说的这句，其实心里已经有答案了。' +
        '<br/><br/>' + h.name + ' 卦不是替你决定，它只是把你<em>没想清楚的那一层</em>翻给你看。' +
        '<br/><br/>如果让你用一句话总结你现在该做的事——<strong>会是哪句？</strong>';
    }

    if (turn === 4) {
      return '<em>『' + userText + '』</em>' +
        '<br/><br/>这就是你这次的卦辞了。<br/>' +
        '罗盘到这里就够了——剩下的，得你自己走。' +
        '<br/><br/><strong>3 个月后</strong>，回来再看一眼这句话。';
    }

    // turn ≥ 5：温和提示
    const codas = [
      '罗盘的话就到这里。<br/>再聊就是占用你的时间了——把刚才那句话记下来。',
      h.name + ' 卦已经说完了它能说的。<br/>剩下的不是问罗盘，是问自己。',
      '建议你点击右上「再摇一卦」<strong>换个问题</strong>来问——同一个问题反复问，是大忌。'
    ];
    return codas[(turn - 5) % codas.length];
  }

  // ===== 重置 =====
  function resetCompass() {
    currentHexagram = null;
    dialogTurn = 0;
    $('result').classList.add('hidden');
    $('dialog').classList.add('hidden');
    $('chat').innerHTML = '';
    $('cast').scrollIntoView({ behavior: 'smooth' });
  }

  // ===== 历史 =====
  function saveHistory(hex, mode) {
    try {
      const list = loadHistory();
      list.unshift({
        id: hex.id,
        name: hex.name,
        symbol: hex.symbol,
        short: hex.short,
        binary: hex.binary,
        mode: mode || 'random',
        ts: Date.now()
      });
      const trimmed = list.slice(0, HISTORY_MAX);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      renderHistory();
    } catch (e) {
      // localStorage 不可用就静默
    }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function renderHistory() {
    const list = loadHistory();
    const section = $('history');
    const listEl = $('historyList');
    if (!list.length) {
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');
    listEl.innerHTML = '';
    list.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      const modeLabel =
        item.mode === 'random' ? '🪙 摇钱' :
        item.mode === 'number' ? '🔢 报数' : '⏱ 时间';
      const date = new Date(item.ts);
      const dateStr = (date.getMonth() + 1) + '/' + date.getDate() + ' ' +
                       String(date.getHours()).padStart(2, '0') + ':' +
                       String(date.getMinutes()).padStart(2, '0');
      div.innerHTML =
        '<span class="hh-time">' + dateStr + '</span>' +
        '<span class="hh-mode">' + modeLabel + '</span>' +
        '<span class="hh-name"><strong>' + item.name + '</strong></span>' +
        '<span class="hh-short">' + item.short + '</span>';
      div.addEventListener('click', () => {
        const hex = findHexagram(item.binary);
        doCast(hex, item.mode);
      });
      listEl.appendChild(div);
    });
  }

  // ===== 工具函数 =====
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function showToast(msg) {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // 暴露到全局供调试
  window.Compass = {
    cast: doCast,
    reset: resetCompass,
    clearHistory: () => {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    }
  };
})();
