#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const semver = require('semver');
const chalk = require('chalk')

const argv = require('minimist')(process.argv.slice(2));

/**
 * Arguments:
 *   --version - to print current version
 *   --verbose - to print logs while init
 *   --scripts-version <alternative package>
 *     Example of valid values:
 *     - a specific npm version: "0.22.0-rc1"
 *     - a .tgz archive from any npm repo: "https://registry.npmjs.org/react-scripts/-/react-scripts-0.20.0.tgz"
 *     - a package prepared with `npm pack`: "/Users/home/vjeux/create-react-app/react-scripts-0.22.0.tgz"
 */
const commands =  argv._;
if(commands.length === 0) {
  if(argv.version) {
    console.log('create-react-app version: ' + require('./package.json').version);
    process.exit();
  }
  console.error('Usage: create-react-app <project-name> [--verbose]');
  process.exit(1);
}
console.log('command---', commands, argv, argv.verbose,);

createApp(commands[0], argv.verbose, argv['script-version']);

function createApp(name, verbose, version) {
  if(fs.existsSync(name)) {
    console.log(`Directory ${name} already exists. Aborting.`);
    process.exit();
  }
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);

  if(!pathExistsSync(name)) {
    fs.mkdirSync(root);
  } else if(!isSafeToCreateProjectIn(root)) {
    console.log(`The directory ${name} contains file(s) that could conflict. Aborting.`);
  }

  console.log(
    'Creating a new React app in ' + root + '.'
  );
  console.log();

  const packageJson = {
    name: appName,
    version: '0.0.1',
    private: true,
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  const originalDirectory = process.cwd();
  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing react-scripts from npm...');
  console.log();

  run(root, appName, version, verbose, originalDirectory)
}

function run(root, appName, version, verbose, originalDirectory) {
  const installPackage =getInstallPackage(version);
  const packageName = getPackageName(installPackage);

  const args = [
    'install',
    verbose && '--verbose',
    '--save-dev',
    '--save-exact',
    installPackage
  ].filter(function(e) { return e;});
  const proc = spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function(code) {
    if(code !== 0) {
      console.error(`npm ${args.join(' ')} failed`);
      return;
    }

    checkNodeVersion(packageName);

    const scriptsPath = path.resolve(
      process.cwd(),
      'node_modules',
      packageName,
      'scripts',
      'init.js'
    );
    const init = require(scriptsPath);
    init(root, appName, verbose, originalDirectory);
  });
}

function getInstallPackage(version) {
  const packageToInstall = 'react-scripts';
  const validSemver = semver.valid(version);
  if(validSemver) {
    packageToInstall += '@' + validSemver;
  } else if(version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall
}

function getPackageName(installPackage) {
  if(~installPackage.indexOf('.tgz')) {
    return installPackage.match(/^.+\/(.+)-.+\.tgz$/)[1];
  } else if(~installPackage.indexOf('@')) {
    return installPackage.split('@')[0];
  }
  return installPackage;
}

function checkNodeVersion(packageName) {
  const packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );
  const packageJson = require(packageJsonPath);
  if(!packageJson.engines || !packageJson.engines.node) {
    return
  }
  if(!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are current running Node %s but React CLI requires %s.' +
        'Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    )
  }
}


function checkAppName(appName) {
  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['react', 'react-dom'];
  const devDependencies = ['react-scripts'];
  const allDependencies = dependencies.concat(devDependencies).sort();

  if(allDependencies.indexOf(appName) > 0) {
    console.error(
      chalk.red(
        'We cannot create a project called `' + appName + '` because a dependency with the same name exists.\n' +
        'Due to the way npm works, the following names are not allowed:\n\n'
      ) +
      chalk.cyan(
        allDependencies.map(function(depName) {
          return '  ' + depName;
        }).join('\n')
      ) +
      chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root) {
  const validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'
  ];
  return fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    })
}

function pathExistsSync(fp) {
  try {
    fs.accessSync(fp);
    return true;
  } catch (err) {
    return false;
  }
}
