import { Reason } from "../CONST";
import { AppRoot } from "./AppRoot.d";
import { AttributeChange } from "../CONST";

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
  changes: AttributeChange[];
  delayed: boolean;
};

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 */
declare class ReactiveComponent extends HTMLElement {
  /** Called when the component is before updating, can return a boolean to prevent the update */
  abstract onBeforeUpdate(): boolean | void;

  /** Called when the component is after updating */
  abstract onAfterUpdate(): void;

  /** Optional callback executed on mount */
  abstract __mountCallback?: (reason: Reason) => void;

  /** Called when the attribute of the component changes */
  abstract attributeChangedCallback(
    name?: string,
    oldValue?: string | null,
    newValue?: string,
  ): void;

  /** The name of the component */
  protected __componentName: string;

  /** Internal unique ID of the component */
  protected __componentId: number;

  /** Internal key used to identify the component instance */
  protected __componentKey: string;

  /** The mount data of the component */
  protected __mountData: MountData;

  /** Map of state observers */
  protected __observers: Map<string, (component: ReactiveComponent) => void>;

  /** Attributes tracked by the component */
  protected attrs: Record<string, string>;

  /** The pending attributes update of the component */
  forwardedQueue: Array<PassInfo>;

  /** KinderGarten childNodes of the component */
  _storedChildren: DocumentFragment;

  /** Whether the component children are injected */
  childrenInjected: boolean;

  /** Record of states that was created in the component */
  states: Record<string, StateValue<unknown>>;

  /** Reference to the AppRoot component */
  root: AppRoot;

  /** All the data for manipulating the tree and reactivity */
  internal: Internal;

  /** Set properties of the component */
  initialSetup(attrs) {}

  /** Called internally when the component is mounted */
  protected async _mount(reason: Reason): Promise<boolean>;

  /** Web Components lifecycle: called when the element is inserted into the DOM */
  connectedCallback(): void;

  /** Web Components lifecycle: called when the element is removed from the DOM */
  disconnectedCallback(): void;

  /** Mount the component */
  async _mount(reason: Reason): Promise<Awaited<boolean>[]>;

  /** Called internally when the component is unmounted */
  protected unmount(): void;

  /** Disable HMR for the component */
  disableHMR(): void;

  /** Inject the fragment of the component */
  injectFragment(): void;

  /** Append _storedChildren or childNodes of the component to the fragment KinderGarten */
  appendChildren(fragment: DocumentFragment): void;

  /** Load the content of the component (HTML) */
  async loadContent(canUseMemoized?: boolean): Promise<boolean>;

  /** Observe changes to a specific state property */
  observeState(property: string): void;

  /** Define or access a reactive state property */
  state<T>(
    property: string,
    initialValue?: T,
    asRef?: boolean,
    avoidClone = false,
  ): { value: T };

  /** Internal hook called when a state value changes */
  stateChange<T>(
    value: T,
    property: string,
    prevValue: T,
    isCalledByHerd?: boolean,
  ): void;

  /** Dynamically load the component script (can be overridden) */
  runScript(reason: Reason): Promise<void>;
}

export default ReactiveComponent;
