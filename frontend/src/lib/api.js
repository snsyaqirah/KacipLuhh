import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

export const createRoom = (name, duration) =>
  api.post('/api/room', { name, duration }).then(r => r.data);

export const getRoom = (roomId) =>
  api.get(`/api/room/${roomId}`).then(r => r.data);

export const joinRoom = (roomId, nickname) =>
  api.post(`/api/room/${roomId}/join`, { nickname }).then(r => r.data);

export const extendRoom = (roomId, hours, ownerToken) =>
  api.post(`/api/room/${roomId}/extend`, { hours }, {
    headers: { 'x-owner-token': ownerToken },
  }).then(r => r.data);

export const closeRoom = (roomId, ownerToken) =>
  api.delete(`/api/room/${roomId}`, {
    headers: { 'x-owner-token': ownerToken },
  }).then(r => r.data);

export const reportRoom = (roomId, reason) =>
  api.post(`/api/room/${roomId}/report`, { reason }).then(r => r.data);
