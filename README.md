<div align="center">
<a href="https://github.com/webpack/webpack">
  <img width="200" height="200"
    src="https://webpack.js.org/assets/icon-square-big.svg">
</a>

# Webpack Webhooks Plugin

[![GitHub stars](https://img.shields.io/github/stars/xiaoyang-liu-cs/webpack-webhooks-plugin?style=for-the-badge)](https://github.com/xiaoyang-liu-cs/webpack-webhooks-plugin/stargazers)
[![LICENSE](https://img.shields.io/github/forks/xiaoyang-liu-cs/webpack-webhooks-plugin.svg?style=for-the-badge)](https://github.com/xiaoyang-liu-cs/webpack-webhooks-plugin/network/members)
[![npm downloads](https://img.shields.io/npm/dy/webpack-webhooks-plugin?style=for-the-badge)]()
[![npm package size](https://img.shields.io/bundlephobia/min/webpack-webhooks-plugin?style=for-the-badge)]()

[![forthebadge](https://forthebadge.com/images/badges/built-by-developers.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/winter-is-coming.svg)](https://forthebadge.com)

[Usage](#usage) |
[Example](#example) |
[Releases](https://github.com/xiaoyang-liu-cs/webpack-webhooks-plugin/releases) |
[Buy Me a Coffee](https://www.buymeacoffee.com/xiaoyangliu)

</div>

**Webpack Webhooks Plugin** is a webpack plugin that notifies external services with HTTP POST requests when certain build events happen.

## Installation

Use npm to install this package:

```
npm install --save-dev webpack-webhooks-plugin
```

## Usage

```js
// webpack.config.js

const WebpackWebhooksPlugin = require('webpack-webhooks-plugin');

module.exports = {
  // ...
  plugins: [
    new WebpackWebhooksPlugin(),
  ],
};
```

The `WebpackWebhooksPlugin` constructor accepts an optional object with two fields: `options` and `events`.

### options

```js
new WebpackWebhooksPlugin({
  options: {
    // `proxy` defines the hostname, port, and protocol of the proxy server.
    // default is `null` (disable proxy)
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 1080,
      auth: {
        username: 'admin',
        password: 'test@proxy'
      }
    },

    // `timeout` specifies the number of milliseconds before the request times out.
    // default is `0` (no timeout)
    timeout: 1000,
  },
});
```

### events

We could create request objects to define the details of the HTTP POST request. The `url` parameter is required and the other properties are optional.

```js
// Postman request object
const postman = {
  // The server URL that will be used for the request (required)
  url: 'https://postman-echo.com/post',

  // Custom headers to be sent (optional)
  headers: {
    'Content-Type': 'application/json',
  },

  // The URL parameters to be sent with the request (optional)
  params: {
    id: 114514
  },

  // The data to be sent as the request body (optional)
  data: {
    status: 'Hey, Postman!',
  },
};
```

The plugin supports sending requests when these events occurs:

- `beforeRun`: Send requests before running the compiler.
- `watchRun`: Send requests before running the compiler during watch mode.
- `success`: Send requests when the compilation has completed successfully.
- `error`: Send requests when the compilation fails.

Each event accepts a request object or an array of request objects. All request objects in the array will be called parallelly by `Promise.allSettled`.

```js
new WebpackWebhooksPlugin({
  events: {
    beforeRun: postman,
    success: [postman, postman],
  },
});
```

## Example

```js
// webpack.config.js

const WebpackWebhooksPlugin = require('../src/index');

const postman = {
  url: 'https://postman-echo.com/post',
  headers: {
    'Content-Type': 'application/json',
  },
  data: {
    status: 'Hey, Postman!',
  },
};

const httpbin = {
  url: 'https://httpbin.org/post',
  headers: {
    'Content-Type': 'application/json',
  },
  data: {
    message: 'Hello, httpbin!',
  },
}

const config = {
  options: {
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 1080,
    },
    timeout: 1000,
  },

  events: {
    success: postman,
    fail: [postman, httpbin],
  },
};

module.exports = {
  // ...
  plugins: [
    new WebpackWebhooksPlugin(config),
  ],
};
```
