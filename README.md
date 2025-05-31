<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./templates/exampleApp/src/public/images/favicon.svg">
  <source media="(prefers-color-scheme: light)" srcset="./templates/exampleApp/src/public/images/favicon_white.svg">
  <img alt="Piglet icon" src="./templates/exampleApp/src/public/images/favicon.svg">
</picture>

# [Official documentation](https://jakubkorytko.github.io/PigletJS)

## Why PigletJS?

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
- **Small size**: PigletJS is designed to be lightweight, with a small footprint that makes it easy to include in your projects. It currently does not have production build, but even now, setup script result is around **100KB**.
This can, and will, be reduced in the future by removing unnecessary features and optimizing the code. Production build will also be available in the future that could even halve the size of the framework by removing hot reload, watcher etc.
</details>

### Okay then, it is simple, small, and easy to use, but why should I use it instead of other frameworks?

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

## License

PigletJS is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
