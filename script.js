"use strict";

/* ==========================================================================
   CONTENT: edit any words or captions here.
   ========================================================================== */

const CONTENT = {
  letter: {
    greeting: "Dear Bal,",
    paragraphs: [
      "I know that this code may not be perfect, but I wanted to create something that feels personal.",
      "You are special to me in a way that simple words cannot fully explain.",
      "I know sometimes labad kas ulo gamay, but I still love you. Always.",
      "Thank you for being part of my life. ♥"
    ],
    signature: "Joseph"
  },

  moments: [
    { src: "images/memories/01.jpg", caption: "Walking anywhere, as long as it's next to you", alt: "Joseph and Bal walking together at the mall", position: "68% 30%" },
    { src: "images/memories/02.jpg", caption: "My favorite kind of chaos", alt: "A close-up selfie of Bal and Joseph", position: "center 40%" },
    { src: "images/memories/03.jpg", caption: "Sun-kissed and side by side", alt: "Joseph and Bal side by side under the trees", position: "center 45%" },
    { src: "images/memories/04.jpg", caption: "Even errands feel like dates with you", alt: "Joseph and Bal in a grocery aisle", position: "center 30%" },
    { src: "images/memories/05.jpg", caption: "Caught one", alt: "Bal blowing a kiss at the camera", position: "center 35%" },
    { src: "images/memories/06.jpg", caption: "Still beautiful from every angle. Yes, even this one", alt: "A playful low-angle selfie of Bal", position: "center 40%" },
    { src: "images/memories/07.jpg", caption: "King and queen, officially", alt: "Joseph and Bal wearing paper crowns at a birthday party", position: "center 55%" }
  ],

  reasons: [
    "You make me smile even on tough days.",
    "You make ordinary days feel special.",
    "Your presence gives me peace.",
    "You inspire me to become better.",
    "You are beautiful in ways that matter most.",
    "You are someone I am grateful for."
  ],

  future: [
    "I hope we can create more memories, support each other, grow together, and experience more beautiful days.",
    "Maybe more adventures, more laughter, more late-night talks, and more reasons to smile."
  ],

  finaleLines: [
    "System scan complete…",
    "Searching for Joseph's favorite person…"
  ],

  dateAsk: {
    // The No button changes its label each time it escapes.
    noLabels: ["No", "Are you sure?", "Think again", "Can't catch me", "Nope", "Just press yes"],
    yesTitle: "It's a date!",
    yesText: "You just made me the happiest person. I can't wait, Bal. ♥"
  },

  credits: [
    { role: "Starring", name: "Bal" },
    { role: "And", name: "Joseph" },
    { role: "Written & directed by", name: "Joseph" },
    { role: "Filmed on location", name: "Malls, grocery aisles, birthday tables & sunny days" },
    { role: "Soundtrack", name: "Your laugh" },
    { role: "Special thanks", name: "You, for being part of my life" }
  ]
};

/* ==========================================================================
   Settings
   ========================================================================== */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TIMING = {
  creditStart: REDUCED_MOTION ? 0 : 400,
  creditStep: REDUCED_MOTION ? 0 : 1150,
  minIntro: REDUCED_MOTION ? 500 : 3900,
  preloadTimeout: 8000,
  envelopeToFilm: REDUCED_MOTION ? 250 : 1800,
  loaderFade: 1400,
  typeChar: REDUCED_MOTION ? 0 : 42,
  linePause: REDUCED_MOTION ? 0 : 520
};

const POLAROID_TILTS = [-3, 2.4, -1.6, 3.2, -2.4, 1.6, -1.2, 2.8];
const SAVED_MEMORIES_KEY = "loveMemories";
const MOTE_COUNT = 18;
const BURST_COUNT = 30;
const NO_BUTTON_PADDING = 16;
const NO_BUTTON_MIN_JUMP = 140;
const NO_BUTTON_TRIES = 25;
const NO_BUTTON_COOLDOWN_MS = 350;
const YES_GROWTH_STEP = 0.08;
const YES_GROWTH_MAX = 1.6;

