@echo off
echo 🧹 Limpieza completa del proyecto...
echo.

echo ❌ Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    ✅ node_modules eliminado
) else (
    echo    ℹ️  node_modules ya no existe
)

echo ❌ Eliminando .astro (caché)...
if exist .astro (
    rmdir /s /q .astro
    echo    ✅ .astro eliminado
) else (
    echo    ℹ️  .astro ya no existe
)

echo ❌ Eliminando dist...
if exist dist (
    rmdir /s /q dist
    echo    ✅ dist eliminado
) else (
    echo    ℹ️  dist ya no existe
)

echo.
echo 📦 Reinstalando dependencias...
npm install

echo.
echo ✅ Proyecto limpio y reinstalado
echo.
echo 🚀 Para probar:
echo    npm run dev
echo.
echo 📝 Las rutas ahora funcionarán correctamente:
echo    - Local: http://localhost:4321/slots
echo    - GitHub Pages: https://zamora16.github.io/unmasking-gambling/slots
echo.
pause
