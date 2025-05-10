/** @import {AppRootInterface, Virtual, Member} from "@jsdocs/browser/classes/AppRoot.d" */
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import {
  toPascalCase,
  sendToExtension,
  loadComponent,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/**
 * Injected using parser
 * @type {Record<string, string>} */
// @ts-ignore
const _routes = routes ?? {};

/** @implements {AppRootInterface} */
class AppRoot extends ReactiveComponent {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._route = "";
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
        this.loadRoute(newValue).then(this._mount.bind(this));
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
    this._unmount.call(this);
    this.shadowRoot.replaceChildren();
    window.Piglet.reset();
    super.connectedCallback();
    await this.loadRoute(newRoute);
    this._mount.call(this);
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
      const [module, pageSource] = await Promise.all([
        import(`${CONST.componentRoute.base}/${routePath}`),
        fetch(`${CONST.componentRoute.html}/${routePath}`).then((res) =>
          res.text(),
        ),
      ]);

      const tags = this.extractCustomTags(pageSource);
      await this.loadCustomComponents(tags, new Set());

      await this.renderComponent(module.default);

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
          await import(`${CONST.componentRoute.base}/${tag}`);

          const html = await fetch(`${CONST.componentRoute.html}/${tag}`).then(
            (res) => res.text(),
          );

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

  connectedCallback() {
    window.Piglet.AppRoot = this;
  }

  /**
   * @type {Member["renderComponent"]["Type"]}
   * @returns {Member["renderComponent"]["ReturnType"]}
   */
  async renderComponent(component) {
    if (component.prototype instanceof ReactiveComponent) {
      await loadComponent(component);
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

  /**
   * @type {Virtual["dispatchEvent"]["Type"]}
   * @returns {Virtual["dispatchEvent"]["ReturnType"]}
   */
  dispatchEvent(event) {
    return false;
  }

  /**
   * @type {Virtual["runScript"]["Type"]}
   * @returns {Virtual["runScript"]["ReturnType"]}
   */
  runScript() {
    return Promise.resolve(undefined);
  }

  /**
   * @type {Virtual["onBeforeUpdate"]["Type"]}
   * @returns {Virtual["onBeforeUpdate"]["ReturnType"]}
   */
  onBeforeUpdate() {}

  /**
   * @type {Virtual["onAfterUpdate"]["Type"]}
   * @returns {Virtual["onAfterUpdate"]["ReturnType"]}
   */
  onAfterUpdate() {}
}

export default AppRoot;
