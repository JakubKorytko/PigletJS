import { performanceWrapper } from "@/modules/performanceWrapper.pig";

this.disableHMR();

const COMPONENTS_COUNT = 1000;
const result = (time) =>
  `Rendered <span>${COMPONENTS_COUNT}</span> components in <span>${time}ms</span>`;

const componentCount = $element("#componentCount");
const performanceTest = $element("#performance-test");

performanceWrapper("EasyPerformanceTest", () => {
  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= COMPONENTS_COUNT; i++) {
    fragment.appendChild($`<EasyPerformanceComponent id="${i}" />`);
  }

  performanceTest.appendChild(fragment);
})((time) => {
  componentCount.innerHTML = result(time);
});
