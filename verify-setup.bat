@echo off
echo 🔍 Verificando configuración de GitHub Pages...
echo.

echo ✅ Verificando astro.config.mjs...
findstr /C:"base: '/unmasking-gambling'" astro.config.mjs >nul
if %errorlevel%==0 (
    echo    Base path configurado correctamente: /unmasking-gambling
) else (
    echo    ❌ Base path no encontrado o incorrecto
)

echo.
echo ✅ Verificando archivos en public/...
if exist "public\favicon.svg" (
    echo    favicon.svg existe
) else (
    echo    ❌ favicon.svg no encontrado
)

if exist "public\images\og-image.svg" (
    echo    og-image.svg existe
) else (
    echo    ❌ og-image.svg no encontrado
)

echo.
echo ✅ Verificando referencias en MainLayout.astro...
findstr /C:"import.meta.env.BASE_URL" src\layouts\MainLayout.astro >nul
if %errorlevel%==0 (
    echo    Referencias BASE_URL encontradas - ✅
) else (
    echo    ❌ Referencias BASE_URL no encontradas
)

echo.
echo 🚀 Para probar localmente:
echo    npm run dev
echo.
echo 🌐 Para desplegar a GitHub Pages:
echo    git add .
echo    git commit -m "Fix asset paths for GitHub Pages"
echo    git push origin main
echo.
echo 📝 La web debería estar disponible en:
echo    https://zamora16.github.io/unmasking-gambling/
echo.
pause
