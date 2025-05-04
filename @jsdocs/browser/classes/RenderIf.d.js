/** @import {Reason} from "@jsdocs/browser/CONST.d" */
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
   * The template element containing content to conditionally render
   * @type {HTMLTemplateElement}
   */
  _template;

  /**
   * The document fragment containing rendered content
   * @type {DocumentFragment|null}
   */
  _fragment;

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
   * @param {unknown} value
   * @returns {void}
   */
  _updateCondition(value) {}

  /**
   * Updates the visibility (mounts or unmounts the component)
   * @returns {void}
   */
  updateVisibility() {}
}

/** @typedef {InterfaceMethodTypes<RenderIfInterface>} Member */
/** @typedef {InterfaceMethodTypes<VirtualReactiveComponentInterface>} Virtual */

export {
  /** @exports Member */
  /** @exports Virtual */
  RenderIfInterface,
};
