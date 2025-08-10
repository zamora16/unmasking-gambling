@echo off
echo 🚨 DIAGNÓSTICO: GitHub Pages no está configurado correctamente
echo.

echo ❌ PROBLEMA ACTUAL:
echo    GitHub Pages intenta usar Jekyll automáticamente
echo    Tu workflow de Astro existe pero no se ejecuta
echo    Por eso ves 3000+ errores de Jekyll, no de tu código
echo.

echo ✅ SOLUCIÓN INMEDIATA:
echo.
echo 1. Ve a tu repositorio en GitHub:
echo    https://github.com/zamora16/unmasking-gambling
echo.
echo 2. Click en "Settings" (arriba a la derecha)
echo.
echo 3. En el menú lateral, click en "Pages"
echo.
echo 4. En "Source", cambia de:
echo    ❌ "Deploy from a branch" 
echo    ✅ A "GitHub Actions"
echo.
echo 5. Click "Save"
echo.
echo 6. Vuelve aquí y ejecuta:
echo    git add .
echo    git commit -m "Activate GitHub Actions workflow"
echo    git push origin main
echo.

echo 🎯 RESULTADO ESPERADO:
echo    - Se ejecutará tu workflow de Astro (sin errores)
echo    - Tu sitio estará en: https://zamora16.github.io/unmasking-gambling/
echo    - Podrás ver el progreso en: https://github.com/zamora16/unmasking-gambling/actions
echo.

echo ⚠️  Los 3000+ errores NO son de tu código:
echo    Son de Jekyll intentando procesar archivos .astro
echo    Una vez configures GitHub Actions, desaparecerán
echo.

echo 📝 Tu workflow de Astro está PERFECTO.
echo    Solo necesitas activarlo en la configuración de GitHub Pages.
echo.
pause
