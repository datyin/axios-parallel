const axiosParallel = require('../dist/index.js');
const { writeFileSync } = require('fs');

console.log('Start...');

(async () => {
  const start = new Date();
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
    const MAX_ASYNC_REQUEST_PER_CPU = 30;
    const response = await axiosParallel(requests, MAX_ASYNC_REQUEST_PER_CPU);

    writeFileSync('example.response.json', JSON.stringify(response), {
      encoding: 'utf8'
    });
  } catch (error) {
    throw new Error(error);
  } finally {
    const end = new Date() - start;
    console.log(`Execution time: ${end}ms`);
  }
})();
