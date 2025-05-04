import { Reason } from "../CONST";

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 */
declare class ReactiveComponent extends HTMLElement {
  /** The caller of the component */
  protected _caller: string;

  /** The name of the component */
  protected _componentName: string;

  /** Map of state observers */
  protected _observers: Map<string, (component: ReactiveComponent) => void>;

  /** Attributes tracked by the component */
  protected _attrs: Record<string, string>;

  /** Internal tree representation for the component */
  protected __tree: Record<string, TreeNode<ReactiveComponent | Element>>;

  /** Functions forwarded from the component to children */
  protected _forwarded: Record<string, Function>;

  /** Whether the component is currently mounted */
  protected _isMounted: boolean;

  /** Whether the component's HTML has been injected */
  protected _isHTMLInjected: boolean;

  /** List of child components */
  protected _children: Array<ReactiveComponent>;

  /** Internal unique ID of the component */
  protected __componentId: number;

  /** Internal key used to identify the component instance */
  protected __componentKey: string;

  /** Root node of the component (ShadowRoot or regular Node) */
  protected __root: ShadowRoot | Node;

  /** Optional callback executed on mount */
  protected mountCallback?: (reason: Reason) => void;

  /** Attributes observed for changes */
  static get observedAttributes(): string[];

  constructor();

  /** Called internally when the component is mounted */
  protected _mount(reason: Reason): void;

  /** Updates child components */
  protected _updateChildren(reason: Reason): void;

  /** The mutation observer of the component */
  protected _mutationObserver: MutationObserver | undefined;

  /** Called internally when the component is unmounted */
  protected _unmount(): void;

  /** Web Components lifecycle: called when the element is inserted into the DOM */
  connectedCallback(): void;

  /** Web Components lifecycle: called when the element is removed from the DOM */
  disconnectedCallback(): void;

  /** Web Components lifecycle: called when the element is adopted into a new document */
  adoptedCallback(): void;

  /** Web Components lifecycle: called when observed attributes change */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string,
  ): void;

  /** Register a callback to be called when the component is mounted */
  onMount: (callback: (reason: Reason) => void) => void;

  /** Observe changes to a specific state property */
  observeState(property: string): void;

  /** Define or access a reactive state property */
  state<T>(property: string, initialValue?: T, asRef?: boolean): { value: T };

  /** Internal hook called when a state value changes */
  stateChange<T>(value: T, property: string, prevValue: T): void;

  /** Called when a state value changes (can be overridden) */
  onStateChange?<T>(value: T, property: string, prevValue: T): void;

  /** Called when an attribute changes (can be overridden) */
  onAttributeChange?<T>(newValue: T, attrName: string, oldValue: T): void;

  /** Called when state or attributes change to trigger reactivity (can be overridden) */
  abstract reactive?(): void;

  /** Dynamically load the component script (can be overridden) */
  abstract runScript?(reason: Reason): Promise<void>;

  /** Mount metadata for the component */
  abstract __mountData: MountData;

  /** Function to track the custom element tree */
  abstract __trackCustomTree: (root?: HTMLElement) => void;

  /** Observer for tracking the custom component tree */
  abstract __customTreeObserver: MutationObserver;
}

export default ReactiveComponent;
