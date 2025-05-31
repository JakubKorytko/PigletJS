## Delayed pass
<p id="top" style="position: absolute; top: -50px"></p>

PigletJS supports a feature called "delayed pass" that allows you to optimize the rendering of your components by deferring updates of its children.
This is done by not running the `.pass()` method on the children components immediately, but putting them in the `task queue` to be executed later.
This can be useful for improving performance in certain scenarios,
such as when your children do not really need attributes from the parent at the moment of first render and is not depending on them to render correctly.

**Remember that the `task queue` is executed only if `stack` is empty, so if you have a lot of tasks in the queue,
it may take some time before they are executed, or may not be executed at all if the stack is never cleared.
Make sure you are familiar with the execution model of JavaScript and how the event loop works before using this feature.
[MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) has awesome overview of the event loop and how it works.**

To use delayed pass, you need to add `delayed` attribute to `.pass()` method call in your component's script.

```html
<script>
  // Your component code here
  $element('ChildComponent').pass({
      delayed: true
      someOtherAttribute: 'value'
    })
</script>
```

## Fragments

PigletJS supports fragments, that means you can pre-render any of your components and inject them later into the DOM.
This is useful for optimizing the initial load time of your application.

**Note:** While it can be used to optimize the app by avoid re-painting DOM for large nested components, it can actually make the script slower, so use it wisely.

### Usage

To use fragments, you need to simply add the `fragment` attribute to a component in your template.

```html
<CustomComponent fragment />
```

This will pre-render the `CustomComponent` but will not inject it into the DOM by itself.
You can then inject it into the DOM using the `injectFragment` method in your PigletJS script.

```javascript
$element("CustomComponent").injectFragment();
```

Calling this method will inject the pre-rendered component into the DOM at the position of the `<CustomComponent fragment />` element.
This is one-time operation, so you can call it only once for each component in your template.

The attribute can be used with any component, but not with native HTML elements.

You can also pass `fragment` attribute using the `.pass()` method in your component's script, which will have the same effect as adding the `fragment` attribute to the component in your template.

```html
<script>
  // Your component code here
  $element('CustomComponent').pass({
    fragment: true
  });
</script>
```

## Early return

PigletJS allows you to optimize your components by using early returns.
This means that you can return from your component before it finishes rendering, if certain conditions are met.

### Throw out

While you can use `return` to exit the component at top level, IDE may not recognize it as a valid return statement.
To counter this, you can use `throw out` statement instead.
Both works the same way, but `throw out` is more explicit and will not cause any issues with IDEs.

```html
<script>
  /* ... */
  if (someCondition) {
    throw out; // This will exit the component early
    return; // ... also works, but may not be recognized by IDEs
  }
  /* ... */
</script>
```

This will not prevent you from throwing an error in your component, so you can still use `throw` with any other value to indicate an error and stop script execution.
