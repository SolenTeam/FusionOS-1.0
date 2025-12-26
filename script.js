// Splash screen
function bootOS() {
  const splash = document.createElement("div");
  splash.id = "splash";
  splash.innerText = "Benvenuto su NamixOS";
  document.body.appendChild(splash);

  setTimeout(() => {
    splash.remove();
    document.getElementById("desktop").style.display = "block";
  }, 1500);
}

window.addEventListener("load", bootOS);


// Apertura app
function openApp(appName) {
  const win = document.createElement("div");
  win.className = "window";
  win.innerHTML = `
    <div class="title">${appName}</div>
    <div class="content" id="content-${appName}"></div>
  `;
  document.body.appendChild(win);

  loadApp(appName, win);
}


// Drag finestre
document.addEventListener("mousedown", function(e) {
  if (!e.target.classList.contains("title")) return;

  const win = e.target.parentElement;
  let offsetX = e.clientX - win.offsetLeft;
  let offsetY = e.clientY - win.offsetTop;

  function move(ev) {
    win.style.left = ev.clientX - offsetX + "px";
    win.style.top = ev.clientY - offsetY + "px";
  }

  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stop);
});


// Icone desktop
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", () => {
      openApp(icon.dataset.app);
    });
  });
});
