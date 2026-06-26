const BOOT_MESSAGES = [
  "Initializing love system...",
  "Loading memories...",
  "Checking happiness level...",
  "Connecting to special person...",
  "Access granted"
];

const APP_CONTENT = {
  letter: {
    title: "&#128140; Love Letter",
    intro: `
      <p>Dear Bal,</p>
      <p>I know that this code may not be perfect, but I wanted to create something that feels personal.</p>
      <p>You are special to me in a way that simple words cannot fully explain.</p>
      <p>I know sometimes labad kas ulo gamay, but I still love you. Always.</p>
      <p>Thank you for being part of my life. &#10084;&#65039;</p>
    `,
    botReply: "This is Joseph's love letter. He wanted to express his feelings in a unique way, just for you."
  },
  reasons: {
    title: "&#127804; Reasons I Love You",
    intro: `
      <ul>
        <li>You make me smile even on tough days.</li>
        <li>You make ordinary days feel special.</li>
        <li>Your presence gives me peace.</li>
        <li>You inspire me to become better.</li>
        <li>You are beautiful in ways that matter most.</li>
        <li>You are someone I am grateful for.</li>
      </ul>
    `,
    botReply: "Reasons I Love You opened. Joseph has many reasons to love you, and he wanted to share some of them here."
  },
  future: {
    title: "&#127769; Future Plans",
    intro: `
      <p>I hope we can create more memories, support each other, grow together, and experience more beautiful days.</p>
      <p>Maybe more adventures, more laughter, more late-night talks, and more reasons to smile.</p>
    `,
    botReply: "Future Plans opened. This is where Joseph dreams about more memories with you."
  },
  surprise: {
    title: "&#127873; Final Surprise",
    intro: `
      <p>System scan complete...</p>
      <p>Searching for Joseph's favorite person...</p>
      <h2>Found: You &#10084;&#65039;</h2>
      <p>You are the final surprise.</p>
    `,
    botReply: "Surprise unlocked! You are the final surprise.",
    onOpen: burstHearts
  }
};

let bootIndex = 0;
let typingIndicator = null;

const bootText = document.getElementById("bootText");
const chatBox = document.getElementById("chatBox");
const assistant = document.getElementById("assistant");
const assistantToggle = document.getElementById("assistantToggle");
const assistantClose = document.getElementById("assistantClose");
const userInput = document.getElementById("userInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

const bootInterval = setInterval(() => {
  if (bootText && BOOT_MESSAGES[bootIndex]) {
    bootText.textContent = BOOT_MESSAGES[bootIndex];
    bootIndex += 1;
  }

  if (bootIndex >= BOOT_MESSAGES.length) {
    clearInterval(bootInterval);
  }
}, 800);

setTimeout(() => {
  document.getElementById("bootScreen").style.display = "none";
  document.getElementById("desktop").classList.remove("hidden");
  assistant.classList.remove("hidden");
}, 4300);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".apps [data-app]").forEach((button) => {
    button.addEventListener("click", () => {
      openApp(button.dataset.app);
    });
  });

  document.querySelectorAll("#quickReplies button").forEach((button) => {
    button.addEventListener("click", () => {
      handleQuickReply(button);
    });
  });

  assistantToggle.addEventListener("click", openAssistant);
  assistantClose.addEventListener("click", closeAssistant);
  sendMessageBtn.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  document.querySelector(".stickman").addEventListener("click", assistantTalk);
  document.querySelector(".stickman").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      assistantTalk();
    }
  });
});

function openAssistant() {
  assistant.classList.remove("is-closed");
  assistantToggle.setAttribute("aria-expanded", "true");
  userInput.focus();
}

function closeAssistant() {
  assistant.classList.add("is-closed");
  assistantToggle.setAttribute("aria-expanded", "false");
}

function openApp(appName, options = {}) {
  const windowBox = document.getElementById("window");
  const content = document.getElementById("windowContent");

  if (!windowBox || !content) return;

  windowBox.classList.remove("hidden");

  if (appName === "memories") {
    renderMemories(content);
    if (!options.silent) {
      addBotMessage("You opened Memories. These are the photos Joseph added for you.");
    }
  } else if (APP_CONTENT[appName]) {
    const app = APP_CONTENT[appName];

    content.innerHTML = `
      <h2>${app.title}</h2>
      ${app.intro}
    `;

    if (!options.silent) {
      addBotMessage(app.botReply);
    }

    if (typeof app.onOpen === "function") {
      app.onOpen();
    }
  }

  windowBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMemories(content) {
  const memories = getMemories();
  const gallery = document.createElement("div");
  gallery.className = "memory-gallery";

  content.innerHTML = `
    <h2>&#128248; Memories</h2>
    <p>Every moment with you is a memory worth keeping.</p>
  `;

  if (memories.length === 0) {
    content.insertAdjacentHTML("beforeend", `
      <p>No memories added yet.</p>
      <p>Go to the Admin Page and upload your photos.</p>
    `);
    return;
  }

  memories.forEach((memory) => {
    const card = document.createElement("article");
    card.className = "memory-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${memory.title || "memory photo"}`);

    const imageWrap = document.createElement("div");
    imageWrap.className = "memory-image-wrap";
    const image = document.createElement("img");
    image.src = memory.image;
    image.alt = memory.title ? `${memory.title} memory photo` : "Memory photo";

    const text = document.createElement("div");
    text.className = "memory-text";
    const title = document.createElement("strong");
    const desc = document.createElement("p");

    title.textContent = memory.title || "Untitled Memory";
    desc.textContent = memory.desc || "A special memory.";

    imageWrap.appendChild(image);
    text.append(title, desc);
    card.append(imageWrap, text);
    card.addEventListener("click", () => openMemoryLightbox(memory));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMemoryLightbox(memory);
      }
    });

    gallery.appendChild(card);
  });

  content.appendChild(gallery);
}

