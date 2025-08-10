@echo off
echo ====================================
echo    CONSTRUYENDO PROYECTO ASTRO
echo ====================================

cd /d "C:\Users\Angel\Desktop\Unmasking_gambling\unmasking-gambling-astro"

echo.
echo Verificando directorio actual...
echo %CD%

echo.
echo Ejecutando build...
npm run build

echo.
echo ====================================
echo Build completado! 
echo ====================================
echo.
echo El sitio esta listo para deployment en GitHub Pages.
echo Las rutas han sido corregidas para funcionar con la base /unmasking-gambling
echo.
echo Siguientes pasos:
echo 1. Commit y push a GitHub
echo 2. Verificar deployment
echo 3. Probar navegacion en la URL en vivo
echo.
pause
