const fs = require('fs-extra');
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

  fs.writeFileSync(
    path.join(hostPath, 'package.json'),
    JSON.stringify(hostPackage, null, 2)
  );

  // copy the files for the user
  fs.copySync(path.join(selfPath, 'template'), hostPath);

  // run another npm install for react and react-dom
  console.log('Installing react and react-dom from npm...');
  // TODO: having to do two npm installs is bad, can we avoid it?
  const args = [
    'install',
    verbose && '--verbose'
  ].filter(function(e) { return e; });
  const proc = spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function(code) {
    if (code !== 0) {
      console.error('`npm ' + args.join(' ') + '` failed');
      return;
    }

    // make sure to display the right way to cd
    let cdpath;
    if(path.join(process.cwd(), appName) === hostPath) {
      cdpath = appName;
    } else {
      cdpath = hostPath;
    }

    console.log('Success! Created ' + appName + ' at ' + hostPath + '.');
    console.log();
    console.log('Inside that directory, you can run several commands:');
    console.log('  * npm start: Starts the development server.');
    console.log('  * npm run build: Bundles the app into static files for production.');
    console.log('  * npm run eject: Removes this tool. If you do this, you can’t go back!');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log('  cd', cdpath);
    console.log('  npm start');
    console.log();
    console.log('Happy hacking!');
  });
};
