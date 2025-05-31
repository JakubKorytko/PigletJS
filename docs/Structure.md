## Structure of a PigletJS Application :id=structure

<p id="top" style="position: absolute; top: -50px"></p>

Structure of a PigletJS application is designed to be simple and intuitive, allowing you to easily manage your web application files:

```
# PigletJS Application Structure

(Your application directory)
├── src/               # Source code for your PigletJS application
│  ├── components/     # Custom components for reuse across pages
│  ├── modules/        # JavaScript modules for reusable code
│  ├── pages/          # Pages of your web application
│  ├── public/         # Public assets like images, fonts, etc.
│  └── App.pig.html    # Routing entry point for your application
├── server/            # Server-side code for your PigletJS application
│   ├── index.mjs
│   └── api/           # API controllers for handling requests
└── Pig.html           # Main entry point for your PigletJS application

```

Of course, you can add more directories and files as needed, but this structure provides a solid foundation for your PigletJS application.

## Routing & Entry Point :id=routing-entry-point

PigletJS uses a simple routing mechanism to handle different paths in your application inside `App.pig.html`. in the `src` directory.
It also uses a file that serves as the main entry point for your application, which is `Pig.html` in the root of your project.

Both files are essential for defining the structure and behavior of your PigletJS application.

### Pig.html :id=pig-html

The `Pig.html` file is the main entry point of your PigletJS application. It is where you define the root component of your application, which is `<App />`.
In this file you can define the overall structure of your application, including the `<head>` and `<body>` sections with styles and scripts that should be applied globally.

**Note:**

- Components inside this file are not processed by PigletJS, so you can use standard HTML elements and attributes.
- Components are not aware of styles nor scripts defined here, so you need to use tags inside components to apply styles or scripts to them.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My PigletJS App</title>
    <link rel="icon" href="/public/favicon.ico" />
    <link rel="stylesheet" href="/public/styles.css" />
  </head>
  <body>
    <App />
    <script type="module" src="/public/ads.js"></script>
  </body>
</html>
```

### App.pig.html :id=app-pig-html

The `App.pig.html` file is the file where you define the routing for your PigletJS application.
Everything is wrapped by `<routes>` component, which is responsible for handling the routing logic and rendering the appropriate components based on the current URL path.

To define a route, you can use the `<route>` component, which takes a `value` attribute that specifies the URL path for the route.
Inside the `<route>` component, you can define component that should be rendered when the route is matched.

```html
<routes>
  <route value="/">
    <HomePage />
  </route>
  <route value="/about">
    <AboutPage />
  </route>
  <route value="/contact">
    <ContactPage />
  </route>
</routes>
```

## Web

Everything for web purposes is located in the `src` directory, which is the main source directory for your PigletJS application.

<p id="components" style="position: absolute;"></p>

### Pages & components :id=pages-components

PigletJS applications are structured around pages and components, which are defined in the `src/pages` and `src/components` directories, respectively.
This structure allows you to organize your application into reusable and modular parts.
In practice, both pages and components share the same structure and can be used interchangeably.

#### Naming convention

In PigletJS, pages and components are named using the `.pig.html` extension, which indicates that they are PigletJS components.
This extension is used for both pages and components, allowing you to create a consistent naming convention across your application.

If you want to extract styles or scripts from a page or component, you can use the `.pig.css` and `.pig.mjs` extensions, respectively with the same name as the page or component.
PigletJS will automatically merge files with the same name but different extensions into a single component.

This allows you to keep your styles and scripts organized and separate from the HTML structure of your pages and components.

Every page or component needs to have PascalCase name, which is the standard naming convention for custom elements in HTML.
It is also required for names to have at least two parts (e.g. `MyComponent` or `MyPage`), which is another requirement for custom elements in HTML.

The structure of both pages and components directories is flexible, and you can organize them as you see fit.
PigletJS will automatically discover and register all pages and components in the `src/pages` and `src/components` directories, respectively.
That, however, provides one limitation: you cannot use the same name for more than one page or component, as PigletJS will not be able to distinguish between them.

The only exception to this rule are [Layouts](Structure#layouts), which are special pages that define the layout for other pages in the same directory.

#### Structure of a page or component

A typical page or component in PigletJS has the following structure:

```html
<content>
  <!-- This is where the main content of the page or component goes -->
  <h1>My Page or Component</h1>
  <p>This is a simple example of a PigletJS page or component.</p>
</content>

<script>
  // This is where you can add JavaScript code for the page or component
  console.log("This is a PigletJS page or component.");
</script>

<style>
  /* This is where you can add styles for the page or component */
  h1 {
    color: blue;
  }
  p {
    font-size: 16px;
  }
</style>
```

There is also a special `<script>` tag with `type="application/json"` that can be used to define metadata for the page or component.
This allows for IDE and editor integrations to provide better support for PigletJS components, such as autocompletion and syntax highlighting.
Metadata is a type of `element` object in `contributions.html.elements` object from web-components web-types specification.

[You can read more about it in the web-types specification](https://plugins.jetbrains.com/docs/intellij/websymbols-web-types.html#web-components)

```html
<script type="application/json">
  {
    "name": "MyPageOrComponent",
    "description": "This is a simple example of a PigletJS page or component.",
    "attributes": [
      {
        "name": "exampleAttribute",
        "type": "string",
        "description": "An example attribute for the page or component."
      }
    ]
  }
