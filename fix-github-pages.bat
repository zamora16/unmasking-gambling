@echo off
echo 🔧 Preparando configuración correcta para GitHub Pages...
echo.

echo ✅ Verificando archivos necesarios...

REM Verificar .nojekyll
if exist "public\.nojekyll" (
    echo    ✅ .nojekyll encontrado
) else (
    echo    ❌ .nojekyll no encontrado - creándolo...
    echo. > "public\.nojekyll"
    echo    ✅ .nojekyll creado
)

REM Verificar workflow
if exist ".github\workflows\deploy.yml" (
    echo    ✅ Workflow de deploy encontrado
) else (
    echo    ❌ Workflow no encontrado
)

echo.
echo 🚀 Pasos para completar la configuración:
echo.
echo 1. Sube los cambios:
echo    git add .
echo    git commit -m "Add .nojekyll and fix GitHub Pages config"
echo    git push origin main
echo.
echo 2. Ve a GitHub.com y configura Pages:
echo    https://github.com/zamora16/unmasking-gambling/settings/pages
echo.
echo 3. En "Source" selecciona "GitHub Actions" (NO "Deploy from a branch")
echo.
echo 4. Espera a que termine el workflow en:
echo    https://github.com/zamora16/unmasking-gambling/actions
echo.
echo 5. Tu sitio estará disponible en:
echo    https://zamora16.github.io/unmasking-gambling/
echo.
echo ⚠️  IMPORTANTE: El build desde "main" funciona con GitHub Actions,
echo    NO con Jekyll automático.
echo.
pause
