## Navigation in JavaScript :id=navigation
<p id="top" style="position: absolute; top: -50px"></p>

PigletJS provides a simple way to navigate between pages using the `$navigate` function inside your components.
This function allows you to change the current page by specifying the path you want to navigate to.

```javascript
$navigate("/path/to/page");
```

**Note:** The path should be relative to the root of your application, and it should not include the domain or protocol.
You can't use `$navigate` to navigate to external URLs.

### Why use `$navigate` instead of `window.location.href`, `window.open` and other methods? :id=navigate-why

- `$navigate` is specifically designed for navigation within a PigletJS application, while `window.location.href` is a standard JavaScript method that causes a full page reload.
- Using `$navigate` ensures that the navigation is handled by PigletJS's routing system, which allows for features like client-side navigation, route transitions, and more.
- It does not cause a full page reload, which is important for maintaining the state of your application and providing a smoother user experience.
- It fires a `popstate` event when the navigation occurs, allowing you to handle navigation events in your PigletJS scripts

## API calls

You can use the `$api` function to make API calls in your PigletJS components.
It is a wrapper around the native `fetch` function that provides a simple way to make API calls and handle the response.
The `$api` function can be used only to call your own API endpoints, which are defined in the `server/api` directory of your PigletJS application.

The parameters of the `$api` function are as follows:

#### `path`

This is the relative API endpoint you want to call. It should be a string that represents the path to the API endpoint, relative to the `server/api` directory.
e.g. with a `server/api/users/controller.mjs` file, you can call it using `$api("/users")`.

#### `fetchOptions`

This is an optional parameter that allows you to customize the fetch request. It should be an object that contains the options you want to pass to the `fetch` function, such as headers, method, body, etc.

#### `expect`

This is an optional parameter that specifies the expected response type. It can be one of the following values:

- `"json"`: The response will be parsed as JSON.
- `"text"`: The response will be parsed as text.
- `"blob"`: The response will be parsed as a Blob.
- `"arrayBuffer"`: The response will be parsed as an ArrayBuffer.
- `"formData"`: The response will be parsed as FormData.
- `"raw"`: The response will be returned as is, without any parsing (default).

If you specify any value other than "raw", the response will be automatically parsed and returned in the specified format.

```javascript
const response = await $api(
  "/users",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  },
  "json",
);
```

### Why use `$api` instead of `fetch`? :id=api-why

- `$api` is specifically designed for making API calls to your own PigletJS application's API endpoints, while `fetch` is a standard JavaScript method that can be used to make any HTTP request.
- Using `$api` ensures that the API calls are handled by PigletJS's routing system, which allows for features like automatic parsing of the response, error handling, and more.
- It provides a simple way to make API calls and handle the response, without having to worry about the details of the `fetch` function.
- It automatically handles the response parsing based on the `expect` parameter, making it easier to work with different response types.
- You can avoid writing full URLs for your API endpoints, as `$api` automatically resolves the path relative to the `server/api` directory.
