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
  console.error('Usage: create-react-app <project-name> [--verbose]');
  process.exit(1);
}

if(argv.v || argv.version) {
  console.log('create-react-app: ' +  require('./package.json').version );
  process.exit();
}

createApp(commands[0], argv.verbose, argv['script-version']);

function createApp(name, verbose, version) {
  if(fs.existsSync(name)) {
    console.log(`Directory ${name} already exists. Aborting.`);
    process.exit();
  }
  const root = path.resolve(name);
  const appName = path.basename(root);

  console.log('This will walk you through creating a new React app in', root);

  fs.mkdirSync(root);

  const packageJson = {
    name: appName,
    version: '0.0.1',
    private: true,
  };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson));
  process.chdir(root);

  console.log('Installing create-react-app-scripts package from npm...');

  run(root, appName, version, verbose)
}

function run(root, appName, version, verbose) {
  const args = [
    'install',
    verbose && '--verbose',
    '--save',
    '--save-exacet',
    getInstallPackage(version)
  ].filter(function(e) { return e;});
  const proc = spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function(code) {
    if(code !== 0) {
      console.error(`npm ${args.join(' ')} failed`);
      return;
    }

    const scriptsPath = path.resolve(
      process.cwd(),
      'node_modules',
      'react-scripts',
      'scripts',
      'init.js'
    );
    const init = require(scriptsPath);
    init(root, appName, verbose);
  });
}

function getInstallPackage(version) {
  const packageToInstall = 'create-react-app-scripts';
  const validSemver = semver.valid(version);
  if(validSemver) {
    packageToInstall += '@' + validSemver;
  } else if(version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall
}

function checkNodeVersion() {
  const packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    'create-react-app-scripts',
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
