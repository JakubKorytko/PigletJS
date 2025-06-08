/** @import {AppRootInterface, AppRootMembers, AppRootVirtualMembers} from "@jsdocs/browser/classes/AppRoot.d" */
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import {
  api,
  fetchComponentData,
  navigate,
  sendToExtension,
  toPascalCase,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import { buildComponentTree } from "@Piglet/browser/tree";
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";
import Herd from "@Piglet/browser/classes/Herd";

/**
 * Injected using parser
 * @type {Record<string, string>} */
// @ts-ignore
const _routes = routes ?? {};

/** @implements {AppRootInterface} */
class AppRoot extends ReactiveComponent {
  /** @type {AppRootMembers["_route"]["Type"]} */
  _route = "";

  /** @type {AppRootMembers["_layoutPaths"]["Type"]} */
  _layoutPaths = {};

  /** @type {AppRootMembers["__previousLayout"]["Type"]} */
  __previousLayout = "";

  /** @type {AppRootMembers["__proxyCache"]["Type"]} */
  __proxyCache = new WeakMap();

  /** @type {AppRootMembers["__fetchCache"]["Type"]} */
  __fetchCache = new Map();

  /** @type {AppRootMembers["__fetchQueue"]["Type"]} */
  __fetchQueue = new Map();

  /** @type {AppRootMembers["componentCounter"]["Type"]} */
  componentCounter = 0;

  /** @type {AppRootMembers["globalState"]["Type"]} */
  globalState = {};

  /** @type {AppRootMembers["extension"]["Type"]} */
  extension = {};

  /** @type {AppRootMembers["mountedComponents"]["Type"]} */
  mountedComponents = new Set();

  /** @type {AppRootMembers["constructedComponents"]["Type"]} */
  constructedComponents = {};

  /** @type {AppRootMembers["registeredComponents"]["Type"]} */
  registeredComponents = {};

  /** @type {AppRootMembers["previousFetchComponentCacheKeys"]["Type"]} */
  previousFetchComponentCacheKeys = {};

  /** @type {AppRootMembers["types"]["Type"]} */
  types = {
    RC: ReactiveComponent,
    RDC: ReactiveDummyComponent,
  };

  static get observedAttributes() {
    return [CONST.routeAttribute];
  }

  constructor(attrs) {
    super(attrs);
    this.herd = new Herd(this);
    this.api = api;
    this.navigate = navigate.bind(this);
    this.addPopStateListener();
  }

  /**
   * @type {AppRootVirtualMembers["connectedCallback"]["Type"]}
   * @returns {AppRootVirtualMembers["connectedCallback"]["ReturnType"]}
   */
  connectedCallback() {
    this.appContent = document.createElement("app-content");
    this.appContent.root = this;
    this.appContent.setAttribute("part", "app-content");
    this.shadowRoot.append(this.appContent);
  }

  /**
   * @type {AppRootMembers["getLayoutPaths"]["Type"]}
   * @returns {AppRootMembers["getLayoutPaths"]["ReturnType"]}
   */
  async getLayoutPaths() {
    const paths = await fetch(`/component/layout/paths?noCache=${Date.now()}`);
    try {
      if (paths.ok) {
        this._layoutPaths = await paths.json();
        return;
      }
    } catch (e) {
      void 0; // Ignore JSON parsing errors
    }
    console.pig(
      CONST.pigletLogs.appRoot.errorLoading("layout paths"),
      CONST.coreLogsLevels.error,
    );
  }

  /**
   * @type {AppRootMembers["reset"]["Type"]}
   * @returns {AppRootMembers["reset"]["ReturnType"]}
   */
  reset() {
    this.state = {};

    const keys = Object.keys(this.globalState);
    const constructed = keys.map((key) => this.constructedComponents[key]);

    for (const component of constructed) {
      let isInAppContent = false;
      let currentElement = component;

      while (currentElement) {
        if (currentElement === this.appContent) {
          isInAppContent = true;
          break;
        }
        currentElement = currentElement.internal?.parent;
      }

      // We don't want to delete AppRoot & its layout components state.
      if (isInAppContent) delete this.globalState[component.__componentKey];
    }

    this.componentCounter = 0;
  }

  /** @type {AppRootMembers["tree"]["Type"]} */
  get tree() {
    return buildComponentTree(this);
  }

  /**
   * @type {AppRootMembers["addPopStateListener"]["Type"]}
   * @returns {AppRootMembers["addPopStateListener"]["ReturnType"]}
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
   * @type {AppRootVirtualMembers["attributeChangedCallback"]["Type"]}
   * @returns {AppRootVirtualMembers["attributeChangedCallback"]["ReturnType"]}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === CONST.routeAttribute && oldValue !== newValue) {
      if (oldValue === null) {
        this.loadRoute(newValue);
      } else {
        this.changeRoute(newValue);
      }
    }
  }

  /**
   * @type {AppRootMembers["changeRoute"]["Type"]}
   * @returns {AppRootMembers["changeRoute"]["ReturnType"]}
   */
  async changeRoute(newRoute) {
    const isReload = newRoute === this._route;
    if (isReload) {
      await this.getLayoutPaths();
    }
    const { base, layout } = await this.preLoadRoute(newRoute, isReload);
    if (!base) return;
    await this.viewTransition({ base, layout }, true);
  }

  /**
   * @type {AppRootMembers["viewTransition"]["Type"]}
   * @returns {AppRootMembers["viewTransition"]["ReturnType"]}
   */
  async viewTransition({ base, layout }, isReloaded) {
    const transitionCallback = () => {
      if (isReloaded) {
        this.internal.mounted = true;
        const persistentChildren = this.appContent.querySelectorAll(
          "*[data-piglet-persistent]",
        );

        this.appContent.replaceChildren(...persistentChildren);
        this.reset();
      }
      this.loadRouteSync(base, layout);
      return this.appRootConnected();
    };

    if (!document.startViewTransition || window.viewTransitionRunning) {
      await this.appContent.runPageTransition("out");
      transitionCallback();
      await this.appContent.runPageTransition();
      await this.appRootConnected();
    } else {
      const currentOverflow = this.style.overflow;
      this.style.overflow = "hidden";
      window.viewTransitionRunning = true;
      const transition = document.startViewTransition(
        transitionCallback.bind(this),
      );
      await transition.finished;
      window.viewTransitionRunning = false;
      this.style.overflow = currentOverflow;
    }
  }

  /**
   * @type {AppRootMembers["preLoadRoute"]["Type"]}
   * @returns {AppRootMembers["preLoadRoute"]["ReturnType"]}
   */
  async preLoadRoute(route, isReloaded = false) {
    this._route = route;

    try {
      let routePath = _routes[route];
      if (!routePath) {
        routePath = "NotFound";
      }

      const routeLayout = this._layoutPaths[routePath]?.layout;
      if (routeLayout === this.__previousLayout && !isReloaded) {
        const { base, html } = await fetchComponentData(
          routePath,
          [CONST.componentRoute.base, CONST.componentRoute.html],
          this.root,
          isReloaded,
        );

        if (html) {
          await this.loadCustomComponents(this.extractCustomTags(html));
        }

        return {
          base,
          layout: "",
        };
      }

      this.__previousLayout = routeLayout;

      const { base, html, layout } = await fetchComponentData(
        routePath,
        [
          CONST.componentRoute.base,
          CONST.componentRoute.html,
          CONST.componentRoute.layout,
        ],
        this.root,
        isReloaded,
      );

      if (html) {
        const tags = [
          ...this.extractCustomTags(html),
          ...this.extractCustomTags(layout),
        ];
        await this.loadCustomComponents(tags);
      }

      return {
        base,
        layout,
      };
    } catch (err) {
      console.pig(
        CONST.pigletLogs.appRoot.errorLoading(route),
        CONST.coreLogsLevels.error,
        err,
      );
      this.appContent.innerHTML = `<h1>${CONST.pageNotFound}</h1>`;
    }
  }

  /**
   * @type {AppRootMembers["loadRoute"]["Type"]}
   * @returns {AppRootMembers["loadRoute"]["ReturnType"]}
   */
  async loadRoute(route) {
    if (Object.keys(this._layoutPaths).length === 0) {
      await this.getLayoutPaths();
    }

    const { base, layout } = await this.preLoadRoute(route);
    if (!base) return;
    await this.viewTransition({ base, layout }, false);
  }

  /**
   * @type {AppRootMembers["loadRouteSync"]["Type"]}
   * @returns {AppRootMembers["loadRouteSync"]["ReturnType"]}
   */
  loadRouteSync(base, layout) {
    this.renderComponent(base, layout);
    sendToExtension(CONST.extension.initialMessage, this.root);
    console.pig(
      CONST.pigletLogs.appRoot.routeLoaded(this._route),
      CONST.coreLogsLevels.info,
    );
  }

  /**
   * @type {AppRootMembers["extractCustomTags"]["Type"]}
   * @returns {AppRootMembers["extractCustomTags"]["ReturnType"]}
   */
  extractCustomTags(pageSource) {
    const tags = new Set();
    let match;

    const clonedRegex = new RegExp(CONST.tagRegex.source, "g");
    while ((match = clonedRegex.exec(pageSource)) !== null) {
      const tag = match[1];
      if (tag.includes("-") && !["app-content"].includes(tag)) {
        tags.add(tag);
      }
    }
    return Array.from(tags).map(toPascalCase);
  }

  /**
   * @type {AppRootMembers["loadCustomComponents"]["Type"]}
   * @returns {AppRootMembers["loadCustomComponents"]["ReturnType"]}
   */
  async loadCustomComponents(tags, seen = new Set()) {
    await Promise.all(
      tags.map(async (tag) => {
        if (tag === CONST.conditionalName || seen.has(tag)) return;
        seen.add(tag);

        try {
          const { html } = await fetchComponentData(
            tag,
            [CONST.componentRoute.base, CONST.componentRoute.html],
            this.root,
          );

          const nestedTags = this.extractCustomTags(html);

          await this.loadCustomComponents(nestedTags, seen);
        } catch (e) {
          console.pig(
            CONST.pigletLogs.appRoot.unableToLoadComponent(tag),
            CONST.coreLogsLevels.warn,
            e,
          );
        }
      }),
    );
  }

  /**
   * @type {AppRootMembers["appRootConnected"]["Type"]}
   * @returns {AppRootMembers["appRootConnected"]["ReturnType"]}
   */
  async appRootConnected() {
    this.internal.mounted = true;
    while (this.internal.waiters.length > 0) {
      await this.internal.waiters.shift()._mount(CONST.reason.parentUpdate);
    }
  }

  /**
   * @type {AppRootMembers["renderComponent"]["Type"]}
   * @returns {AppRootMembers["renderComponent"]["ReturnType"]}
   */
  renderComponent(component, layout) {
    let contentTag = null;
    if (layout) {
      const parsedLayout = new DOMParser().parseFromString(layout, "text/html");
      const content = [
        ...parsedLayout.head.childNodes,
        ...parsedLayout.body.childNodes,
      ];
      contentTag = content.find(
        (el) => el.nodeName.toLowerCase() === "app-content",
      );
      this.shadowRoot.replaceChildren(this.appContent);
      for (const child of content) {
        let el = child;
        const tag = child.tagName?.toLowerCase();
        if (tag && tag.includes("-") && tag !== "app-content") {
          const customComponent = customElements.get(tag);
          if (customComponent) {
            el = new customComponent({ parent: this }, this.root);
          }
        }
        this.shadowRoot.appendChild(el);
      }
    }

    if (component.prototype instanceof ReactiveComponent) {
      const element = new component({ parent: this }, this);
      if (element instanceof ReactiveComponent) {
        if (contentTag) {
          contentTag.replaceWith(this.appContent);
          this.appContent.appendChild(element);
        } else {
          this.appContent.appendChild(element);
        }
      }
    }
  }

  /** @type {AppRootMembers["route"]["Type"]} */
  get route() {
    return this._route;
  }

  /** @param {AppRoot["_route"]} newRoute */
  set route(newRoute) {
    if (this._route !== newRoute) {
      this.setAttribute(CONST.routeAttribute, newRoute);
      if (window.location.pathname !== newRoute) {
        history.pushState({}, "", newRoute);
      }
      this._route = newRoute;
    }
  }
}

export default AppRoot;
