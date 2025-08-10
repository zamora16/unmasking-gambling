@echo off
echo 🔧 Activando workflow después de configurar GitHub Pages...
echo.

echo ✅ Configuración verificada en archivos locales:
echo.

if exist ".github\workflows\deploy.yml" (
    echo    ✅ Workflow de Astro encontrado
) else (
    echo    ❌ Workflow no encontrado
)

if exist "public\.nojekyll" (
    echo    ✅ .nojekyll presente (evita Jekyll)
) else (
    echo    ❌ .nojekyll no encontrado
)

echo.
echo 🚀 Subiendo cambios para activar workflow:
echo.

git add .
git status

echo.
echo ¿Continuar con commit y push? (S/N)
set /p continue=

if /i "%continue%"=="S" (
    git commit -m "Configure GitHub Actions for Astro deployment"
    echo.
    echo 📤 Pushing to GitHub...
    git push origin main
    
    echo.
    echo ✅ ¡Listo! Ahora ve a verificar:
    echo.
    echo 📊 GitHub Actions (progreso del build):
    echo    https://github.com/zamora16/unmasking-gambling/actions
    echo.
    echo 🌐 Tu sitio estará disponible en:
    echo    https://zamora16.github.io/unmasking-gambling/
    echo.
    echo ⏱️  El primer deploy puede tardar 2-5 minutos
    echo.
) else (
    echo ❌ Cancelado. Ejecuta manualmente:
    echo    git commit -m "Configure GitHub Actions"
    echo    git push origin main
)

echo.
pause
