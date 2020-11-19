import { AxiosRequestConfig } from 'axios';
interface AxiosParallelResponse {
    request: AxiosRequestConfig;
    data?: any;
    headers?: any;
    error?: string;
}
declare function axiosParallel(requests: AxiosRequestConfig[], limit?: number): Promise<AxiosParallelResponse[]>;
export = axiosParallel;
