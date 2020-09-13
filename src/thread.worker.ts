import axios from 'axios';
import { parentPort } from 'worker_threads';
import { AxiosRequestConfig } from 'axios';
import { DEFAULT_ASYNC_REQUEST_LIMIT, toFinite } from './common';

const fetch = (req: AxiosRequestConfig) => {
  return axios(req)
    .then((res) => {
      return { request: req, data: res.data, headers: res.headers };
    })
    .catch((error) => {
      return { request: req, error: error.message };
    });
};

function series(items: AxiosRequestConfig[], fn: any) {
  let result: any = [];

  return items
    .reduce((acc, item) => acc.then(() => fn(item).then((res: any) => result.push(res))), Promise.resolve())
    .then(() => result);
}

function fetchAll(requests: AxiosRequestConfig[], chunk_size: number) {
  const chunks: any = [];

  // Validate chunk size
  chunk_size = toFinite(chunk_size) || DEFAULT_ASYNC_REQUEST_LIMIT;

  // Chunk Array
  for (let i = 0; i < requests.length; i += chunk_size) {
    chunks.push(requests.slice(i, i + chunk_size));
  }

  let result: any = [];

  return series(chunks, (chunk: AxiosRequestConfig[]) => {
    const promises = chunk.map((item: AxiosRequestConfig) => fetch(item));

    return Promise.all(promises).then((res) => {
      result = result.concat(res);
    });
  }).then(() => result);
}

if (parentPort) {
  const pp = parentPort;

  pp.once('message', (data) => {
    fetchAll(data.requests, data.limit)
      .then((res: any) => pp.postMessage(res))
      .catch((error: any) => {
        console.log('Thread Worker Failed.', error.message);
        pp.postMessage([]);
      });
  });
} else {
  console.log('no parentPort');
}
