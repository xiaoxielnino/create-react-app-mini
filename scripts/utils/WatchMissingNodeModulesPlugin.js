const { Compilation } = require("webpack");

function WatchMissingNodeModulesPlugin(nodeModulesPath) {
  this.nodeModulesPath = nodeModulesPath;
}

WatchMissingNodeModulesPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    var missingDeps = compilation.missingDependencies;
    var nodeModulesPath = this.nodeModulesPath;

    if(missingDeps.some(file => file.indexOf(nodeModulesPath) !== -1)) {
      compilation.contextDependencies.push(nodeModulesPath);
    }

    callback();
  })
}

module.exports = WatchMissingNodeModulesPlugin;
