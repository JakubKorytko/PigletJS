import ReactiveComponent from "./ReactiveComponent";
import { Reason } from "../CONST";

/** Interface for the RenderIf component */
declare class RenderIf extends ReactiveComponent {
  /** The condition of the component */
  protected _condition: string;

  /** The template of the component */
  protected _template: HTMLTemplateElement;

  /** The fragment of the component */
  protected _fragment: DocumentFragment | null;

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
