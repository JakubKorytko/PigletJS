/** @import {AppRootInterface, AppRootMembers, AppRootVirtualMembers} from "@jsdocs/browser/classes/AppRoot.d" */
/** @import {RouteChangeEventDetail} from "@jsdocs/browser/classes/NavLink.d" */

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

/** For IDE autocompletion */
let Parser;

/** @type {(detail: RouteChangeEventDetail, type: `piglet:${string}`) => CustomEvent<RouteChangeEventDetail>} */
const RouteEvent = function (detail, type) {
  return new CustomEvent(type, {
    detail,
  });
};

// noinspection JSPotentiallyInvalidUsageOfClassThis
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

  /** @type {AppRootMembers["_routes"]["Type"]} */
  @Parser _routes = {};

  /** @type {AppRootMembers["__navigationQueue"]["Type"]} */
  __navigationQueue = [];

  /** @type {AppRootMembers["__navigatorId"]["Type"]} */
  __navigatorId = 0;

  /** @type {AppRootMembers["__routeCandidate"]["Type"]} */
  __routeCandidate = "";

  static get observedAttributes() {
    return [CONST.routeAttribute];
  }

  constructor(attrs) {
    super(attrs);
    if (AppRoot.instance) return AppRoot.instance;
    AppRoot.instance = this;
    this.herd = new Herd(this);
    this.api = api;
    this.navigate = navigate.bind(this);
    this.addPopStateListener();
    Object.defineProperties(window.location, {
      /** @type {AppRootMembers["route"]["Type"]} */
      route: {
        get: () => this._route,
      },
      /** @type {AppRootMembers["route"]["Type"]} */
      candidate: {
        get: () => this.__routeCandidate,
      },
    });
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
      this.route = CONST.symbols.popStateMarker;
    });
  }

  /**
   * @type {AppRootVirtualMembers["attributeChangedCallback"]["Type"]}
   * @returns {AppRootVirtualMembers["attributeChangedCallback"]["ReturnType"]}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== CONST.routeAttribute) return;
    if (this.route && !newValue) return this.setAttribute(name, "/");
    this.route = newValue;
  }

  /**
   * @type {AppRootMembers["resetBeforeTransition"]["Type"]}
   * @returns {AppRootMembers["resetBeforeTransition"]["ReturnType"]}
   */
  resetBeforeTransition() {
    this.internal.mounted = true;
    const persistentChildren = this.appContent.querySelectorAll(
      "*[data-piglet-persistent]",
    );

    this.appContent.replaceChildren(...persistentChildren);
    this.reset();
  }

  /**
   * @type {AppRootMembers["transitionCallback"]["Type"]}
   * @returns {AppRootMembers["transitionCallback"]["ReturnType"]}
   */
  transitionCallback({ base, layout }, isInitial = false) {
    if (!isInitial) this.resetBeforeTransition();
    this.renderComponent(base, layout);
    sendToExtension(CONST.extension.initialMessage, this.root);
    console.pig(
      CONST.pigletLogs.appRoot.routeLoaded(this.route),
      CONST.coreLogsLevels.info,
    );
    return this.appRootConnected();
  }

  /**
   * @type {AppRootMembers["startRouteChain"]["Type"]}
   * @returns {AppRootMembers["startRouteChain"]["ReturnType"]}
   */
  startRouteChain(navigator, data) {
    async function* gen({ route, isInitial, isReloaded }) {
      if (isReloaded || Object.keys(this._layoutPaths).length === 0) {
        yield await this.getLayoutPaths();
      }

      const { base, layout, html } = await this.preLoadRoute(route, isReloaded);
      if (!base) return false;

      const tags = [
        ...this.extractCustomTags(html),
        ...this.extractCustomTags(layout),
      ];

      yield await this.loadCustomComponents(tags);

      if (!document.startViewTransition) {
        yield await this.appContent.runPageTransition("out");
        yield await this.transitionCallback({ base, layout }, isInitial);
        yield await this.appContent.runPageTransition();
        yield await this.appRootConnected();
      } else {
        if (window.viewTransitionRunning) {
          window.viewTransitionRunning.skipTransition();
          console.pig(
            CONST.pigletLogs.skippingViewTransition,
            CONST.coreLogsLevels.warn,
          );
        }
        if (isInitial) {
          this.resetBeforeTransition();
        }
        const currentOverflow = this.style.overflow;

        try {
          this.style.overflow = "hidden";
          const transition = document.startViewTransition(
            this.transitionCallback.bind(this, { base, layout }),
          );
          window.viewTransitionRunning = transition;
          yield await transition.ready;
          yield await transition.updateCallbackDone;
          yield await transition.finished;
          window.viewTransitionRunning = null;
          this.style.overflow = currentOverflow;
        } catch (e) {
          console.pig(
            CONST.pigletLogs.errorDuringViewTransition,
            CONST.coreLogsLevels.warn,
            e,
          );
          window.viewTransitionRunning = null;
          this.style.overflow = currentOverflow;
          yield await this.appRootConnected();
          return true;
        }
      }

      return true;
    }

    gen.bind(this);

    return new Promise(async (resolve) => {
      const generator = gen.call(this, data);
      let result = await generator.next();

      while (!result.done) {
        if (navigator.isStale) {
          console.pig(
            CONST.pigletLogs.staleNavigation,
            CONST.coreLogsLevels.warn,
          );
          return resolve(false);
        }
        result = await generator.next(result.value);
      }

      navigator.success();
      resolve(result.value);
    });
  }

  /**
   * @type {AppRootMembers["preLoadRoute"]["Type"]}
   * @returns {AppRootMembers["preLoadRoute"]["ReturnType"]}
   */
  async preLoadRoute(route, isReloaded = false) {
    try {
      const routePath = this._routes[route] ?? "NotFound";
      const routeLayout = this._layoutPaths[routePath]?.layout;
      const isLayoutTheSame =
        routeLayout === this.__previousLayout && !isReloaded;
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

      return {
        base,
        layout: isLayoutTheSame ? "" : layout,
        html,
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

  /**
   * @type {AppRootMembers["createNavigator"]["Type"]}
   * @returns {AppRootMembers["createNavigator"]["ReturnType"]}
   */
  createNavigator(route) {
    const id = ++this.__navigatorId;
    const entry = { route, id };
    this.__navigationQueue.push(entry);

    const condition = () => {
      const isStale =
        this.__navigationQueue[this.__navigationQueue.length - 1]?.id !== id;
      if (isStale) {
        const index = this.__navigationQueue.findIndex((e) => e.id === id);
        if (index !== -1) this.__navigationQueue.splice(index, 1);
        return false;
      }
      return true;
    };

    const status = {
      id,
      route,
      done: false,
      get isStale() {
        return !condition();
      },
    };

    status.success = () => {
      const index = this.__navigationQueue.findIndex((e) => e.id === id);
      if (index !== -1) this.__navigationQueue.splice(index, 1);
      status.done = true;
    };

    return status;
  }

  /** @type {AppRootMembers["route"]["Type"]} */
  get route() {
    return this._route;
  }

  /**
   * @type {AppRootMembers["reload"]["Type"]}
   * @returns {AppRootMembers["reload"]["ReturnType"]}
   */
  reload() {
    this.route = this._route;
  }

  /**
   * @type {AppRootMembers["__forceFullReload"]["Type"]}
   * @returns {AppRootMembers["__forceFullReload"]["ReturnType"]}
   */
  __forceFullReload() {
    window.location.reload();
  }

  /** @param {AppRoot["_route"] | typeof CONST.symbols.popStateMarker} passedRoute */
  set route(passedRoute) {
    if (!passedRoute) return;
    return new Promise(async () => {
      const native = passedRoute === CONST.symbols.popStateMarker;
      const targetRoute = native ? window.location.pathname : passedRoute;

      const routeData = {
        previousRoute: this._route,
        isInitial: this._route === "",
        native,
        redirected: false,
      };

      let testConnection;
      try {
        testConnection = await fetch(targetRoute);
      } catch {}
      const testURL = new URL(testConnection.url);
      const route = testURL.pathname;

      routeData.route = route;
      routeData.isReloaded = this._route === route;
      if (route !== targetRoute) {
        routeData.redirected = true;
      }

      this.__routeCandidate = route;

      const statusCode = String(testConnection.status)[0];

      if (["4", "5"].includes(statusCode)) {
        this.dispatchEvent(
          new RouteEvent(routeData, CONST.pigletEvents.canceledByMiddleware),
        );
        console.pig(
          CONST.pigletLogs.canceledByMiddleware(route),
          CONST.coreLogsLevels.info,
        );
        return;
      }

      const navigator = this.createNavigator(route);

      this.dispatchEvent(
        new RouteEvent(routeData, CONST.pigletEvents.beforeRouteChange),
      );

      const wasStale = !(await this.startRouteChain(navigator, routeData));
      if (wasStale) {
        return;
      }
      this._route = route;

      if (!native) {
        window.history.pushState({}, "", route);
      }

      this.dispatchEvent(
        new RouteEvent(routeData, CONST.pigletEvents.routeChanged),
      );
    });
  }
}

export default AppRoot;