let allMoments = [];

/* ==========================================================================
   Boot
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderLetter();
  renderMoments();
  renderReasons();
  renderFuture();
  renderCredits();
  setupLightbox();
  setupDateAsk();
  runIntro();
});

/* ==========================================================================
   Helpers
   ========================================================================== */

function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function markReveal(node, index = 0) {
  node.setAttribute("data-reveal", "");
  node.style.setProperty("--i", String(index));
  return node;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function observeOnce(target, threshold, callback) {
  if (!target) return;

  if (!("IntersectionObserver" in window)) {
    callback();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      callback();
    }
  }, { threshold });

  observer.observe(target);
}

/* ==========================================================================
   Opening sequence
   ========================================================================== */

function runIntro() {
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  const status = document.getElementById("loaderStatus");
  const envelope = document.getElementById("envelope");

  loader.querySelectorAll(".credit").forEach((credit, index) => {
    setTimeout(() => credit.classList.add("is-shown"), TIMING.creditStart + index * TIMING.creditStep);
  });

  const setProgress = (ratio) => {
    fill.style.transform = `scaleX(${ratio})`;
  };

  const imagesReady = preloadImages(CONTENT.moments.map((moment) => moment.src), setProgress);
  const imagesOrTimeout = Promise.race([imagesReady, wait(TIMING.preloadTimeout)]);

  Promise.all([imagesOrTimeout, wait(TIMING.minIntro)]).then(() => {
    setProgress(1);
    status.textContent = "Ready when you are";
    loader.classList.add("is-ready");
    envelope.disabled = false;
    envelope.focus({ preventScroll: true });
  });

  envelope.addEventListener("click", () => {
    envelope.classList.add("is-open");
    envelope.disabled = true;
    status.textContent = "♥";
    setTimeout(() => startFilm(loader), TIMING.envelopeToFilm);
  }, { once: true });
}

function preloadImages(sources, onProgress) {
  let loaded = 0;

  return Promise.all(sources.map((src) => new Promise((resolve) => {
    const image = new Image();
    const finish = () => {
      loaded += 1;
      onProgress(loaded / sources.length);
      resolve();
    };

    image.onload = finish;
    image.onerror = () => {
      console.warn(`Could not load photo: ${src}`);
      finish();
    };
    image.src = src;
  })));
}

function startFilm(loader) {
  const film = document.getElementById("film");

  loader.classList.add("is-done");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-playing");
  film.inert = false;

  setTimeout(() => {
    loader.hidden = true;
  }, TIMING.loaderFade);

  setupReveals();
  setupFinale();
  createMotes();
  document.getElementById("heroTitle").focus({ preventScroll: true });
}

/* ==========================================================================
   Scroll reveals & ambient light
   ========================================================================== */

function setupReveals() {
  const targets = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

  targets.forEach((target) => observer.observe(target));
}

function createMotes() {
  if (REDUCED_MOTION) return;

  const container = document.getElementById("sparkles");

  for (let i = 0; i < MOTE_COUNT; i += 1) {
    const mote = createEl("span", "mote");
    mote.style.left = `${randomBetween(0, 100)}vw`;
    mote.style.setProperty("--size", `${randomBetween(3, 9)}px`);
    mote.style.setProperty("--dur", `${randomBetween(14, 28)}s`);
    mote.style.setProperty("--delay", `${randomBetween(-28, 0)}s`);
    mote.style.setProperty("--dx", `${randomBetween(-60, 60)}px`);
    mote.style.setProperty("--o", String(randomBetween(0.25, 0.7)));
    container.appendChild(mote);
  }
}

/* ==========================================================================
   Scene 2: Letter
   ========================================================================== */