</script>
```

### Modules

Modules in PigletJS are JavaScript files that contain reusable code, such as functions, classes, or constants.
You can import these modules into your PigletJS components or scripts to use their functionality.
It can be any JavaScript module with `.pig.mjs` extension, which is a PigletJS-specific extension for JavaScript modules.

```javascript
// Example of a module in PigletJS, saved as src/modules/greet.pig.mjs
export function greet(name) {
  return `Hello, ${name}!`;
}
```

```html
<!-- Example of using a module in a PigletJS component -->
<content>
  <h1>Custom component</h1>
</content>

<script>
  import { greet } from "/modules/greet.pig";

  const greeting = greet("World");
  console.log(greeting); // Outputs: Hello, World!
</script>
```

As in the example above, modules are imported from the `/modules/` route and the extension (aside from `.pig`) is not required.

### Public

PigletJS provides a `public` folder for static assets that are served directly by the server. This is useful for files that do not require any processing or transformation, such as images, fonts, and other static files.

The structure of the `public` folder is flexible, and you can organize it as you see fit. However, it is recommended to follow a common structure for better organization and maintainability.

To access public assets in your PigletJS application, you can use the `/public` prefix in the URL. For example, if you have an image named `logo.png` in the `public/images` directory, you can access it via the URL `/public/images/logo.png`.
It is supported by PigletJS's built-in methods and components.

### `{...}.pig.css`

The `.pig.css` extension is used to mark CSS special file that is processed by PigletJS and allows you to use component names in your CSS selectors.

```css
CustomComponent {
  color: red;
  &:hover {
    color: blue;
  }
}

main .some-class {
  NestedComponent {
    background-color: yellow;
  }
}
```

### Layouts

Each directory in the `src/pages` directory can have a `Layout.pig.html` file that defines the layout for every page in that directory.
If a directory do not have a `Layout.pig.html` file, it will recursively look for a `Layout.pig.html` file in the parent directories until it finds one or reaches the root of the `src/pages` directory.
This allows you to create a consistent layout for all pages in a specific section of your application, while still allowing for custom layouts on individual pages.

For now, it is not possible to use JS scripts in the `Layout.pig.html` file, and it is not certain if it will be supported in the future.
There is also no support for separate `Layout.pig.css` file, so you should include styles directly in the `Layout.pig.html` file.

#### Structure of layout file

The `Layout.pig.html` file should have the following structure:

```html
<content>
  <!-- This is where the page content will be rendered -->
  <AppContent />
  <!-- You can add any other components or elements that should be part of the layout -->
</content>

<style>
  /* Add any styles that should be applied to the layout */
</style>
```

You can reference `AppContent` in your styles to apply styles to the page content.
Layout files are excluded from view transitions, so you can use them to define the structure of your pages without affecting the transitions between them.

### NotFound page :id=notfound-page

PigletJS allows you to customize the NotFound page by creating a `NotFound.pig.html` file anywhere in your `src/pages` directory.
This file will be used as the 404 page when a user tries to access a route that does not exist in your application.
It works fine, but there are some [limitations that will be fixed in the future](Unreleased#customizable-notfound-page):

- You can't have multiple NotFound pages for different routes. PigletJS will always use the first `NotFound.pig.html` file it finds in the `src/pages` directory.
- You can't set custom name for the NotFound page. For it to work, the file must be named `NotFound.pig.html`.

Every other rule that applies to pages also applies to the NotFound page, such as the naming convention and structure of the page.

```html
<content>
  <h1>404 Not Found</h1>
  <p>The page you are looking for does not exist.</p>
  <NavLink to="/">Go to Home</NavLink>
</content>

<script>
  // You can add any JavaScript code to handle the NotFound page logic
  console.log("This is the NotFound page.");
</script>

<style>
  /* Add any styles for the NotFound page */
  h1 {
    color: red;
  }
  p {
    font-size: 18px;
  }
</style>
```

## Server

PigletJS's server-side structure is designed to handle API requests and server-side logic.
It is located in the `server` directory of your PigletJS application.

### index.mjs

The only file that is required in the `server` directory is the `index.mjs` file,
which is the entry point for your server-side code.

It should import the `server` module from `@Piglet/libs/server` and start the server on a specified port.

```javascript
import server from "@Piglet/libs/server";
import CONST from "@Piglet/misc/CONST";

server.listen(CONST.PORT, () => {
  console.log("Server is ready!");
});
```

Except for the `index.mjs` file, you can create any number of files in the `server` directory to handle your server-side logic.

### API directory :id=api-directory

For API endpoints, you should create a directory named `api` inside the `server` directory.
This directory will contain your API controllers, which are responsible for handling API requests and returning responses.

API is based on the concept of controllers, which are JavaScript modules that export a function to handle the request and response.
The API directory has a directory-based routing system, which means that the directory structure of the `api` directory determines the API endpoints.

That means, if you have a directory structure like this:

```
server/
  api/
    users/
      controller.mjs
    products/
      controller.mjs
```

You can access the API endpoints as follows:

```
(HTTP method) /api/users
(HTTP method) /api/products
```

Or even better with PigletJS's `$api` function:

```javascript
const users = await $api("/users");
const products = await $api("/products");
```

### controller.mjs :id=controller-mjs

Each API endpoint should have a `controller.mjs` file that exports a function to handle the request and response.
For now, `get`, `post` and other HTTP methods should be handled in the same `controller.mjs` file
(of course, you can create separate files for each method if you prefer, but you will need to create a conditional check by yourself in the `controller.mjs` file).

```javascript
export default async (req, res) => {
  if (req.method === "GET") {
    // Handle GET request
    res.json({ message: "Hello from GET!" });
  } else if (req.method === "POST") {
    // Handle POST request
    const data = await req.json();
    res.json({ message: "Hello from POST!", data });
  } else {
    // Handle other methods
    res.status(405).json({ error: "Method not allowed" });
  }
};
```
