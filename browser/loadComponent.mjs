import { injectTreeTrackingToComponentClass } from "@Piglet/browser/tree";
import { toKebabCase } from "@Piglet/browser/helpers";

function loadComponent(_class) {
  const className = _class.name;
  const tagName = toKebabCase(className);

  const existingClass = customElements.get(tagName);
  if (!existingClass) {
    injectTreeTrackingToComponentClass(_class);
    customElements.define(tagName, _class);
  }

  return customElements.whenDefined(tagName);
}

export { loadComponent };