function renderLetter() {
  const body = document.getElementById("letterBody");
  const { greeting, paragraphs, signature } = CONTENT.letter;

  body.appendChild(markReveal(createEl("p", "letter-greeting script", greeting)));

  paragraphs.forEach((text, index) => {
    body.appendChild(markReveal(createEl("p", "letter-line", text), index + 1));
  });

  document.getElementById("letterSignature").textContent = signature;
}

/* ==========================================================================
   Scene 3: Moments (built-in photos + anything added on admin.html)
   ========================================================================== */

function readSavedMemories() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_MEMORIES_KEY));
    if (!Array.isArray(saved)) return [];

    return saved
      .filter((memory) => memory && typeof memory.image === "string" && memory.image.startsWith("data:image/"))
      .map((memory) => ({
        src: memory.image,
        caption: memory.title || "A special memory",
        note: memory.desc || "",
        alt: memory.title ? `${memory.title} memory photo` : "Memory photo",
        position: "center"
      }));
  } catch (error) {
    console.warn("Saved memories could not be read.", error);
    return [];
  }
}

function renderMoments() {
  const grid = document.getElementById("momentsGrid");
  allMoments = [...CONTENT.moments, ...readSavedMemories()];

  allMoments.forEach((moment, index) => {
    const item = markReveal(createEl("li"), index % 3);
    const card = createEl("button", "polaroid");
    const image = createEl("img");
    const caption = createEl("span", "polaroid-caption", moment.caption);

    card.type = "button";
    card.style.setProperty("--tilt", `${POLAROID_TILTS[index % POLAROID_TILTS.length]}deg`);
    card.setAttribute("aria-label", `Open photo: ${moment.caption}`);

    image.src = moment.src;
    image.alt = moment.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.style.objectPosition = moment.position || "center";

    if (moment.note) {
      caption.appendChild(createEl("span", "polaroid-note", moment.note));
    }

    card.append(image, caption);
    card.addEventListener("click", () => openLightbox(index, card));
    item.appendChild(card);
    grid.appendChild(item);
  });
}

/* ==========================================================================
   Lightbox
   ========================================================================== */

const lightbox = {
  root: null,
  image: null,
  caption: null,
  note: null,
  index: 0,
  returnFocus: null
};

function setupLightbox() {
  lightbox.root = document.getElementById("lightbox");
  lightbox.image = document.getElementById("lightboxImg");
  lightbox.caption = document.getElementById("lightboxCaption");
  lightbox.note = document.getElementById("lightboxNote");

  lightbox.root.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.root.querySelector(".lightbox-prev").addEventListener("click", () => showMoment(lightbox.index - 1));
  lightbox.root.querySelector(".lightbox-next").addEventListener("click", () => showMoment(lightbox.index + 1));

  lightbox.root.addEventListener("click", (event) => {
    if (event.target === lightbox.root) closeLightbox();
  });

  document.addEventListener("keydown", handleLightboxKeys);
}

function openLightbox(index, trigger) {
  lightbox.returnFocus = trigger;
  showMoment(index);

  lightbox.root.hidden = false;
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => lightbox.root.classList.add("is-open"));
  lightbox.root.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
  if (lightbox.root.hidden) return;

  lightbox.root.classList.remove("is-open");
  document.body.classList.remove("no-scroll");

  setTimeout(() => {
    lightbox.root.hidden = true;
  }, 300);

  if (lightbox.returnFocus) lightbox.returnFocus.focus();
}

function showMoment(index) {
  const total = allMoments.length;
  lightbox.index = (index + total) % total;

  const moment = allMoments[lightbox.index];
  lightbox.image.src = moment.src;
  lightbox.image.alt = moment.alt;
  lightbox.caption.textContent = moment.caption;
  lightbox.note.textContent = moment.note || "";
}

function handleLightboxKeys(event) {
  if (lightbox.root.hidden) return;

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    showMoment(lightbox.index - 1);
  } else if (event.key === "ArrowRight") {
    showMoment(lightbox.index + 1);
  } else if (event.key === "Tab") {
    trapFocus(event);
  }
}

