/** @import {AppRootInterface, Virtual, Member} from "@jsdocs/browser/classes/AppRoot.d" */
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import {
  toPascalCase,
  sendToExtension,
  fetchComponentData,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/**
 * Injected using parser
 * @type {Record<string, string>} */
// @ts-ignore
const _routes = routes ?? {};

/** @implements {AppRootInterface} */
class AppRoot extends ReactiveComponent {
  _route = "";

  constructor() {
    super();
    this.addPopStateListener();
  }

  static get observedAttributes() {
    return [CONST.routeAttribute];
  }

  /**
   * @type {Member["addPopStateListener"]["Type"]}
   * @returns {Member["addPopStateListener"]["ReturnType"]}
   */
  addPopStateListener() {
    window.addEventListener("popstate", () => {
      const currentPath = window.location.pathname;
      if (_routes[currentPath] && this._route !== currentPath) {
        this.route = currentPath;
      }
    });
  }

  /**
   * @type {Member["attributeChangedCallback"]["Type"]}
   * @returns {Member["attributeChangedCallback"]["ReturnType"]}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === CONST.routeAttribute && oldValue !== newValue) {
      if (oldValue === null) {
        this.loadRoute(newValue).then(this.appRootConnected.bind(this));
      } else {
        void this.changeRoute(newValue);
      }
    }
  }

  /**
   * @type {Member["changeRoute"]["Type"]}
   * @returns {Member["changeRoute"]["ReturnType"]}
   */
  async changeRoute(newRoute) {
    this.internal.mounted = true;
    this.shadowRoot.replaceChildren();
    window.Piglet.reset();
    this.appRootConnected();
    await this.loadRoute(newRoute);
  }

  /**
   * @type {Member["loadRoute"]["Type"]}
   * @returns {Member["loadRoute"]["ReturnType"]}
   */
  async loadRoute(route) {
    this._route = route;

    try {
      let routePath = _routes[route];
      if (!routePath) {
        routePath = "NotFound";
      }

      const { base, html } = await fetchComponentData(routePath, [
        CONST.componentRoute.base,
        CONST.componentRoute.html,
      ]);

      if (html) {
        const tags = this.extractCustomTags(html);
        await this.loadCustomComponents(tags);
      }

      this.renderComponent(base);

      sendToExtension(CONST.extension.initialMessage);
      window.Piglet.log(
        CONST.pigletLogs.appRoot.routeLoaded(route),
        CONST.coreLogsLevels.info,
      );
    } catch (err) {
      window.Piglet.log(
        CONST.pigletLogs.appRoot.errorLoading(route),
        CONST.coreLogsLevels.error,
        err,
      );
      this.shadowRoot.innerHTML = `<h1>${CONST.pageNotFound}</h1>`;
    }
  }

  /**
   * @type {Member["extractCustomTags"]["Type"]}
   * @returns {Member["extractCustomTags"]["ReturnType"]}
   */
  extractCustomTags(pageSource) {
    const tags = new Set();
    let match;
    while ((match = CONST.tagRegex.exec(pageSource)) !== null) {
      const tag = match[1];
      if (tag.includes("-")) {
        tags.add(tag);
      }
    }
    return Array.from(tags).map(toPascalCase);
  }

  /**
   * @type {Member["loadCustomComponents"]["Type"]}
   * @returns {Member["loadCustomComponents"]["ReturnType"]}
   */
  async loadCustomComponents(tags, seen = new Set()) {
    await Promise.all(
      tags.map(async (tag) => {
        if (tag === CONST.conditionalName || seen.has(tag)) return;
        seen.add(tag);

        try {
          const { html } = await fetchComponentData(tag, [
            CONST.componentRoute.base,
            CONST.componentRoute.html,
          ]);

          const nestedTags = this.extractCustomTags(html);

          await this.loadCustomComponents(nestedTags, seen);
        } catch (e) {
          window.Piglet.log(
            CONST.pigletLogs.appRoot.unableToLoadComponent(tag),
            CONST.coreLogsLevels.warn,
            e,
          );
        }
      }),
    );
  }

  appRootConnected() {
    this.internal.mounted = true;
    while (this.internal.waiters.length > 0) {
      this.internal.waiters.shift()._mount(CONST.reason.parentUpdate);
    }
  }

  connectedCallback() {
    window.Piglet.AppRoot = this;
  }

  /**
   * @type {Member["renderComponent"]["Type"]}
   * @returns {Member["renderComponent"]["ReturnType"]}
   */
  renderComponent(component) {
    if (component.prototype instanceof ReactiveComponent) {
      const element = new component();
      if (element instanceof ReactiveComponent) {
        this.shadowRoot.appendChild(element);
      }
    } else if (typeof component === "string") {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = component || "";
      this.shadowRoot.appendChild(wrapper);
    }
  }

  /** @type {Member["route"]["Type"]} */
  get route() {
    return this._route;
  }

  /** @param {AppRootInterface["route"]} newRoute */
  set route(newRoute) {
    if (this._route !== newRoute) {
      this.setAttribute(CONST.routeAttribute, newRoute);
      if (window.location.pathname !== newRoute) {
        history.pushState({}, "", newRoute);
      }
      this._route = newRoute;
    }
  }

  onAfterUpdate() {
    return true;
  }

  onBeforeUpdate() {
    return true;
  }

  async runScript(reason) {
    return Promise.resolve(undefined);
  }
}

export default AppRoot;
