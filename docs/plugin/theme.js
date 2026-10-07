import { loadThemeIcons } from "./icons.js";

const THEME_KEY = "piglet-docs-theme";

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", theme === "light" ? "#faf4ee" : "#0c0907");
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn(error);
  }

  const button = document.querySelector("[data-theme-toggle]");
  if (!button) {
    return;
  }

  const next = theme === "light" ? "dark" : "light";
  button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  button.setAttribute("aria-label", "Switch to " + next + " theme");
  button.lastChild.textContent = theme === "light" ? "Light" : "Dark";
}

async function mountToggle() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || sidebar.dataset.pigToggle === "1") {
    return;
  }

  sidebar.dataset.pigToggle = "1";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("data-theme-toggle", "");
  const label = document.createElement("span");
  label.textContent = "Dark";

  try {
    const { sun, moon } = await loadThemeIcons();
    button.append(sun, moon);
  } catch (error) {
    console.warn(error);
  }

  button.append(label);
  button.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  sidebar.appendChild(button);
  applyTheme(currentTheme());
}

export { mountToggle };
