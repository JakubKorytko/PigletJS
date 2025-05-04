/** Root component of the application, handles routing and component loading. */
declare class AppRoot extends ReactiveComponent {
  /** Current route path */
  protected _route: string;

  constructor();

  /** Attributes observed for changes */
  static get observedAttributes(): string[];

  /** Adds popstate event listener for handling browser navigation */
  addPopStateListener(): void;

  /** Changes the current route and updates the view */
  changeRoute(newRoute: string): Promise<void>;

  /** Loads and renders the view for a given route */
  loadRoute(route: string): Promise<void>;

  /** Extracts custom component tags from HTML source */
  extractCustomTags(pageSource: string): string[];

  /** Loads custom component modules */
  loadCustomComponents(tags: string[]): Promise<void>;

  /** Renders a component into the view */
  renderComponent(component: typeof HTMLElement | undefined): Promise<void>;

  /** Gets the current route path */
  get route(): string;

  /** Sets a new route path */
  set route(newRoute: string);
}
