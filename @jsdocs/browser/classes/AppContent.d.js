/** @import { VirtualReactiveDummyComponentInterface } from "@Piglet/browser/classes/ReactiveDummyComponent.d"; */

import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/**
 * Interface for the AppContent component
 * @interface AppContentInterface
 * @implements {VirtualReactiveDummyComponentInterface} */
class AppContentInterface extends ReactiveDummyComponent {
  /**
   * Method to run page transition animation
   * @param {string} inOrOut - Direction of the transition ("in" or "out")
   * @param {number} duration - Duration of the transition in milliseconds
   * @returns {Promise<void>}
   */
  async runPageTransition(inOrOut = "in", duration = 100) {}
}

/** @typedef {InterfaceMethodTypes<AppContentInterface>} AppContentMembers */

export {
  /** @exports AppContentInterface */
  /** @exports AppContentMembers */
  AppContentInterface,
};
