const navigate = (route) => {
  if (!window.Piglet.tree) return;

  const root = Object.values(window.Piglet.tree)[0];

  if (root.componentName !== "AppRoot") return;

  window.history.pushState({}, "", route);

  root.element.route = route;
};

window.navigate = navigate;

export default navigate;
