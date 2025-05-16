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
   * Current route path
   * @type {string}
   */
  route;

  /**
   * List of attributes to observe for changes
   * @returns {string[]} Array of attribute names
   */
  static get observedAttributes() {
    return [];
  }

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
   * Loads and renders the view for a given route
   * @param {string} route - Route path to load
   * @returns {Promise<void>}
   */
  async loadRoute(route) {}

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
   * Renders a component into the view
   * @param {typeof ReactiveComponent | undefined} component - Component class or function to render
   * @returns {Promise<void>}
   */
  async renderComponent(component) {}

  /**
   * Lifecycle method called when an observed attribute changes
   * @param {string} name - The name of the changed attribute
   * @param {string|null} oldValue - The previous value of the attribute
   * @param {string} newValue - The new value of the attribute
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {}
}

/** @typedef {InterfaceMethodTypes<AppRootInterface>} Member */
/** @typedef {InterfaceMethodTypes<ReactiveComponent>} Virtual */

export {
  /** @exports Virtual */
  /** @exports Member */
  AppRootInterface,
};
