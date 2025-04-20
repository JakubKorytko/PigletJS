let pigletSupport = true;

function renderTree(obj) {
  if (!obj || typeof obj !== "object") return "";

  const entries = Object.entries(obj);
  return entries
    .map(([key, value]) => {
      const label = `${value.componentName ?? "HTML"} (${key})`;

      // Check if the object has children
      const hasChildren =
        value.children && Object.keys(value.children).length > 0;

      if (hasChildren) {
        return `
          <details open>
            <summary>${label}</summary>
            ${renderTree(value.children)}
          </details>
        `;
      } else {
        // Render the final elements as plain text instead of expandable details
        return `<div class="_details"><p class="_summary">${label}</p></div>`;
      }
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
  if (!pigletSupport) return;
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
    if (message.type === "STATE_UPDATE" && message.payload && pigletSupport) {
      document.getElementById("state").innerHTML = renderStateTree(
        message.payload,
      );
    }

    if (message.type === "PIGLET_SUPPORT_UPDATE") {
      if (pigletSupport !== message.payload) {
        pigletSupport = message.payload;
        if (pigletSupport) {
          document.getElementById("warning").style.display = "none";
          waitForResponse();
        } else {
          document.getElementById("warning").style.display = "block";
          document.getElementById("state").innerHTML = "";
          document.getElementById("tree").innerHTML = "";
        }
      }
    }

    if (message.type === "TREE_UPDATE" && message.payload && pigletSupport) {
      document.getElementById("tree").innerHTML = renderTree(message.payload);
    }
  });

  waitForResponse();
});
