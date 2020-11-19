/* eslint-disable @typescript-eslint/no-explicit-any */
import { cpus } from 'os';
import axios, { AxiosRequestConfig } from 'axios';
import { Worker } from 'worker_threads';
import * as path from 'path';
import toFinite from './toFinite';

const CPUs = cpus().length || 1;
const WORKER_PATH = path.resolve(__dirname, 'fetch.worker.js');

interface FetchResponse {
  request: AxiosRequestConfig;
  data?: any;
  headers?: any;
  error?: string;
}

function fetch(
  input: AxiosRequestConfig | AxiosRequestConfig[],
  limit = 25
): Promise<FetchResponse[]> {
  return new Promise((resolve) => {
    if (!Array.isArray(input)) {
      input = [input];
    }

    // Validate requests
    const requests: AxiosRequestConfig[] = input.filter((req) => req?.url?.trim() !== '');

    if (!requests.length) {
      console.error('[Fetch] Empty or not valid input.');
      return resolve([]);
    }

    if (requests.length > 1) {
      const threads = [];

      // Chunk
      for (let i = CPUs; i > 0; i--) {
        const group = requests.splice(0, Math.ceil(requests.length / i));

        if (group.length) {
          threads.push(group);
        }
      }

      if (!threads.length) {
        console.error('[Fetch] failed to split requests on threads.');
        return resolve([]);
      }

      let done = 0;
      const results: any[] = [];

      // Start Worker
      threads.forEach((thread) => {
        const worker = new Worker(WORKER_PATH, {
          workerData: {
            requests: thread,
            limit: toFinite(limit) || 25
          }
        });

        worker.once('message', (response) => {
          if (Array.isArray(response) && response.length) {
            response.forEach((res) => results.push(res));
          }
        });

        worker.once('exit', () => {
          worker.unref();
          done++;

          if (done === threads.length) {
            resolve(results);
          }
        });
      });
    } else {
      axios(requests[0])
        .then((res) => {
          resolve([{ request: requests[0], data: res.data, headers: res.headers }]);
        })
        .catch((error) => {
          resolve([{ request: requests[0], error: error.message }]);
        });
    }
  });
}

export = fetch;