function trapFocus(event) {
  const buttons = [...lightbox.root.querySelectorAll("button")];
  const first = buttons[0];
  const last = buttons[buttons.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ==========================================================================
   Scene 4: Reasons
   ========================================================================== */

function renderReasons() {
  const grid = document.getElementById("reasonsGrid");

  CONTENT.reasons.forEach((reason, index) => {
    const number = String(index + 1).padStart(2, "0");
    const item = markReveal(createEl("li"), index % 3);
    const card = createEl("button", "reason-card");
    const inner = createEl("span", "reason-inner");
    const front = createEl("span", "reason-face reason-front");
    const back = createEl("span", "reason-face reason-back");

    card.type = "button";
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-label", `Reason ${number}`);

    front.append(
      createEl("span", "reason-number", `No. ${number}`),
      createEl("span", "reason-hint", "Tap to read")
    );
    back.appendChild(createEl("span", "", reason));
    back.setAttribute("aria-hidden", "true");

    card.addEventListener("click", () => {
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(flipped));
      card.setAttribute("aria-label", flipped ? `Reason ${number}: ${reason}` : `Reason ${number}`);
    });

    inner.append(front, back);
    card.appendChild(inner);
    item.appendChild(card);
    grid.appendChild(item);
  });
}

/* ==========================================================================
   Scene 5: Future
   ========================================================================== */

function renderFuture() {
  const body = document.getElementById("futureBody");

  CONTENT.future.forEach((text, index) => {
    body.appendChild(markReveal(createEl("p", "", text), index + 2));
  });
}

/* ==========================================================================
   Scene 6: Finale & credits
   ========================================================================== */

function setupFinale() {
  const finale = document.getElementById("finale");
  const credits = document.getElementById("credits");
  const foundWord = document.getElementById("foundWord");

  observeOnce(finale, 0.5, () => playFinale(finale, foundWord));
  observeOnce(credits, 0.3, () => credits.classList.add("is-rolling"));

  document.getElementById("againBtn").addEventListener("click", () => burstHearts(foundWord));
}

async function playFinale(finale, foundWord) {
  const lines = document.getElementById("searchLines");

  for (const text of CONTENT.finaleLines) {
    const line = createEl("p");
    lines.appendChild(line);
    await typeText(line, text);
    await wait(TIMING.linePause);
  }

  finale.classList.add("is-found");
  await wait(REDUCED_MOTION ? 0 : 600);
  burstHearts(foundWord);
}

async function typeText(node, text) {
  if (!TIMING.typeChar) {
    node.textContent = text;
    return;
  }

  for (let i = 1; i <= text.length; i += 1) {
    node.textContent = text.slice(0, i);
    await wait(TIMING.typeChar);
  }
}

function burstHearts(anchor) {
  if (REDUCED_MOTION || !anchor) return;

  const rect = anchor.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < BURST_COUNT; i += 1) {
    const isGold = i % 3 === 0;
    const piece = createEl("span", isGold ? "burst-piece burst-piece--gold" : "burst-piece", isGold ? "✦" : "♥");
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(110, 340);

    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--r", `${randomBetween(-90, 90)}deg`);
    piece.style.setProperty("--size", `${randomBetween(14, 30)}px`);
    piece.style.animationDelay = `${randomBetween(0, 0.25)}s`;
    piece.addEventListener("animationend", () => piece.remove());

    document.body.appendChild(piece);
  }
}

function renderCredits() {
  const list = document.getElementById("creditsList");

  CONTENT.credits.forEach(({ role, name }) => {
    const line = createEl("div", "credit-line");
    line.append(createEl("span", "credit-role", role), createEl("span", "credit-name", name));
    list.appendChild(line);
  });
}

/* ==========================================================================
   Scene 7: The question (the No button runs away)
   ========================================================================== */

