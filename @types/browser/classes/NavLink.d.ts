import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/** Interface for the NavLink component */
declare class NavLinkInterface extends ReactiveDummyComponent {
  /** Click event handler */
  handleClick: (event: MouseEvent) => void;

  /** Method for adding/removing the active class */
  updateActiveState: () => void;
}

export default NavLinkInterface;
