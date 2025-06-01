## Why PigletJS? :id=why-pigletjs

It is important to understand why PigletJS was created and what problems it solves but also when it is not the best choice for your project.

PigletJS is a JavaScript framework that allows you to create web applications **without the need for any node modules or npm**.

It is designed to be **simple, lightweight, and easy to use**, while still providing powerful features that allow you to create complex applications.

<details>
<summary>Current features</summary>

- **No node modules**: PigletJS does not require any node modules or npm at all, which makes it easy to use and deploy.
- **No build steps**: PigletJS does not require any build step, which means you can start using it right away without having to set up a complex build process.
- **Component-Based Architecture**: Build your application using reusable and maintainable components.
- **Custom Web Components**: Easily create custom elements and manage them with the framework's internal tooling.
- **Real-Time Hot Reloading**: Automatically reloads components during development for faster feedback.
- **State Management**: Integrated state tracking and management to keep your components in sync.
- **Custom Route Handlers**: Seamless integration for custom routes such as API endpoints, components, and pages.
- **Built-In Development Server**: Includes a server that watches for file changes and reloads the application automatically.
- **Modern web standards**: Built on modern web standards including custom elements, view transitions, but ensuring compatibility with older browsers (not all though, bye bye IE11).
- **Small size**: PigletJS is designed to be lightweight, with a small footprint that makes it easy to include in your projects. It currently does not have production build, but even now, setup script result is around **150KB**.
This can, and will, be reduced in the future by removing unnecessary features and optimizing the code. Production build will also be available in the future that could even halve the size of the framework by removing hot reload, watcher etc.
</details>

### Okay then, it is simple, small, and easy to use, but why should I use it instead of other frameworks? :id=why-pigletjs-2

You shouldn't. PigletJS is not meant to replace other frameworks like React, Vue, or Angular.
It is designed to be a lightweight alternative for projects that do not require the full power of these frameworks.
There is no way that a framework that is so small and simple can compete with the big players in the field.
It is meant to be used in projects where you want to have a simple and easy-to-use framework that does not require any build steps or node modules.

**It is a good choice for small to medium-sized projects, prototypes, or when you want to quickly create a web application without the overhead of a full-fledged framework.**

**It is also a good choice for projects where you want to have full control over the code and do not want to rely on third-party libraries or frameworks.**

**It is not meant to be used in large-scale applications or projects (please, do not use it in such projects, it is not ready for that yet, I personally would not use it in such projects either).**

Also, be aware that PigletJS is still in development, and I wouldn't recommend using it in production yet.
It lacks security features, such as CSRF protection, and it is not fully tested in all browsers.

Right now, it should be used:

- For learning purposes, to understand how web components and custom elements work or how frameworks work in general.
- For portfolio projects, small projects, or projects with no user authentication, sensitive data, or other security concerns.
- For any static websites with no user input, such as blogs, documentation sites, or landing pages.

## Getting started with PigletJS :id=getting-started

**If you are new to PigletJS, it is recommended to select all optional features when running the setup script.**
**This will let you create your first PigletJS application with all the features available, and you can then remove the ones you do not need.**

### There are two ways to get started with PigletJS:

#### Starting with full template :id=full-template

You can start with an example application template that is provided in the repository.
It is a good way to see how PigletJS works and if the framework is a good fit for your project or if you just want to try it out.
You can do this by running the setup script and selecting the `Showcase example app` template when prompted.
Then you can simply browse the code and see how it works in practice.

#### Starting with a blank project :id=blank-project

