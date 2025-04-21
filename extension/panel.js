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

const addStateListeners = () => {
  document.querySelectorAll(".state-input").forEach((input) => {
    input.addEventListener("blur", () => {
      const key = input.dataset.key;
      const parent = input.dataset.parent || null;
      const value = input.value;

      sendStateUpdateToPage(key, value, parent);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
  });
};

function sendStateUpdateToPage(key, value, stateName) {
  let parsedValue;

  if (/^true$/i.test(value) || /^false$/i.test(value)) {
    parsedValue = /^true$/i.test(value);
  } else {
    parsedValue = value;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "EXT_SET_STATE",
      payload: { key, stateName, value: parsedValue },
    });
  });
}

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
  addStateListeners();
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
      addStateListeners();
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