function openMemoryLightbox(memory) {
  closeMemoryLightbox();

  const lightbox = document.createElement("div");
  const inner = document.createElement("div");
  const frame = document.createElement("div");
  const image = document.createElement("img");
  const closeButton = document.createElement("button");
  const caption = document.createElement("div");
  const title = document.createElement("strong");
  const desc = document.createElement("p");

  lightbox.className = "memory-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");

  inner.className = "memory-lightbox-inner";
  frame.className = "memory-lightbox-frame";
  closeButton.className = "memory-lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close memory photo");
  closeButton.innerHTML = "&times;";

  image.src = memory.image;
  image.alt = memory.title ? `${memory.title} memory photo` : "Memory photo";

  caption.className = "memory-lightbox-caption";
  title.textContent = memory.title || "Untitled Memory";
  desc.textContent = memory.desc || "A special memory.";

  caption.append(title, desc);
  frame.append(image, closeButton);
  inner.append(frame, caption);
  lightbox.appendChild(inner);
  document.body.appendChild(lightbox);

  closeButton.focus();
  closeButton.addEventListener("click", closeMemoryLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeMemoryLightbox();
    }
  });
}

function closeMemoryLightbox() {
  const existingLightbox = document.querySelector(".memory-lightbox");

  if (existingLightbox) {
    existingLightbox.remove();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMemoryLightbox();
  }
});

function closeApp() {
  document.getElementById("window").classList.add("hidden");
  closeMemoryLightbox();
}

function sendMessage() {
  const question = userInput.value.trim();

  if (!question) return;

  openAssistant();
  addUserMessage(question);
  userInput.value = "";

  respondAfterDelay(question);
}

function handleQuickReply(button) {
  const answer = button.dataset.answer;

  openAssistant();

  if (answer) {
    addUserMessage(answer);
    respondAfterDelay(answer);
  }
}

function respondAfterDelay(question, afterReply) {
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    replyToUser(question);

    if (typeof afterReply === "function") {
      afterReply();
    }
  }, 550);
}

function replyToUser(question) {
  const q = question.toLowerCase();
  let response = "";
  let appToOpen = "";

  if (q.includes("photo") || q.includes("image") || q.includes("pic")) {
    response = "You can add photos through the Admin Page. After saving, they will appear inside the Memories app.";
  } else if (q.includes("admin")) {
    response = "Open admin.html to add, preview, or delete memory photos.";
  } else if (q.includes("memory") || q.includes("memories")) {
    response = "Opening Memories for you.";
    appToOpen = "memories";
  } else if (q.includes("letter") || q.includes("message")) {
    response = "Opening the Love Letter for you.";
    appToOpen = "letter";
  } else if (q.includes("reason") || q.includes("love")) {
    response = "Opening Reasons I Love You.";
    appToOpen = "reasons";
  } else if (q.includes("future") || q.includes("plan")) {
    response = "Opening Future Plans.";
    appToOpen = "future";
  } else if (q.includes("surprise")) {
    response = "Opening the Surprise app.";
    appToOpen = "surprise";
  } else if (q.includes("who") || q.includes("joseph")) {
    response = "Joseph is the person who made this Love OS for you. He wanted to give you something personal and creative.";
  } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    response = "Hello! I can help with memories, the love letter, reasons, future plans, surprises, or photo ideas.";
  } else if (q.includes("thank")) {
    response = "You are very welcome.";
  } else {
    response = "You can ask me about memories, the love letter, reasons, future plans, surprises, or how to add photos.";
  }

  addBotMessage(response);

  if (appToOpen) {
    openApp(appToOpen, { silent: true });
  }
}

function showTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
  }

  typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = "<span></span><span></span><span></span>";

  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

function addUserMessage(text) {
  addChatMessage(text, "user-msg");
}

function addBotMessage(text) {
  addChatMessage(text, "bot-msg");
  animateStickman();
}

function addChatMessage(text, className) {
  if (!chatBox) return;

  const message = document.createElement("div");
  message.className = className;
  message.textContent = text;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function assistantTalk() {
  const randomMessages = [
    "Click Surprise when you're ready.",
    "The Love Letter app is special.",
    "Memories make this OS more personal.",
    "You can add your own photos through the Admin Page.",
    "Joseph made this with effort and care.",
    "You can ask me anything about this Love OS."
  ];

  openAssistant();
  addBotMessage(randomMessages[Math.floor(Math.random() * randomMessages.length)]);
}

function animateStickman() {
  const stickman = document.querySelector(".stickman");

  if (!stickman) return;

  stickman.classList.add("dance");

  setTimeout(() => {
    stickman.classList.remove("dance");
  }, 700);
}

function getMemories() {
  try {
    return JSON.parse(localStorage.getItem("loveMemories")) || [];
  } catch (error) {
    console.warn("Saved memories could not be read.", error);
    return [];
  }
}

function createHeart() {
  const heartsContainer = document.getElementById("hearts");

  if (!heartsContainer || document.hidden) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.innerHTML = "&#10084;&#65039;";
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${Math.random() * 18 + 16}px`;

  heartsContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 5000);
}

function burstHearts() {
  for (let i = 0; i < 30; i += 1) {
    setTimeout(createHeart, i * 120);
  }
}

setInterval(createHeart, 2200);
