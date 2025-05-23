import { ReactiveComponent } from "@Piglet/browser/classes/index";

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
