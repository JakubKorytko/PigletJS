let $display = true;

let $nested = { object: { hide: true } };

element("#hide").on("click", () => {
  $display = !$display;
  $nested = { object: { hide: $display } };
});
