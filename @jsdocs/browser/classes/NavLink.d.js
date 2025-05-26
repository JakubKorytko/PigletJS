/** @import { VirtualReactiveDummyComponentInterface } from "@Piglet/browser/classes/ReactiveDummyComponent.d"; */

import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/**
 * Interface for the NavLink component
 * @interface NavLinkInterface
 * @implements {VirtualReactiveDummyComponentInterface} */
class NavLinkInterface extends ReactiveDummyComponent {
  /**
   * Click event handler
   * @param event {PointerEvent} event - The click event
   * @returns {void}
   */
  handleClick(event) {}

  /**
   * Method for adding/removing the active class
   * @returns {void}
   */
  updateActiveState() {}
}

/** @typedef {InterfaceMethodTypes<NavLinkInterface>} NavLinkMembers */
/** @typedef {InterfaceMethodTypes<VirtualReactiveDummyComponentInterface>} NavLinkVirtualMembers */

export {
  /** @exports NavLinkInterface */
  /** @exports NavLinkMembers */
  /** @exports NavLinkVirtualMembers */
  NavLinkInterface,
};
