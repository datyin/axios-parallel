import { workerData, parentPort } from 'worker_threads';
import axios, { AxiosRequestConfig } from 'axios';
import { arr, num, str, bool } from './util/primitives';
import { AxiosParallelResponse, AxiosParallelResponseDetails } from './schema/response';

const requests: AxiosRequestConfig[] = workerData?.requests || [];
const limit = workerData?.limit && workerData.limit >= 2 ? workerData.limit : 2;

function parseRequest(input: unknown): AxiosParallelResponseDetails {
  return {
    aborted: bool(input, 'aborted'),
    finished: bool(input, 'finished'),
    host: str(input, 'host'),
    method: str(input, 'method'),
    path: str(input, 'path'),
    protocol: str(input, 'protocol'),
    responseUrl: str(input, 'res.responseUrl'),
    redirects: arr(input, 'res.redirects') as string[],
    statusCode: num(input, 'res.statusCode'),
    statusMessage: str(input, 'res.statusMessage')
  };
}

async function fetch(req: AxiosRequestConfig): Promise<AxiosParallelResponse> {
  try {
    const res = await axios(req);
    const details = parseRequest(res.request);

    return { request: req, data: res.data, headers: res.headers, details };
  } catch (error) {
    const details = parseRequest(error.request);
    return { request: req, details, error: error?.message ?? 'Unknown Error' };
  }
}

type FN = (item: AxiosRequestConfig[]) => unknown;

async function series(items: Array<AxiosRequestConfig[]>, fn: FN): Promise<AxiosParallelResponse[]> {
  const result: AxiosParallelResponse[] = [];

  await items.reduce(
    (acc, item) =>
      acc.then(async () => {
        const res = await fn(item);
        result.push(res as AxiosParallelResponse);
      }),
    Promise.resolve()
  );

  return result;
}

async function start(): Promise<AxiosParallelResponse[]> {
  try {
    const result: AxiosParallelResponse[] = [];
    const chunks: AxiosRequestConfig[][] = [];

    for (let i = 0; i < requests.length; i += limit) {
      chunks.push(requests.slice(i, i + limit));
    }

    await series(chunks, async (chunk: AxiosRequestConfig[]) => {
      const promises = chunk.map((item: AxiosRequestConfig) => fetch(item));
      const res = await Promise.all(promises);

      res.forEach((r) => result.push(r));
    });

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

start()
  .then((res) => {
    parentPort?.postMessage(res);
  })
  .catch((error) => {
    console.log(error);
    parentPort?.postMessage([]);
  });
