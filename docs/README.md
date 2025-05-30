<img alt="Piglet icon" src="./favicon.svg">

# PigletJS

PigletJS is a modern JavaScript framework for building dynamic web applications with a focus on component-based architecture. It simplifies the development process by providing a structured and scalable way to handle components, routing, and state management.

## Features

- **Component-Based Architecture**: Build your application using reusable and maintainable components.
- **Custom Web Components**: Easily create custom elements and manage them with the framework's internal tooling.
- **Real-Time Hot Reloading**: Automatically reloads components during development for faster feedback.
- **State Management**: Integrated state tracking and management to keep your components in sync.
- **Custom Route Handlers**: Seamless integration for custom routes such as API endpoints, components, and pages.
- **Built-In Development Server**: Includes a server that watches for file changes and reloads the application automatically.

## Installation

PigletJS does not use `node_modules`, so you don’t need to worry about installing dependencies via `npm` or `yarn`. The only requirement is that you have **Node.js** installed.

You can download and install Node.js from the [official website](https://nodejs.org/).

Once Node.js is installed, you can start using PigletJS directly.

```bash
git clone https://github.com/JakubKorytko/PigletJS
node PigletJS/setup.mjs
```

And that's it!

## Usage

To start the App & Server, run the following command in project root directory:

```bash
node start.mjs
```

## CLI Commands

- `r` - Reloads the components and regenerates the build.
- `s` - Restarts the development server.
- `Ctrl+C` - Shuts down the server.

## License

PigletJS is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
