import { ReactiveComponent } from "./ReactiveComponent.d.ts";

declare class ReactiveDummyComponent extends HTMLElement {
  __observers: Map<string, (component: ReactiveComponent) => void>;
  connectedCallback(): void;
  observeState(property: string): void;
  stateChange<T>(value: T, property: string, prevValue: T): void;
  refChange(value: unknown, property: string, prevValue: unknown): void;
}

export default ReactiveDummyComponent;
