@echo off
echo 🔍 DIAGNÓSTICO: Problema de navegación en GitHub Pages
echo.

echo ❌ PROBLEMA ANTERIOR:
echo    Los enlaces en Header/Footer usaban rutas absolutas:
echo    - href="/slots" → busca en zamora16.github.io/slots (no existe)
echo    - href="/sports" → busca en zamora16.github.io/sports (no existe)
echo    - href="/the-way" → busca en zamora16.github.io/the-way (no existe)
echo.

echo ✅ SOLUCIÓN APLICADA:
echo    Función getUrl() que añade base path automáticamente:
echo    - getUrl('/slots') → /unmasking-gambling/slots en GitHub Pages
echo    - getUrl('/sports') → /unmasking-gambling/sports en GitHub Pages  
echo    - getUrl('/the-way') → /unmasking-gambling/the-way en GitHub Pages
echo.

echo 🔧 ARCHIVOS MODIFICADOS:
echo    - src/components/layout/Header.astro (navegación principal)
echo    - src/components/layout/Footer.astro (enlaces del pie)
echo.

echo 🌍 COMPORTAMIENTO:
echo    Local (npm run dev):
echo    - getUrl('/slots') → '/slots' (funciona en localhost:4321)
echo.
echo    GitHub Pages (producción):
echo    - getUrl('/slots') → '/unmasking-gambling/slots' (funciona en GitHub Pages)
echo.

echo 📁 VERIFICANDO ESTRUCTURA DE PÁGINAS:
if exist "src\pages\slots\index.astro" (
    echo    ✅ /slots → src\pages\slots\index.astro
) else (
    echo    ❌ /slots no encontrado
)

if exist "src\pages\sports" (
    echo    ✅ /sports → src\pages\sports\
) else (
    echo    ❌ /sports no encontrado
)

if exist "src\pages\the-way" (
    echo    ✅ /the-way → src\pages\the-way\
) else (
    echo    ❌ /the-way no encontrado
)

if exist "src\pages\lottery" (
    echo    ✅ /lottery → src\pages\lottery\
) else (
    echo    ❌ /lottery no encontrado
)

if exist "src\pages\roulette" (
    echo    ✅ /roulette → src\pages\roulette\
) else (
    echo    ❌ /roulette no encontrado
)

echo.
echo 🎯 RESULTADO ESPERADO:
echo    Todos los enlaces de navegación (Header y Footer) ahora deberían
echo    funcionar correctamente tanto en desarrollo local como en GitHub Pages.
echo.

echo 🚀 PARA APLICAR LA SOLUCIÓN:
echo    1. test-navigation-fix.bat (construir y verificar)
echo    2. deploy-navigation-fix.bat (subir a GitHub)
echo.

echo 🔍 PARA VERIFICAR QUE FUNCIONA:
echo    Después del deploy, ve a:
echo    https://zamora16.github.io/unmasking-gambling/
echo    Y prueba hacer clic en todos los enlaces del menú principal.
echo.
pause
