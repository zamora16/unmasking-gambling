/**
 * Sistema global de navegación para Unmasking Gambling
 * Maneja automáticamente las URLs con base path para GitHub Pages
 */

import { getUrl } from './url';

export interface NavigationHelper {
  /**
   * Navegar a una URL interna
   */
  navigateTo: (path: string) => void;
  
  /**
   * Obtener URL completa con base path
   */
  getUrl: (path: string) => string;
  
  /**
   * Verificar si una URL es interna
   */
  isInternalUrl: (url: string) => boolean;
}

/**
 * Función helper para navegación que funciona tanto en desarrollo como producción
 */
export function createNavigationHelper(): NavigationHelper {
  return {
    navigateTo(path: string) {
      const fullUrl = getUrl(path);
      window.location.href = fullUrl;
    },

    getUrl(path: string) {
      return getUrl(path);
    },

    isInternalUrl(url: string) {
      return url.startsWith('/') && !url.startsWith('//');
    }
  };
}

/**
 * Helper global para uso en scripts inline
 */
export function setupGlobalNavigation() {
  // Función global para navegación en onclick handlers
  (window as any).navigateToPath = (path: string) => {
    const helper = createNavigationHelper();
    helper.navigateTo(path);
  };

  // Función global para obtener URLs
  (window as any).getGlobalUrl = (path: string) => {
    const helper = createNavigationHelper();
    return helper.getUrl(path);
  };
}

// Auto-setup cuando se carga el módulo
if (typeof window !== 'undefined') {
  setupGlobalNavigation();
}
