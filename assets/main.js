/* Harry · Personal Site — interactions */

/* ============= 主题切换 ============= */
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || getSystemTheme();
  const next = current === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
}

function getSystemTheme() {
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark" : "light";
}

(function initTheme() {
  let stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  const initial = stored || getSystemTheme();
  document.documentElement.setAttribute("data-theme", initial);
})();

/* ============= 复制微信号 ============= */
function copyWechat() {
  const wxId = "jialin_69";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(wxId).then(() => showToast("微信号已复制：" + wxId));
  } else {
    // 兜底
    const input = document.createElement("input");
    input.value = wxId;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast("微信号已复制：" + wxId);
  }
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

/* ============= 预约弹窗 ============= */
function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ESC 关弹窗
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBookingModal();
});

/* ============= 顶部 nav 滚动时高亮当前 section ============= */
window.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".topnav-links a");

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        links.forEach(a => {
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-30% 0px -55% 0px" });

  sections.forEach(s => observer.observe(s));

  // 注入 active 状态样式
  const style = document.createElement("style");
  style.textContent = `
    .topnav-links a.active {
      color: var(--text);
      font-weight: 500;
    }
    .topnav-links a.active::after {
      content: "";
      display: block;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--accent);
      margin: 3px auto 0;
    }
  `;
  document.head.appendChild(style);
});

/* ============= 进入视口时元素淡入（一次性，纯 CSS 配合） ============= */
window.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(".project, .now-item, .writing-item, .connect-card");
  if (!("IntersectionObserver" in window)) return;

  // 初始隐藏 + transition
  targets.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    el.style.transitionDelay = `${Math.min(i * 30, 200)}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

  targets.forEach(el => io.observe(el));
});


/* =====================================================================
 *  v3.0 · BGM 控制（《星游记》情怀 BGM）
 *  - 默认静音/暂停（顺应浏览器 autoplay policy）
 *  - 初始音量严格 0.2（20% 柔和背景）
 *  - 点击图标：播放 / 暂停切换
 *  - 用户上次状态记忆到 localStorage（仅记忆 on/off，不自动播放）
 *  ===================================================================== */
const BGM_INITIAL_VOLUME = 0.2; // 💡 调整全站默认音量（0.0 - 1.0）

function toggleBgm() {
  const audio = document.getElementById("siteBgm");
  const fab   = document.getElementById("bgmToggle");
  if (!audio || !fab) return;

  if (audio.paused) {
    audio.volume = BGM_INITIAL_VOLUME;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.then(() => {
        fab.classList.add("is-playing");
        fab.setAttribute("aria-pressed", "true");
        try { localStorage.setItem("bgm:wanted", "1"); } catch (e) {}
        showToast && showToast("🎵 《星游记》· 远航");
      }).catch(() => {
        showToast && showToast("浏览器拦截了自动播放，请再点一次");
      });
    } else {
      fab.classList.add("is-playing");
      fab.setAttribute("aria-pressed", "true");
    }
  } else {
    audio.pause();
    fab.classList.remove("is-playing");
    fab.setAttribute("aria-pressed", "false");
    try { localStorage.setItem("bgm:wanted", "0"); } catch (e) {}
  }
}

/* 初始化音量 + 状态同步 + 首次交互自动尝试播放（绕过浏览器 autoplay 限制） */
(function initBgm() {
  document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("siteBgm");
    if (!audio) return;
    audio.volume = BGM_INITIAL_VOLUME;

    // 状态同步
    audio.addEventListener("pause", function () {
      const fab = document.getElementById("bgmToggle");
      if (fab) {
        fab.classList.remove("is-playing");
        fab.setAttribute("aria-pressed", "false");
      }
    });
    audio.addEventListener("play", function () {
      const fab = document.getElementById("bgmToggle");
      if (fab) {
        fab.classList.add("is-playing");
        fab.setAttribute("aria-pressed", "true");
      }
    });

    // ============ 首次交互自动尝试播放 ============
    // 浏览器铁律：页面加载时不能自动播。
    // 但用户的任何一次点击 / 滚动 / 按键都能"激活"播放权限。
    // 所以监听首次任意交互，悄悄尝试播放一次。
    // 用户上次明确点暂停过则尊重选择（bgm:wanted=0）。
    let triedAutoplay = false;
    const tryAutoplay = () => {
      if (triedAutoplay) return;
      triedAutoplay = true;
      let userPaused = "0";
      try { userPaused = localStorage.getItem("bgm:wanted") || ""; } catch (e) {}
      if (userPaused === "0") return; // 用户明确暂停过，尊重
      if (!audio.paused) return;       // 已经在播
      audio.volume = BGM_INITIAL_VOLUME;
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => { /* 浏览器仍拒绝就算了，等用户主动点 */ });
      }
    };
    ["click", "touchstart", "scroll", "keydown"].forEach(evt => {
      window.addEventListener(evt, tryAutoplay, { once: true, passive: true });
    });
  });
})();

