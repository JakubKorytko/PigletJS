## Elements selectors :id=element-selectors

<p id="top" style="position: absolute; top: -50px"></p>

### `$element(selector, expect? = HTMLElement.prototype)`

This function allows you to select a single element in the DOM using a CSS selector.
It returns the first element that matches the selector wrapped in a proxy object that provides additional methods for event handling and updates.
Every method - except `clone()` - returns the same proxy object, allowing for method chaining.

Due to lack of TypeScript in this project, the `expect` parameter is purely for type checking purposes and does not affect the runtime behavior.
You can use it to specify the expected type of the element:

```javascript
// We expect the element to be an input element
const element = $element("input", HTMLInputElement.prototype);

// We expect the element to be our custom component
const { RC } = $types;
const element = $element("CustomElement", RC);

// We expect the element to be a built-in PigletJS component
const { RDC } = $types;
const element = $element("NavLink", RDC);
```

This functionality can be entirely skipped, as the `expect` parameter is not used at runtime, but it can be useful for IDEs to provide better type checking and autocompletion.

#### `.pass(updates)`

This method allows you to pass updates to the element. The `updates` parameter is an object containing the attributes to update.

```javascript
$element("selector").pass({
  attribute1: "value1",
  attribute2: "value2",
});
```

#### `.on(event, callback, options)`

This method allows you to add an event listener to the element. The `event` parameter is a string representing the event type (e.g., `"click"`), and the `callback` parameter is a function that will be called when the event occurs.
You can also pass an optional `options` parameter, which is the same as the third parameter of the `addEventListener` method in JavaScript.
The difference between this method and the native `addEventListener` is that it returns the same proxy object,
allowing for method chaining and all listeners added by these methods are stored in the element's internal listeners list, which can be cleared later using `.clearListeners()` method.

```javascript
$element("selector").on(
  "click",
  (event) => {
    console.log("Element clicked!", event);
  },
  { once: true },
);
```

#### `.off(event, callback)`

This method allows you to remove an event listener from the element. The `event` parameter is a string representing the event type, and the `callback` parameter is the function that was previously added as an event listener.

```javascript
$element("selector").off("click", (event) => {
  console.log("Element clicked!", event);
});
```

#### `.clearListeners()`

This method allows you to clear all event listeners that were added to the element using the `.on()` method. This is useful for cleaning up event listeners when they are no longer needed, preventing memory leaks.

```javascript
$element("selector").clearListeners();
```

#### `.clone()`

This method allows you to clone the element. It returns a new instance of the `ReactiveComponent` or `HTMLElement`, depending on whether the selected element is a PigletJS component or a native HTML element.
This should be used instead of the native `cloneNode()` method when cloning PigletJS components, as it ensures that the cloned component retains its reactive properties and methods.

```javascript
const clonedElement = $element("selector").clone();
```

### `$elements(selector)`

This function allows you to select multiple elements in the DOM using a selector.
It returns an array of elements that match the selector, each wrapped in the same proxy object as `$element(selector)`.

## Document and self reference

Because PigletJS uses custom elements, the `document` may turn out to be something different than you expect.
Instead, you can use following references:

### `$document`

This is a reference to current component's document (which is actually the `shadowRoot` of the component).

### `$this`

This is a reference to the current component instance, it can be used as any other node in the DOM but with component's methods and properties available.

**Note:** You can use `this` keyword in your component's script to refer to the current component instance as well,
but due to IDE not recognizing it as a valid reference at the top-level, it is recommended to use `$this` instead for consistency and clarity.

## Dynamically creating elements in JavaScript

PigletJS allows you to create elements in your components using the `$` template syntax.
This should be used instead of the standard HTML syntax, as it allows PigletJS to optimize the rendering process and provide additional features (like non-string attributes - functions, objects, etc.).

If `document.createElement()` is used, PigletJS will not be able to optimize the rendering process and will treat the element as a regular HTML element - it may even result to component not being rendered at all.

```html
<script>
  const myElement = $`<CustomElement ${{
    attribute: "value",
    anotherAttribute: 123,
    onClick: () => console.log("Clicked!"),
  }} />`;

  // Now you can append it to the DOM in normal way
  $element("CustomElementParent").append(myElement);
</script>
```
