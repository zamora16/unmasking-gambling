@echo off
echo ====================================
echo   VERIFICACION DE RUTAS CORREGIDAS
echo ====================================

cd /d "C:\Users\Angel\Desktop\Unmasking_gambling\unmasking-gambling-astro"

echo.
echo Verificando archivos corregidos...
echo.

echo [1/8] Verificando helper centralizado...
if exist "src\utils\url.ts" (
    echo ✅ src\utils\url.ts - ENCONTRADO
) else (
    echo ❌ src\utils\url.ts - NO ENCONTRADO
)

echo.
echo [2/8] Verificando Header.astro...
findstr /c:"import { getUrl } from '../../utils/url';" src\components\layout\Header.astro >nul
if %errorlevel%==0 (
    echo ✅ Header.astro - IMPORT CORRECTO
) else (
    echo ❌ Header.astro - IMPORT FALTANTE
)

echo.
echo [3/8] Verificando index.astro...
findstr /c:"import { getUrl } from '../utils/url';" src\pages\index.astro >nul
if %errorlevel%==0 (
    echo ✅ index.astro - IMPORT CORRECTO
) else (
    echo ❌ index.astro - IMPORT FALTANTE
)

echo.
echo [4/8] Verificando slots/rtp.astro...
findstr /c:"import { getUrl } from '../../utils/url';" src\pages\slots\rtp.astro >nul
if %errorlevel%==0 (
    echo ✅ slots/rtp.astro - IMPORT CORRECTO
) else (
    echo ❌ slots/rtp.astro - IMPORT FALTANTE
)

echo.
echo [5/8] Verificando slots/volatilidad.astro...
findstr /c:"import { getUrl } from '../../utils/url';" src\pages\slots\volatilidad.astro >nul
if %errorlevel%==0 (
    echo ✅ slots/volatilidad.astro - IMPORT CORRECTO
) else (
    echo ❌ slots/volatilidad.astro - IMPORT FALTANTE
)

echo.
echo [6/8] Verificando slots/lineas-pago.astro...
findstr /c:"import { getUrl } from '../../utils/url';" src\pages\slots\lineas-pago.astro >nul
if %errorlevel%==0 (
    echo ✅ slots/lineas-pago.astro - IMPORT CORRECTO
) else (
    echo ❌ slots/lineas-pago.astro - IMPORT FALTANTE
)

echo.
echo [7/8] Verificando configuracion Astro...
findstr /c:"base: process.env.NODE_ENV === 'production' ? '/unmasking-gambling' : undefined" astro.config.mjs >nul
if %errorlevel%==0 (
    echo ✅ astro.config.mjs - CONFIGURACION CORRECTA
) else (
    echo ❌ astro.config.mjs - CONFIGURACION INCORRECTA
)

echo.
echo [8/8] Verificando enlaces hardcodeados...
findstr /c:'href="/' src\pages\index.astro >nul
if %errorlevel%==0 (
    echo ⚠️  index.astro - TODAVIA CONTIENE ENLACES HARDCODEADOS
) else (
    echo ✅ index.astro - SIN ENLACES HARDCODEADOS
)

echo.
echo ====================================
echo   VERIFICACION COMPLETADA
echo ====================================
echo.
echo Si todos los checks estan en verde ✅, 
echo las rutas han sido corregidas correctamente.
echo.
echo Ahora puedes ejecutar:
echo 1. build-y-deploy.bat
echo 2. git add .
echo 3. git commit -m "Fix: Corregir rutas para GitHub Pages"
echo 4. git push
echo.
pause
