const storagePrefix = "steel-frontier-v2:";
const toast = document.querySelector("[data-toast]");
let toastTimer;

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

const initIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  nav?.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
};

const initUploads = () => {
  document.querySelectorAll("[data-upload]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-upload");
      document.querySelector(`[data-file-input="${target}"]`)?.click();
    });
  });

  document.querySelectorAll("[data-file-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      const target = input.getAttribute("data-file-input");
      const preview = document.querySelector(`[data-preview="${target}"]`);

      if (!file || !preview) return;

      const url = URL.createObjectURL(file);
      const isVideo = preview.tagName.toLowerCase() === "video";

      if (isVideo) {
        preview.src = url;
        preview.load();
        preview.play().catch(() => undefined);
      } else {
        preview.src = url;
      }

      showToast(file.type.startsWith("video") ? "Видео загружено" : "Фото загружено");
    });
  });
};

const initEditableText = () => {
  const editables = [...document.querySelectorAll("[data-editable]")];
  const originalValues = new Map();

  editables.forEach((element) => {
    const key = `${storagePrefix}${element.getAttribute("data-editable")}`;
    originalValues.set(key, element.innerHTML);

    const saved = localStorage.getItem(key);
    if (saved) {
      element.innerHTML = saved;
    }

    element.addEventListener("input", () => {
      localStorage.setItem(key, element.innerHTML);
    });
  });

  document.querySelector("[data-clear-text]")?.addEventListener("click", () => {
    editables.forEach((element) => {
      const key = `${storagePrefix}${element.getAttribute("data-editable")}`;
      const original = originalValues.get(key);
      if (original) {
        element.innerHTML = original;
      }
      localStorage.removeItem(key);
    });
    initIcons();
    showToast("Текст сброшен");
  });

  document.querySelector("[data-copy-brief]")?.addEventListener("click", async () => {
    const brief = document.querySelector("#brief");
    const text = brief?.innerText.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Текст скопирован");
    } catch {
      showToast("Не удалось скопировать автоматически");
    }
  });
};

const initReveal = () => {
  const candidates = document.querySelectorAll(".bento-card, .card, .pay-card, .path-list li, .prof, .cta-inner, .hero-card");
  candidates.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  candidates.forEach((element) => observer.observe(element));
};

document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  initHeader();
  initUploads();
  initEditableText();
  initReveal();
});
