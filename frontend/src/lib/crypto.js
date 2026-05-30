const ALGO = 'AES-GCM';
const KEY_BITS = 256;
const IV_BYTES = 12;

export async function generateRoomKey() {
  const key = await crypto.subtle.generateKey({ name: ALGO, length: KEY_BITS }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  return bufToB64u(raw);
}

export async function importRoomKey(b64uKey) {
  const raw = b64uToBuf(b64uKey);
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, false, ['encrypt', 'decrypt']);
}

export async function encryptMessage(text, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, cryptoKey, encoded);
  return `${bufToB64u(iv)}.${bufToB64u(ciphertext)}`;
}

export async function decryptMessage(payload, cryptoKey) {
  const [ivPart, ctPart] = payload.split('.');
  if (!ivPart || !ctPart) throw new Error('Invalid payload');
  const iv = b64uToBuf(ivPart);
  const ciphertext = b64uToBuf(ctPart);
  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

function bufToB64u(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64uToBuf(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
