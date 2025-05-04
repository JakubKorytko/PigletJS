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
  _caller;

  /**
   * The name of the component
   * @type {string}
   */
  _componentName;

  /**
   * The observers of the component state
   * @type {Map<string, (component: ReactiveComponent) => void>}
   */
  _observers;

  /**
   * The attributes of the component
   * @type {Record<string, string>|{}}
   */
  _attrs;

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
  _isMounted;

  /**
   * Whether the HTML is injected
   * @type {boolean}
   */
  _isHTMLInjected;

  /**
   * The children of the component
   * @type {Array<ReactiveComponent>}
   */
  _children;

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
   * @type {((reason: Reason) => void) | undefined}
   */
  mountCallback;

  /**
   * The mutation observer of the component
   * @type {MutationObserver | undefined}
   */
  _mutationObserver;

  /**
   * Called when the component is mounted
   * @param {Reason} reason
   * @returns {void}
   */
  _mount(reason) {}

  /**
   * Updates the children of the component
   * @param {Reason} reason
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
   * @param {string} property
   * @returns {void}
   */
  observeState(property) {}

  /**
   * Get a result of useState hook & add it to the component observers
   * @template T
   * @param {string} property
   * @param {*} initialValue
   * @param {boolean} [asRef]
   * @returns {{ value: T }}
   */
  state(property, initialValue, asRef) {
    return { value: initialValue };
  }

  /**
   * @template T
   * Called when the state of the component changes
   * @param {T} value
   * @param {string} property
   * @param {T} prevValue
   * @returns {void}
   */
  stateChange(value, property, prevValue) {}

  /**
   * Dispatch an event
   * @param {Event} event
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
   * @param {string=} name
   * @param {string|null=} oldValue
   * @param {string=} newValue
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {}

  /**
   * @template T
   * Called when the state of the component changes (can be used in custom components script tag)
   * @param {T=} [value]
   * @param {string=} [property]
   * @param {T=} [prevValue]
   * @returns {void}
   */
  onStateChange(value, property, prevValue) {}

  /**
   * @template T
   * Called when the attribute of the component changes (can be used in custom components script tag)
   * @param {T=} newValue
   * @param {string=} attrName
   * @param {T=} oldValue
   * @returns {void}
   */
  onAttributeChange(newValue, attrName, oldValue) {}

  /**
   * Called when the component state or attributes change
   * @returns {void}
   */
  reactive() {}

  /**
   * Run the script of the component by dynamic import
   * @param {Reason} reason
   * @returns {Promise<void>}
   */
  runScript(reason) {
    return Promise.resolve();
  }

  /**
   * Called when the component is before updating, can return a boolean to prevent the update
   * @returns {boolean|void}
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
  _stateless;
}

/** @typedef {InterfaceMethodTypes<BaseReactiveComponentInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  BaseReactiveComponentInterface,
  VirtualReactiveComponentInterface,
};
