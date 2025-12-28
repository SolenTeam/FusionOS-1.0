/* ===========================
   BASIC SELECTORS
=========================== */
const icons = document.querySelectorAll(".icon");
const windowsEls = document.querySelectorAll(".window");
const taskbarContainer = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const startApps = document.querySelectorAll(".start-app");
const startPowerButtons = document.querySelectorAll(".start-power");
const splash = document.getElementById("splash");
const blackScreen = document.getElementById("black-screen");
const blackIcon = document.getElementById("black-icon");
const standbyOverlay = document.getElementById("standby-message");
const desktop = document.getElementById("desktop");

/* Dock */
const dockItems = document.querySelectorAll(".dock-item");
const dockRecent = document.getElementById("dock-recent");
const dockDivider = document.getElementById("dock-divider");

/* Context menu */
const contextMenu = document.getElementById("context-menu");
const ctxButtons = document.querySelectorAll(".ctx-btn");

let zIndexCounter = 500;
let isInStandby = false;

/* Stato app: open/hidden per dock recent */
const appState = {}; // { appId: { open: bool, hidden: bool } }
const recentApps = []; // max 2

/* Contesto corrente per il context menu */
let ctxTarget = null; // { type, appId, windowId }

/* ===========================
   UTILS
=========================== */
function getWindowByAppId(appId) {
  return document.querySelector(`.window[data-app-id="${appId}"]`);
}

function getAppIdFromWindow(win) {
  return win.dataset.appId || null;
}

function ensureAppState(appId) {
  if (!appState[appId]) {
    appState[appId] = { open: false, hidden: false };
  }
}

/* ===========================
   WINDOW MANAGEMENT
=========================== */
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  windowsEls.forEach(w => w.classList.remove("active"));
  win.classList.add("active");
}

function openWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  const appId = getAppIdFromWindow(win);
  if (appId) {
    ensureAppState(appId);
    appState[appId].open = true;
    appState[appId].hidden = false;
    addRecentApp(appId);
  }

  win.style.display = "flex";
  focusWindow(win);

  if (window.innerWidth <= 700) {
    win.classList.add("fullscreen");
  }

  addToTaskbar(winId);
  renderDockRecent();
}

function minimizeWindow(win) {
  const appId = getAppIdFromWindow(win);
  win.style.display = "none";

  if (appId) {
    ensureAppState(appId);
    appState[appId].open = true;
    appState[appId].hidden = true;
    addRecentApp(appId);
  }

  renderDockRecent();
}

function closeWindow(win) {
  const appId = getAppIdFromWindow(win);
  win.style.display = "none";

  if (appId) {
    ensureAppState(appId);
    appState[appId].open = false;
    appState[appId].hidden = false;
    removeFromRecent(appId);
  }

  removeFromTaskbar(win.id);
  renderDockRecent();
}

/* ===========================
   TASKBAR
=========================== */
function addToTaskbar(winId) {
  if (document.querySelector(`.taskbar-item[data-window="${winId}"]`)) return;

  const win = document.getElementById(winId);
  if (!win) return;

  const appId = getAppIdFromWindow(win) || winId.replace("win-", "");

  const item = document.createElement("div");
  item.className = "taskbar-item";
  item.dataset.window = winId;
  item.dataset.appId = appId;
  item.textContent = appId;

  item.addEventListener("click", () => {
    const w = document.getElementById(winId);
    if (!w) return;
    if (w.style.display === "none" || w.style.display === "") {
      openWindow(winId);
    } else {
      focusWindow(w);
    }
  });

  attachContextMenuHandlers(item, { type: "taskbar", appId, windowId: winId });

  taskbarContainer.appendChild(item);
}

function removeFromTaskbar(winId) {
  const item = document.querySelector(`.taskbar-item[data-window="${winId}"]`);
  if (item) item.remove();
}

/* ===========================
   DOCK RECENT APPS
=========================== */
function addRecentApp(appId) {
  ensureAppState(appId);

  const index = recentApps.indexOf(appId);
  if (index !== -1) {
    recentApps.splice(index, 1);
  }
  recentApps.unshift(appId);
  if (recentApps.length > 2) {
    recentApps.pop();
  }
}

function removeFromRecent(appId) {
  const index = recentApps.indexOf(appId);
  if (index !== -1) {
    recentApps.splice(index, 1);
  }
}

function renderDockRecent() {
  if (!dockRecent) return;
  dockRecent.innerHTML = "";

  if (recentApps.length === 0) {
    dockDivider.style.display = "none";
    return;
  }

  dockDivider.style.display = "block";

  recentApps.forEach(appId => {
    const btn = document.createElement("button");
    btn.className = "dock-recent-item";
    btn.dataset.appId = appId;

    let icon = "📦";
    if (appId === "browser") icon = "🌐";
    if (appId === "files") icon = "🗂️";
    if (appId === "terminal") icon = ">";
    if (appId === "settings") icon = "⚙️";
    if (appId === "notes") icon = "📝";
    if (appId === "about") icon = "🖥️";

    btn.textContent = icon;

    ensureAppState(appId);
    if (appState[appId].open && appState[appId].hidden) {
      const dot = document.createElement("div");
      dot.className = "dock-indicator";
      btn.appendChild(dot);
    }

    btn.addEventListener("click", () => {
      const win = getWindowByAppId(appId);
      if (!win) return;
      openWindow(win.id);
    });

    const win = getWindowByAppId(appId);
    attachContextMenuHandlers(btn, {
      type: "dock-recent",
      appId,
      windowId: win ? win.id : null
    });

    dockRecent.appendChild(btn);
  });
}

