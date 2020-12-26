const fs = require('fs');

module.exports = function (hostPath, appName) {
  const selfPath = hostPath + '/node_modules/create-react-app-scripts';

  const hostPackage = require(hostPath + '/package.json');
  const selfPackage = require(selfPath + '/package.json');

  // copy over devDependencies
  for(let key in selfPackage.devDependencies) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key]
  }

  // setup the script rules
  hostPackage.scripts = {};
  ['start', 'build'].forEach(function(command) {
    hostPackage.scripts[command] = 'node node_modules/create-react-app-scripts/scripts/' + command + '.js';
  })

  fs.writeFileSync(hostPath + '/package.json', JSON.stringify(hostPackage, null, 2));

  // TODO: run npm install in hostPath, (not needed for npm 3 if we accept some hackery)

  // Move the src folder
  fs.renameSync(selfPath + '/src', hostPath + '/src');

  console.log('Creating the app', appName, 'at', hostPath);
}
