/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * A base class for reactive web components in the Piglet framework without a shadow DOM.
 * @interface BaseReactiveDummyComponentInterface
 */
class BaseReactiveDummyComponentInterface {
  /**
   * The observers of the component state
   * @type {Map<string, (component: ReactiveComponent) => void>}
   */
  __observers;

  /**
   * @type {boolean}
   * Whether to batch ref updates
   */
  shouldBatchRefUpdates = true;

  /**
   * Called when the component is connected to the DOM
   * @returns {void}
   */
  connectedCallback() {}

  /**
   * Observe a state property
   * @param {string} property - The property to observe
   * @returns {void}
   */
  observeState(property) {}

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
   * Called when the ref used in the component changes and batches the changes
   * @template T - The type of the state value.
   * @param {T} value - The new value of the state
   * @param {string} property - The property that changed
   * @param {T} prevValue - The previous value of the state
   * @returns {void}
   * */
  refChange(value, property, prevValue) {}

  /**
   * Creates a style tag with the given text content and appends it to the component.
   * @param {string} textContent - The CSS text content to be added to the style tag
   * @returns {void}
   */
  createStyleTag(textContent) {}

  /**
   * Called by refChange to pass the ref update to the component when batching is done
   * @template T - The type of the state value.
   * @param {T} value - The new value of the state
   * @param {string} property - The property that changed
   * @param {T} prevValue - The previous value of the state
   * @returns {void}
   */
  passRefUpdate(value, property, prevValue) {}
}

/**
 * @interface VirtualReactiveDummyComponentInterface
 * @extends {BaseReactiveDummyComponentInterface}
 */
class VirtualReactiveDummyComponentInterface extends BaseReactiveDummyComponentInterface {
  /**
   * Callback for when the component is mounted
   * @param {Reason} reason - The reason for the mount
   * @returns {Promise<Awaited<boolean>[]>}
   */
  async _mount(reason) {
    return Promise.all([true]);
  }

  /**
   * Callback for when the component state is updated
   * @param {unknown} value - The new value
   * @returns {void}
   */
  _update(value) {}

  /**
   * Callback for when the component reference is updated
   * @param {unknown} value - The new value
   * @returns {void}
   */
  _refUpdate(value) {}

  /**
   * Called when the attribute of the component changes
   * @param {string=} name - The name of the attribute
   * @param {string|null=} oldValue - The previous value of the attribute
   * @param {string=} newValue - The new value of the attribute
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {}
}

/** @typedef {InterfaceMethodTypes<BaseReactiveDummyComponentInterface>} ReactiveDummyMembers */
/** @typedef {InterfaceMethodTypes<VirtualReactiveDummyComponentInterface>} ReactiveDummyVirtualMembers */

export {
  /** @exports ReactiveDummyMembers */
  /** @exports ReactiveDummyVirtualMembers */
  BaseReactiveDummyComponentInterface,
  VirtualReactiveDummyComponentInterface,
};
