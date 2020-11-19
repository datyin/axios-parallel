const yargs = require('yargs/yargs');
const webpack = require('webpack');
const config = require('./compiler/config');
const execute = require('./compiler/execute');

const args = yargs(process.argv).argv;
const webpackConfig = config.webpack(args);

webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  const statsInfo = stats.toJson();

  console.log(
    stats.toString({
      chunks: false,
      colors: true
    })
  );

  if (args.dev) {
    execute(args, statsInfo);
  } else {
    config.package(args, statsInfo);
  }
});
