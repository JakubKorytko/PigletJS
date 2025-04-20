const { display = init(true) } = state;
const { nested = init({ object: { hide: true } }) } = state;

onStateChange["display"] = (value) => {
  nested.value = { object: { hide: value } };
};

element("#hide").on("click", () => {
  display.value = !display.value;
});
