import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiServiceOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiService {
  private instance: AxiosInstance;

  constructor(options: ApiServiceOptions) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 30000,
      headers: options.headers || { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T>(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const headers = {
      ...axios.defaults.headers,
      ...(config?.headers || {}),
    };
    delete config?.headers;
    return this.instance.post<T>(url, data, { ...config, headers });
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T>(url, config);
  }
}

export default ApiService;
