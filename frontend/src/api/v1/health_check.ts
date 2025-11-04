import axios, { type AxiosInstance } from 'axios';

function buildClient(baseURL: string): AxiosInstance {
  const url = baseURL.replace(/\/+$/, '');
  return axios.create({
    baseURL: url,
    headers: { 'Content-Type': 'application/json' },
    timeout: 8000,
  });
}

export const createHealthApi = (baseURL: string) => {
  const client = buildClient(baseURL);

  return {
    async request<T = unknown>() {
      const { data } = await client.get<T>('/api/v1/health');
      return data;
    },
  };
};
