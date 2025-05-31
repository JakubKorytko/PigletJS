## Initial value

When you use ref or state in your component, you can provide an initial value for it.
It is only used when state or ref was not set before - if it was, this call will be ignored.

You can do it using `$$(initialValue)` function, which is available in the component's script.

```html
<script>
  $P.someState = $$(42); // Sets initial value of someState to 42
  $B.someRef = $$(null); // Sets initial value of someRef to null
  $$P.someNestedState = $$(true); // Sets initial value of someNestedState to true
</script>
```

This is to avoid re-initializing the state or ref if it was already set before and can be safely called on top-level of the component's script.

### `avoidClone` parameter

You can also pass an optional `avoidClone` parameter to the `$$(initialValue)` function as the second argument.
This parameter is a boolean that lets you control whether the initial value should be cloned or not before being assigned to the state or ref.
If set to `true`, the initial value will not be cloned, which can be useful when we are dealing with values that are not serializable (like functions, animations or DOM elements).

```html
<script>
  const element = $`<CustomComponent />`;
  $P.someState = $$(element, true); // Sets initial value of someState to element without cloning it
  $B.someRef = $$(element, true); // Sets initial value of someRef to element without cloning it
  const someFunction = () => console.log("Hello, world!");
  $P.someNestedState = $$(someFunction, true); // Sets initial value of someNestedState to someFunction without cloning it
</script>
```

If you pass a function, object or anything that can be referenced, it will not be cloned and will be the same instance as the one you passed.
**This can be both useful and dangerous, so use it wisely:**

```html
<script>
  const anObject = {
    key: {
      value: "Hello, world!",
    },
  };
  $P.someState = $$(anObject, true); // Sets initial value of someState to anObject without cloning it
  anObject.key.value = "Goodbye, world!"; // This will change the value of someState as well
  console.log($P.someState.key.value); // "Goodbye, world!"
</script>
```

Setting `avoidClone` to `false` (or not passing it at all) and passing a non-serializable value will still set the value without cloning it, but it will console log a warning in the console.
