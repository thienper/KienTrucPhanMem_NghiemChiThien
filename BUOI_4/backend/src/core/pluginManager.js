class PluginManager {
  constructor(context) {
    this.context = context;
    this.plugins = [];
  }

  register(plugin) {
    this.plugins.push(plugin);
  }

  boot() {
    this.plugins.forEach((plugin) => {
      if (typeof plugin.register === 'function') {
        plugin.register(this.context);
      }
    });
  }
}

module.exports = PluginManager;
