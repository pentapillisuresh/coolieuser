import client from './client';

export const arriveAtJob = (jobId: number, latitude: number, longitude: number) =>
  client.put(`/jobs/${jobId}/arrive`, { latitude, longitude });

export const getJobById = (jobId: number) =>
  client.get(`/jobs/${jobId}/byworker`);

export const acceptJob = (jobId: number) =>
  client.put(`/jobs/${jobId}/accept`);

export const generateCompleteOTP= (jobId: number) =>
  client.put(`/jobs/${jobId}/generateCompleteOTP`);

export const generateConfirmationOTP= (jobId: number) =>
  client.put(`/jobs/${jobId}/generateConfirmationOTP`);

export const confirmOTP = (jobId: number, otp: string) =>
  client.post(`/jobs/${jobId}/confirm-otp`, { otp });

export const completeJob = (jobId: number,completionOtp: string) =>
  client.put(`/jobs/${jobId}/complete`, {completionOtp});
