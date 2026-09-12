import client from './client';

export const reverseGeocode = (latitude: number, longitude: number) =>
  client.post('/location/reverse-geocode', { latitude, longitude });

export const geocodeAddress = (address: string) =>
  client.post('/location/geocode', { address });

export const getRoute = (originLat: number, originLng: number, destLat: number, destLng: number) =>
  client.post('/location/route', { originLat, originLng, destLat, destLng });