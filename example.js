const axiosParallel = require('./index');
const { writeFileSync } = require('fs');

console.log('Start...');

(async () => {
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
    // Send 30 Parallel Requests per CPU
    const response = await axiosParallel(requests, 30);

    writeFileSync('example.response.json', JSON.stringify(response), {
      encoding: 'utf8'
    });
  } catch (error) {
    throw new Error(error);
  }

  console.log('Done');
})();
