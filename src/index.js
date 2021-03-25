const axios = require('axios');

const validateEvent = (event) => {
  if (event === null || event === undefined) {
    return [];
  }
  return Array.isArray(event) ? event : [event];
};

class WebpackWebhooksPlugin {
  constructor({ options, events }) {
    this.options = {};
    this.options.proxy = options.proxy || {};

    this.events = {};
    this.events.beforeRun = validateEvent(events.beforeRun);
    this.events.success = validateEvent(events.success);
    this.events.error = validateEvent(events.error);

    this.beforeRunHook = this.beforeRunHook.bind(this);
    this.doneHook = this.doneHook.bind(this);
    this.post = this.post.bind(this);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('WebpackWebhooksPlugin', this.beforeRunHook);
    compiler.hooks.done.tapAsync('WebpackWebhooksPlugin', this.doneHook);
  }

  async post(event) {
    const config = {
      ...event,
      proxy: this.options.proxy,
      method: 'POST',
    };

    try {
      const response = await axios(config);
      console.log(response.data.json);
    } catch (error) {
      console.log(error);
    }
  }

  async beforeRunHook(compiler, callback) {
    const promiseArray = this.events.beforeRun.map((event) => this.post(event));
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
