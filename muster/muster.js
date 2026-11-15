(() => {
  const d = document, h = d.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motion = h.hasAttribute("data-motion") && !reduce;
  if (motion) h.classList.add("anim");

  const toggle = d.querySelector("[data-nav-toggle]");
  if (toggle) {
    toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", String(h.classList.toggle("nav-open"))));
    d.querySelectorAll("#nav a").forEach((a) => a.addEventListener("click", () => { h.classList.remove("nav-open"); toggle.setAttribute("aria-expanded", "false"); }));
  }

  d.querySelectorAll("form[data-demo]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = [...f.elements].find((el) => el.willValidate && !el.checkValidity());
    f.querySelectorAll(".f").forEach((l) => l.classList.toggle("is-bad", !!l.querySelector(":invalid")));
    if (bad) { bad.focus(); return; }
    f.reset();
    f.querySelector("[data-ok]").hidden = false;
  }));

  const video = d.querySelector("video");
  if (video && reduce) { video.removeAttribute("autoplay"); video.pause(); }

  const bar = d.querySelector("[data-bar]");
  const layers = motion ? [...d.querySelectorAll("[data-depth]")] : [];
  let vh = innerHeight, tick = false;
  const frame = () => {
    tick = false;
    if (bar) bar.classList.toggle("is-scrolled", scrollY > 24);
    for (const el of layers) {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue;
      el.style.transform = `translate3d(0,${((vh / 2 - (r.top + r.height / 2)) * el.dataset.depth).toFixed(1)}px,0)`;
    }
  };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", () => { vh = innerHeight; frame(); }, { passive: true });
  frame();

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const hs = motion ? [...d.querySelectorAll("[data-hscroll]")] : [];
  const words = motion ? [...d.querySelectorAll("[data-words]")] : [];
  words.forEach((el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" "); });
  const sizeHs = () => hs.forEach((s) => { const t = s.querySelector("[data-track]"); s.style.height = `${t.scrollWidth - innerWidth + innerHeight}px`; });
  const fx = () => {
    for (const s of hs) {
      const t = s.querySelector("[data-track]"), r = s.getBoundingClientRect();
      t.style.transform = `translate3d(${-clamp(-r.top / (r.height - innerHeight)) * (t.scrollWidth - innerWidth)}px,0,0)`;
    }
    for (const el of words) {
      const r = el.getBoundingClientRect(), ws = el.children, p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      for (let i = 0; i < ws.length; i++) ws[i].classList.toggle("on", i / ws.length < p);
    }
  };
  if (hs.length || words.length) {
    sizeHs();
    addEventListener("resize", sizeHs);
    addEventListener("scroll", () => requestAnimationFrame(fx), { passive: true });
    fx();
  }

  if (motion && fine) {
    d.querySelectorAll("[data-magnet]").forEach((el) => {
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`; });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    d.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 8}deg)`; });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  const due = d.querySelector("[data-fristen]");
  if (due) {
    const sel = due.querySelector("select"), out = due.querySelector("[data-out]");
    const fmt = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long" });
    const shift = (dt) => { while (dt.getDay() === 0 || dt.getDay() === 6) dt.setDate(dt.getDate() + 1); return dt; };
    const show = () => {
      const [yy, mm] = sel.value.split("-").map(Number);
      const rows = [[10, "Umsatzsteuer-Voranmeldung und Lohnsteuer-Anmeldung"]];
      if ([3, 6, 9, 12].includes(mm)) rows.push([10, "Vorauszahlung Einkommen- und Körperschaftsteuer"]);
      if ([2, 5, 8, 11].includes(mm)) rows.push([15, "Vorauszahlung Gewerbe- und Grundsteuer"]);
      out.innerHTML = rows.map(([day, t]) => `<li><b>${fmt.format(shift(new Date(yy, mm - 1, day)))}</b><span>${t}</span></li>`).join("");
    };
    const now = new Date();
    sel.innerHTML = Array.from({ length: 6 }, (_, i) => { const m = new Date(now.getFullYear(), now.getMonth() + i, 1); return `<option value="${m.getFullYear()}-${m.getMonth() + 1}">${m.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</option>`; }).join("");
    sel.addEventListener("change", show);
    show();
  }

  if (motion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    d.querySelectorAll("[data-r]").forEach((el) => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      io.observe(el);
    });
  }
})();
