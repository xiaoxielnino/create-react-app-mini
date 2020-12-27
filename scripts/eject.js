const fs = require('fs');
const path = require('path');
const rl = require('readline');

const promt = function(question, cb) {
  const rlInterface = rl.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rlInterface.question(question + '\n', function(answer) {
    rlInterface.close();
    cb(answer);
  })
}

promt('Are you sure you want to eject? This action is permanent. [y/N]', function(answer) {
  const shouldEject = answer && (
    answer.toLowerCase() === 'y' ||
    answer.toLowerCase() === 'yes'
  );
  if(!shouldEject) {
    console.log('Close one! Eject aborted.');
    process.exit(1);
  }
  console.log('Ejecting...');
  console.log();

  const selPath = path.join(__dirname, '..');
  const hostPath = path.join(selPath, '..', '..');
  const files = [
    path.join('config', 'babel.dev.js'),
    path.join('config', 'babel.prod.js'),
    path.join('config', 'flow', 'css.js.flow'),
    path.join('config', 'flow', 'file.js.flow'),
    path.join('config', 'eslint.js'),
    path.join('config', 'webpack.config.dev.js'),
    path.join('config', 'webpack.config.prod.js'),
    path.join('scripts', 'build.js'),
    path.join('scripts', 'start.js'),
    path.join('scripts', 'openChrome.applescript')
  ];
  // Ensure that the host folder is clean and we won't override any files
  files.forEach(file => {
    if(fs.existsSync(path.join(hostPath, file))) {
      console.error(
        '`' + file + '` already exists in your app folder. We cannot ' +
        'continue as you would lose all the changes in that file or directory. ' +
        'Please delete it (maybe make a copy for backup) and run this ' +
        'command again.'
      );
      process.exit(1);
    }
  });

  fs.mkdirSync(path.join(hostPath, 'config'));
  fs.mkdirSync(path.join(hostPath, 'config', 'flow'));
  fs.mkdirSync(path.join(hostPath, 'scripts'));

  files.forEach(file => {
    console.log('Copying ' + file + ' to ' + hostPath);
    var content = fs
      .readFileSync(path.join(selfPath, file), 'utf8')
      // Remove license header from JS
      .replace(/^\/\*\*(\*(?!\/)|[^*])*\*\//, '')
      // Remove license header from AppleScript
      .replace(/^--.*\n/gm, '')
      .trim() + '\n';
    fs.writeFileSync(path.join(hostPath, file), content);
  })
  console.log();

  const selfPackage = require(path.join(selfPath, 'package.json'));
  const hostPackage = require(path.join(hostPath, 'package.json'));

  console.log('Removing dependency: react-scripts');
  delete hostPackage.devDependencies['react-scripts'];

  Object.keys(selfPackage.dependencies).forEach(function (key) {
    // For some reason optionalDependencies end up in dependencies after install
    if (selfPackage.optionalDependencies[key]) {
      return;
    }
    console.log('Adding dependency: ' + key);
    hostPackage.devDependencies[key] = selfPackage.dependencies[key];
  });

  console.log('Updating scripts');
  Object.keys(hostPackage.scripts).forEach(function (key) {
    hostPackage.scripts[key] = 'node ./scripts/' + key + '.js'
  });
  delete hostPackage.scripts['eject'];

  console.log('Writing package.json');
  fs.writeFileSync(
    path.join(hostPath, 'package.json'),
    JSON.stringify(hostPackage, null, 2)
  );
  console.log();

  console.log('Running npm install...');
  rimrafSync(selfPath);
  spawnSync('npm', ['install'], {stdio: 'inherit'});
  console.log('Ejected successfully!');
  console.log();

  console.log('Please consider sharing why you ejected in this survey:');
  console.log('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1');
  console.log();
})
