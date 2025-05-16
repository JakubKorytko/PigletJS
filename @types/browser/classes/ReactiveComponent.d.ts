import { Reason } from "../CONST";

type Internal = {
  owner: ReactiveComponent | undefined;
  HMR: boolean;
  mounted: boolean;
  children: Array<ReactiveComponent>;
  waiters: Array<ReactiveComponent>;
  fragment: {
    content: DocumentFragment | undefined;
    enabled: boolean;
    fragmentRoot: ReactiveComponent | undefined;
  };
  readonly parent: ReactiveComponent | null;
};

type PassInfo = {
  ref: ReactiveComponent | null;
  updates: Record<string, any>;
  delayed: boolean;
};

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 */
declare class ReactiveComponent extends HTMLElement {
  /** The name of the component */
  protected __componentName: string;

  /** Map of state observers */
  protected __observers: Map<string, (component: ReactiveComponent) => void>;

  /** Attributes tracked by the component */
  protected attrs: Record<string, string>;

  /** Internal unique ID of the component */
  protected __componentId: number;

  /** Internal key used to identify the component instance */
  protected __componentKey: string;

  /** Optional callback executed on mount */
  protected __mountCallback?: (reason: Reason) => void;

  /** Attributes observed for changes */
  static get observedAttributes(): string[];

  constructor();

  /** Called internally when the component is mounted */
  protected _mount(reason: Reason): void;

  /** Called internally when the component is unmounted */
  protected unmount(): void;

  /** The mount data of the component */
  protected __mountData: MountData;

  /** Mount the component */
  _mount(reason: Reason): void;

  /** Disable HMR for the component */
  disableHMR(): void;

  /** Inject the fragment of the component */
  injectFragment(): void;

  /** Web Components lifecycle: called when the element is inserted into the DOM */
  connectedCallback(): void;

  /** Web Components lifecycle: called when the element is removed from the DOM */
  disconnectedCallback(): void;

  /** Observe changes to a specific state property */
  observeState(property: string): void;

  /** Load the content of the component (HTML) */
  loadContent(canUseMemoized?: boolean): Promise<void | null>;

  /** Define or access a reactive state property */
  state<T>(property: string, initialValue?: T, asRef?: boolean): { value: T };

  /** Internal hook called when a state value changes */
  stateChange<T>(value: T, property: string, prevValue: T): void;

  internal: Internal;

  forwardedQueue: Array<PassInfo>;

  /** Dynamically load the component script (can be overridden) */
  abstract runScript?(reason: Reason): Promise<void>;

  /** Called when the attribute of the component changes */
  abstract attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string,
  ): void;

  /** Called when the component is before updating, can return a boolean to prevent the update */
  abstract onBeforeUpdate(): boolean | void;

  /** Called when the component is after updating */
  abstract onAfterUpdate(): void;
}

export default ReactiveComponent;
