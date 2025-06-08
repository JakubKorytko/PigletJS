## Herd

Sometimes you want to create a group of components that share the same data.
That can be achieved by passing attributes, but it can be cumbersome if you have a lot of nested components.

Herd is a special mechanism that allows you to create state that is shared between multiple components and can be accessed by components at any level
of the component tree without passing it through attributes.

Herd, is also an only state that is persistent across navigations (except for components inside layouts, which are not destroyed on navigation if layout has not been changed).
meaning that if you navigate to another page and then back, the herd will still be available.

It can be treated as context in React, but applied to root component - thus it is available to all components in the application.

### Creating a Herd

To create a herd, you can use the `$H` object, which is a special object available in the component's script.

```javascript
$H.myHerd = $$({
  count: 0,
  size: 10,
});
```

You can also use nested reactive herds, just like with [Nested State](Component_data/Nested_state):

```javascript
$$H.myHerd = $$({
  nested: {
    count: 0,
    size: 10,
  },
});
```

### Accessing a Herd

You can access the herd properties using the `$$H`/`$H` object. For example, to access the `count` property:

```javascript
console.log($$H.myHerd.nested.count); // Outputs: 0
console.log($H.myHerd.count); // Outputs: 0
```

### Modifying a Herd

To modify the herd, you can directly assign a new value to the herd property. For example, to increment the `count` property:

```javascript
$$H.myHerd.nested.count++;
$H.myHerd.count++;
```

### Reactivity

The only difference between herds and regular state is that herds are not making the component re-render when the herd is modified by default.
You can safely modify/access the herd properties without worrying about re-rendering the component if you want.

However, if you want to make the component re-render when the herd is modified, you can use the `$H`/`$$H.observe` method.
The only argument is a herd name, you can also unobserve the herd by using `$H`/`$$H.unobserve` method with the same argument.

```javascript
$$H.observe("myHerd");
```

### Both `$H` and `$$H` use the same data

Both `$H` and `$$H` are used to access the same herd data.
If you, for example, create a herd using `$H`, you can access it using `$$H` and vice versa.
The same applies to modifying the herd data, observing it, and unobserving it.

Only the way you create the herd matters, as `$H` creates a herd that is reactive only at the top level, while `$$H` creates a herd that is reactive at all depths.
