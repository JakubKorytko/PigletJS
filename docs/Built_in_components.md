## Note on display of built-in components :id=display-note

By default, built-in components in PigletJS have `display: contents` style, which means they will not create a new box in the layout and will treat their children as if they were direct children of the parent component.
This allows you to use built-in components without affecting the layout of your application.
However, you can override this behavior by adding a `display` style to the built-in component in your CSS file if you want it to create a new box in the layout.

Each of these components can be referenced in your PigletJS scripts or CSS files by its name to apply styles or add functionality specific to the component.
There may be some exceptions to this rule, so please refer to the documentation for each component for more details.

## \<RenderIf condition="..." /> :id=RenderIf

The `<RenderIf />` component is a built-in component in PigletJS that allows you to conditionally render content based on a boolean expression.
It is particularly useful for controlling the visibility of elements in your application without cluttering your code with multiple conditional statements.
It accepts a `condition` attribute, which is a boolean expression that determines whether the content inside the `<RenderIf />` component should be rendered or not.
If the `condition` evaluates to `true`, the content inside the `<RenderIf />` component will be rendered; otherwise, it will not be rendered at all.
Aside from boolean expressions, you can set to condition to one of the following values:

- `$attrs.{...}`: This allows you to use attributes from the parent component as the condition.
- `${...}`: This allows you to use a state/ref variable from the parent component as the condition.
- `!{...}`: This allows you to use a state/ref variable from the parent component as the condition, but negated (i.e. `!$isVisible` will render the content if `$isVisible` is `false`).
  The same apply to `$attrs` attributes, so `!$attrs.isVisible` will render the content if the `isVisible` attribute is not set or is set to a falsy value.

**By 'parent component', I mean the component that contains the `<RenderIf />` component in its template.**

```html
<!-- Example of using RenderIf -->
<content>
  <RenderIf condition="$attrs.isVisible">
    <p>
      This content is conditionally rendered based on the isVisible attribute.
    </p>
  </RenderIf>
  <RenderIf condition="$isVisible">
    <p>
      This content is conditionally rendered based on the isVisible state
      variable.
    </p>
  </RenderIf>
  <RenderIf condition="true">
    <p>This content is always rendered.</p>
  </RenderIf>
  <RenderIf condition="false">
    <p>This content is never rendered.</p>
  </RenderIf>
  <RenderIf condition="!$isVisible">
    <p>
      This content is conditionally rendered based on the isVisible state
      variable, but negated.
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

## \<NavLink to="..." /> :id=NavLink

The `<NavLink />` component is a built-in component in PigletJS that allows you to create navigation links.
It accepts a `to` attribute, which specifies the route to navigate to when the link is clicked.
The route can only navigate to one of your application's pages - it cannot navigate to external URLs, thus it should have a syntax of `to="/path/to/page"`.

```html
<!-- Example of using NavLink when on /home page -->
<content>
  <!-- This has `active` class -->
  <NavLink to="/home">Home</NavLink>
  <NavLink to="/about">About</NavLink>
  <NavLink to="/contact">Contact</NavLink>
</content>
```

### Why use `<NavLink />` instead of `<a>`? :id=NavLink-why

- `<NavLink />` is specifically designed for navigation within a PigletJS application, while `<a>` is a standard HTML anchor element.
- Using `<NavLink />` ensures that the navigation is handled by PigletJS's routing system, which allows for features like client-side navigation, route transitions, and more.
- It automatically applies `active` classes to the link when the current route matches the `to` attribute, making it easier to style active links.
- It does not cause a full page reload, which is important for maintaining the state of your application and providing a smoother user experience.
- It fires a `popstate` event when the link is clicked, allowing you to handle navigation events in your PigletJS scripts.

## \<KinderGarten /> :id=KinderGarten

The `<KinderGarten />` component is a built-in component in PigletJS that allows you to add children components to your other components.
You should place it inside your component's template, and it will render the children components that are passed to it.
It is useful for creating reusable components that can accept other components as children, allowing you to build complex UIs with ease.

```html
<!-- CustomComponent.pig.html -->
<content>
  <h1>My Component</h1>
  <!-- Children will be rendered inside this -->
  <KinderGarten />
</content>
```

```html
<!-- CustomContainer.pig.html -->
<content>
  <CustomComponent>
    <p>This is a child component</p>
  </CustomComponent>
</content>
```

## \<AppContent /> :id=AppContent

The `<AppContent />` component is a built-in component in PigletJS that serves as the main content area of your application.
It is typically used to render the main content of your app, such as pages or components that are part of the application's layout.
If a page has a layout, it will be wrapped around `<AppContent />`, which will then render the content of that page.
It is automatically included in the `AppRoot` component, so you don't need to add it manually unless you are creating a custom layout.

You can reference `AppContent` as well in your CSS & JS tags/files, but the only way to do so is by using the `:host` selector in the component that is at the top-level of your page,
or inside a layout file (using its name `AppContent`).

## \<App /> :id=App

**In `Pig.html` it is named `<App />`, but in PigletJS scripts and CSS files,
it needs to be referenced as `<AppRoot />` because that's the requirement of HTML custom elements.**

The `<AppRoot />` component is a built-in component in PigletJS that serves as the root of your application.
It is automatically included in the `Pig.html` file, which is the main entry point of your PigletJS application.
The `<AppRoot />` component is responsible for rendering the main structure of your application, including the `<AppContent />` component, which contains the main content of your app.
It also handles the routing and navigation of your application, allowing you to define different pages and components that can be rendered based on the current route.
