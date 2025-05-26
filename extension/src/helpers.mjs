// noinspection JSUnresolvedReference

/** @type {import("./chrome.d.js").Chrome} */
const chromeExtension = globalThis.chrome;

let pigletSupport = true;

function renderTree(tree) {
  if (!tree || typeof tree !== "object") return document.createTextNode("");

  const fragment = document.createDocumentFragment();

  for (const [rawKey, children] of Object.entries(tree)) {
    const isHTML = rawKey.startsWith("[HTML]");
    const key = isHTML ? rawKey.replace("[HTML]", "") : rawKey;

    const hasChildren = children && Object.keys(children).length > 0;

    const label = document.createElement("span");
    label.textContent = key;
    label.className = isHTML ? "html-component" : "user-component";
    label.style.color = isHTML ? "green" : "red";

    if (hasChildren) {
      const details = document.createElement("details");
      details.open = true;

      const summary = document.createElement("summary");
      summary.appendChild(label);

      details.appendChild(summary);
      details.appendChild(renderTree(children));
      fragment.appendChild(details);
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "_details";

      const summary = document.createElement("p");
      summary.className = "_summary";
      summary.appendChild(label);

      wrapper.appendChild(summary);
      fragment.appendChild(wrapper);
    }
  }

  return fragment;
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

/**
 * Parses a dataset path from a DOM input element to extract state information
 * for setting a nested property within a state object.
 *
 * Expected `data-path` format: `"stateName.key.subkey1.subkey2..."`.
 *
 * @param {HTMLInputElement} input - The input element containing a `data-path` attribute and a value.
 * @returns {{
 *   key: string,
 *   stateName: string,
 *   path: string[],
 *   value: any
 * }} An object with:
 *   - `stateName`: the top-level state identifier,
 *   - `key`: the direct key in the state object (second segment),
 *   - `path`: the remaining nested path (from the third segment onward),
 *   - `value`: the parsed value from the input.
 */
const setStateProperty = (input) => {
  const parts = input.dataset.path.split(".");
  const lastPart = parts.pop();

  return {
    key: parts.length === 1 ? lastPart : parts.at(1),
    stateName: parts.at(0),
    path: path.split(".").slice(2),
    value: parseValue(input.value),
  };
};

const addStateListeners = (port) => {
  document.querySelectorAll(".state-input").forEach(
    (
      /** @type {HTMLInputElement} */
      input,
    ) => {
      input.addEventListener("blur", () => {
        port.postMessage({
          type: "MODIFY_STATE",
          payload: setStateProperty(input),
          source: "PIGLET_PANEL",
          tabId: chromeExtension.devtools?.inspectedWindow?.tabId,
        });
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });
    },
  );
};

function renderStateTree(obj, parentKey = null, path = null) {
  if (typeof obj !== "object" || obj === null) {
    return document.createTextNode(String(obj));
  }

  const ul = document.createElement("ul");

  Object.entries(obj).forEach(([key, value]) => {
    const li = document.createElement("li");
    const inputPath = `${path ? `${path}.` : ""}${key}`;

    if (typeof value === "object" && value !== null) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.className = "key";
      summary.textContent = key;

      details.appendChild(summary);
      details.appendChild(renderStateTree(value, key, inputPath ?? parentKey));
      li.appendChild(details);
    } else {
      const keySpan = document.createElement("span");
      keySpan.className = "key";
      keySpan.textContent = `${key}:`;

      const input = document.createElement("input");
      input.className = "state-input";
      input.dataset.path = inputPath;

      input.value = String(value);

      li.appendChild(keySpan);
      li.appendChild(input);
    }

    ul.appendChild(li);
  });

  return ul;
}

function updateTreePreservingUI(container, newTreeData) {
  const openKeys = new Set();
  container.querySelectorAll("details").forEach((el) => {
    const summary = el.querySelector("summary");
    if (el.open && summary) {
      openKeys.add(summary.textContent);
    }
  });

  const newContent = renderTree(newTreeData);

  if (
    newContent instanceof HTMLElement ||
    newContent instanceof DocumentFragment
  ) {
    newContent.querySelectorAll("details").forEach((el) => {
      const summary = el.querySelector("summary");
      if (summary && openKeys.has(summary.textContent)) {
        el.open = true;
      }
    });
  }

  container.replaceChildren(newContent);
}

function updateStateTreePreservingUI(container, newState) {
  const openDetailsKeys = new Set();
  container.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");
    if (details.open && summary) {
      openDetailsKeys.add(summary.textContent);
    }
  });

  const active = document.activeElement;
  let focusKey = null;
  let focusParent = null;
  let selectionStart = null;

  if (
    active?.classList.contains("state-input") &&
    active instanceof HTMLInputElement
  ) {
    focusKey = active.dataset.key;
    focusParent = active.dataset.parent;
    selectionStart = active.selectionStart;
  }

  const newTree = renderStateTree(newState);

  container.innerHTML = "";
  container.appendChild(newTree);

  container.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");
    if (summary && openDetailsKeys.has(summary.textContent)) {
      details.open = true;
    }
  });

  if (focusKey !== null) {
    const selector = `.state-input[data-key="${focusKey}"][data-parent="${focusParent}"]`;
    const newInput = container.querySelector(selector);
    if (newInput) {
      newInput.focus();
      if (selectionStart !== null) {
        newInput.setSelectionRange(selectionStart, selectionStart);
      }
    }
  }
}

function renderDOM(id, payload) {
  const html = id === "state" ? renderStateTree(payload) : renderTree(payload);
  document.getElementById("warning").style.display = "none";
  /** @type {HTMLElement} */
  const loader = document.getElementById(id).querySelector(".loader");
  loader ? (loader.style.display = "none") : null;
  document.getElementById(id).innerHTML = "";
  document.getElementById(id).appendChild(html);
}

function updateDOM(type, payload, port) {
  if (type === "INITIAL_DATA") {
    renderDOM("state", payload.state);
    renderDOM("tree", payload.tree);
    pigletSupport = payload;
  } else if (type === "STATE_UPDATE") {
    updateStateTreePreservingUI(document.getElementById("state"), payload);
  } else if (type === "TREE_UPDATE") {
    updateTreePreservingUI(document.getElementById("tree"), payload);
  }
  addStateListeners(port);
}

export { updateDOM };
