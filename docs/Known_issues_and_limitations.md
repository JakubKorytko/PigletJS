## PigletJS is a work in progress, and there are some known issues and limitations that you should be aware of:
<p id="top" style="position: absolute; top: -50px"></p>

- **Browser Compatibility**: PigletJS is designed to work with modern browsers. It may not function correctly in older browsers or those that do not support ES6 features.
- **Types**: Types are not fully implemented yet. This means that some features may not have type definitions, and you may encounter issues when using TypeScript or other type-checking tools.
- **IDE Support**: PigletJS does not have full IDE support yet. This means that features like auto-completion, linting, and error checking may not work as expected in your development environment.
- **Piglet global object**: Currently all the state is stored in the `Piglet` global object. This should be changed in the future to allow for better encapsulation and modularity.
It also contains some properties that should be easily accessible such as `allowDebugging` which disables browser extension when set to `false`, `enableCoreLogs` for production builds or `types` that allows you to access the types of PigletJS components.
You can still do it, but you would need to either set `window.Piglet` properties one by one (to avoid removing state & other props) or edit `PigletJS/browser/config.mjs` file directly which is not ideal.
- **Cloning components that contain PigletJS components**: Cloning components that contain PigletJS components may not work as expected. This is due to the way PigletJS handles component instances and their state.
- **Navigation go back**: When navigating back to route that is missing, the page is not changed.
- **Pure attributes are lowercase**: When using pure attributes, they are converted to lowercase due to the way HTML attributes are handled in the browser. This may cause issues if you rely on case-sensitive attribute names.
- **Custom paths resolver**: The custom paths resolver (`@/src/`, `@/server/`) is not fully tested and implement in all places yet. You may encounter issues when using these paths in your project. `resolvePath` function is also not available in PigletJS scripts yet.
- **<span style='color: red'>CRITICAL:</span> Pig svg icon has orange border**: The PigletJS icon has an orange border in the SVG format if it is big enough. This needs to be fixed ASAP.
