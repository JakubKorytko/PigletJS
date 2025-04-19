import { externalMethod } from "@/modules/testExternal.pig";
const { display, nested } = state;

externalMethod();

onStateChange = (value, property, prevValue) => {
  console.log("State changed in MySecondBox", value, property, prevValue);
  if (property === "display") {
    nested.value = { object: { hide: value } };
  }
};

element("#test").on("click", () => {
  display.value = !display.value;
});
