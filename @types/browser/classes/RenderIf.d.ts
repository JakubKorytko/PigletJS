import ReactiveComponent from "./ReactiveComponent";
import { Reason } from "../CONST";

/** Interface for the RenderIf component */
declare class RenderIf extends ReactiveComponent {
  /** The condition of the component */
  _condition: string;

  /** The document fragment containing the rendered content */
  _contentFragment: DocumentFragment | null;

  /** Is the condition negated */
  _negated: boolean;

  /** The condition property split into parts */
  _parts: string[];

  /** Is the fragment in the DOM */
  _contentMounted: boolean;

  /** Moves the children to the fragment */
  _moveChildrenToFragment(): void;

  /** Updates the condition from the attribute */
  _updateFromAttribute(): void;

  /** Updates the condition */
  _updateCondition(value: boolean): void;

  /** Updates the visibility */
  updateVisibility(): void;

  /** Callback for when the component is mounted */
  _mount(reason: Reason): void;

  /** Callback for when the component state is updated */
  _update(value: unknown): void;

  /** Callback for when the component reference is updated */
  _refUpdate(value: unknown): void;
}

export default RenderIf;
