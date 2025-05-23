/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
import { VirtualReactiveDummyComponentInterface } from "@jsdocs/browser/classes/ReactiveDummyComponent.d";

/**
 * Interface for the RenderIf component
 * @interface RenderIfInterface
 * @extends {VirtualReactiveDummyComponentInterface}
 */
class RenderIfInterface extends VirtualReactiveDummyComponentInterface {
  /**
   * The condition that determines if content should be rendered
   * @type {boolean}
   */
  _condition;

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
   * The document fragment containing rendered content
   * @type {DocumentFragment|null}
   */
  _contentFragment;

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
}

/** @typedef {InterfaceMethodTypes<RenderIfInterface>} RenderIfMembers */
/** @typedef {InterfaceMethodTypes<VirtualReactiveDummyComponentInterface>} RenderIfVirtualMembers */

export {
  /** @exports RenderIfMembers */
  /** @exports Virtual */
  RenderIfInterface,
};
