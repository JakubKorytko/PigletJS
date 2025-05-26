window.isMouseDown = false;

window.mouseHandlers = {
  mousedown: () => (window.isMouseDown = true),
  mouseup: () => (window.isMouseDown = false),
};

const removeMouseListeners = () => {
  window.removeEventListener("mousedown", window.mouseHandlers.mousedown);
  window.removeEventListener("mouseup", window.mouseHandlers.mouseup);
};

const addMouseListeners = () => {
  window.addEventListener("mousedown", window.mouseHandlers.mousedown);
  window.addEventListener("mouseup", window.mouseHandlers.mouseup);
};

export { addMouseListeners, removeMouseListeners };
