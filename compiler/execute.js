const chalk = require('chalk');
const { spawn } = require('child_process');
const { pathExistsSync } = require('fs-extra');
const { trim, forEach } = require('lodash');
const { resolve, normalize } = require('path');

const prefix = chalk`[{magenta Execute}]`;
const errorPrefix = chalk`[{red ERROR}]`;

let child = null;

module.exports = async function (args, stats) {
  let entry = trim(args.entry);

  if (entry && !entry.endsWith('.js')) {
    entry = `${entry}.js`;
  }

  let path = '';

  if (entry && pathExistsSync(`${stats.outputPath}/${entry}`)) {
    path = `${stats.outputPath}/${entry}`;
  } else if (pathExistsSync(`${stats.outputPath}/index.js`)) {
    path = `${stats.outputPath}/index.js`;
  } else if (pathExistsSync(`${stats.outputPath}/main.js`)) {
    path = `${stats.outputPath}/main.js`;
  } else if (pathExistsSync(`${stats.outputPath}/app.js`)) {
    path = `${stats.outputPath}/app.js`;
  }

  if (!path) {
    console.log(prefix, errorPrefix, 'Failed to find entry point to be executed!');
    return;
  }

  path = normalize(path);

  if (child) {
    console.log(prefix, chalk`Restarting script {greenBright.bold ${path}}`);
    child.stdin.pause();
    child.kill();
  } else {
    console.log(prefix, chalk`Starting script {greenBright.bold ${path}}`);
  }

  const arguments = [path];

  forEach(args, (value, index) => {
    if (index !== '_' && index !== '$0') {
      arguments.push(`--${index}=${value}`);
    }
  });

  child = spawn(args._[0], arguments, {
    cwd: resolve(__dirname, '..'),
    encoding: 'utf8'
  });

  child.stderr.on('data', (data) =>
    console.log(prefix, errorPrefix, chalk`{red ${data.toString()}}`)
  );

  child.stdout.on('data', (data) => console.log(prefix, data.toString()));
  child.on('close', (code) => console.log(prefix, `Process closed with code ${code}`));
};
