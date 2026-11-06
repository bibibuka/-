// ============================================================
//  Контракт · СПб — v2 MILITARY: поведение лендинга
//  Vanilla JS. Header shadow, mobile nav, FAQ accordion,
//  scroll parallax (rAF-throttled), lead form (Telegram),
//  IntersectionObserver reveal. Respect prefers-reduced-motion.
// ============================================================

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Настройка отправки заявок в Telegram ---
// 1) Создай бота: напиши @BotFather -> /newbot -> получи ТОКЕН.
// 2) Узнай chat_id: напиши своему боту любое сообщение, затем открой
//    https://api.telegram.org/bot<ТОКЕН>/getUpdates -> возьми chat.id.
const TG = {
  botToken: "PASTE_BOT_TOKEN",   // <-- вставь токен от @BotFather
  chatId:   "PASTE_CHAT_ID",     // <-- вставь свой chat_id
};

// --- Шапка: тень + фон при прокрутке ---
const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!header) return;

  let ticking = false;
  const sync = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { window.requestAnimationFrame(sync); ticking = true; }
  }, { passive: true });
  sync();

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(Boolean(open)));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(e.target) || toggle?.contains(e.target)) return;
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
};

// --- FAQ: открыт только один пункт за раз ---
const initFaq = () => {
  const items = document.querySelectorAll("[data-faq] .faq-item");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
};

// --- Параллакс фоновых слоёв ---
const initParallax = () => {
  if (prefersReduced) return;
  const layers = document.querySelectorAll("[data-parallax]");
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
};

// --- Reveal при скролле ---
const initReveal = () => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (prefersReduced) { targets.forEach((t) => t.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((t) => io.observe(t));
};

// --- Форма заявки -> Telegram ---
const escapeTg = (s) => s.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, "\\$&").slice(0, 500);

const initLeadForm = () => {
  const form = document.querySelector("[data-lead]");
  if (!form) return;
  const status = form.querySelector("[data-status]");
  const submit = form.querySelector("[data-submit]");
  const submitLabel = submit?.querySelector("span");
  const serial = form.querySelector("[data-form-serial]");
  if (serial) serial.textContent = String(1000 + Math.floor(Math.random() * 8999));

  const showStatus = (kind, msg) => {
    status.hidden = false;
    status.dataset.kind = kind;
    status.textContent = msg;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const job = (data.get("job") || "").toString().trim();

    // Базовая проверка телефона: хотя бы 10 цифр
    const digits = phone.replace(/\D/g, "");
    if (!name || digits.length < 10) {
      showStatus("err", "Проверь имя и телефон — номер должен содержать не меньше 10 цифр.");
      return;
    }

    submit.dataset.loading = "true";
    if (submitLabel) submitLabel.textContent = "Отправляем…";

    const text = [
      "🟢 *Новая заявка с сайта*",
      "",
      `*Имя:* ${escapeTg(name)}`,
      `*Телефон:* ${escapeTg(phone)}`,
      job ? `*Доп. инфо:* ${escapeTg(job)}` : null,
    ].filter(Boolean).join("\n");

    // Если токен не задан — показываем локальный успех (чтобы видеть работу формы)
    if (TG.botToken === "PASTE_BOT_TOKEN" || TG.chatId === "PASTE_CHAT_ID") {
      await new Promise((r) => setTimeout(r, 500));
      showStatus("ok", "Заявка принята! Это тестовый режим — подключите Telegram-бота, чтобы заявки стали приходить в чат. Сейчас перезвоним по оставленному номеру.");
      form.reset();
      submit.dataset.loading = "false";
      if (submitLabel) submitLabel.textContent = "Отправить заявку";
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${TG.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG.chatId,
          text,
          parse_mode: "MarkdownV2",
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      showStatus("ok", "Заявка отправлена! Перезвоним в ближайшее время.");
      form.reset();
    } catch (err) {
      showStatus("err", "Не удалось отправить. Проверь интернет или позвони нам напрямую +7 (921) 555-12-34.");
    } finally {
      submit.dataset.loading = "false";
      if (submitLabel) submitLabel.textContent = "Отправить заявку";
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initFaq();
  initParallax();
  initLeadForm();
  initReveal();
});
