import ReactiveComponent from "./ReactiveComponent.d";
import ReactiveDummyComponent from "./ReactiveDummyComponent.d";
import type { api } from "../helpers.d";

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

  navigate: (route: string) => boolean; // Navigate function for changing routes

  api: api; // API instance for making requests

  /** Resets the application state and component counter */
  reset: () => void;

  /** Fetches layout paths from the server */
  async getLayoutPaths(): Promise<void>;

  /** Adds popstate event listener for handling browser navigation */
  addPopStateListener(): void;

  /** Changes the current route and updates the view */
  changeRoute(newRoute: string): Promise<void>;

  /** Handles view transitions when the route changes */
  async viewTransition(
    { base, layout }: { base: ReactiveComponent | undefined; layout: string },
    isReloaded: boolean,
  ): Promise<void>;

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

  /** Synchronously take care of rendering the route */
  loadRouteSync(base: ReactiveComponent | undefined, layout: string): void;

  /** Extracts custom component tags from HTML source */
  extractCustomTags(pageSource: string): string[];

  /** Loads custom component modules */
  loadCustomComponents(tags: string[], seen?: Set<string>): Promise<void>;

  /** Lets the child components know that the app root is connected */
  async appRootConnected(): Promise<void>;

  /** Renders a component into the view */
  renderComponent(component: typeof HTMLElement | undefined): Promise<void>;

  /** Gets the current route path */
  get route(): string;

  /** Sets a new route path */
  set route(newRoute: string);
}
