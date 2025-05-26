/** @import { KinderGartenInterface } from "@jsdocs/browser/classes/KinderGartenInterface.d"; */
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";

/** @implements {KinderGartenInterface} */
class KinderGarten extends ReactiveDummyComponent {
  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    this._parent._storedChildren.append(...this.childNodes);
  }
}

export default KinderGarten;
