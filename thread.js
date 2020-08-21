const axios = require('axios');
const { parallelLimit } = require('async');
const { parentPort } = require('worker_threads');

function prepare(input) {
  const tasks = [];

  if (input && Array.isArray(input)) {
    input.forEach((request) => {
      if (!request.url || !request.url.trim()) {
        return;
      }

      tasks.push(function (callback) {
        axios(request)
          .then((response) => {
            callback(null, {
              request,
              data: response.data,
              headers: response.headers,
              status: {
                code: response.status,
                text: response.statusText
              }
            });
          })
          .catch((error) => {
            callback(null, { request, error });
          });
      });
    });
  }

  return tasks;
}

parentPort.once('message', (data) => {
  const tasks = prepare(data.requests);

  if (tasks.length) {
    parallelLimit(tasks, data.limit, (_error, results) => {
      parentPort.postMessage(results);
    });
  }
});
