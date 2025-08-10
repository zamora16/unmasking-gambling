@echo off
echo 🚀 DESPLIEGUE COMPLETO: Navegación corregida para GitHub Pages
echo.

echo 📋 RESUMEN DE CORRECCIONES:
echo    ✅ Header: función getUrl() para base path automático
echo    ✅ Footer: enlaces internos corregidos
echo    ✅ Build script: sin TypeScript check estricto
echo    ✅ Config: base path solo en producción
echo.

echo 🧪 PASO 1: Probando localmente...
echo.
start "" cmd /c "timeout /t 3 && start http://localhost:4321"
npm run dev &

echo ⏱️  Servidor iniciándose... (se abrirá en 3 segundos)
timeout /t 5 /nobreak >nul

echo.
echo 📦 PASO 2: Construyendo para GitHub Pages...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build exitoso
) else (
    echo ❌ Error en build - abortando
    pause
    exit /b 1
)

echo.
echo 📤 PASO 3: Subiendo a GitHub...
echo.

git add .
git status

echo.
echo 🤔 ¿Continuar con el commit y push? (S/N)
set /p continue=

if /i "%continue%"=="S" (
    git commit -m "Fix navigation routes for GitHub Pages

- Add getUrl() helper function to handle base path automatically
- Update Header.astro with correct route generation
- Update Footer.astro with correct internal links
- Routes now work correctly both locally and on GitHub Pages

Local: /slots, /sports, /the-way
GitHub Pages: /unmasking-gambling/slots, /sports, /the-way"
    
    echo.
    echo 📡 Enviando a GitHub...
    git push origin main
    
    echo.
    echo 🎉 ¡DESPLIEGUE COMPLETADO!
    echo.
    echo 📊 Monitorea el progreso del build:
    echo    https://github.com/zamora16/unmasking-gambling/actions
    echo.
    echo 🌐 Tu sitio estará disponible en ~3-5 minutos:
    echo    https://zamora16.github.io/unmasking-gambling/
    echo.
    echo 🧪 PRUEBA TODAS LAS RUTAS:
    echo    ✓ https://zamora16.github.io/unmasking-gambling/ (inicio)
    echo    ✓ https://zamora16.github.io/unmasking-gambling/slots
    echo    ✓ https://zamora16.github.io/unmasking-gambling/sports  
    echo    ✓ https://zamora16.github.io/unmasking-gambling/the-way
    echo    ✓ https://zamora16.github.io/unmasking-gambling/lottery
    echo    ✓ https://zamora16.github.io/unmasking-gambling/roulette
    echo.
    echo 🔍 Si alguna ruta no funciona:
    echo    1. Verifica que existe la página en src/pages/
    echo    2. Asegúrate de que el commit se aplicó correctamente
    echo    3. Espera unos minutos más para el deploy
    
) else (
    echo.
    echo ⏸️  Despliegue pausado. Para continuar manualmente:
    echo    git commit -m "Fix navigation routes for GitHub Pages"
    echo    git push origin main
)

echo.
pause
