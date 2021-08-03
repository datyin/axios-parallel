import { AxiosRequestConfig } from 'axios';

export type AxiosParallelInput = AxiosRequestConfig | AxiosRequestConfig[];

export interface AxiosParallelResponseDetails {
  aborted: boolean;
  finished: boolean;
  host: string;
  protocol: string;
  method: string;
  path: string;
  responseUrl: string;
  redirects: string[];
  statusCode: number;
  statusMessage: string;
}

export interface AxiosParallelResponse {
  request: AxiosRequestConfig;
  data?: unknown;
  headers?: Record<string, string>;
  error?: string;
  details: AxiosParallelResponseDetails;
}

declare function axiosParallel(requests: AxiosParallelInput, limit?: number): Promise<AxiosParallelResponse[]>;
export default axiosParallel;
