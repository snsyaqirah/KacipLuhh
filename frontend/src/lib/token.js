const PREFIX = 'kacip_';

export const storage = {
  setKey: (roomId, key) => localStorage.setItem(`${PREFIX}key_${roomId}`, key),
  getKey: (roomId) => localStorage.getItem(`${PREFIX}key_${roomId}`),
  setToken: (roomId, token) => localStorage.setItem(`${PREFIX}token_${roomId}`, token),
  getToken: (roomId) => localStorage.getItem(`${PREFIX}token_${roomId}`),
  setOwnerToken: (roomId, token) => localStorage.setItem(`${PREFIX}owner_${roomId}`, token),
  getOwnerToken: (roomId) => localStorage.getItem(`${PREFIX}owner_${roomId}`),
  setNickname: (roomId, nick) => localStorage.setItem(`${PREFIX}nick_${roomId}`, nick),
  getNickname: (roomId) => localStorage.getItem(`${PREFIX}nick_${roomId}`),
  clearRoom: (roomId) => {
    ['key_', 'token_', 'owner_', 'nick_'].forEach(k =>
      localStorage.removeItem(`${PREFIX}${k}${roomId}`));
  },
};
