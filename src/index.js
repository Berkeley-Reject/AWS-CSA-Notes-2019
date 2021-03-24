const axios = require('axios');

const validateEvent = (event) => {
  if (event === null || event === undefined) {
    return [];
  }
  return Array.isArray(event) ? event : [event];
};

const post = async (event) => {
  const axiosEvent = {
    ...event,
    proxy: this.proxy,
    method: 'POSt',
  };
  try {
    const response = await axios(axiosEvent);
    console.log(response.data.json);
  } catch (error) {
    console.log(error);
  }
};

class WebpackWebhooksPlugin {
  constructor(options) {
    this.beforeRun = validateEvent(options.beforeRun);
    this.success = validateEvent(options.success);
    this.error = validateEvent(options.error);
    this.proxy = options.proxy || {};

    this.beforeRunHook = this.beforeRunHook.bind(this);
    this.doneHook = this.doneHook.bind(this);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('WebpackWebhooksPlugin', this.beforeRunHook);
    compiler.hooks.done.tapAsync('WebpackWebhooksPlugin', this.doneHook);
  }

  async beforeRunHook(compiler, callback) {
    const promiseArray = this.beforeRun.map((event) => post(event));
    await Promise.allSettled(promiseArray);
    callback();
  }

  async doneHook(stats, callback) {
    const events = [];
    if (stats.hasErrors()) {
      events.push(...this.error);
    } else {
      events.push(...this.success);
    }

    const promiseArray = events.map((event) => post(event));
    await Promise.allSettled(promiseArray);
    callback();
  }
}

module.exports = WebpackWebhooksPlugin;
