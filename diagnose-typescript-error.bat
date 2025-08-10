@echo off
echo 🔍 DIAGNÓSTICO: Error TypeScript con astro.config.mjs
echo.

echo 📋 INFORMACIÓN DEL SISTEMA:
echo Node version:
node --version 2>nul || echo ❌ Node no encontrado

echo NPM version:
npm --version 2>nul || echo ❌ NPM no encontrado

echo.
echo 📂 ARCHIVOS DE CONFIGURACIÓN:
if exist astro.config.mjs (
    echo ✅ astro.config.mjs existe
) else (
    echo ❌ astro.config.mjs NO existe
)

if exist tsconfig.json (
    echo ✅ tsconfig.json existe
) else (
    echo ❌ tsconfig.json NO existe
)

if exist package.json (
    echo ✅ package.json existe
) else (
    echo ❌ package.json NO existe
)

echo.
echo 🔍 PROCESOS ACTIVOS:
echo Procesos Node.js ejecutándose:
tasklist /fi "imagename eq node.exe" 2>nul | find "node.exe" || echo ℹ️  No hay procesos Node.js activos

echo.
echo 📁 DIRECTORIOS PROBLEMÁTICOS:
if exist .astro (
    echo ⚠️  .astro existe (caché que puede causar problemas)
    dir .astro /b 2>nul | find /c /v "" > temp.txt
    set /p filecount=<temp.txt
    del temp.txt
    echo    Archivos en .astro: %filecount%
) else (
    echo ✅ .astro no existe (está bien)
)

if exist node_modules (
    echo ✅ node_modules existe
) else (
    echo ❌ node_modules NO existe - necesitas npm install
)

echo.
echo 💡 RECOMENDACIONES:
echo.
echo 1. SOLUCIÓN RÁPIDA (recomendada):
echo    fix-typescript-conflict.bat
echo.
echo 2. SOLUCIÓN ALTERNATIVA:
echo    recreate-config.bat
echo.
echo 3. SOLUCIÓN MANUAL:
echo    - Cierra todas las ventanas de terminal/VSCode
echo    - Elimina carpeta .astro
echo    - Ejecuta: npm run dev
echo.
pause
