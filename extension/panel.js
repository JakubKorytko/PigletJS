let pigletSupport = true;

function renderTree(obj) {
  if (!obj || typeof obj !== "object") return "";

  const entries = Object.entries(obj);
  return entries
    .map(([key, value]) => {
      const label = `${value.componentName ?? "HTML"} (${key})`;

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
        return `<div class="_details"><p class="_summary">${label}</p></div>`;
      }
    })
    .join("");
}

function parseValue(value) {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }

  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return numValue;
  }

  try {
    const parsedValue = JSON.parse(value);
    if (typeof parsedValue === "object") {
      return parsedValue;
    }
  } catch (e) {
    return value;
  }

  return value;
}

const addStateListeners = (port) => {
  document.querySelectorAll(".state-input").forEach((input) => {
    input.addEventListener("blur", () => {
      const key = input.dataset.key;
      const stateName = input.dataset.parent || null;
      const value = parseValue(input.value);

      port.postMessage({
        type: "MODIFY_STATE",
        payload: { key, stateName, value },
        source: "PIGLET_PANEL",
      });
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
  });
};

function renderStateTree(obj, parentKey = null) {
  if (typeof obj !== "object" || obj === null)
    return `<span>${String(obj)}</span>`;

  return `
    <ul>
      ${Object.entries(obj)
        .map(([key, value]) => {
          const encodedKey = key.replace(/"/g, "&quot;");
          const encodedParent = parentKey
            ? parentKey.replace(/"/g, "&quot;")
            : "";

          if (typeof value === "object" && value !== null) {
            return `
              <li>
                <details>
                  <summary class="key">${key}</summary>
                  ${renderStateTree(value, key)}
                </details>
              </li>
            `;
          } else {
            return `
              <li>
                <span class="key">${key}:</span>
                <input
                  class="state-input"
                  data-key="${encodedKey}"
                  data-parent="${encodedParent}"
                  value="${String(value)}"
                />
              </li>
            `;
          }
        })
        .join("")}
    </ul>
  `;
}

function updateDOM(type, payload, port) {
  if (!pigletSupport) {
    document.getElementById("warning").style.display = "block";
    document.getElementById("state").innerHTML = "";
    document.getElementById("tree").innerHTML = "";
    return;
  }
  const id = type === "STATE_UPDATE" ? "state" : "tree";
  const html = id === "state" ? renderStateTree(payload) : renderTree(payload);
  document.getElementById("warning").style.display = "none";
  document.getElementById(id).innerHTML = html;
  addStateListeners(port);
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

  const port = chrome.runtime.connect();

  port.postMessage({
    type: "INITIAL_REQUEST",
    source: "PIGLET_PANEL",
  });

  port.onMessage.addListener((msg) => {
    if (msg.source === "PIGLET_BACKGROUND") {
      if (msg.type === "PIGLET_CONFIG") {
        pigletSupport = msg.payload;
      }
      updateDOM(msg.type, msg.payload, port);
    }
  });
});
