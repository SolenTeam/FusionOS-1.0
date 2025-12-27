/* ===========================
   BASIC STATE
=========================== */
const icons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");
const taskbar = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const startApps = document.querySelectorAll(".start-app");
const startPowerButtons = document.querySelectorAll(".start-power");
const dockItems = document.querySelectorAll(".dock-item");
const splash = document.getElementById("splash");
const blackScreen = document.getElementById("black-screen");
const blackIcon = document.getElementById("black-icon");
const standbyOverlay = document.getElementById("standby-message");

let zIndexCounter = 500;
let isInStandby = false;

/* ===========================
   WINDOW MANAGEMENT
=========================== */
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = "flex";
  focusWindow(win);

  // Mobile fullscreen
  if (window.innerWidth <= 700) {
    win.classList.add("fullscreen");
  }

  addToTaskbar(id);
}

function closeWindow(win) {
  win.style.display = "none";
  removeFromTaskbar(win.id);
}

function minimizeWindow(win) {
  win.style.display = "none";
}

function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  windows.forEach(w => w.classList.remove("active"));
  win.classList.add("active");
}

/* ===========================
   TASKBAR
=========================== */
function addToTaskbar(id) {
  if (document.querySelector(`.taskbar-item[data-window="${id}"]`)) return;

  const item = document.createElement("div");
  item.className = "taskbar-item";
  item.dataset.window = id;
  item.textContent = id.replace("win-", "");
  item.addEventListener("click", () => openWindow(id));
  taskbar.appendChild(item);
}

function removeFromTaskbar(id) {
  const item = document.querySelector(`.taskbar-item[data-window="${id}"]`);
  if (item) item.remove();
}

/* ===========================
   ICONS & DOCK
=========================== */
icons.forEach(icon => {
  icon.addEventListener("dblclick", () => openWindow(icon.dataset.window));
  icon.addEventListener("click", () => {
    if (window.innerWidth <= 700) openWindow(icon.dataset.window);
  });
});

dockItems.forEach(btn => {
  btn.addEventListener("click", () => openWindow(btn.dataset.window));
});

/* ===========================
   START MENU
=========================== */
startButton.addEventListener("click", e => {
  e.stopPropagation();
  startMenu.classList.toggle("open");
});

document.addEventListener("click", () => {
  startMenu.classList.remove("open");
});

startApps.forEach(btn => {
  btn.addEventListener("click", () => {
    openWindow(btn.dataset.window);
    startMenu.classList.remove("open");
  });
});

/* ===========================
   WINDOW BUTTONS + DRAG
=========================== */
windows.forEach(win => {
  const btnClose = win.querySelector(".btn-close");
  const btnMin = win.querySelector(".btn-minimize");
  const btnFull = win.querySelector(".btn-fullscreen");
  const titlebar = win.querySelector(".window-titlebar");

  if (btnClose) btnClose.addEventListener("click", () => closeWindow(win));
  if (btnMin) btnMin.addEventListener("click", () => minimizeWindow(win));
  if (btnFull) btnFull.addEventListener("click", () => win.classList.toggle("fullscreen"));

  // Drag
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("mousedown", e => {
    if (win.classList.contains("fullscreen")) return;
    dragging = true;
    focusWindow(win);
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => dragging = false);
});

/* ===========================
   CLOCK
=========================== */
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 30000);

/* ===========================
   SPLASH
=========================== */
function playSplash(callback) {
  splash.style.display = "flex";
  splash.classList.add("visible");

  setTimeout(() => {
    splash.classList.remove("visible");
    splash.style.display = "none";
    if (callback) callback();
  }, 2500);
}

/* ===========================
   STANDBY & REBOOT
=========================== */
function showBlack(icon, duration, callback) {
  blackIcon.textContent = icon;
  blackScreen.querySelector(".black-title").textContent = "NamixOS";
  blackScreen.style.display = "flex";
  blackScreen.classList.add("visible");

  setTimeout(() => {
    blackScreen.classList.remove("visible");
    blackScreen.style.display = "none";
    if (callback) callback();
  }, duration);
}

function enterStandby() {
  windows.forEach(w => w.style.display = "none");

  showBlack("⏸", 1500, () => {
    standbyOverlay.style.display = "flex";
    standbyOverlay.classList.add("visible");
    isInStandby = true;
  });
}

function wakeFromStandby() {
  if (!isInStandby) return;

  standbyOverlay.classList.remove("visible");
  standbyOverlay.style.display = "none";
  isInStandby = false;

  showBlack("⏸", 1500, () => playSplash(() => {}));
}

standbyOverlay.addEventListener("click", wakeFromStandby);

function enterReboot() {
  windows.forEach(w => w.style.display = "none");

  showBlack("🔄", 1500, () => playSplash(() => {}));
}

startPowerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.action === "standby") enterStandby();
    if (btn.dataset.action === "reboot") enterReboot();
  });
});

/* ===========================
   MOBILE FULLSCREEN
=========================== */
function mobileMode() {
  const isMobile = window.innerWidth <= 700;
  windows.forEach(win => {
    if (win.style.display !== "none") {
      win.classList.toggle("fullscreen", isMobile);
    }
  });
}
window.addEventListener("resize", mobileMode);

/* ===========================
   INIT
=========================== */
playSplash(() => {});
blackScreen.style.display = "none";
standbyOverlay.style.display = "none";
