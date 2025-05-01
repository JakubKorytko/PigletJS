import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import { fadeIn, fadeOut, toPascalCase } from "@Piglet/browser/helpers";
import { sendToExtension } from "@Piglet/browser/extension";
import { loadComponent } from "@Piglet/browser/loadComponent";
import CONST from "@Piglet/browser/CONST";

class AppRoot extends ReactiveComponent {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._route = "";

    window.addEventListener("popstate", () => {
      const currentPath = window.location.pathname;
      if (routes[currentPath] && this._route !== currentPath) {
        this.route = currentPath;
      }
    });
  }

  // noinspection JSUnusedGlobalSymbols
  static get observedAttributes() {
    return [CONST.routeAttribute];
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Handles changes to observed attributes (in this case, 'route').
   * Dynamically imports the page based on the route and injects it as shadowRoot.
   * @param {string} name - The name of the attribute.
   * @param {string} oldValue - The previous value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === CONST.routeAttribute && oldValue !== newValue) {
      if (oldValue === null) {
        this.loadRoute(newValue).then(this._mount.bind(this));
      } else {
        // noinspection JSIgnoredPromiseFromCall
        this.changeRoute(newValue);
      }
    }
  }

  async changeRoute(newRoute) {
    await fadeOut(this.shadowRoot.host, 100);
    this._unmount.call(this);
    this.shadowRoot.innerHTML = "";
    window.Piglet.reset();
    super.connectedCallback();
    await this.loadRoute(newRoute);
    this._mount.call(this);
  }

  /**
   * Loads the route content, imports the page, and injects it into the shadowRoot.
   * @param {string} route - The route to load.
   */
  async loadRoute(route) {
    this._route = route;

    try {
      const routePath = routes[route];
      const module = await import(`${CONST.componentRoute.base}/${routePath}`);

      const response = await fetch(`${CONST.componentRoute.html}/${routePath}`);
      const pageSource = await response.text();

      const tags = new Set();
      let match;
      while ((match = CONST.tagRegex.exec(pageSource)) !== null) {
        const tag = match[1];
        if (!tag.includes("-")) continue;
        tags.add(tag);
      }

      const pascalTags = Array.from(tags).map(toPascalCase);

      await Promise.all(
        Array.from(pascalTags).map(async (tag) => {
          if (tag === CONST.conditionalName) return;
          try {
            await import(`${CONST.componentRoute.base}/${tag}`);
          } catch (e) {
            Piglet.log(
              CONST.pigletLogs.appRoot.unableToLoadComponent(tag),
              CONST.coreLogsLevels.warn,
              e,
            );
          }
        }),
      );

      if (
        module.default instanceof HTMLElement ||
        typeof module.default === "function"
      ) {
        await loadComponent(module.default);
        // noinspection ES6MissingAwait
        fadeIn(this.shadowRoot.host, 100);
        this.shadowRoot.appendChild(new module.default());
      } else {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = module.default || "";
        this.shadowRoot.appendChild(wrapper);
      }

      sendToExtension(CONST.extension.initialMessage);

      Piglet.log(
        CONST.pigletLogs.appRoot.routeLoaded(route),
        CONST.coreLogsLevels.info,
      );
    } catch (err) {
      Piglet.log(
        CONST.pigletLogs.appRoot.errorLoading(route),
        CONST.coreLogsLevels.error,
        err,
      );
      this.shadowRoot.innerHTML = `<h1>${CONST.pageNotFound}</h1>`;
    }
  }

  /**
   * Get the current route.
   * @returns {string} - The current route value.
   */
  get route() {
    return this._route;
  }

  /**
   * Set the route and trigger the attribute change.
   * @param {string} newRoute - The new route to set.
   */
  set route(newRoute) {
    if (this._route !== newRoute) {
      this.setAttribute(CONST.routeAttribute, newRoute);
      if (window.location.pathname !== newRoute) {
        history.pushState({}, "", newRoute);
      }
    }
  }
}

export default AppRoot;