After the installation, there is a [Your first PigletJS app](#your-first-pigletjs-app) tutorial that will guide you through the process of creating your first PigletJS application from scratch.
You can follow the steps in the tutorial to create a simple application that demonstrates the basic features of PigletJS.

You can select `Directories structure only` or `No template at all` when running the setup script - depending on whether you want to have a basic directory structure or not.
The tutorial below assumes that you have selected `No template at all`, so you will have a blank project to start with.

## Installation :id=installation

Since PigletJS do not require any node modules nor npm at all, you can simply:

1. Clone the repository into your project directory:

   ```bash
   git clone https://github.com/JakubKorytko/PigletJS.git
   ```

1. Run the setup script to build the project (**run this command in your project directory**):

   ```bash
   node PigletJS/setup.mjs
   ```

1. Finish the setup by following the instructions in the terminal.

## Configuration :id=configuration

PigletJS has a simple configuration for enabling or disabling debugging features.
You can configure the framework by creating a special script tag in `Pig.html` file, which is the main entry point of your application.

```html
<script type="application/json" id="piglet-config">
  {
    "allowDebugging": boolean, // Allow extension to read tree + write & read state (default: true)
    "enableCoreLogs": {
      "info": boolean, // Enable info logs (default: false)
      "warn": boolean, // Enable warning logs (default: true)
      "error": boolean // Enable error logs (default: true)
    }
  }
</script>
```

**Note:** If you edit only part of `enableCoreLogs` object, the other properties will be set to `false`.

## Your first PigletJS app :id=your-first-pigletjs-app

In this section, we will create a simple PigletJS application that demonstrates the basic features of the framework.
I assume that you have selected no template when running the setup script, so you will have a blank project to start with.

### Step 1: Create the server script

We need to create a server script that will start the PigletJS server and serve our application.
Create a directory named `server` in the root of your project directory, and then create a file named `index.mjs` inside it.

```javascript
/** server/index.mjs */
/** We need to import the PigletJS server module */
import server from "@Piglet/libs/server";

server.listen(2137, () => {
  console.log("Server is ready!");
});
```

We will not create any API endpoints for this simple application, but you can do so by creating a directory named `api` inside the `server` directory and adding your API controllers there.
Read more about the server structure in the [API Endpoints](Structure#api-directory) documentation.

### Step 2: Create the main component

Then, we need to create the main component of our application.
Create a new file named `Pig.html` in the root of your project directory.
Let's make it as simple as possible:

```html
<!-- Pig.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>My PigletJS App</title>
  </head>
  <body>
    <!-- This is the root component of your application -->
    <App />
  </body>
</html>
```

### Step 3: Create the routing entry point

Next, we need to create the routing entry point for our application.

But before that, we need to create a directory named `src` in the root of your project directory.
We will place all our components and pages inside this directory.
Let's make a subdirectory named `pages` and another one named `components` inside the `src` directory.

Create a new file named `App.pig.html` in the `src` directory.

```html
<!-- src/App.pig.html -->
<routes>
  <route value="/">
    <HomePage />
  </route>
</routes>
```

Here we define a route named `/`, which will be the main page of our application.
We need to create a `HomePage` component that will be rendered when the user navigates to this route.

**Note:** Do not put any comments or other elements inside the `<routes>` tag and `<route>` tag, as it will break the routing system.

### Step 4: Create the Home page

We have defined a route, but we need to create the actual page that will be rendered when the user navigates to the `/` route.
Create a new file named `HomePage.pig.html` in the `src/pages` directory.

**Every pig component and page must have a `.pig.html` extension, so PigletJS can recognize it.**

```html
<!-- src/pages/HomePage.pig.html -->
<content>
  <h1>Welcome to my PigletJS app!</h1>
  <p>This is a simple application built with PigletJS.</p>
  <ButtonClicker />
</content>
```

As you can see, we have created a simple page that displays a welcome message and a button.
Now we need to create the `ButtonClicker` component that will handle the button click event.

### Step 5: Create the ButtonClicker component

Create a new file named `ButtonClicker.pig.html` in the `src/components` directory.

```html
<!-- src/components/ButtonClicker.pig.html -->
<content>
  <button>Click me!</button>
  <output></output>
</content>

<script>
  // We create a new state value to store the number of clicks, $$ is used to set the initial value
  $P.clickCount = $$(0);

  // We create a ref to detect a first render
  $B.firstRender = $$(true);

  // We update the output element with the new click count on every render
  // $element is a special function that returns the DOM element with the given selector
  // We have only one button and output element in this component, so we can use simple selectors
  $element("output").textContent =
    `You clicked the button ${$P.clickCount} times!`;

  // We add an event listener to the button that will increment the click count
  // But we want to add it only on first render to not stack them
  if ($B.firstRender) {
    $element("button").on("click", () => {
      $P.clickCount++; // Increment the click count
    });
    // Not a first render anymore
    $B.firstRender = false;
  }
</script>
```

### Step 6: Run the application

Now we have everything set up, and we can run our application.
To do this, run the following command in your project directory:

```bash
node pig.mjs
```

This will start the PigletJS server and serve your application on `http://localhost:2137` (or http://piglet.js:2137 if you have added the host entry during the setup script).

### Step 7: Celebrate!

**Congratulations! You have created your first PigletJS application.**

You can now read the docs to learn more about PigletJS and its features, or you can start building your own applications using the framework.
