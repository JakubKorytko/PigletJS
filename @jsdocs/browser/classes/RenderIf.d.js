/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
import { VirtualReactiveComponentInterface } from "@jsdocs/browser/classes/ReactiveComponent.d";

/**
 * Interface for the RenderIf component
 * @interface RenderIfInterface
 * @extends {VirtualReactiveComponentInterface}
 */
class RenderIfInterface extends VirtualReactiveComponentInterface {
  /**
   * The condition that determines if content should be rendered
   * @type {boolean}
   */
  _condition;

  /**
   * The document fragment containing rendered content
   * @type {DocumentFragment|null}
   */
  _contentFragment;

  /**
   * Is condition negated
   * @type {boolean}
   */
  _negated = false;

  /**
   * Condition property split into parts
   * @type {string[]}
   */
  _parts = [];

  /**
   * Is fragment in the DOM
   * @type {boolean}
   */
  _contentMounted = true;

  /**
   * Moves children to the fragment
   * @returns {void}
   */
  _moveChildrenToFragment() {}

  /**
   * Updates the condition from the attribute
   * @returns {void}
   */
  _updateFromAttribute() {}

  /**
   * Updates the condition
   * @param {unknown} value - The value to update the condition with
   * @returns {void}
   */
  _updateCondition(value) {}

  /**
   * Updates the visibility (mounts or unmounts the component)
   * @returns {void}
   */
  updateVisibility() {}

  /**
   * Callback for when the component is mounted
   * @param {Reason} reason - The reason for the mount
   * @returns {void}
   */
  _mount(reason) {}

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
}

/** @typedef {InterfaceMethodTypes<RenderIfInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  RenderIfInterface,
};
