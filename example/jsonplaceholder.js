const axiosParallel = require('axios-parallel');

// Debug
const { performance } = require('perf_hooks');
const { writeFileSync } = require('fs');

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

    writeFileSync('example.response.json', JSON.stringify(response), {
      encoding: 'utf8'
    });
  } catch (error) {
    throw new Error(error);
  }

  const end = performance.now() - start;
  console.log(`Execution time: ${end}ms`);
})();
