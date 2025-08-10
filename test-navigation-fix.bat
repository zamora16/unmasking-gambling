@echo off
echo 🔧 SOLUCIONANDO: Rutas de navegación en GitHub Pages
echo.

echo ✅ CAMBIOS APLICADOS:
echo    - Header: todos los enlaces usan getUrl() con base path
echo    - Footer: enlaces internos corregidos
echo    - Función helper: maneja automáticamente local vs GitHub Pages
echo.

echo 🎯 CÓMO FUNCIONA AHORA:
echo    - Local (dev): /slots, /sports, etc.
echo    - GitHub Pages: /unmasking-gambling/slots, /unmasking-gambling/sports
echo.

echo 🚀 CONSTRUYENDO SITIO PARA GITHUB PAGES...
echo.

npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡BUILD EXITOSO!
    echo.
    echo 📂 Verificando estructura generada:
    if exist dist\index.html (
        echo    ✅ Página principal: dist\index.html
    ) else (
        echo    ❌ Página principal no encontrada
    )
    
    if exist dist\slots\index.html (
        echo    ✅ Página slots: dist\slots\index.html
    ) else (
        echo    ❌ Página slots no encontrada
    )
    
    if exist dist\sports\index.html (
        echo    ✅ Página sports: dist\sports\index.html
    ) else (
        echo    ❌ Página sports no encontrada
    )
    
    if exist dist\the-way\index.html (
        echo    ✅ Página the-way: dist\the-way\index.html
    ) else (
        echo    ❌ Página the-way no encontrada
    )
    
    echo.
    echo 📤 PARA APLICAR EN GITHUB PAGES:
    echo    git add .
    echo    git commit -m "Fix navigation routes for GitHub Pages"
    echo    git push origin main
    echo.
    echo 🌐 RESULTADO ESPERADO:
    echo    - Página principal: https://zamora16.github.io/unmasking-gambling/
    echo    - Slots: https://zamora16.github.io/unmasking-gambling/slots
    echo    - Sports: https://zamora16.github.io/unmasking-gambling/sports
    echo    - The Way: https://zamora16.github.io/unmasking-gambling/the-way
    echo.
    echo ✅ TODAS las rutas de navegación deberían funcionar ahora
    
) else (
    echo ❌ Error en el build. Revisa los mensajes de error arriba.
)

echo.
echo 🔍 Para probar localmente primero:
echo    npm run dev
echo    - Ve a: http://localhost:4321/
echo    - Prueba navegar a todas las secciones
echo    - Si funciona local, funcionará en GitHub Pages
echo.
pause
