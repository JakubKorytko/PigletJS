const consoleTree = () => {
  console.groupCollapsed("🌲 Component's tree:");
  console.log(window.Piglet.tree);
  console.dir(window.Piglet.tree);
  console.groupEnd();
};

export default consoleTree;
