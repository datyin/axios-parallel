# Send Asynchronous Requests
Send multiple asynchronous requests using [Axios](https://github.com/axios/axios), [Async](https://caolan.github.io/async/v3/docs.html#parallelLimit) &amp; [Workers](https://nodejs.org/api/worker_threads.html) in NodeJS

> NOTE: This module is meant for [Node.JS](https://nodejs.org/) applications, not Web Browser.

# Installation
`npm install axios-parallel --save`

# Usage
```javascript
const axiosParallel = require('axios-parallel');
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
    const MAX_ASYNC_REQUEST_PER_CPU = 30;
    const response = await axiosParallel(requests, MAX_ASYNC_REQUEST_PER_CPU);

    writeFileSync('example.response.json', JSON.stringify(response), {
      encoding: 'utf8'
    });
  } catch (error) {
    throw new Error(error);
  }

  console.log('Done');
})();
```