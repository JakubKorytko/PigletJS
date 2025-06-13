/** @import { VirtualReactiveDummyComponentInterface } from "@Piglet/browser/classes/ReactiveDummyComponent.d"; */

import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/**
 * @typedef {{
 *  route: string,
 *  previousRoute: string,
 *  isInitial: boolean,
 *  isReloaded: boolean,
 *  native: boolean,
 * }} RouteChangeEventDetail
 */

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
   * @param {CustomEvent<RouteChangeEventDetail> | undefined} event - The event data containing the route information
   * @returns {void}
   */
  updateActiveState(event) {}
}

/** @typedef {InterfaceMethodTypes<NavLinkInterface>} NavLinkMembers */
/** @typedef {InterfaceMethodTypes<VirtualReactiveDummyComponentInterface>} NavLinkVirtualMembers */

export {
  /** @exports NavLinkInterface */
  /** @exports NavLinkMembers */
  /** @exports NavLinkVirtualMembers */
  /** @exports RouteChangeEventDetail */
  NavLinkInterface,
};
