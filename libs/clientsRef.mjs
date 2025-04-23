/**
 * A shared reference object used to store Piglet client instances.
 * This can be mutated and accessed across modules.
 *
 * @typedef {Object} ClientsRef
 * @property {Array<any>} instance - An array of connected client instances.
 */

/** @type {ClientsRef} */
export const clientsRef = {
  instance: [],
};
