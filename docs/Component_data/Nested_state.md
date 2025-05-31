# Nested state

Nested state in PigletJS allows you to create complex data structures within your components and at the same time keep it **fully reactive**.
This means that when **any** property of the nested state changes, the component will re-render with the new data.

**This is a powerful feature that allows you to create dynamic and interactive components without having to manually manage the state updates.**

**But great power comes with great** ~responsibility~ **performance impact.**
When using nested state, you should be aware that it can have a performance impact on your application, especially if you have a large number of nested properties or if you are updating them frequently.
Every property is wrapped in a Proxy object, which allows PigletJS to track changes and re-render the component when necessary.
As long as you use nested state wisely, it can be a great addition to your PigletJS application.

You can create nested properties by simply assigning them to the `$$P` object, and PigletJS will automatically wrap them in a Proxy object.

For example, this will re-render the component with new value every second:

```javascript
$$P.veryNested = $$({
  nest1: {
    nest2: {
      nest3: {
        value: 5,
      },
    },
  },
});

console.log($$P.veryNested.nest1.nest2.nest3.value);

const interval = setInterval(() => {
  $$P.veryNested.nest1.nest2.nest3.value++;
}, 1000);

$onBeforeUpdate(() => {
    clearInterval(interval);
})
```

Usage of nested state is the same as for [normal state](Component_data/State), the only difference is you use it with the `$$P` object instead of `$P`.
