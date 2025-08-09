# 🚀 Instrucciones de Despliegue en GitHub Pages

## Pasos para desplegar el proyecto

### 1. Preparar el repositorio local

El proyecto ya está configurado para GitHub Pages con:
- `astro.config.mjs` configurado con el `site` y `base` correctos
- Workflow de GitHub Actions en `.github/workflows/deploy.yml`
- Build estático habilitado

### 2. Subir el código a GitHub

```bash
# En el directorio unmasking-gambling-astro/
git init
git add .
git commit -m "Initial commit - Unmasking Gambling website"
git branch -M main
git remote add origin https://github.com/zamora16/unmasking-gambling.git
git push -u origin main
```

### 3. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub: https://github.com/zamora16/unmasking-gambling
2. Ve a **Settings** > **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. El workflow se ejecutará automáticamente al hacer push

### 4. Verificar el despliegue

- El sitio estará disponible en: https://zamora16.github.io/unmasking-gambling/
- Cada push a la rama `main` triggereará un nuevo despliegue automático
- Puedes ver el progreso en la pestaña **Actions** de tu repositorio

## Comandos útiles

```bash
# Desarrollar localmente
npm run dev

# Construir para producción
npm run build

# Preview de la build local
npm run preview

# Verificar que no hay errores
npm run astro check
```

## Estructura de URLs en GitHub Pages

- Página principal: `/unmasking-gambling/`
- El Camino: `/unmasking-gambling/the-way/`
- Simuladores: `/unmasking-gambling/slots/`, `/unmasking-gambling/roulette/`, etc.
- Ayuda: `/unmasking-gambling/ayuda/`

## Notas importantes

- El sitio usa rutas estáticas, así que toda la navegación funcionará sin servidor
- Las imágenes deben estar en `public/images/` para ser servidas correctamente
- El workflow de GitHub Actions instala dependencias y hace build automáticamente
- El despliegue toma 2-5 minutos desde el push hasta estar live

## Solución de problemas

Si hay errores en el despliegue:

1. Revisa la pestaña **Actions** en GitHub para ver logs de error
2. Verifica que el build funciona localmente con `npm run build`
3. Asegúrate de que todas las dependencias están en `package.json`
4. Verifica que no hay errores de TypeScript con `npm run astro check`
