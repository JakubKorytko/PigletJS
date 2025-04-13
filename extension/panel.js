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

  try {
    chrome.devtools.inspectedWindow.eval(
      "window.AppComponentTree",
      function (result, isException) {
        if (isException) {
          document.getElementById("output").textContent = "Error fetching tree";
        } else {
          document.getElementById("tree").innerHTML = renderTree(result);
        }
      },
    );

    chrome.devtools.inspectedWindow.eval(
      "window.AppState",
      function (result, isException) {
        if (isException) {
          document.getElementById("output").textContent = "Error fetching tree";
        } else {
          document.getElementById("state").innerHTML = renderStateTree(result);
        }
      },
    );
  } catch (err) {
    console.warn("Polling error:", err);
  }
});
