# Sistema Centralizado de Enlaces

## 📖 Descripción

Este sistema permite gestionar de forma centralizada todas las URLs de la aplicación, tanto internas como externas. **Cambiar de dominio es ahora tan simple como modificar una sola línea**.

## 🔧 Configuración

### Cambiar dominio principal
Edita `/src/utils/links.ts` y modifica la línea:

```typescript
const DOMAIN_CONFIG = {
  production: 'https://tu-nuevo-dominio.com', // ← Cambiar aquí
  development: 'http://localhost:4321'
}
```

## 🚀 Uso

### URLs Internas
```typescript
import { getUrl } from '../utils/links';

// En templates Astro
<a href={getUrl('/ayuda')}>Ayuda</a>
<a href={getUrl('/the-way')}>El Camino</a>
```

### URLs Externas
```typescript
import { getExternalLink } from '../utils/links';

// Enlaces a organizaciones
<a href={getExternalLink('spain', 'fejar')}>FEJAR</a>
<a href={getExternalLink('international', 'ncpg')}>NCPG</a>
```

### Teléfonos de Emergencia
```typescript
import { getEmergencyPhone } from '../utils/links';

// Teléfonos por país
<a href={`tel:${getEmergencyPhone('spain', 'crisis')}`}>024</a>
<a href={`tel:${getEmergencyPhone('usa', 'gambler')}`}>1-800-GAMBLER</a>
```

### URLs Absolutas (SEO/Meta tags)
```typescript
import { getAbsoluteUrl } from '../utils/links';

// Para meta tags, sitemaps, etc.
const canonicalUrl = getAbsoluteUrl('/ayuda');
// Resultado: https://tu-dominio.com/ayuda
```

## 📂 Estructura

```
EXTERNAL_LINKS = {
  spain: {
    fejar, autoexclusion, jugarBien, rgiaj
  },
  international: {
    ncpg, gamcare, gambleAware, etc.
  },
  social: {
    twitter, linkedin, facebook
  },
  contact: {
    emails específicos
  }
}

EMERGENCY_PHONES = {
  spain: { crisis, fejar, emergency },
  usa: { gambler, crisis, emergency },
  uk: { gamcare, samaritans, emergency },
  // etc...
}
```

## ✅ Ventajas

1. **Cambio de dominio**: Una sola línea
2. **URLs rotas**: Imposibles (TypeScript verifica las claves)
3. **Mantenimiento**: Centralizado y fácil
4. **Consistencia**: Todas las URLs son uniformes
5. **Flexibilidad**: Diferentes entornos (dev/prod)

## 🔧 Migración completada

- ✅ Footer.astro
- ✅ Header.astro  
- ✅ index.astro
- ✅ ayuda.astro
- ✅ MainLayout.astro (ya usaba BASE_URL correctamente)

## 📝 Notas

- Los enlaces de redes sociales están como placeholders ("#") - actualizar cuando tengas URLs reales
- El sistema es extensible: agregar nuevos países/organizaciones es simple
- TypeScript previene errores de escritura en las claves