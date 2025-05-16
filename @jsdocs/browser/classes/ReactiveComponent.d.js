/** @import {Reason} from "@jsdocs/browser/CONST.d" */
/** @import {MountData, TreeNode} from "@jsdocs/browser/tree.d" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

import { getHost } from "@Piglet/browser/helpers";

/**
 * @typedef {
 * {
 *  owner: ReactiveComponent|undefined,
 *  HMR: boolean,
 *  mounted: boolean,
 *  children: Array<ReactiveComponent>,
 *  waiters: Array<ReactiveComponent>,
 *  fragment:
 *    {
 *      content: DocumentFragment|undefined,
 *      enabled: boolean,
 *      fragmentRoot: ReactiveComponent|undefined,
 *    },
 *  readonly parent: ReactiveComponent|null}
 * } Internal
 */

/** @typedef {
 * {
 *  ref: ReactiveComponent|null,
 *  updates: Record<string, any>,
 *  delayed: boolean
 * }
 *} PassInfo
 */

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 * @interface BaseReactiveComponentInterface
 */
class BaseReactiveComponentInterface {
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
  attrs;

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
   * The mount callback of the component
   * @type {((reason: Reason) => void)}
   */
  __mountCallback;

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
   * Called when the component is unmounted
   * @returns {void}
   */
  unmount() {}

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
   * Disable HMR for the component
   * @returns {void}
   */
  disableHMR() {}

  /** @type {Internal} */
  internal = {
    owner: undefined,
    HMR: true,
    mounted: false,
    children: [],
    waiters: [],
    fragment: {
      content: undefined,
      enabled: false,
      fragmentRoot: undefined,
    },
    get parent() {
      return getHost(this.owner, true);
    },
  };

  /**
   * The pending attributes update of the component
   * @type {Array<PassInfo>}
   */
  forwardedQueue = [];
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
}

/** @typedef {InterfaceMethodTypes<BaseReactiveComponentInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  BaseReactiveComponentInterface,
  VirtualReactiveComponentInterface,
};
