/** @import { AppContentInterface, AppContentMembers } from "@jsdocs/browser/classes/KinderGartenInterface.d"; */
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";

/** @implements {AppContentInterface} */
class AppContent extends ReactiveDummyComponent {
  constructor() {
    super();
  }

  /**
   * @type {AppContentMembers["runPageTransition"]["Type"]}
   * @returns {AppContentMembers["runPageTransition"]["ReturnType"]}
   */
  async runPageTransition(inOrOut = "in", duration = 100) {
    const animationFrames = [
      { opacity: "0", filter: "blur(5rem)" },
      { opacity: "1", filter: "blur(0)" },
    ];

    const animationOptions = {
      easing: "ease-in-out",
      duration,
      fill: "forwards",
    };

    const animation = this.animate(
      inOrOut === "in" ? animationFrames : animationFrames.reverse(),
      animationOptions,
    );

    await animation.finished;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

export default AppContent;
