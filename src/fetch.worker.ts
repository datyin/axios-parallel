/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Credits: karataev
 * https://github.com/karataev/fetch-data-patterns/blob/master/src/helpers.js
 */
import axios, { AxiosRequestConfig } from 'axios';
import { workerData, parentPort } from 'worker_threads';
import toFinite from './toFinite';

async function fetch(req: AxiosRequestConfig) {
  try {
    const res = await axios(req);
    return { request: req, data: res.data, headers: res.headers };
  } catch (error) {
    return { request: req, error: error.message };
  }
}

async function series(items: AxiosRequestConfig[], fn: any) {
  const result: any[] = [];

  await items.reduce(
    (acc, item) => acc.then(() => fn(item).then((res: any) => result.push(res))),
    Promise.resolve()
  );

  return result;
}

async function fetchAll(requests: AxiosRequestConfig[], chunk_size: number) {
  const chunks: any = [];

  // Validate chunk size
  chunk_size = toFinite(chunk_size) || 25;

  // Chunk Array
  for (let i = 0; i < requests.length; i += chunk_size) {
    chunks.push(requests.slice(i, i + chunk_size));
  }

  let result: any = [];

  await series(chunks, (chunk: AxiosRequestConfig[]) => {
    const promises = chunk.map((item: AxiosRequestConfig) => fetch(item));

    return Promise.all(promises).then((res) => {
      result = result.concat(res);
    });
  });

  return result;
}

if (parentPort) {
  fetchAll(workerData.requests, workerData.limit)
    .then((res: any) => parentPort?.postMessage(res))
    .catch((error: any) => {
      console.log('Thread Worker Failed.', error.message);
      parentPort?.postMessage([]);
    });
}
