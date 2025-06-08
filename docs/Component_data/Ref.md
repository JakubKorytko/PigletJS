## Refs

This works exactly like the [state](Component_data/State) component data type, but it does not trigger re-rendering of the component when its value changes.
This is useful for storing values that do not need to be reactive, such as first render flags, or values that are used only for calculations and do not affect the component's template.

### Defining refs

To define the state for a component, you can use the `$B` object in the component's script (preferably with `$$` function, [read more](Component_data/Initial_value)).

```javascript
$B.myRef = $$("initial value");
```

### Accessing Refs

You can access the state properties using the `$B` object. For example, to access the `count` property:

```javascript
console.log($B.counter.count); // Outputs: 0
```

### Modifying State

To modify the ref, you can directly assign a new value to the ref property. For example, to increment the `count` property:

```javascript
$B.counter = {
  ...$B.counter,
  count: $B.counter.count + 1,
};
```

### Reactivity

Refs are not reactive by default, meaning that changes to their values will not trigger a re-render of the component.

The only exception for this is `RenderIf` component, which get proper callback when the ref of its parent component changes, so it can re-evaluate the condition and re-render itself if needed.

If you need to trigger a re-render when a ref value changes, you can use the `$P` object to force a re-render.

```javascript
$P.rerender = $$(true);
$B.myRef = $$("value");

$element("button").on("click", () => {
  $B.myRef = $$("new value");
  $P.rerender = !$P.rerender; // Trigger re-render of the component
});
```
