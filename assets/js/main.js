/* ==========================================================================
   CAISSO — анимации лендинга
   ========================================================================== */

// Все вещи дропа. Отсюда строятся 3D-карусель и каталог.
// cat: outer | hoodie | top | cargo | acc. ring: false — не показывать в карусели.
const PRODUCTS = [
  { name: "Пуховик «Панцирь»", cat: "outer", img: "assets/img/hero-jacket.png" },
  { name: "Худи «Звезда»", cat: "hoodie", img: "assets/img/items/hoodie-star.png" },
  { name: "Худи «Орбита»", cat: "hoodie", img: "assets/img/items/hoodie-orbit.png" },
  { name: "Худи «Шип»", cat: "hoodie", img: "assets/img/items/hoodie-thorn.png" },
  { name: "Худи «Глитч»", cat: "hoodie", img: "assets/img/items/hoodie-glitch.png" },
  { name: "Худи «База»", cat: "hoodie", img: "assets/img/items/hoodie-base.png" },
  { name: "Полузамок «Фронт»", cat: "top", img: "assets/img/items/halfzip.png" },
  { name: "Лонгслив «Трек»", cat: "top", img: "assets/img/items/longsleeve.png" },
  { name: "Куртка «Тактик»", cat: "outer", img: "assets/img/items/tactical.png" },
  { name: "Карго «Утилита»", cat: "cargo", img: "assets/img/items/cargo-01.png" },
  { name: "Карго «Пепел»", cat: "cargo", img: "assets/img/items/cargo-02.png" },
  { name: "Карго «Вектор»", cat: "cargo", img: "assets/img/items/cargo-03.png" },
  { name: "Карго «Вертикаль»", cat: "cargo", img: "assets/img/items/cargo-04.png" },
  { name: "Маска «Ноль»", cat: "acc", img: "assets/img/items/mask.png", ring: false },
  { name: "Шапка и сумка-слинг", cat: "acc", img: "assets/img/items/beanie-bag.png", ring: false },
  { name: "Кепка «Лого»", cat: "acc", img: "assets/img/items/cap.png", ring: false },
  { name: "Очки «Визор»", cat: "acc", img: "assets/img/items/glasses.png", ring: false },
];

const CATS = { outer: "Куртки", hoodie: "Худи", top: "Верх", cargo: "Карго", acc: "Аксессуары" };

