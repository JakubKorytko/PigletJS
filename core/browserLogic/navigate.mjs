const navigate = (route) => {
  if (!window.AppComponentTree) return;

  const root = Object.values(window.AppComponentTree)[0];

  if (root.componentName !== "AppRoot") return;

  window.history.pushState({}, "", route);

  root.element.route = route;
};

window.navigate = navigate;

export default navigate;
