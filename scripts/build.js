process.env.NODE_ENV = 'production';

const spawnSync = require('child_process').spawnSync;
const webpack = require('webpack');
const config = require('../webpack.config.prod');

const relative = process.argv[2] === 'local' ? '.' : '../..';
spawnSync('rm', ['-rf', relative + '/build']);

webpack(config).run(function(err, stats) {
  if(err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Build successfully generated in the build/ folder');
})
