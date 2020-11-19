const { isPlainObject, clone } = require('lodash');
const { resolve } = require('path');
const { writeJsonSync } = require('fs-extra');
const webpackConfig = require('../webpack.config');
const package = require('../package.json');

function generateWebpackConfig(args) {
  if (!isPlainObject(webpackConfig)) {
    return {
      target: 'node12.19',
      mode: 'development',
      node: {
        global: false,
        __filename: false,
        __dirname: false
      }
    };
  }

  if (args.dev) {
    webpackConfig.mode = 'development';
    webpackConfig.watch = true;

    if (!webpackConfig.watchOptions) {
      webpackConfig.watchOptions = {
        aggregateTimeout: 200,
        ignored: ['node_modules/**', 'compiler.js']
      };
    } else {
      if (!webpackConfig.watchOptions.ignored) {
        webpackConfig.watchOptions.ignored = ['node_modules/**', 'compiler.js'];
      }
    }
  } else {
    webpackConfig.mode = 'production';
    webpackConfig.watch = false;
  }

  if (!webpackConfig.output || !webpackConfig.path) {
    webpackConfig.output = {
      path: resolve(__dirname, '..', 'dist'),
      filename: '[name].js',
      libraryTarget: 'commonjs2'
    };
  }

  return webpackConfig;
}

function generatePackage(args, stats) {
  const productionPackage = clone(package);

  if (productionPackage.scripts) delete productionPackage.scripts;
  if (productionPackage.dependencies) delete productionPackage.dependencies;
  if (productionPackage.devDependencies) delete productionPackage.devDependencies;

  const externalModules = stats.modules
    .filter((m) => m.identifier && m.identifier.startsWith('external '))
    .map((m) => m.name.replace('external ', '').replace(/"/g, ''));

  const dependencies = {};

  externalModules.forEach((p) => {
    if (package.dependencies && package.dependencies[p]) {
      dependencies[p] = package.dependencies[p];
    }
  });

  productionPackage.dependencies = dependencies;

  try {
    writeJsonSync(`${stats.outputPath}/package.json`, productionPackage, {
      spaces: 2,
      encoding: 'utf8'
    });
  } catch (error) {
    console.log('Failed to write package.json', error.message);
  }
}

module.exports.webpack = generateWebpackConfig;
module.exports.package = generatePackage;
