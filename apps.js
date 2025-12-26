function loadApp(name, win) {
  const content = win.querySelector(".content");

  if (name === "terminal") {
    content.innerHTML = `
      <div id="terminal-output"></div>
      <input id="terminal-input" placeholder="Scrivi un comando...">
    `;

    const input = content.querySelector("#terminal-input");
    const output = content.querySelector("#terminal-output");

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        output.innerHTML += `<div>> ${input.value}</div>`;
        input.value = "";
      }
    });
  }

  if (name === "files") {
    content.innerHTML = `
      <p>File Manager</p>
      <ul>
        <li>Documenti</li>
        <li>Immagini</li>
        <li>Musica</li>
      </ul>
    `;
  }

  if (name === "notes") {
    content.innerHTML = `
      <textarea style="width:100%;height:100%;">Scrivi qui...</textarea>
    `;
  }
}