/* ===========================
   ICONS & DOCK FIXED
=========================== */
icons.forEach(icon => {
  const winId = icon.dataset.window;
  const appId = icon.dataset.appId;
  if (!winId) return;

  icon.addEventListener("dblclick", () => openWindow(winId));

  // Su mobile singolo tap apre
  icon.addEventListener("click", () => {
    if (window.innerWidth <= 700) openWindow(winId);
  });

  attachContextMenuHandlers(icon, {
    type: "desktop-icon",
    appId,
    windowId: winId
  });
});

dockItems.forEach(btn => {
  const winId = btn.dataset.window;
  const appId = btn.dataset.appId;

  btn.addEventListener("click", () => openWindow(winId));

  attachContextMenuHandlers(btn, {
    type: "dock-main",
    appId,
    windowId: winId
  });
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
  hideContextMenu();
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
windowsEls.forEach(win => {
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

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  const appId = getAppIdFromWindow(win);
  attachContextMenuHandlers(win, {
    type: "window",
    appId,
    windowId: win.id
  });
});

/* ===========================
   CLOCK
=========================== */
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
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
  blackScreen.style.display = "flex";
  blackScreen.classList.add("visible");

  setTimeout(() => {
    blackScreen.classList.remove("visible");
    blackScreen.style.display = "none";
    if (callback) callback();
  }, duration);
}

function enterStandby() {
  windowsEls.forEach(w => (w.style.display = "none"));

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

  showBlack("⏸", 1500, () => {
    playSplash(() => {});
  });
}

standbyOverlay.addEventListener("click", wakeFromStandby);

function enterReboot() {
  windowsEls.forEach(w => {
    w.style.display = "none";
  });

  for (const appId in appState) {
    appState[appId].open = false;
    appState[appId].hidden = false;
  }
  recentApps.splice(0, recentApps.length);
  renderDockRecent();
  taskbarContainer.innerHTML = "";

  showBlack("🔄", 3000, () => {
    playSplash(() => {});
  });
}

startPowerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.action === "standby") enterStandby();
    if (btn.dataset.action === "reboot") enterReboot();
  });
});

/* ===========================
   MOBILE FULLSCREEN ON RESIZE
=========================== */
function mobileMode() {
  const isMobile = window.innerWidth <= 700;
  windowsEls.forEach(win => {
    if (win.style.display !== "none") {
      win.classList.toggle("fullscreen", isMobile);
    }
  });
}
window.addEventListener("resize", mobileMode);

/* ===========================
   CONTEXT MENU
=========================== */
function showContextMenu(x, y, meta) {
  ctxTarget = meta;
  contextMenu.style.display = "flex";

  const menuRect = contextMenu.getBoundingClientRect();
  let posX = x;
  let posY = y;

  if (posX + menuRect.width > window.innerWidth) {
    posX = window.innerWidth - menuRect.width - 5;
  }
  if (posY + menuRect.height > window.innerHeight) {
    posY = window.innerHeight - menuRect.height - 5;
  }

  contextMenu.style.left = posX + "px";
  contextMenu.style.top = posY + "px";
}

function hideContextMenu() {
  contextMenu.style.display = "none";
  ctxTarget = null;
}

function attachContextMenuHandlers(element, meta) {
  if (!element) return;

  // desktop: right-click
  element.addEventListener("contextmenu", e => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, meta);
  });

  // mobile: long press
  let lastTapTime = 0;

element.addEventListener("touchstart", e => {
  const now = Date.now();
  const delta = now - lastTapTime;
  lastTapTime = now;

  if (delta < 400) {
    const touch = e.touches[0];
    if (canShowMenu(element)) {
      showContextMenu(touch.clientX, touch.clientY, meta);
    }
  }
});

  element.addEventListener("touchend", () => {
    clearTimeout(touchTimer);
  });

  element.addEventListener("touchmove", () => {
    clearTimeout(touchTimer);
  });
}

document.addEventListener("click", () => {
  hideContextMenu();
});

document.addEventListener("scroll", () => {
  hideContextMenu();
});

/* Azioni context menu */
ctxButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!ctxTarget) return;
    const action = btn.dataset.action;
    const { appId, windowId } = ctxTarget;

    let win = null;
    if (windowId) {
      win = document.getElementById(windowId);
    }
    if (!win && appId) {
      win = getWindowByAppId(appId);
    }
    if (!win) {
      hideContextMenu();
      return;
    }

    if (action === "open") {
      openWindow(win.id);
    } else if (action === "hide") {
      minimizeWindow(win);
    } else if (action === "close") {
      closeWindow(win);
    }

    hideContextMenu();
  });
});

/* ===========================
   WALLPAPER FROM LOCALSTORAGE
=========================== */
function applySavedWallpaper() {
  const saved = localStorage.getItem("namixos_wallpaper");
  if (!saved) return; // usa quello di default da CSS

  try {
    const data = JSON.parse(saved);
    if (data.type === "css") {
      desktop.style.background = data.value;
    } else if (data.type === "image") {
      desktop.style.background = `url(${data.value}) center/cover no-repeat`;
    }
  } catch (e) {
    console.warn("Invalid wallpaper data");
  }
}

/* ===========================
   INIT
=========================== */
playSplash(() => {});
blackScreen.style.display = "none";
standbyOverlay.style.display = "none";

applySavedWallpaper();
mobileMode();
