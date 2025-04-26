/**
 * Sends data to the browser extension based on the specified request type.
 *
 * @param {"initial" | "state" | "tree"} requestType - The type of data to send.
 * @returns {boolean} Whether the data was successfully sent.
 */
const sendToExtension = (requestType) => {
  const api = window.Piglet?.extension;
  const actions = {
    initial: api?.sendInitialData,
    state: api?.sendStateUpdate,
    tree: api?.sendTreeUpdate,
  };

  const action = actions[requestType];
  if (typeof action === "function") {
    action();
    return true;
  }

  return false;
};

export { sendToExtension };
