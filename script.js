// ============================================================
//  Контракт · Санкт-Петербург — поведение лендинга
// ============================================================

// --- Шапка: тень при прокрутке ---
const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!header) return;

  const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  sync();
  window.addEventListener("scroll", sync, { passive: true });

  // Мобильное меню
  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(Boolean(open)));
  });

  // Закрыть меню после клика по ссылке
  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Закрыть меню по клику вне его
  document.addEventListener("click", (e) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(e.target) || toggle?.contains(e.target)) return;
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
};

// --- Появление блоков при прокрутке ---
const initReveal = () => {
  const items = document.querySelectorAll(
    ".card, .pay-card, .prof, .path-list li, .specialty-cards li, .hero-card, .mc-card, .re-card, .faq-item, .trust-item, .nuc-card, .nuc-panel"
  );
  if (!("IntersectionObserver" in window) || !items.length) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  items.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
};

// --- FAQ: открыт только один пункт за раз ---
const initFaq = () => {
  const items = document.querySelectorAll("[data-faq] .faq-item");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initReveal();
  initFaq();
});
