export const ACCENT_COLORS = [
  { id: 'emerald', hex: '#10b981', name: 'Hijau' },
  { id: 'blue',    hex: '#3b82f6', name: 'Biru' },
  { id: 'purple',  hex: '#8b5cf6', name: 'Ungu' },
  { id: 'orange',  hex: '#f97316', name: 'Oren' },
  { id: 'rose',    hex: '#f43f5e', name: 'Merah' },
  { id: 'amber',   hex: '#f59e0b', name: 'Kuning' },
];

export const DEFAULT_ACCENT = 'emerald';

export function getAccentHex(id) {
  return ACCENT_COLORS.find(c => c.id === id)?.hex ?? '#10b981';
}
