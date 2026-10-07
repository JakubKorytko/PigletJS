const sunUrl = new URL("./icons/sun.svg", import.meta.url);
const moonUrl = new URL("./icons/moon.svg", import.meta.url);

async function loadIcon(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.status + " " + url.pathname);
  }

  const markup = await response.text();
  const svg = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
  return document.importNode(svg, true);
}

async function loadThemeIcons() {
  const [sun, moon] = await Promise.all([loadIcon(sunUrl), loadIcon(moonUrl)]);
  return { sun, moon };
}

export { loadThemeIcons };
