const axios = require('axios');

const validateEvent = (event) => {
  if (event === null || event === undefined) {
    return [];
  }
  return Array.isArray(event) ? event : [event];
};

class WebpackWebhooksPlugin {
  constructor({ options, events }) {
    this.options = {
      proxy: options.proxy || {},
      timeout: options.timeout || 0,
    };

    this.events = {
      beforeRun: validateEvent(events.beforeRun),
      watchRun: validateEvent(events.watchRun),
      success: validateEvent(events.success),
      error: validateEvent(events.error),
    };

    this.beforeRunHook = this.beforeRunHook.bind(this);
    this.watchRunHook = this.watchRunHook.bind(this);
    this.doneHook = this.doneHook.bind(this);
    this.post = this.post.bind(this);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('WebpackWebhooksPlugin', this.beforeRunHook);
    compiler.hooks.watchRun.tapAsync('WebpackWebhooksPlugin', this.watchRunHook);
    compiler.hooks.done.tapAsync('WebpackWebhooksPlugin', this.doneHook);
  }

  async post(event) {
    const config = {
      ...event,
      proxy: this.options.proxy,
      timeout: this.options.timeout,
      method: 'POST',
    };

    try {
      const response = await axios(config);
      console.log(
        '\x1b[32m%s\x1b[0m %s',
        '[Webhooks]', // Text color: Green
        `${config.url} [Status: ${response.status} ${response.statusText}]`,
      );
    } catch (error) {
      console.log(
        '\x1b[31m%s\x1b[0m %s',
        '[Webhooks]', // Text color: Red
        `${config.url} [Message: ${error.message}]`,
      );
    }
  }

  async beforeRunHook(compiler, callback) {
    const promiseArray = this.events.beforeRun.map((event) => this.post(event));
    await Promise.allSettled(promiseArray);
    callback();
  }

  async watchRunHook(compiler, callback) {
    const promiseArray = this.events.watchRun.map((event) => this.post(event));
    await Promise.allSettled(promiseArray);
    callback();
  }

  async doneHook(stats, callback) {
    const events = [];
    if (stats.hasErrors()) {
      events.push(...this.events.error);
    } else {
      events.push(...this.events.success);
    }

    const promiseArray = events.map((event) => this.post(event));
    await Promise.allSettled(promiseArray);
    callback();
  }
}

module.exports = WebpackWebhooksPlugin;
