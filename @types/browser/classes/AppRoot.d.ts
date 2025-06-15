import ReactiveComponent from "./ReactiveComponent.d";
import ReactiveDummyComponent from "./ReactiveDummyComponent.d";
import type { api } from "../helpers.d";
import type { HerdInterface } from "./Herd.d";
import type { RouteChangeEventDetail } from "./NavLink.d";

type Navigator = {
  id: number; // Unique identifier for the navigation
  route: string; // The route being navigated to
  done: boolean; // Indicates if the navigation is complete
  isStale: boolean; // Indicates if the navigation is stale
  success: () => void; // Callback function to call on successful navigation
};

/** Root component of the application, handles routing and component loading. */
declare class AppRoot extends ReactiveComponent {
  /** Current route path */
  _route: string;

  /** Component layout paths */
  _layoutPaths: {
    [key: string]: {
      layout: string;
    };
    layouts: Record<string, string>;
  };

  /** Previous layout path */
  __previousLayout: string;

  /** Deep state proxy cache */
  __proxyCache: Map<string, StateValue<unknown>>;

  /** The fetch cache */
  __fetchCache: Map<string, string>;

  /** The fetch queue */
  __fetchQueue: Map<string, Promise<string>>;

  /** Counter for setting component IDs */
  componentCounter: number;

  /** Whole application state */
  globalState: Record<string, StateInterface<unknown>> | {};

  /** Tree of components in the application */
  tree: Record<string, TreeNode<ReactiveComponent | Element>> | {};

  /** Extension communication methods */
  extension: {
    sendInitialData?: () => void;
    sendTreeUpdate?: () => void;
    sendStateUpdate?: () => void;
  };

  /** Set of mounted components */
  mountedComponents: Set<{
    tag: string;
    ref: HTMLElement | ReactiveComponent;
  }>;

  /** Record of components whose constructors have been called */
  constructedComponents: Record<string, ReactiveComponent>;

  /** Record of components registered in custom elements registry */
  registeredComponents: Record<string, ReactiveComponent>;

  /** Record of previously fetched component cache keys */
  previousFetchComponentCacheKeys: Record<
    string,
    Record<"html" | "script" | "layout", string>
  >;

  types: {
    RC: typeof ReactiveComponent; // ReactiveComponent class
    RDC: typeof ReactiveDummyComponent; // ReactiveDummyComponent class
  };

  /** Function to navigate to a new route */
  navigate: (route: string) => boolean;

  /** API instance for making requests */
  api: api;

  /** Herd instance for state management */
  herd: HerdInterface;

  /** Routes object containing route paths and their corresponding components */
  _routes: Record<string, string> | Record<string, never>;

  /** Queue for handling navigation request */
  __navigationQueue: Array<AppRoot["route"]>;

  /** Unique identifier for the navigator instance */
  __navigatorId: number;

  /** Candidate route for navigation */
  __routeCandidate: string;

  /** Resets the application state and component counter */
  reset: () => void;

  /** Fetches layout paths from the server */
  async getLayoutPaths(): Promise<void>;

  /** Adds popstate event listener for handling browser navigation */
  addPopStateListener(): void;

  /** Preloads layout and base for a given route */
  async preLoadRoute(
    route: string,
    isReloaded = false,
  ): Promise<{
    base: ReactiveComponent | undefined;
    layout: string;
  }>;

  /** Loads and renders the view for a given route */
  loadRoute(route: string): Promise<void>;

  /** Extracts custom component tags from HTML source */
  extractCustomTags(pageSource: string): string[];

  /** Loads custom component modules */
  loadCustomComponents(tags: string[], seen?: Set<string>): Promise<void>;

  /** Lets the child components know that the app root is connected */
  async appRootConnected(): Promise<void>;

  /** Renders a component into the view */
  renderComponent(
    component: typeof HTMLElement | undefined,
    layout: string,
  ): void;

  /** Gets the layout components for the current route */
  getLayoutComponents(): ReactiveComponent[];

  /** Gets the current route path */
  get route(): string;

  /** Sets a new route path */
  set route(newRoute: string);

  /** Resets the application state before a route transition */
  resetBeforeTransition(): void;

  /** Handles the transition callback after a route change */
  transitionCallback: (
    { base, layout }: { base: ReactiveComponent | undefined; layout: string },
    isInitial?: boolean,
  ) => Promise<void>;

  /** Starts a route chain for the navigator */
  startRouteChain: (
    navigator: Navigator,
    routeData: RouteChangeEventDetail,
  ) => boolean;

  /** Creates a new navigator instance for handling route changes */
  createNavigator(route: string): Navigator;

  /** Reloads the route and its components */
  reload(): void;

  /** Force a full reload of the application */
  __forceFullReload: () => void;
}
