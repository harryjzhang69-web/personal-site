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
