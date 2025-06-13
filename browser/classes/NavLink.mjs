/** @import { NavLinkInterface, NavLinkMembers, NavLinkVirtualMembers } from "@jsdocs/browser/classes/NavLink.d"; */
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";
import CONST from "@Piglet/browser/CONST";

/** @implements {NavLinkInterface} */
class NavLink extends ReactiveDummyComponent {
  static get observedAttributes() {
    return ["to"];
  }

  constructor(attrs, root) {
    super(attrs, root);
    this.handleClick = this.handleClick.bind(this);
    this.updateActiveState = this.updateActiveState.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "link");
    this.style.cursor = "pointer";
    this.addEventListener("click", this.handleClick);
    window.addEventListener(
      CONST.pigletEvents.beforeRouteChange,
      this.updateActiveState,
    );
    window.addEventListener(
      CONST.pigletEvents.routeChanged,
      this.updateActiveState,
    );
    this.updateActiveState();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
    window.removeEventListener(
      CONST.pigletEvents.beforeRouteChange,
      this.updateActiveState,
    );
    window.removeEventListener(
      CONST.pigletEvents.routeChanged,
      this.updateActiveState,
    );
  }

  /**
   * @type {NavLinkVirtualMembers["attributeChangedCallback"]["Type"]}
   * @returns {NavLinkVirtualMembers["attributeChangedCallback"]["ReturnType"]}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "to" && oldValue !== newValue) {
      this.attrs[name] = newValue;
      this.updateActiveState();
    }
  }

  /**
   * @type {NavLinkMembers["handleClick"]["Type"]}
   * @returns {NavLinkMembers["handleClick"]["ReturnType"]}
   */
  handleClick(event) {
    this.root.navigate(this.attrs.to);
  }

  /**
   * @type {NavLinkMembers["updateActiveState"]["Type"]}
   * @returns {NavLinkMembers["updateActiveState"]["ReturnType"]}
   */
  updateActiveState(event) {
    const route = event?.detail.route ?? this.root.__routeCandidate;
    if (route === this.attrs.to) {
      this.classList.add("active");
    } else {
      this.classList.remove("active");
    }
  }
}

export default NavLink;
