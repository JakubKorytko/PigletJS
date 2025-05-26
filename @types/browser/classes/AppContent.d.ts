import { ReactiveDummyComponent } from "@Piglet/browser/classes/index";

/** Interface for the AppContent component */
declare class AppContentInterface extends ReactiveDummyComponent {
  /** Method to run page transition animation */
  async runPageTransition(inOrOut = "in", duration = 100): Promise<void>;
}

export default AppContentInterface;
