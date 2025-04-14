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

function waitForResponse() {
  const interval = setInterval(() => {
    chrome.runtime.sendMessage({ type: "REQUEST_CURRENT_DATA" }, (response) => {
      if (chrome.runtime.lastError) {
        return;
      }

      if (response && response.type === "CURRENT_DATA") {
        clearInterval(interval);
        handleData(response);
      }
    });
  }, 1000);
}

function handleData(data) {
  document.getElementById("state").innerHTML = renderStateTree(data.state);
  document.getElementById("tree").innerHTML = renderTree(data.tree);
}

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

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STATE_UPDATE" && message.payload) {
      document.getElementById("state").innerHTML = renderStateTree(
        message.payload,
      );
    }

    if (message.type === "TREE_UPDATE" && message.payload) {
      document.getElementById("tree").innerHTML = renderTree(message.payload);
    }
  });

  waitForResponse();
});
