// ===== Azhar Moolla — Portfolio interactions =====
// Base interactions work standalone; Motion (motion.dev, loaded via CDN as
// window.Motion) layers on entrance, scroll-linked, and spring animations.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const M = !reduceMotion && window.Motion ? window.Motion : null;
if (M) document.documentElement.classList.add("has-motion");

/* ---------- Audience views: ?view=planning | analyst | builder ---------- */
// Same site, three orderings. The résumé QR codes link to ?view=analyst and
// ?view=planning; the bare URL defaults to planning.
const VIEWS = {
  planning: {
    order: ["analyst-work", "experience", "projects", "skills"],
    sub: "Urban planner with municipal, consulting, and economic-development experience — development review, GIS spatial analysis, urban design, and the financial feasibility that decides whether a plan gets built. And when the right tool doesn't exist, <em>I build it</em>.",
    cta: ["See the planning work", "#analyst-work"],
    doc: ["Download CV (PDF)", "assets/docs/Azhar_Moolla_CV.pdf"],
    stats: [["4", "Planning & consulting placements"], ["$1.2B", "Development pro forma modelled"], ["1", "Emilio Dio Award for Studio Excellence"], ["5", "Web products shipped"]],
  },
  analyst: {
    order: ["analyst-work", "experience", "projects", "skills"],
    sub: "Real estate analyst who builds and stress-tests development pro formas — scenario and sensitivity testing, phasing, NPV and IRR, and clear recommendations for stakeholders. Grounded in urban planning, and when the right tool doesn't exist, <em>I build it</em>.",
    cta: ["See the pro forma work", "#analyst-work"],
    doc: ["Download résumé (PDF)", "assets/docs/Azhar_Moolla_Resume.pdf"],
    stats: [["$1.2B", "Development pro forma modelled"], ["4", "Development scenarios stress-tested"], ["1", "Emilio Dio Award for Studio Excellence"], ["5", "Web products shipped"]],
  },
  builder: {
    order: ["projects", "analyst-work", "experience", "skills"],
    sub: "I work the whole stack of a problem — financial feasibility, urban planning, economic development, data analysis, marketing — and <em>when the right tool doesn't exist, I build it</em>. The products below started exactly that way.",
    cta: ["See the live projects", "#projects"],
    doc: ["Download résumé (PDF)", "assets/docs/Azhar_Moolla_Resume.pdf"],
    stats: [["5", "Web products shipped"], ["$0/mo", "Infra cost of Home Finder"], ["$1.2B", "Development pro forma modelled"], ["1", "Emilio Dio Award for Studio Excellence"]],
  },
};

const viewParam = new URLSearchParams(location.search).get("view");
let currentView = VIEWS[viewParam] ? viewParam : "planning";

function applyView(name, { pushUrl = false } = {}) {
  const v = VIEWS[name];
  currentView = name;
  document.documentElement.dataset.view = name;

  // section + nav order (contact stays last), alternating backgrounds
  let n = 0;
  v.order.forEach((id, i) => {
    const sec = document.getElementById(id);
    sec.style.order = i;
    sec.classList.toggle("section-alt", i % 2 === 1);
    const li = document.querySelector(`.nav-links [data-nav="${id}"]`);
    if (li) li.style.order = i;
    n = i;
  });
  document.getElementById("contact").style.order = n + 1;
  document.querySelector('.nav-links [data-nav="contact"]').style.order = n + 1;

  // gallery order
  document.querySelectorAll(".gallery-item").forEach((f) => {
    f.style.order = f.dataset[name === "builder" ? "oPlanning" : name === "analyst" ? "oAnalyst" : "oPlanning"];
  });

  // hero copy
  document.getElementById("hero-sub").innerHTML = v.sub;
  const cta = document.getElementById("hero-cta");
  cta.href = v.cta[1];
  cta.querySelector("span").textContent = v.cta[0];
  const doc = document.getElementById("hero-doc");
  doc.href = v.doc[1];
  doc.querySelector("span").textContent = v.doc[0];
  document.querySelectorAll("#hero-stats .stat").forEach((el, i) => {
    const [value, label] = v.stats[i];
    const num = el.querySelector(".stat-num");
    const m = value.match(/^(\$?)([\d.]+)(.*)$/);
    num.dataset.prefix = m[1];
    num.dataset.value = m[2];
    num.dataset.decimals = (m[2].split(".")[1] || "").length;
    num.dataset.suffix = m[3];
    num.textContent = value;
    el.querySelector(".stat-label").textContent = label;
  });

  document.querySelectorAll(".view-switch button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.view === name))
  );

  if (pushUrl) {
    const u = new URL(location.href);
    u.searchParams.set("view", name);
    history.replaceState(null, "", u);
  }
}

applyView(currentView);
document.querySelectorAll(".view-switch button").forEach((b) =>
  b.addEventListener("click", () => applyView(b.dataset.view, { pushUrl: true }))
);

