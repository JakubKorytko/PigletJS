import { testujemy } from "@/modules/testExternal.pig";
const { display, nested } = state;

testujemy();

onStateChange = (value, property) => {
  console.log("State changed in MySecondBox", value, property);
  if (property === "display") {
    nested.value = { object: { hide: value } };
  }
};

element("#test").on("click", () => {
  display.value = !display.value;
});
