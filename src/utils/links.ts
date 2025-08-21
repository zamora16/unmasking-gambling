/**
 * Sistema centralizado de enlaces para Unmasking Gambling
 * Maneja tanto URLs internas como enlaces externos
 */

// Configuración del dominio principal
const DOMAIN_CONFIG = {
  // Cambiar esta URL cuando se migre a un dominio personalizado
  production: 'https://tu-dominio-futuro.com',
  development: 'http://localhost:4321'
} as const;

// URLs internas - usan el sistema getUrl existente
export function getUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  
  if (path === '/' && base !== '/') {
    return base;
  }
  
  if (base === '/') {
    return path;
  }
  
  return `${base.replace(/\/$/, '')}${path}`;
}

// Enlaces externos organizados por categoría
export const EXTERNAL_LINKS = {
  // Recursos oficiales España
  spain: {
    fejar: 'https://www.fejar.org',
    autoexclusion: 'https://www.autoexclusion.es',
    jugarBien: 'https://www.ordenacionjuego.es/participantes-juego/juego-seguro',
    rgiaj: 'https://www.ordenacionjuego.es/participantes-juego/juego-seguro/rgiaj',
  },
  
  // Recursos internacionales
  international: {
    ncpg: 'https://www.ncpgambling.org',
    gamcare: 'https://www.gamcare.org.uk',
    gambleAware: 'https://www.gambleaware.org',
    jugadoresAnonimos: 'https://www.jugadoresanonimos.org',
    gamblersAnonymous: 'https://www.gamblersanonymous.org',
    mexicoConadic: 'https://www.gob.mx/conadic',
  },
  
  // Redes sociales y contacto
  social: {
    twitter: '#', // Placeholder - actualizar cuando tengas URLs reales
    linkedin: '#',
    facebook: '#',
  },
  
  // Emails de contacto
  contact: {
    jugadoresAnonimosChile: 'mailto:contacto@jugadoresanonimos.cl',
  }
} as const;

// Función helper para obtener enlaces externos
export function getExternalLink(category: keyof typeof EXTERNAL_LINKS, key: string): string {
  const categoryLinks = EXTERNAL_LINKS[category] as Record<string, string>;
  return categoryLinks[key] || '#';
}

// Función para obtener el dominio base según el entorno
export function getBaseDomain(): string {
  if (import.meta.env.DEV) {
    return DOMAIN_CONFIG.development;
  }
  return DOMAIN_CONFIG.production;
}

// Función para obtener URLs absolutas (útil para SEO, meta tags, etc.)
export function getAbsoluteUrl(path: string): string {
  const baseDomain = getBaseDomain();
  const relativePath = getUrl(path);
  
  // Si relativePath ya es absoluto, devolverlo tal como está
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  return `${baseDomain}${relativePath}`;
}

// Teléfonos de emergencia por país
export const EMERGENCY_PHONES = {
  spain: {
    crisis: '024',
    fejar: '900200225',
    emergency: '112'
  },
  usa: {
    gambler: '18004262537',
    crisis: '988',
    emergency: '911'
  },
  uk: {
    gamcare: '08088020133',
    samaritans: '116123',
    emergency: '999'
  },
  argentina: {
    buenosAires: '08002225462',
    caba: '108',
    line141: '141'
  },
  chile: {
    mentalHealth: '*4141',
    saludResponde: '6003607777',
    jugadoresAnonimos: '+56944072802'
  },
  mexico: {
    conadic: '8009112000',
    unam: '5556583911'
  }
} as const;

// Función helper para obtener teléfonos
export function getEmergencyPhone(country: keyof typeof EMERGENCY_PHONES, type: string): string {
  const countryPhones = EMERGENCY_PHONES[country] as Record<string, string>;
  return countryPhones[type] || '';
}