// highlight the nav link for the section in view
if ("IntersectionObserver" in window) {
  const links = new Map(
    [...document.querySelectorAll(".nav-links a")].map((a) => [a.getAttribute("href").slice(1), a])
  );
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const a = links.get(e.target.id);
        if (a) a.classList.toggle("is-current", e.isIntersecting);
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });
}

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Nav: fixed-position height + elevated state on scroll ---------- */
const navWrap = document.querySelector(".nav-wrap");

// The nav is position:fixed, so body padding reserves its space; keep the
// CSS variable in sync with the real rendered height.
const setNavHeight = () =>
  document.documentElement.style.setProperty("--nav-h", navWrap.offsetHeight + "px");
setNavHeight();
window.addEventListener("resize", setNavHeight);
window.addEventListener(
  "scroll",
  () => navWrap.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true }
);

/* ---------- Scroll reveal (base, works without Motion) ---------- */
const revealEls = document.querySelectorAll(".reveal");
const heroReveals = new Set(document.querySelectorAll(".hero-inner .reveal"));

function showAll(els) {
  els.forEach((el) => el.classList.add("is-visible"));
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  showAll(revealEls);
} else {
  // When Motion drives the hero entrance, exclude hero elements from the
  // observer so the two systems don't fight.
  const observed = M ? [...revealEls].filter((el) => !heroReveals.has(el)) : [...revealEls];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  observed.forEach((el) => observer.observe(el));

  // Fail-safe: never leave content hidden if the observer doesn't fire
  // (e.g. headless renderers, browser quirks).
  setTimeout(() => showAll(revealEls), 2500);
}

/* ---------- Motion: hero entrance sequence ---------- */
if (M) {
  const { animate, stagger } = M;
  const ease = [0.22, 1, 0.36, 1];

  // Split the name into characters for a staggered rise (dot keeps its accent).
  const title = document.querySelector(".hero-title");
  const label = title.textContent.trim();
  title.setAttribute("aria-label", label);
  const frag = document.createDocumentFragment();
  [...title.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach((ch) => {
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
        } else {
          const s = document.createElement("span");
          s.className = "char";
          s.setAttribute("aria-hidden", "true");
          s.textContent = ch;
          frag.appendChild(s);
        }
      });
    } else {
      node.classList.add("char");
      node.setAttribute("aria-hidden", "true");
      frag.appendChild(node);
    }
  });
  title.textContent = "";
  title.appendChild(frag);
  title.classList.add("is-visible");

  animate(
    title.querySelectorAll(".char"),
    { opacity: [0, 1], y: ["0.55em", 0], filter: ["blur(8px)", "blur(0px)"] },
    { duration: 0.7, delay: stagger(0.035, { startDelay: 0.1 }), ease }
  );

  // Remaining hero elements rise in sequence after the name.
  const rest = [...heroReveals].filter((el) => el !== title);
  rest.forEach((el) => el.classList.add("is-visible"));
  animate(
    rest,
    { opacity: [0, 1], y: [22, 0] },
    { duration: 0.65, delay: stagger(0.12, { startDelay: 0.45 }), ease }
  );

  /* ---------- Motion: scroll progress bar ---------- */
  M.scroll(animate(".scroll-progress", { scaleX: [0, 1] }, { ease: "linear" }));

  /* ---------- Motion: stat counters ---------- */
  const stats = document.querySelectorAll(".stat-num[data-value]");
  let counted = false;
  M.inView(
    ".hero-stats",
    () => {
      if (counted) return;
      counted = true;
      stats.forEach((el) => {
        const target = parseFloat(el.dataset.value);
        const decimals = Number(el.dataset.decimals || 0);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        animate(0, target, {
          duration: 1.4,
          ease: "circOut",
          onUpdate: (v) => {
            el.textContent = prefix + v.toFixed(decimals) + suffix;
          },
        });
      });
    },
    { amount: 0.4 }
  );

  /* ---------- Motion: parallax drift on project screenshots ---------- */
  document.querySelectorAll(".project-media").forEach((media) => {
    const img = media.querySelector("img");
    M.scroll(animate(img, { y: ["-4.5%", "4.5%"] }, { ease: "linear" }), {
      target: media,
      offset: ["start end", "end start"],
    });
  });
}

/* ---------- Pointer tilt on project screenshots (fine pointers only) ---------- */
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".project-media").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
      card.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Lightbox for analyst work gallery ---------- */
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");
let lastFocused = null;

document.querySelectorAll(".gallery-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    lastFocused = btn;
    lightboxImg.src = btn.dataset.full;
    lightboxImg.alt = btn.querySelector("img").alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (M) {
      M.animate(lightbox, { opacity: [0, 1] }, { duration: 0.25 });
      M.animate(
        lightboxImg,
        { opacity: [0, 1], scale: [0.93, 1] },
        { type: "spring", stiffness: 320, damping: 28 }
      );
    }
    lightboxClose.focus();
  });
});

function closeLightbox() {
  const finish = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };
  if (M) {
    M.animate(lightbox, { opacity: 0 }, { duration: 0.18 }).then(finish);
  } else {
    finish();
  }
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});
