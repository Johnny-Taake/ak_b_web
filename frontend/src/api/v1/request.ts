import axios, { type AxiosInstance } from 'axios';

import type { RequestPayload } from '@/types/api';

function buildClient(baseURL: string): AxiosInstance {
  const url = baseURL.replace(/\/+$/, '');
  return axios.create({
    baseURL: url,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const createRequestApi = (baseURL: string) => {
  const client = buildClient(baseURL);
  return {
    async sendEmail(emailData: RequestPayload) {
      const { data } = await client.post('/api/v1/request', emailData);
      return data;
    },
  };
};
