import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

export type RouteChangeEventDetail = {
  route: string;
  previousRoute: string;
  isInitial: boolean;
  isReloaded: boolean;
  native: boolean;
};

/** Interface for the NavLink component */
declare class NavLinkInterface extends ReactiveDummyComponent {
  /** Click event handler */
  handleClick: (event: MouseEvent) => void;

  /** Method for adding/removing the active class */
  updateActiveState: (
    event: CustomEvent<RouteChangeEventDetail> | undefined,
  ) => void;
}

export default NavLinkInterface;