(() => {
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  let lenis = null;
  let scrollVelocity = 0;

  /* ---------- Плавный скролл ---------- */
  function initScroll() {
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
      lenis.on("scroll", (e) => {
        scrollVelocity = e.velocity || 0;
        if (hasGSAP) ScrollTrigger.update();
      });
      if (hasGSAP) {
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
      lenis.stop();
    } else {
      let lastY = scrollY;
      addEventListener("scroll", () => { scrollVelocity = scrollY - lastY; lastY = scrollY; }, { passive: true });
    }

    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id === "#top" ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.6 });
        else (target === 0 ? document.body : target).scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------- Курсор ---------- */
  function initCursor() {
    if (!canHover) return;
    const cur = $(".cursor");
    const label = $(".cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      cur.classList.add("is-visible");
    });
    document.addEventListener("pointerleave", () => cur.classList.remove("is-visible"));
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const hov = e.target.closest("a, button, [data-hover], .row");
      cur.classList.toggle("is-label", !!lab && !hov);
      cur.classList.toggle("is-hover", !!hov);
      if (lab) label.textContent = lab.dataset.cursor;
    });
  }

  /* ---------- 3D-карусель ---------- */
  function initCarousel() {
    const ring = $(".js-ring");
    const stage = ring.parentElement;
    PRODUCTS.filter((p) => p.ring !== false).forEach((p, i) => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `<img src="${p.img}" alt="" decoding="async"><span class="card__name"><span>${p.name}</span><span>${String(i + 1).padStart(2, "0")}</span></span><i class="card__shade"></i>`;
      ring.append(c);
    });

    const cards = $$(".card", ring);
    const shades = cards.map((c) => $(".card__shade", c));
    const N = cards.length;
    const step = 360 / N;
    let R = 0, tilt = -9;

    let flat = false; // на телефоне вместо 3D-кольца — плоская лента со свайпом
    function layout() {
      const mobile = innerWidth < 900;
      flat = mobile;
      stage.classList.toggle("carousel--flat", flat);
      if (flat) {
        ring.style.transform = "";
        cards.forEach((c) => { c.style.transform = ""; });
        return;
      }
      const cw = mobile ? Math.min(innerWidth * 0.36, 190) : Math.max(150, Math.min(260, innerWidth * 0.15, innerHeight * 0.3));
      ring.style.setProperty("--cw", cw + "px");
      R = (cw / 2) / Math.tan(Math.PI / N) * 1.08;
      tilt = mobile ? -7 : -9;
      cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
    }
    layout();
    addEventListener("resize", layout);

    const BASE = reduce ? 0 : -8; // градусов в секунду
    let angle = 0, boost = 0, dragging = false, lastX = 0, lastT = 0, inView = false;

    stage.addEventListener("pointerdown", (e) => {
      if (flat) return;
      dragging = true; lastX = e.clientX; lastT = performance.now();
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging || flat) return;
      const now = performance.now();
      const d = (e.clientX - lastX) * 0.22;
      const dt = Math.max(1, now - lastT) / 1000;
      angle += d;
      boost = Math.max(-400, Math.min(400, d / dt)) - BASE;
      lastX = e.clientX; lastT = now;
    });
    const end = () => { dragging = false; };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { rootMargin: "100px" }).observe(stage);

    let prev = performance.now();
    (function loop(now) {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (inView && !flat) {
        if (!dragging) {
          boost *= Math.pow(0.04, dt);           // плавное затухание после броска
          boost += -scrollVelocity * 0.9 * (reduce ? 0 : 1); // скролл раскручивает кольцо
          angle += (BASE + boost) * dt;
        }
        ring.style.transform = `translateZ(${-R}px) rotateX(${tilt}deg) rotateY(${angle}deg)`;
        for (let i = 0; i < N; i++) {
          const a = ((i * step + angle) * Math.PI) / 180;
          shades[i].style.opacity = ((1 - Math.cos(a)) / 2 * 0.72).toFixed(3);
        }
      }
      requestAnimationFrame(loop);
    })(prev);
  }

  /* ---------- Каталог с фильтрами ---------- */
  let setFilter = () => {};
  function initCatalog() {
    const grid = $(".js-grid");
    grid.innerHTML = PRODUCTS.map((p, i) => `
      <article class="item" data-cat="${p.cat}">
        <div class="item__img">
          <span class="item__num">${String(i + 1).padStart(2, "0")}</span>
          <img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async">
        </div>
        <div class="item__meta">
          <h3 class="item__name">${p.name}</h3>
          <span class="item__cat">${CATS[p.cat]}</span>
        </div>
      </article>`).join("");

    const items = $$(".item", grid);
    const buttons = $$(".filter");
    buttons.forEach((b) => {
      const n = b.dataset.filter === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === b.dataset.filter).length;
      b.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
      b.addEventListener("click", () => setFilter(b.dataset.filter));
    });

    setFilter = (f) => {
      buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === f));
      const show = items.filter((it) => f === "all" || it.dataset.cat === f);
      items.forEach((it) => it.classList.toggle("is-hidden", !show.includes(it)));
      if (hasGSAP && !reduce) {
        gsap.fromTo(show, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "expo.out", overwrite: true });
      }
      if (hasGSAP) ScrollTrigger.refresh();
      if (lenis) lenis.resize();
    };

    // строки категорий открывают нужный фильтр
    $$(".row[data-filter]").forEach((row) => {
      row.addEventListener("click", () => {
        setFilter(row.dataset.filter);
        const target = $("#catalog");
        if (lenis) lenis.scrollTo(target, { duration: 1.4 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------- Картинка при наведении на силуэт ---------- */
  function initHoverImage() {
    if (!canHover) return;
    const box = $(".hover-img");
    const img = $("img", box);
    let x = 0, y = 0, cx = 0, cy = 0, rot = 0;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
    (function loop() {
      const dx = x - cx;
      cx += dx * 0.12; cy += (y - cy) * 0.12;
      rot += (Math.max(-8, Math.min(8, dx * 0.05)) - rot) * 0.1;
      box.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${rot}deg)`;
      requestAnimationFrame(loop);
    })();
    $$(".row").forEach((row) => {
      row.addEventListener("pointerenter", () => {
        img.src = row.dataset.img;
        box.classList.add("is-on");
      });
      row.addEventListener("pointerleave", () => box.classList.remove("is-on"));
    });
  }

  /* ---------- Hero: параллакс за мышью ---------- */
  function initHeroParallax() {
    if (!canHover || reduce || !hasGSAP) return;
    const hero = $(".hero");
    const product = $(".hero__product");
    const title = $(".hero__title");
    const ghost = $(".hero__ghost");
    const px = gsap.quickTo(product, "x", { duration: 1.2, ease: "power3" });
    const py = gsap.quickTo(product, "y", { duration: 1.2, ease: "power3" });
    const tx = gsap.quickTo(title, "x", { duration: 1.4, ease: "power3" });
    const gx = gsap.quickTo(ghost, "x", { duration: 1.8, ease: "power3" });
    hero.addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      px(nx * 30); py(ny * 18);
      tx(nx * -14);
      gx(nx * -50);
    });
  }

  /* ---------- Анимации на GSAP ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w${w === "CAISSO" ? " w--brand" : ""}">${w}</span>`).join(" ");
    return $$(".w", el);
  }

  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero уходит при скролле (только на десктопе — на телефоне блоки не должны наезжать друг на друга)
    if (innerWidth >= 900) {
      const heroScrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero__title", { yPercent: 40, opacity: 0.15, ease: "none", scrollTrigger: heroScrub });
      gsap.to(".hero__img", { yPercent: -8, ease: "none", scrollTrigger: heroScrub });
      gsap.to(".hero__product", { scale: 1.08, transformOrigin: "50% 100%", ease: "none", scrollTrigger: heroScrub });
    }

    // О бренде: слова проявляются по скроллу
    const words = splitWords($(".js-words"));
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".about__text", start: "top 80%", end: "bottom 55%", scrub: true },
    });

    // Заголовки «выезжают» из-под маски
    $$(".drop__title, .contacts__title").forEach((h) => {
      gsap.from($$(".line__in", h), {
        yPercent: 110, duration: 1.2, stagger: 0.09, ease: "expo.out",
        scrollTrigger: { trigger: h, start: "top 85%" },
      });
    });

    // Карусель въезжает
    gsap.from(".carousel__ring", {
      scale: 0.7, opacity: 0, duration: 1.8, ease: "expo.out",
      scrollTrigger: { trigger: ".drop", start: "top 60%" },
    });

    // Мелкий текст и кнопки
    $$(".label, .drop__note, .drop__cta, .section-head > .micro, .filters, .contacts__lead").forEach((el) => {
      gsap.from(el, {
        y: 24, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 98%" },
      });
    });

    // Строки списка силуэтов
    gsap.from(".row", {
      y: 60, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out",
      scrollTrigger: { trigger: ".list", start: "top 80%" },
    });

    // Цифры считаются
    $$(".js-num").forEach((el) => {
      const to = +el.dataset.to;
      const pad = +(el.dataset.pad || 0);
      const pre = el.dataset.prefix || "";
      const fmt = (v) => pre + String(Math.round(v)).padStart(pad, "0");
      el.textContent = fmt(0);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 2, ease: "power3.out",
        onUpdate: () => (el.textContent = fmt(o.v)),
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
    gsap.from(".fact", {
      y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: ".facts", start: "top 90%" },
    });

    // Карточки каталога
    ScrollTrigger.batch(".item", {
      start: "top 92%",
      onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.06, ease: "expo.out", overwrite: true }),
    });
    gsap.set(".item", { opacity: 0 });

    // Контакты
    gsap.from(".contact", {
      y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".contacts__grid", start: "top 95%" },
    });
  }

  /* ---------- Прелоадер + интро ---------- */
  function intro() {
    const loader = $(".loader");
    const done = () => {
      document.body.classList.remove("is-loading");
      if (lenis) lenis.start();
    };

    if (!hasGSAP) { loader.remove(); done(); return; }

    const heroLines = $$(".hero__title .line__in");
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set(".hero__product", { y: "18vh", opacity: 0 });
    gsap.set(".hero__img", { scale: 0.9 });
    gsap.set([".header", ".reveal-fade"], { opacity: 0 });

    const count = { v: 0 };
    const countEl = $(".js-count");
    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))),
    ]);

    const tl = gsap.timeline();
    tl.fromTo(".loader__brand span", { yPercent: 105 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "expo.out" })
      .to(count, {
        v: 100, duration: reduce ? 0.2 : 1.3, ease: "power2.inOut",
        onUpdate: () => {
          countEl.textContent = String(Math.round(count.v)).padStart(3, "0");
          gsap.set(".loader__bar i", { scaleX: count.v / 100 });
        },
      }, 0.1);

    tl.add(() => {
      tl.pause();
      ready.then(() => tl.resume());
    });

    tl.to(".loader__brand span", { yPercent: -105, duration: 0.6, stagger: 0.04, ease: "expo.in" })
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15")
      .add(done, "-=0.6")
      .to(heroLines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: "expo.out" }, "-=0.55")
      .to(".hero__product", { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" }, "<0.15")
      .to(".hero__img", { scale: 1, duration: 2.2, ease: "expo.out" }, "<")
      .to([".header", ".reveal-fade"], { opacity: 1, duration: 1, stagger: 0.05 }, "<0.5")
      .add(() => {
        loader.remove();
        if (!reduce) {
          gsap.to(".hero__img", { y: -14, rotation: 0.6, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }
      });
  }

  /* ---------- Старт ---------- */
  initScroll();
  initCursor();
  initCarousel();
  initCatalog();
  initHoverImage();
  if (hasGSAP) {
    initScrollAnimations();
    initHeroParallax();
  }
  intro();
})();
