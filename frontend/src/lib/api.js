import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

export const createRoom = (name, duration, passcode) =>
  api.post('/api/room', { name, duration, ...(passcode ? { passcode } : {}) }).then(r => r.data);

export const getRoom = (roomId) =>
  api.get(`/api/room/${roomId}`).then(r => r.data);

export const joinRoom = (roomId, nickname, passcode) =>
  api.post(`/api/room/${roomId}/join`, { nickname, ...(passcode ? { passcode } : {}) }).then(r => r.data);

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

export const getAdminReports = (adminSecret) =>
  api.get('/api/admin/reports', { headers: { 'x-admin-secret': adminSecret } }).then(r => r.data);

export const adminCloseRoom = (roomId, adminSecret) =>
  api.delete(`/api/admin/room/${roomId}`, { headers: { 'x-admin-secret': adminSecret } }).then(r => r.data);
