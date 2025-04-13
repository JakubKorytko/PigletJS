const port = chrome.runtime.connect({ name: "popup" });

console.log(port);

port.onMessage.addListener((message) => {
  console.log("Wiadomość:", message.type);

  if (message.type === "STATE_UPDATE") {
    document.getElementById("state").innerHTML = renderStateTree(
      message.payload,
    );
  }

  if (message.type === "TREE_UPDATE") {
    document.getElementById("tree").innerHTML = renderTree(message.payload);
  }

  if (message.type === "CURRENT_DATA") {
    if (message.payload.state) {
      document.getElementById("state").innerHTML = renderStateTree(
        message.payload.state,
      );
    }

    if (message.payload.tree) {
      document.getElementById("tree").innerHTML = renderTree(
        message.payload.tree,
      );
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.panel).classList.add("active");
    }),
  );
  port.postMessage({ type: "REQUEST_CURRENT_DATA" });
});

function renderTree(obj) {
  if (!obj || typeof obj !== "object") return "";

  const entries = Object.entries(obj);
  return entries
    .map(([key, value]) => {
      const label = `${value.componentName ?? "HTML"} (${key})`;
      return `
              <details open>
                <summary>${label}</summary>
                ${value.children ? renderTree(value.children) : ""}
              </details>
            `;
    })
    .join("");
}

function renderStateTree(obj) {
  if (typeof obj !== "object" || obj === null)
    return `<span>${String(obj)}</span>`;

  return `
      <ul>
        ${Object.entries(obj)
          .map(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              return `
                      <li>
                        <details>
                          <summary class="key">${key}</summary>
                          ${renderStateTree(value)}
                        </details>
                      </li>
                    `;
            } else {
              return `<li><span class="key">${key}:</span> ${String(value)}</li>`;
            }
          })
          .join("")}
      </ul>
    `;
}
