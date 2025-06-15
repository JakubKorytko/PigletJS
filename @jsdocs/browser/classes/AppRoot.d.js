/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
/** @import {Navigate, Api} from "@jsdocs/browser/helpers.d" */
/** @import {HerdInterface} from "@Piglet/browser/classes/Herd.d" */
/** @import {RouteChangeEventDetail} from "@jsdocs/browser/classes/NavLink.d" */

import { VirtualReactiveComponentInterface } from "@jsdocs/browser/classes/ReactiveComponent.d";
import {buildComponentTree} from "@Piglet/browser/tree";

/**
 * @typedef {{
 *    id: number,
 *    route: string,
 *    done: boolean,
 *    isStale: boolean,
 *    success: () => void,
 * }} Navigator
 */

/**
 * Root component of the application, handles routing and component loading
 * @interface AppRootInterface
 * @extends {VirtualReactiveComponentInterface}
 */
class AppRootInterface extends VirtualReactiveComponentInterface {
  /**
   * Current route path
   * @type {string}
   */
  _route;

  /**
   * Component layout paths
   * @type {{
   *     [key: string]: {
   *         layout: string
   *     },
   *     layouts: Record<string, string>
   * }}
   */
  _layoutPaths = {};

  /**
   * Previous layout path
   * @type {string}
   */
  __previousLayout = "";

  /**
   * Deep state proxy cache
   * @type {WeakMap<string, StateValue<unknown>>}
   */
  __proxyCache = new WeakMap();

  /**
   * The fetch cache
   * @type {Map<string, string>}
   */
  __fetchCache = new Map();

  /**
   * The fetch queue
   * @type {Map<string, Promise<string>>}
   */
  __fetchQueue = new Map();

  /**
   * Counter for setting component IDs
   * @type {number}
   */
  componentCounter = 0;

  /**
   * Whole application state
   * @type {Record<string, StateInterface<unknown>>|{}}
   */
  globalState = {};

  /**
   * Tree of components in the application
   * @type {Record<string, TreeNode>|Record<string, never>}
   */
  get tree() {
    if (this.AppRoot) {
      return buildComponentTree(this.AppRoot);
    }

    return {};
  }

  /**
   * Extension communication methods
   * @type {{
   *     sendInitialData?: () => void, // Send initial data to the extension
   *     sendTreeUpdate?: () => void, // Send tree update to the extension
   *     sendStateUpdate?: () => void // Send state update to the extension
   *   }}
   */
  extension = {};

  /**
   * Set of mounted components
   * @type {
   *    Set<{
   *        tag: string, // The tag of the component
   *        ref: HTMLElement|ReactiveComponent // The reference to the component
   *    }>
   * }
   */
  mountedComponents = new Set();

  /**
   * Record of components whose constructors have been called
   * @type {Record<string, ReactiveComponent>}
   */
  constructedComponents = {};

  /**
   * Record of components registered in custom elements registry
   * @type {Record<string, ReactiveComponent>}
   */
  registeredComponents = {};

  /**
   * Record of previously fetched component cache keys
   * @type {Record<string, Record<'html' | 'script' | 'layout', string>>}
   */
  previousFetchComponentCacheKeys = {};

  /**
   * @type {{
   *   RC: ReactiveComponent, // ReactiveComponent class
   *   RDC: ReactiveDummyComponent, // ReactiveDummyComponent class
   * }}
   */
  types;

  /**
   * Navigate function for changing routes
   * @type {Navigate}
   */
  navigate;

  /**
   * API instance for making requests
   * @type {Api}
   */
  api;

  /**
   * Current route path
   * @type {string}
   */
  route;

  /**
   * Reference to the herd instance
   * @type {HerdInterface}
   */
  herd;

  /**
   * Routes object containing route paths and their corresponding components
   * @type {Record<string, string> | Record<string, never>}
   */
  _routes;

  /**
   * Queue for handling navigation requests
   * @type {Array<AppRootInterface['route']>}
   */
  __navigationQueue;

  /**
   * Unique identifier for the navigator instance
   * @type {number};
   */
  __navigatorId;

  /**
   * Candidate route for navigation
   * @type {string}
   */
  __routeCandidate;

  /**
   * Fetches layout paths from the server
   * @returns {Promise<void>}
   */
  async getLayoutPaths() {}

  /**
   * Adds popstate event listener for handling browser navigation
   * @returns {void}
   */
  addPopStateListener() {}


  /**
   * Preloads layout and base for a given route
   * @param {string} route - Route path to preload
   * @param {boolean} isReloaded - Indicates if the route is reloaded
   * @returns {Promise<{ base: ReactiveComponent | undefined, layout: string }>}
   */
  async preLoadRoute(route, isReloaded = false);

  /**
   * Extracts custom component tags from HTML source
   * @param {string} pageSource - HTML source code to parse
   * @returns {string[]} Array of custom component tag names
   */
  extractCustomTags(pageSource) {
    return [];
  }

  /**
   * Loads custom component modules
   * @param {string[]} tags - Array of component tag names to load
   * @param {Set<string>=} seen - Set of seen component tag names
   * @returns {Promise<void>}
   */
  async loadCustomComponents(tags, seen) {}

  /**
   * Lets the child components know that the app root is connected
   * @returns {Promise<void>}
   */
  async appRootConnected();

  /**
   * Renders a component into the view
   * @param {typeof ReactiveComponent | undefined} component - Component class or function to render
   * @param {string} layout - Layout string to use
   * @returns {void}
   */
  renderComponent(component, layout) {}

  /**
   * Gets the layout components for the current route
   * @returns {ReactiveComponent[]}
   */
  getLayoutComponents() {};

  /**
   * Resets the application state and component counter
   * @returns {void}
   */
  reset() {
    this.state = {};
    this.componentCounter = 0;
  }

  /**
   * Resets the application state before a route transition
   * @returns {void}
   */
  resetBeforeTransition() {};

  /**
   * Handles the transition callback after a route change
   * @param base {ReactiveComponent | undefined} - Base component for the route
   * @param layout {string} - Layout string for the route
   * @param isInitial {boolean} - Indicates if this is the initial route load
   * @returns {Promise<void>}
   */
  transitionCallback({base, layout}, isInitial = false) {
    return Promise.resolve();
  };

  /**
   * Starts a route chain for the navigator
   * @param navigator {Navigator} - The navigator instance to start the route chain
   * @param routeData {RouteChangeEventDetail} - Data for the route change event
   * @returns {boolean}
   */
  startRouteChain(navigator, routeData) {
    return true;
  }

  /**
   * Creates a new navigator instance for handling route changes
   * @param {string} route - The route path for the navigator
   * @returns {Navigator}
   */
  createNavigator(route) {
    return {
      id: this.__navigatorId++,
      route: this.route,
      done: false,
      isStale: false,
      success: () => {},
    };
  }

  /**
   * Reloads the route and its components
   * @returns {void}
   */
  reload() {}

  /**
   * Force a full reload of the application
   * @returns {void}
   */
  __forceFullReload() {}
}

/** @typedef {InterfaceMethodTypes<AppRootInterface>} AppRootMembers */
/** @typedef {InterfaceMethodTypes<ReactiveComponent>} AppRootVirtualMembers */

export {
  /** @exports Virtual */
  /** @exports Member */
  AppRootInterface,
};
