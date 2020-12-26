#!/usr/bin/env node
const path = require('path');
const spawn = require('cross-spawn');
const script = process.argv[2];
const args = process.argv.slice(3);

switch(script) {
  case 'build':
  case 'start':
  case 'eject':
    spawn(
      'node',
      [path.resolve(__dirname, '..', 'scripts', script)].concat(args),
      {stdio: 'inherit'}
    );
    break;
  default:
      console.log(`Unknow script ${script} .`);
      console.log('Perhaps you need to update react-scripts?');
      break;
}
