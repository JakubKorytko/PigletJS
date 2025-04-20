import { injectTreeTrackingToComponentClass } from "@/core/browserEnv/treeTracking";
import ReactiveComponent from "@/core/browserEnv/reactiveComponent";
import { toPascalCase } from "@/core/browserEnv/helpers";

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

  static get observedAttributes() {
    return ["route"];
  }

  /**
   * Handles changes to observed attributes (in this case, 'route').
   * Dynamically imports the page based on the route and injects it as shadowRoot.
   * @param {string} name - The name of the attribute.
   * @param {string} oldValue - The previous value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "route" && oldValue !== newValue) {
      this.loadRoute(newValue);
    }
  }

  /**
   * Loads the route content, imports the page, and injects it into the shadowRoot.
   * @param {string} route - The route to load.
   */
  async loadRoute(route) {
    this._route = route;

    try {
      // Dynamically import the page
      const routePath = routes[route];
      const module = await import(`/component/${routePath}`);

      const response = await fetch(`/component/${routePath}`);
      const pageSource = await response.text();

      const tagRegex = /<([a-z][a-z0-9-]*)\b[^>]*\/?>/g;
      const tags = new Set();
      let match;
      while ((match = tagRegex.exec(pageSource)) !== null) {
        const tag = match[1];
        if (!tag.includes("-")) continue;
        tags.add(tag);
      }

      const pascalTags = Array.from(tags).map(toPascalCase);

      await Promise.all(
        Array.from(pascalTags).map(async (tag) => {
          if (tag === "CIf") return;
          try {
            await import(`/component/${tag}`);
          } catch (e) {
            Piglet.log(
              `Nie udało się załadować komponentu <${tag}>`,
              "warn",
              e,
            );
          }
        }),
      );

      this.shadowRoot.innerHTML = "";

      window.Piglet.reset();

      if (
        module.default instanceof HTMLElement ||
        typeof module.default === "function"
      ) {
        this.shadowRoot.appendChild(new module.default());
      } else {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = module.default || "";
        this.shadowRoot.appendChild(wrapper);
      }

      Piglet.log(`Route '${route}' loaded successfully.`, "info");
    } catch (err) {
      Piglet.log(`Error loading route '${route}':`, "error", err);
      this.shadowRoot.innerHTML = "<h1>Page Not Found</h1>";
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
      this.setAttribute("route", newRoute);
      if (window.location.pathname !== newRoute) {
        history.pushState({}, "", newRoute);
      }
    }
  }
}

// Define the custom element
injectTreeTrackingToComponentClass(AppRoot);
customElements.define("app-root", AppRoot);
