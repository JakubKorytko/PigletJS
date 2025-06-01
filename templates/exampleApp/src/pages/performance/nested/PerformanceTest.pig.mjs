import { createPerformanceWrapper } from "/modules/performanceWrapper.pig";

const { RC } = $types;

const goBackElement = $element(".fa-arrow-circle-left");
const performanceEntry = $element("PerformanceEntry", RC);
const componentCount = $element("h1");
const performanceTest = $element("section");

const perf = createPerformanceWrapper("PerformanceTest");

$B.injected = $$(false);
$B.runTest = $$(false);

const result = (id, time) =>
  `Rendered stateful component tree of <span>${id}</span> levels deep with ` +
  `callback passed from top-most parent to most nested child that returned to root in <span>${time}ms</span>`;

function goBackHandler() {
  performanceTest.replaceChildren();
  componentCount.innerText = "Rendering...";
  $B.runTest = false;
  $B.injected = false;
}

function runTest({
  componentsToRender = 100,
  fragmented: fragment = false,
  delayedPass = true,
}) {
  $B.runTest = true;

  const testProperties = {
    componentsToRender: fragment
      ? Math.max(componentsToRender - 1, 0)
      : componentsToRender,
    fragmented: fragment,
    delayedPass,
    injected: $B.injected,
  };

  const reachedEnd = (id) => {
    if (!$B.injected) {
      if (fragment) {
        $element("PerformanceComponent", RC).injectFragment();
      }
      perf.end((time) => {
        $element("h1").innerHTML = result(id, time);
      });
      $B.injected = true;
    }
  };

  const props = {
    testProperties,
    reachedEnd,
    fragment,
  };

  const component = $`<PerformanceComponent ${props} />`;

  performanceTest.appendChild(component);

  perf.start();
}

goBackElement?.on("click", goBackHandler);
performanceEntry.pass({ extended: true, runTest });
