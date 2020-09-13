import { cpus } from 'os';
import { Worker } from 'worker_threads';
import { existsSync } from 'fs';
import { AxiosRequestConfig } from 'axios';
import { DEFAULT_ASYNC_REQUEST_LIMIT, isNotEmptyArray, toFinite } from './common';

const CPU_NUM = cpus().length;

interface AxiosParallelResponse<> {
  request: AxiosRequestConfig;
  data?: any;
  headers?: any;
  error?: string;
}

/**
 * Send Requests
 *
 * @param {array} requests
 * @param {number} limit requests per cpu (default: 30)
 * @return {array}
 */

function axiosParallel(requests: AxiosRequestConfig[], limit = DEFAULT_ASYNC_REQUEST_LIMIT) {
  return new Promise<AxiosParallelResponse[]>((resolve) => {
    const pszWorkerFile = `${__dirname}/thread.worker.js`;

    if (!existsSync(pszWorkerFile)) {
      throw new Error(`[Axios Parallel] Missing worker file: ${pszWorkerFile}`);
    }

    let done = 0;

    const results: AxiosParallelResponse[] = [];
    const groups: any = [];

    // Split array into chunks based on CPU cores
    if (isNotEmptyArray(requests)) {
      for (let i = CPU_NUM; i > 0; i--) {
        const group = requests.splice(0, Math.ceil(requests.length / i));

        if (isNotEmptyArray(group)) {
          groups.push(group);
        }
      }
    }

    if (groups.length) {
      groups.forEach((group: AxiosRequestConfig[]) => {
        const worker = new Worker(pszWorkerFile);

        worker.once('message', (response) => {
          if (response && Array.isArray(response) && response.length) {
            response.forEach((res) => results.push(res));
          }
        });

        worker.once('exit', () => {
          worker.unref();
          done++;

          if (done === groups.length) {
            resolve(results);
          }
        });

        worker.postMessage({
          requests: group,
          limit: toFinite(limit) || DEFAULT_ASYNC_REQUEST_LIMIT
        });
      });
    } else {
      resolve(results);
    }
  });
}

export = axiosParallel;
