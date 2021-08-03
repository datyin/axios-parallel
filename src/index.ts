import { cpus } from 'os';
import { Worker } from 'worker_threads';
import path from 'path';
import { isEmptyArray, num } from './util/primitives';
import { AxiosParallelInput, AxiosParallelResponse } from './schema/response';

const CPUs = cpus().length || 1;
const WORKER_PATH = path.resolve(__dirname, 'fetch.worker.js');

/**
 * Fetch single or multiple requests parallel using multiple cpu threads
 *
 * @param {AxiosParallelInput} requests
 * @param {number} [parallelTasks=30]
 * @return {*}  {Promise<AxiosParallelResponse[]>}
 */
function fetch(requests: AxiosParallelInput, parallelTasks: number = 30): Promise<AxiosParallelResponse[]> {
  return new Promise((resolve) => {
    parallelTasks = num(parallelTasks) || 30;

    if (!Array.isArray(requests)) {
      requests = [requests];
    }

    requests = requests.filter((req) => req?.url?.trim() !== '');

    if (!requests.length) {
      console.error('[Fetch] Empty or not valid input.');
      resolve([]);
      return;
    }

    let completed = 0;
    let results: AxiosParallelResponse[] = [];

    for (let i = 0; i < CPUs; i++) {
      const group = requests.splice(0, Math.ceil(requests.length / i));

      if (!group.length) {
        completed++;
        continue;
      }

      const worker = new Worker(WORKER_PATH, {
        workerData: { requests: group, limit: parallelTasks }
      });

      worker.once('message', (response: AxiosParallelResponse[]) => {
        if (!isEmptyArray(response)) {
          results = results.concat(response);
        }
      });

      worker.once('exit', () => {
        worker.removeAllListeners();
        completed++;

        if (completed === CPUs) {
          resolve(results);
        }
      });
    }
  });
}

export = fetch;
