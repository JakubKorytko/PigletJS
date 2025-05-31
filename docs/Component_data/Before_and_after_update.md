## Before and after update

There are two lifecycle hooks in PigletJS that allow you to run code before and after the component is updated: `$onBeforeUpdate` and `$onAfterUpdate`.
These hooks are useful for performing actions that need to happen right before or after the component's state is updated.
For now, these methods do not support asynchronous operations, so they should be used for synchronous code only.

### $onBeforeUpdate

The `$onBeforeUpdate` method is called right before the component is updated.
This is a good place to perform any preparations or checks that need to be done before the update occurs or clear intervals, listeners, etc.

```javascript
// MyComponent.pig.mjs
$onBeforeUpdate(() => {
  console.log("Component is about to update!");
  // Perform any necessary preparations here
});
```

You can also return `false` from this method to prevent the update from happening. This can be useful if you want to conditionally skip the update based on some logic.
But be careful with this, as it can lead to unexpected behavior if not used correctly.
Any other return value will be ignored.

```javascript
// MyComponent.pig.mjs
$onBeforeUpdate(() => {
  if (someCondition) {
    console.log("Skipping update due to some condition.");
    return false; // Prevent the update
  }
  console.log("Component is about to update!");
});
```

### $onAfterUpdate

The `$onAfterUpdate` method is called right after the component has been updated. This is a good place to perform any actions that need to happen after the update, such as updating the UI or triggering side effects.

```javascript
// MyComponent.pig.mjs
$onAfterUpdate(() => {
  console.log("Component has been updated!");
  // Perform any necessary actions after the update here
});
```

Returned value from this method is ignored, so you can use it for side effects without worrying about the return value.