@echo off
echo 🔧 Probando configuración local vs producción...
echo.

echo ✅ Configuración actualizada:
echo    - TypeScript: modo base (menos estricto)
echo    - Base path: solo en producción
echo    - Desarrollo: rutas normales (sin /unmasking-gambling)
echo    - Producción: rutas con /unmasking-gambling
echo.

echo 🚀 Probando en desarrollo local:
echo    Ejecutando: npm run dev
echo.
echo    Deberías poder acceder a:
echo    - http://localhost:4321/ (página principal)
echo    - http://localhost:4321/slots (simulador slots)
echo    - http://localhost:4321/sports (apuestas deportivas)
echo    - http://localhost:4321/the-way (el camino)
echo.

echo 🌐 En GitHub Pages funcionará:
echo    - https://zamora16.github.io/unmasking-gambling/
echo    - https://zamora16.github.io/unmasking-gambling/slots
echo    - etc.
echo.

echo 📝 Para probar:
echo    1. npm run dev (desarrollo local)
echo    2. git add . && git commit -m "Fix TypeScript and local routes"
echo    3. git push origin main (despliegue a GitHub Pages)
echo.

echo ⚠️  Si aún tienes problemas:
echo    1. Borra node_modules: rmdir /s node_modules
echo    2. Reinstala: npm install
echo    3. Reinicia el servidor: npm run dev
echo.
pause
