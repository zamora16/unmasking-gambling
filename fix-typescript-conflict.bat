@echo off
echo 🚨 SOLUCIONANDO ERROR: TypeScript conflicto con astro.config.mjs
echo.

echo 🛑 Deteniendo procesos que puedan estar ejecutándose...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧹 LIMPIEZA COMPLETA...

echo ❌ Eliminando caché .astro...
if exist .astro (
    rmdir /s /q .astro
    echo    ✅ .astro eliminado
) else (
    echo    ℹ️  .astro ya no existe
)

echo ❌ Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    ✅ node_modules eliminado
) else (
    echo    ℹ️  node_modules ya no existe
)

echo ❌ Eliminando dist...
if exist dist (
    rmdir /s /q dist
    echo    ✅ dist eliminado
) else (
    echo    ℹ️  dist ya no existe
)

echo ❌ Eliminando package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo    ✅ package-lock.json eliminado
) else (
    echo    ℹ️  package-lock.json ya no existe
)

echo.
echo 📦 REINSTALANDO TODO DESDE CERO...
npm install

echo.
echo ✅ LIMPIEZA COMPLETA TERMINADA
echo.

echo 🚀 PROBANDO EL SERVIDOR...
echo    Si el error persiste, presiona Ctrl+C y reporta el problema
echo.

npm run dev
