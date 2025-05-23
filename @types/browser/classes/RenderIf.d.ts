import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/** Interface for the RenderIf component */
declare class RenderIf extends ReactiveDummyComponent {
  /** The condition of the component */
  _condition: string;

  /** Is the condition negated */
  _negated: boolean;

  /** The condition property split into parts */
  _parts: string[];

  /** The document fragment containing the rendered content */
  _contentFragment: DocumentFragment | null;

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
}

export default RenderIf;