function setupDateAsk() {
  const section = document.getElementById("dateAsk");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  let escapes = 0;
  let lastEscape = 0;

  const escape = (event) => {
    if (event) event.preventDefault();
    // One tap fires both pointerdown and click; count it once.
    if (Date.now() - lastEscape < NO_BUTTON_COOLDOWN_MS) return;
    lastEscape = Date.now();
    escapes += 1;
    noBtn.textContent = CONTENT.dateAsk.noLabels[escapes % CONTENT.dateAsk.noLabels.length];
    yesBtn.style.setProperty("--grow", String(Math.min(1 + escapes * YES_GROWTH_STEP, YES_GROWTH_MAX)));
    moveNoButton(section, noBtn, yesBtn);
  };

  // Mouse gets close, finger touches it, keyboard focuses it, or a click slips through.
  // pointermove too: after a jump the browser may still think the cursor is
  // "over" the button, so pointerenter alone would not fire again.
  const escapeFromMouse = (event) => {
    if (event.pointerType === "mouse") escape();
  };
  noBtn.addEventListener("pointerenter", escapeFromMouse);
  noBtn.addEventListener("pointermove", escapeFromMouse);
  noBtn.addEventListener("pointerdown", escape);
  noBtn.addEventListener("click", escape);
  noBtn.addEventListener("focus", () => {
    if (noBtn.matches(":focus-visible")) escape();
  });

  yesBtn.addEventListener("click", () => sayYes(yesBtn, noBtn));
}

function moveNoButton(section, noBtn, yesBtn) {
  const area = section.getBoundingClientRect();

  if (!noBtn.classList.contains("is-running")) {
    const start = noBtn.getBoundingClientRect();
    section.appendChild(noBtn);
    noBtn.classList.add("is-running");
    noBtn.style.transform = `translate(${start.left - area.left}px, ${start.top - area.top}px)`;
    void noBtn.offsetWidth; // commit the start position so the first jump animates
  }

  const target = pickNoButtonSpot(area, noBtn.getBoundingClientRect(), yesBtn.getBoundingClientRect());
  noBtn.style.transform = `translate(${target.x}px, ${target.y}px)`;
}

function pickNoButtonSpot(area, current, yes) {
  // Only use the part of the section that is on screen, so it never hides.
  const minX = NO_BUTTON_PADDING;
  const maxX = Math.max(minX, area.width - current.width - NO_BUTTON_PADDING);
  const minY = Math.max(0, -area.top) + NO_BUTTON_PADDING;
  const maxY = Math.max(minY, Math.min(area.height, window.innerHeight - area.top) - current.height - NO_BUTTON_PADDING);

  const currentX = current.left - area.left;
  const currentY = current.top - area.top;
  const yesBox = {
    left: yes.left - area.left - 24,
    right: yes.right - area.left + 24,
    top: yes.top - area.top - 24,
    bottom: yes.bottom - area.top + 24
  };

  let spot = { x: randomBetween(minX, maxX), y: randomBetween(minY, maxY) };

  for (let i = 0; i < NO_BUTTON_TRIES; i += 1) {
    const candidate = { x: randomBetween(minX, maxX), y: randomBetween(minY, maxY) };
    const overlapsYes = candidate.x < yesBox.right && candidate.x + current.width > yesBox.left
      && candidate.y < yesBox.bottom && candidate.y + current.height > yesBox.top;
    const jump = Math.hypot(candidate.x - currentX, candidate.y - currentY);

    if (!overlapsYes && jump >= NO_BUTTON_MIN_JUMP) {
      spot = candidate;
      break;
    }
  }

  return spot;
}

function sayYes(yesBtn, noBtn) {
  const answer = document.getElementById("dateAnswer");

  document.getElementById("dateAnswerTitle").textContent = CONTENT.dateAsk.yesTitle;
  document.getElementById("dateAnswerText").textContent = CONTENT.dateAsk.yesText;

  burstHearts(yesBtn);
  noBtn.remove();
  document.getElementById("dateChoices").hidden = true;
  answer.hidden = false;

  setTimeout(() => burstHearts(document.getElementById("dateAnswerTitle")), REDUCED_MOTION ? 0 : 700);
}
