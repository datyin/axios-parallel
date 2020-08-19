const { cpus } = require('os');
const { Worker } = require('worker_threads');
const { existsSync } = require('fs');

function chunkify(array) {
  const result = [];

  for (let i = cpus().length; i > 0; i--) {
    const data = array.splice(0, Math.ceil(array.length / i));

    if (data && data.length) {
      result.push(data);
    }
  }

  return result;
}

/**
 * Send Requests
 *
 * @param {array} requests
 * @param {number} limit requests per cpu (default: 30)
 * @return {array}
 */
function onRequest(requests, limit = 30) {
  return new Promise((resolve) => {
    const workerFile = `${__dirname}/thread.js`;

    if (!existsSync(workerFile)) {
      throw new Error('[Axios Parallel] Missing worker file:', workerFile);
    }

    let done = 0;

    const data = [];
    const groups = chunkify(requests);

    if (groups.length) {
      groups.forEach((group) => {
        const worker = new Worker(workerFile);

        worker.once('message', (response) => {
          if (response && Array.isArray(response) && response.length) {
            response.forEach((res) => data.push(res));
          }
        });

        worker.once('exit', () => {
          worker.unref();
          done++;

          if (done === groups.length) {
            resolve(data);
          }
        });

        worker.postMessage({
          requests: group,
          limit: limit
        });
      });
    } else {
      resolve(data);
    }
  });
}

module.exports = onRequest;
