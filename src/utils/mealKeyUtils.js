export function slugifyMealKey(text) {
  if (!text || typeof text !== 'string') return { slug: 'unknown', label: text || 'Unknown' };
  
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  return {
    slug,
    label: text
  };
}
