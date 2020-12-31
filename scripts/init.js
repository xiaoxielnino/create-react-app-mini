const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
const pathExists = require('path-exists');
const chalk = require('chalk');

module.exports = function (appPath, appName, verbose, originalDirectory) {
  const ownPath = path.join(appPath + 'node_modules', 'react-scripts');

  const appPackage = require(path.join(appPath, 'package.json'));

  // copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  // setup the script rules
  appPackage.scripts = {
    'start': 'react-scripts start',
    'build': 'react-scripts build',
    'test': 'react-scripts test --env=jsdom',
    'eject': 'react-scripts eject'
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  const readmeExists = pathExists.sync(path.join(appPath, 'README.md'));
  if(readmeExists) {
    fs.renameSync(path.join(appPath, 'README.md'), path.join(appPath, 'README.old.md'));
  }

  // copy the files for the user
  fs.copySync(path.join(ownPath, 'template'), appPath);

  fs.move(path.join(appPath,'gitignore'), path.join(appPath, '.gitignore'), [], function(err) {
    if(err) {
      if(err.code === 'EEXIST') {
        const data = fs.readFileSync(path.join(appPath, 'gitignore'));
        fs.appendFileSync(path.join(appPath, 'gitignore'), data);
        fs.unlinkSync(path.join(appPath, 'gitignore'));
      } else {
        throw err;
      }
    }
  });

  // run another npm install for react and react-dom
  console.log('Installing react and react-dom from npm...');
  // TODO: having to do two npm installs is bad, can we avoid it?
  const args = [
    'install',
    'react',
    'react-dom',
    '--save',
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
    if(originalDirectory && path.join(originalDirectory, appName) === appPath) {
      cdpath = appName;
    } else {
      cdpath = appPath;
    }

    console.log();
    console.log('Success! Created ' + appName + ' at ' + appPath + '.');
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log(chalk.cyan('  npm start'));
    console.log('    Starts the development server.');
    console.log();
    console.log(chalk.cyan('  npm run build'));
    console.log('    Bundles the app into static files for production.');
    console.log();
    console.log(chalk.cyan('  npm test'));
    console.log('    Starts the test runner.');
    console.log();
    console.log(chalk.cyan('  npm run eject'));
    console.log('    Removes this tool and copies build dependencies, configuration files');
    console.log('    and scripts into the app directory. If you do this, you can’t go back!');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log('  ' + chalk.cyan('npm start'));
    if (readmeExists) {
      console.log();
      console.log(chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`'));
    }
    console.log();
    console.log('Happy hacking!');
  });
};
