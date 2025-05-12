class NavLink extends HTMLElement {
  static get observedAttributes() {
    return ["to"];
  }

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.updateActiveState = this.updateActiveState.bind(this);
  }

  connectedCallback() {
    this.setAttribute("role", "link");
    this.style.cursor = "pointer";
    this.addEventListener("click", this.handleClick);
    window.addEventListener("popstate", this.updateActiveState);
    this.updateActiveState();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
    window.removeEventListener("popstate", this.updateActiveState);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "to" && oldValue !== newValue) {
      this.updateActiveState();
    }
  }

  handleClick(event) {
    event.preventDefault();
    const to = this.getAttribute("to");
    if (window.$navigate && typeof window.$navigate === "function") {
      window.$navigate(to);
    } else {
      console.warn("window.$navigate is not defined");
    }

    this.updateActiveState();
  }

  updateActiveState() {
    const to = this.getAttribute("to");
    const currentPath = window.location.pathname;
    if (currentPath === to) {
      this.classList.add("active");
    } else {
      this.classList.remove("active");
    }
  }
}

export default NavLink;
