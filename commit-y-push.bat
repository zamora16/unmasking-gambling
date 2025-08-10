@echo off
echo ====================================
echo     GIT COMMIT Y PUSH AUTOMATICO
echo ====================================

cd /d "C:\Users\Angel\Desktop\Unmasking_gambling\unmasking-gambling-astro"

echo.
echo Verificando status de git...
git status

echo.
echo Agregando todos los archivos modificados...
git add .

echo.
echo Haciendo commit con mensaje descriptivo...
git commit -m "Fix: Corregir rutas para GitHub Pages

- Crear helper centralizado getUrl() en src/utils/url.ts
- Migrar Header.astro al helper centralizado  
- Corregir enlaces hardcodeados en index.astro
- Corregir enlaces en todas las páginas de slots
- Migrar páginas de roulette y lottery al helper
- Todas las rutas ahora funcionan con base /unmasking-gambling

Resuelve el problema donde las rutas iban a:
- zamora16.github.io/slots/rtp/ ❌
En lugar de:
- zamora16.github.io/unmasking-gambling/slots/rtp/ ✅"

echo.
echo Pushing a GitHub...
git push

echo.
echo ====================================
echo   DEPLOYMENT A GITHUB COMPLETADO
echo ====================================
echo.
echo El sitio se actualizara automaticamente en GitHub Pages.
echo URL: https://zamora16.github.io/unmasking-gambling/
echo.
echo Espera unos minutos y prueba la navegacion.
echo Todas las rutas internas deberian funcionar correctamente.
echo.
pause
