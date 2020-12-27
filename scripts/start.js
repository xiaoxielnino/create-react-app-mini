process.env.NODE_ENV = 'development';

const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.config.dev');
const execSync = require('child_process').execSync;
const open = require('open');
const { existsSync } = require('fs');

// TODO: hide this behind a flag and eliminate dead code on eject.
// This shouldn't be exposed to the user.
let handleCompile;
const isSmokeTest = process.argv.some( arg =>
  arg.indexOf('--smoke-test') > -1
);
if(isSmokeTest) {
  handleCompile = function(err, stats) {
    if(err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

const friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASynctaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}


// This is a little hacky
// It would be easier if webpack provided a rich error object.

function formatMessage(message) {
  return message
    .replace(
      'Module build failed: SyntaError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f')
}

const compiler = webpack(config. handleCompile);
compiler.plugin('invalid', function () {
  clearConsole();
  console.log('Compiling...');
})
compiler.plugin('done', function(stats) {
  clearConsole();
  const hasErrors = stats.hasErrors();
  const hasWarnings = stats.hasWarnings();
  if(!hasErrors && !hasWarnings) {
    console.log(chalk.green('Compiled successfully!'));
    console.log();
    console.log('The app is running at http://localhost:3000/');
    console.log();
    return;
  };

  const json = stats.toJson();
  const formattedErrors = json.errors.map(message =>
    'Error in ' + formatMessage(message)
  );
  const formattedWarnings = json.warnings.map(message =>
    'Warning in ' + formatMessage(message)
  );
  if (hasErrors) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    if (formattedErrors.some(isLikelyASyntaxError)) {
      // If there are any syntax errors, show just them.
      // This prevents a confusing ESLint parsing error
      // preceding a much more useful Babel syntax error.
      formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
    }
    formattedErrors.forEach(message => {
      console.log(message);
      console.log();
    });
    // If errors exist, ignore warnings.
    return;
  }

  if (hasWarnings) {
    console.log(chalk.yellow('Compiled with warnings.'));
    console.log();
    formattedWarnings.forEach(message => {
      console.log(message);
      console.log();
    });

    console.log('You may use special comments to disable some warnings.');
    console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
    console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
  }
})

function openBrowser() {
  if(process.platform === 'darwin') {
    try {
      // try out best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      existsSync('ps cax | grep "Google Chrome"');
      execSync(
        'osascript ' +
        path.resolve(__dirname, './openChrome.applescript') +
        ' http://localhost:3000/'
      );
      return;
    } catch(err) {
      // ignore errors
    }
  }
  open('http://localhost:3000/');
}

new WebpackDevServer(webpack(config), {
  historyApiFallback: true,
  hot: true,
  publicPath: config.output.publicPath,
  quiet: true
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }
  clearConsole();
  console.log(chalk.cyan('Starting the development server...'));
  console.log();
  openBrowser();
});
