/** @import {Reason} from "@jsdocs/browser/CONST.d" */
/** @import {TreeNode, MountData} from "@jsdocs/browser/tree.d" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 * @interface BaseReactiveComponentInterface
 */
class BaseReactiveComponentInterface {
  /**
   * The caller of the component
   * @type {string}
   */
  __caller;

  /**
   * The name of the component
   * @type {string}
   */
  __componentName;

  /**
   * The observers of the component state
   * @type {Map<string, (component: ReactiveComponent) => void>}
   */
  __observers;

  /**
   * The attributes of the component
   * @type {Record<string, string>|{}}
   */
  __attrs;

  /**
   * The tree of the component
   * @type {Record<string, TreeNode<ReactiveComponent|Element>>}
   */
  __tree;

  /**
   * The forwarded functions of the component
   * @type {Record<string, Function>|{}}
   */
  _forwarded;

  /**
   * Whether the component is mounted
   * @type {boolean}
   */
  __isMounted;

  /**
   * Whether the HTML is injected
   * @type {boolean}
   */
  __isHTMLInjected;

  /**
   * The children of the component
   * @type {Array<ReactiveComponent>}
   */
  __children;

  /**
   * The ID of the component
   * @type {number}
   */
  __componentId;

  /**
   * The key of the component (format: `ComponentName-id`)
   * @type {string}
   */
  __componentKey;

  /**
   * The root element of the component
   * @type {ShadowRoot | Node}
   */
  __root;

  /**
   * The mount callback of the component
   * @type {((reason: Reason) => void)}
   */
  __mountCallback;

  /**
   * The mutation observer of the component
   * @type {MutationObserver | undefined}
   */
  __mutationObserver;

  /**
   * Called when the component is mounted
   * @param {Reason} reason - The reason for the mount
   * @returns {void}
   */
  _mount(reason) {}

  /**
   * Updates the children of the component
   * @param {Reason} reason - The reason for the update
   * @returns {void}
   */
  _updateChildren(reason) {}

  /**
   * Called when the component is unmounted
   * @returns {void}
   */
  _unmount() {}

  /**
   * Called when the component is connected to the DOM
   * @returns {void}
   */
  connectedCallback() {}

  /**
   * Called when the component is disconnected from the DOM
   * @returns {void}
   */
  disconnectedCallback() {}

  /**
   * Called when the component is adopted
   * @returns {void}
   */
  adoptedCallback() {}

  /**
   * Set the callback to be called when the component is mounted
   * @param {(reason: Reason) => void} callback
   * @returns {void}
   */
  onMount(callback) {}

  /**
   * Observe a state property
   * @param {string} property - The property to observe
   * @returns {void}
   */
  observeState(property) {}

  /**
   * Get a result of useState hook & add it to the component observers
   * @template T - The type of the state value.
   * @param {string} property - The property to observe
   * @param {*} initialValue - The initial value of the state
   * @param {boolean} [asRef] - Whether it was called from a ref
   * @returns {{ value: T }}
   */
  state(property, initialValue, asRef) {
    return { value: initialValue };
  }

  /**
   * Called when the state of the component changes
   * @template T - The type of the state value.
   * @param {T} value - The new value of the state
   * @param {string} property - The property that changed
   * @param {T} prevValue - The previous value of the state
   * @returns {void}
   */
  stateChange(value, property, prevValue) {}

  /**
   * Dispatch an event
   * @param {Event} event - The event to dispatch
   * @returns {boolean}
   */
  dispatchEvent(event) {
    return true;
  }

  /**
   * Reload the component
   * @async
   * @returns {Promise<void>}
   */
  async reloadComponent() {}

  /**
   * Load the content of the component (HTML)
   * @async
   * @returns {Promise<void|null>} A promise that resolves when the HTML content is loaded, or `null` in case of an error.
   */
  async loadContent() {}
}

/**
 * @interface VirtualReactiveComponentInterface
 * @extends {BaseReactiveComponentInterface}
 */
class VirtualReactiveComponentInterface extends BaseReactiveComponentInterface {
  /**
   * Called when the attribute of the component changes
   * @param {string=} name - The name of the attribute
   * @param {string|null=} oldValue - The previous value of the attribute
   * @param {string=} newValue - The new value of the attribute
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {}

  /**
   * Run the script of the component by dynamic import
   * @param {Reason} reason - The reason for the script execution
   * @returns {Promise<void>}
   */
  runScript(reason) {
    return Promise.resolve();
  }

  /**
   * Called when the component is before updating, can return a boolean to prevent the update
   * @returns {boolean|void} - Whether to prevent the update
   */
  onBeforeUpdate() {}

  /**
   * Called when the component is after updating
   * @returns {void}
   */
  onAfterUpdate() {}

  /**
   * The mount data of the component
   * @type {MountData}
   */
  __mountData;

  /**
   * The method to track the custom tree of the component
   * @type {((root?: HTMLElement) => void)}
   */
  __trackCustomTree;

  /**
   * The observer to track the custom tree of the component
   * @type {MutationObserver}
   */
  __customTreeObserver;

  /**
   * Is the component stateless
   * @type {boolean}
   */
  __stateless;
}

/** @typedef {InterfaceMethodTypes<BaseReactiveComponentInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  BaseReactiveComponentInterface,
  VirtualReactiveComponentInterface,
};
