import client from './client';

export const uploadSingleFile = (file: any) => {
  const formData = new FormData();
  // For React Native, file should be an object with uri, name, type
  formData.append('file', file);

  console.log("photo::",JSON.stringify(formData))
  return client.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};