import { createPerformanceWrapper } from "/modules/performanceWrapper.pig";
import { addMouseListeners } from "/modules/mouseListener.pig";

$B.currentComponentId = $$(-1);
$B.runTest = $$(false);
$B.controller = $$(new AbortController(), true);

const goBackElement = $element(".fa-arrow-circle-left");
const componentElement = $element($this);
const performanceEntry = $element("PerformanceEntry");
const componentCount = $element("h1");
const performanceTest = $element("section");
const perf = createPerformanceWrapper("EasyPerformanceTest");
const scrollElement = $element(".scroll");

addMouseListeners();

$B.isScrollEnabled = $$(true);

if (window.matchMedia("(any-pointer: coarse)").matches) {
  scrollElement.style.display = "block";
}

const touchMoveHandler = (e) => {
  const element = $document.elementFromPoint(
    e.touches[0].clientX,
    e.touches[0].clientY,
  );
  const componentId = element?.__componentId;
  if (!$B.isScrollEnabled) {
    e.preventDefault();
  }
  if (
    typeof componentId === "number" &&
    $B.currentComponentId !== componentId &&
    element.__componentName === "EasyPerformanceComponent"
  ) {
    $B.currentComponentId = componentId;
    element.playAnimation();
  }
};

function goBackHandler() {
  performanceTest.replaceChildren();
  componentCount.innerText = "Rendering...";
  $B.controller.abort();
  $B.runTest = false;
}

const popStateHandler = () => {
  if ($B.controller) $B.controller.abort();
};

const scrollHandler = (e) => {
  scrollElement.classList.toggle("fa-hand-rock-o");
  scrollElement.classList.toggle("fa-hand-paper-o");
  $B.isScrollEnabled = !$B.isScrollEnabled;
};

scrollElement.on("click", scrollHandler);

const cleanupListeners = () => {
  window.removeEventListener("piglet:beforeRouteChange", popStateHandler);
  componentElement.off("touchmove", touchMoveHandler);
  goBackElement.off("click", goBackHandler);
};

componentElement.on("touchmove", touchMoveHandler);

goBackElement.on("click", goBackHandler);
window.addEventListener("piglet:beforeRouteChange", popStateHandler);

const generateResult = (time, componentsToRender) =>
  `Rendered <span>${componentsToRender}</span> components in <span>${time}ms</span>`;

async function runTest({ componentsToRender, waitBeforeRender }) {
  $B.controller = new AbortController();
  $B.runTest = true;

  perf.start();

  const elements = Array.from(
    { length: componentsToRender },
    (_, i) =>
      $`<EasyPerformanceComponent ${{ id: i + 1, waitBeforeRender }} />`,
  );

  if (waitBeforeRender) {
    for (const element of elements) {
      if ($B.controller.signal.aborted) {
        console.warn("Test aborted before completion.");
        performanceTest.replaceChildren();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      performanceTest.appendChild(element);
    }
  } else {
    performanceTest.append(...elements);
  }

  perf.end((time) => {
    componentCount.innerHTML = generateResult(time, componentsToRender);
  });
}

$onBeforeUpdate(cleanupListeners);

performanceEntry?.pass({ runTest });
