import { ReactiveComponent } from "./ReactiveComponent.d.ts";
import type { Reason } from "../CONST.d";

declare class ReactiveDummyComponent extends HTMLElement {
  __observers: Map<string, (component: ReactiveComponent) => void>;
  shouldBatchRefUpdates: boolean;
  connectedCallback(): void;
  observeState(property: string): void;
  stateChange<T>(value: T, property: string, prevValue: T): void;
  refChange(value: unknown, property: string, prevValue: unknown): void;
  createStyleTag(textContent: string): void;
  passRefUpdate<T>(value: T, property: string, prevValue: T): void;
  abstract _mount(reason: Reason): Promise<boolean>;
  abstract _update(value: unknown): void;
  abstract _refUpdate(value: unknown): void;
  abstract attributeChangedCallback(
    name?: string,
    oldValue?: string | null,
    newValue?: string,
  ): void;
}

export default ReactiveDummyComponent;
