/** @import {Reason} from "@jsdocs/browser/CONST.d" */
/** @import {MountData, TreeNode} from "@jsdocs/browser/tree.d" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 * @interface BaseReactiveComponentInterface
 */
class BaseReactiveComponentInterface {
  /**
   * Whether the component is pending an attribute update
   * @type {boolean}
   */
  __pendingAttributeUpdate;

  /**
   * The batched attribute changes of the component
   * @type {Array<{newValue: string, attrName: string, oldValue: string}>}
   */
  __batchedAttributeChanges;

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
   * @type {TreeNode}
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
   * Components that are waiting for the script to be loaded
   * @type {Array<VirtualReactiveComponentInterface>}
   */
  __waitingForScript;

  /**
   * @type {boolean}
   * Whether the component is using fragment
   */
  __useFragment;

  /**
   * Whether the component is killed
   * @type {boolean}
   */
  __killed;

  /**
   * The mount data of the component
   * @type {MountData}
   */
  __mountData;

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
   * @param {boolean} [canUseMemoized] - Whether to use memoized content
   * @returns {Promise<void|null>} A promise that resolves when the HTML content is loaded, or `null` in case of an error.
   */
  async loadContent(canUseMemoized) {}

  /**
   * Inject the fragment of the component
   * @returns {void}
   */
  injectFragment() {}

  /**
   * Check if the component is in a document fragment any level deep
   * Return the component if it is in a document fragment
   * @returns {boolean|VirtualReactiveComponentInterface}
   */
  isInDocumentFragmentDeep() {
    return false;
  }

  /**
   * Kill the component
   * @returns {void}
   */
  kill() {}

  /**
   * Disable HMR for the component
   * @returns {void}
   */
  disableHMR() {}

  /**
   * Whether the component is killed (getter)
   * @returns {boolean}
   */
  get __isKilled() {
    return;
  }
}

/**
 * @interface VirtualReactiveComponentInterface
 * @extends {BaseReactiveComponentInterface}
 */
class VirtualReactiveComponentInterface extends BaseReactiveComponentInterface {
  /**
   * Is the component stateless
   * @type {boolean}
   */
  __stateless;

  /**
   * The ID of the component
   * @type {number}
   */
  __id;

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
}

/** @typedef {InterfaceMethodTypes<BaseReactiveComponentInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  BaseReactiveComponentInterface,
  VirtualReactiveComponentInterface,
};
