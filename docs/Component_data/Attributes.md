## Attributes

Attributes in PigletJS are used to pass data to components, similar to how HTML attributes work for elements.
They allow you to customize the behavior and appearance of components by providing additional information.

You can pass attributes using the [`pass()`](DOM#element-selectors) method on a component instance proxy returned by [`$element(selector)`](DOM#element-selectors).

```javascript
// MyParentComponent.pig.mjs
$element("MyComponent").pass({
  attributeName: "attributeValue",
  anotherAttribute: 42,
  isVisible: true,
});
```

Unless `delayed` attribute is passed, the attributes will be available in the component immediately after the `pass()` method is called.

Passing any attribute to a component will link these two components making the child component reactive to the parent component's updates.
This means that if the parent component updates for any reason, it will send the updates to the child component, and the child component will re-render with the new data if passed attribute changed.

**Note:** There are some reserved attributes that are used by PigletJS internally: `fragment` & `delayed`
Read more about them in the [Optimization](Optimization#top) section.

### Passing non-primitive attributes

You can pass any attribute to a component, including primitive values (like strings, numbers, booleans) and non-primitive values (like objects, arrays, functions).
However, when passing non-primitive values, you should be aware that they are passed by reference.
That means that if you pass pure objects like:

```javascript
// MyParentComponent.pig.mjs
$element("MyComponent").pass({
  myObject: { key: "value" },
});
```

Or

```javascript
// MyParentComponent.pig.mjs
const myObject = { key: "value" };
$element("MyComponent").pass({
  myObject,
});
```

It will re-render children on every parent update, even if the object itself did not change.
That is because the object reference is different each time you pass it, so PigletJS treats it as a new value.

That is not a case when we pass, for example, a PigletJS ref:

```javascript
// MyParentComponent.pig.mjs
$B.myObject = $$({ key: "value" });
$element("MyComponent").pass({
  myObject: $B.myObject,
});
```

This will not cause the child component to re-render on every parent update, as the reference to `$B.myObject` remains the same.

However, it will also not re-render the child component if the object nested value changes, as PigletJS does not perform deep comparison of objects:

```javascript
// MyParentComponent.pig.mjs
$B.myObject = $$({ key: "value" });
$P.rerender = $$(true); // This is here to trigger re-render of the parent component later as refs are not reactive by themselves
$element("MyComponent").pass({
  myObject: $B.myObject,
});

$element("button").on("click", () => {
  $B.myObject.key = "new value";
  $P.rerender = !$P.rerender; // Trigger re-render of the component
});
```

This can be resolved in two ways:

1. **Instead of changing a key of the object, you can replace the whole object with a new one:**

```javascript
/** same code as above */
$element("button").on("click", () => {
  $B.myObject = { key: "new value" }; // Replace the whole object
  $P.rerender = !$P.rerender; // Trigger re-render of the parent component
});
```

1. **Change the object reference by using spread, Object.assign, or similar methods:**

```javascript
// MyParentComponent.pig.mjs
$B.myObject = $$({ key: "value" });
$P.rerender = $$(true); // This is here to trigger re-render of the parent component later as refs are not reactive by themselves
$element("MyComponent").pass({
  myObject: Object.assign({}, $B.myObject),
});

$element("button").on("click", () => {
  $B.myObject.key = "new value";
  $P.rerender = !$P.rerender; // Trigger re-render of the component
});
```

But this is almost the same as creating pure object and passing it to the component.

Keep it in mind when passing non-primitive values to components as it may lead to unnecessary re-render or no re-render at all if the reference does not change.

### Accessing attributes in components

To access the passed attributes in your component, you can use `$attrs` object, which is available in the component's script.

```javascript
// MyComponent.pig.mjs
const { attributeName, anotherAttribute } = $attrs;

console.log(attributeName); // "attributeValue"
console.log(anotherAttribute); // 42
```

### Using attributes in templates

Currently, attributes are not directly usable in the component's template.
There is an exception for the [RenderIf](Built_in_components#RenderIf) component, which allows you to conditionally render content based on the attribute value.

```html
<!-- MyComponent.pig.mjs -->
<content>
  <RenderIf condition="$attrs.isVisible">
    <p>
      This content is conditionally rendered based on the isVisible attribute.
    </p>
  </RenderIf>
  <RenderIf condition="!$attrs.isVisible">
    <p>
      This content is conditionally rendered based on the isVisible attribute,
      but negated.
    </p>
  </RenderIf>
</content>
```
