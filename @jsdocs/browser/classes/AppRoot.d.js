/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

import { VirtualReactiveComponentInterface } from "@jsdocs/browser/classes/ReactiveComponent.d";

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
   * Current route path
   * @type {string}
   */
  route;

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
   * Changes the current route and updates the view
   * @method
   * @param {string} newRoute - New route path to navigate to
   * @returns {Promise<void>}
   */
  async changeRoute(newRoute) {}

  /**
   * Handles view transitions when the route changes
   * @param {{ base: ReactiveComponent | undefined, layout: string }} baseAndLayout - Base path for the layout
   * @param {boolean} isReloaded - Indicates if the view is reloaded
   * @returns {Promise<void>}
   */
  async viewTransition({ base, layout }, isReloaded);

  /**
   * Preloads layout and base for a given route
   * @param {string} route - Route path to preload
   * @param {boolean} isReloaded - Indicates if the route is reloaded
   * @returns {Promise<{ base: ReactiveComponent | undefined, layout: string }>}
   */
  async preLoadRoute(route, isReloaded = false);

  /**
   * Loads and renders the view for a given route
   * @param {string} route - Route path to load
   * @returns {Promise<void>}
   */
  async loadRoute(route) {}

  /**
   * Synchronously take care of rendering the route
   * @param {ReactiveComponent | undefined} base - Base component to render
   * @param {string} layout - Layout path to use
   * @returns {void}
   */
  loadRouteSync(base, layout);

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
   * @returns {Promise<void>}
   */
  async renderComponent(component, layout) {}
}

/** @typedef {InterfaceMethodTypes<AppRootInterface>} AppRootMembers */
/** @typedef {InterfaceMethodTypes<ReactiveComponent>} AppRootVirtualMembers */

export {
  /** @exports Virtual */
  /** @exports Member */
  AppRootInterface,
};
