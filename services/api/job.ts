import client from './client';

export const arriveAtJob = (jobId: number, latitude: number, longitude: number) =>
  client.put(`/jobs/${jobId}/arrive`, { latitude, longitude });

export const acceptJob = (jobId: number) =>
  client.put(`/jobs/${jobId}/accept`);

export const confirmOTP = (jobId: number, otp: string) =>
  client.post(`/jobs/${jobId}/confirm-otp`, { otp });

export const completeJob = (jobId: number) =>
  client.put(`/jobs/${jobId}/complete`);