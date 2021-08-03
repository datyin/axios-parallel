/* eslint-disable @typescript-eslint/no-var-requires */
let axiosParallel = null;

try {
  axiosParallel = require('../bundle/index');
} catch (ex) {
  /* */
}

try {
  axiosParallel = require('../dist/index');
} catch (ex) {
  /* */
}

if (!axiosParallel) {
  console.error('Failed to find axios module');
  process.exit(1);
}

// Debug
const { performance } = require('perf_hooks');
const { writeFileSync } = require('fs');
const { join } = require('path');

const EXAMPLE_PATH = join(__dirname, 'example.response.json');

console.log('Start...');

(async () => {
  const start = performance.now();
  const requests = [];

  // https://jsonplaceholder.typicode.com/posts
  for (let id = 1; id <= 100; id++) {
    // https://github.com/axios/axios#axios-api
    requests.push({
      method: 'GET',
      url: `https://jsonplaceholder.typicode.com/posts/${id}`
    });
  }

  try {
    const MAX_PARALLEL_REQUEST_PER_CPU = 30;
    const response = await axiosParallel(requests, MAX_PARALLEL_REQUEST_PER_CPU);

    writeFileSync(EXAMPLE_PATH, JSON.stringify(response), { encoding: 'utf8' });
  } catch (error) {
    throw new Error(error);
  }

  const end = performance.now() - start;
  console.log(`Execution time: ${end}ms`);
})();
