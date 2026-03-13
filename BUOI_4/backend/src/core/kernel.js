const PluginManager = require('./pluginManager');
const contentPlugin = require('../plugins/contentPlugin');

function createKernel({ app, dataFilePath }) {
  const context = {
    app,
    dataFilePath,
  };

  const pluginManager = new PluginManager(context);
  pluginManager.register(contentPlugin);

  return {
    boot: () => pluginManager.boot(),
  };
}

module.exports = createKernel;
