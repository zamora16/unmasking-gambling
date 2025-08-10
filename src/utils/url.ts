/**
 * Utility function to generate correct URLs with base path for GitHub Pages
 * @param path - The path to append to the base URL
 * @returns The complete URL with proper base path
 */
export function getUrl(path: string): string {
  // En development, BASE_URL es '/' 
  // En production (GitHub Pages), BASE_URL es '/unmasking-gambling'
  const base = import.meta.env.BASE_URL || '/';
  
  // Si ya es la base, no duplicar
  if (path === '/' && base !== '/') {
    return base;
  }
  
  // Si base es '/', simplemente devolver el path
  if (base === '/') {
    return path;
  }
  
  // Remover trailing slash del base y añadir el path
  return `${base.replace(/\/$/, '')}${path}`;
}
