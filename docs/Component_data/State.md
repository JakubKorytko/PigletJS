## State

**If you want to update the state on change of nested properties, read more in [Nested State](Component_data/Nested_state).**

PigletJS components can have their own state, which is a simple object that holds data specific to that component.
This state can be used to store information that affects the component's rendering or behavior.

The state can be accessed and modified using the `$P` object, which is a special object available in the component's script.

**Never modify the `$P` values at the top-level of the component's script as it will cause infinite re-rendering of the component.**

The only exceptions to this rule are the initial state definition and **proper** conditional setting of the state in the component's script.

### Defining State

To define the state for a component, you can use the `$P` object in the component's script (preferably with `$$` function, [read more](Component_data/Initial_value)).

```javascript
$P.counter = $$({
  count: 0,
  size: 10,
});
```

### Accessing State

You can access the state properties using the `$P` object. For example, to access the `count` property:

```javascript
console.log($P.counter.count); // Outputs: 0
```

### Modifying State

To modify the state, you can directly assign a new value to the state property. For example, to increment the `count` property:

```javascript
$P.counter = {
  ...$P.counter,
  count: $P.counter.count + 1,
};
```

### Reactivity

PigletJS automatically tracks changes to the state and re-renders the component when the state is modified.
This means that when you update the state, the component will automatically re-render to reflect the new state.
If a child component is linked to parent component's state (meaning that the parent passed any attribute to the child component, read more in [Attributes](Component_data/Attributes)), it will also re-render when the parent's state changes.

```javascript
// Parent script
$P.counter = $$({
  count: 0,
});

$element('ChildComponent').pass({
  counter: $P.counter,
});
```

```javascript
// Child script
const { counter } = $attrs;
console.log(counter.count); // Count value from parent state, initially 0
```
