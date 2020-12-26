const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');

module.exports = function (hostPath, appName, verbose) {
  const selfPath = path.join(hostPath + 'node_modules', 'react-scripts');

  const hostPackage = require(path.join(hostPath, 'package.json'));
  const selfPackage = require(path.join(selfPath, 'package.json'));

  // copy over some of the devDependencies
  hostPackage.dependencies = hostPackage.dependencies || {};
  ['react', 'react-dom'].forEach(function (key) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key];
  })

  // setup the script rules
  hostPackage.scripts = {};
  ['start', 'build', 'eject'].forEach(function(command) {
    hostPackage.scripts[command] = 'react-scripts ' + command ;
  })

  fs.writeFileSync(hostPath + '/package.json', JSON.stringify(hostPackage, null, 2));

  // TODO: run npm install in hostPath, (not needed for npm 3 if we accept some hackery)

  // Move the src folder
  fs.renameSync(selfPath + '/src', hostPath + '/src');

  console.log('Creating the app', appName, 'at', hostPath);
}
