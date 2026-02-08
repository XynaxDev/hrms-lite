export const formatDemoId = (id: string) => {
  const raw = (id || '').toString().trim();
  if (!raw.toUpperCase().startsWith('DUM_')) return raw;
  const parts = raw.split('_');
  const last = parts[parts.length - 1];
  const n = parseInt(last, 10);
  if (!Number.isFinite(n)) return raw;
  return `DUM_${String(n).padStart(2, '0')}`;
};

export const formatDemoEmail = (id: string, email: string) => {
  const rawId = (id || '').toString().trim();
  if (!rawId.toUpperCase().startsWith('DUM_')) return email;
  const friendly = formatDemoId(rawId);
  const nn = friendly.split('_')[1] || '';
  if (!nn) return email;
  return `dum_${nn}_example@gmail.com`;
};
