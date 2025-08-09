@echo off
echo 🚀 Verificando proyecto para despliegue...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
  echo ❌ Error: No se encuentra package.json. Asegúrate de estar en el directorio del proyecto.
  pause
  exit /b 1
)

echo ✅ package.json encontrado

REM Verificar que node_modules existe
if not exist "node_modules" (
  echo 📦 Instalando dependencias...
  npm install
) else (
  echo ✅ node_modules encontrado
)

REM Verificar configuración de Astro
if exist "astro.config.mjs" (
  echo ✅ astro.config.mjs configurado
) else (
  echo ❌ Error: astro.config.mjs no encontrado
  pause
  exit /b 1
)

REM Verificar workflow de GitHub Actions
if exist ".github\workflows\deploy.yml" (
  echo ✅ Workflow de GitHub Actions configurado
) else (
  echo ❌ Error: Workflow de GitHub Actions no encontrado
  pause
  exit /b 1
)

REM Ejecutar chequeo de Astro
echo 🔍 Ejecutando chequeo de TypeScript...
npm run astro check

if %errorlevel% equ 0 (
  echo ✅ Chequeo de TypeScript exitoso
) else (
  echo ❌ Error en chequeo de TypeScript
  pause
  exit /b 1
)

REM Ejecutar build
echo 🏗️ Ejecutando build de producción...
npm run build

if %errorlevel% equ 0 (
  echo ✅ Build exitoso
  echo.
  echo 🎉 ¡Proyecto listo para desplegar!
  echo.
  echo 📋 Próximos pasos:
  echo 1. git add .
  echo 2. git commit -m "Initial commit"
  echo 3. git push origin main
  echo 4. Configurar GitHub Pages en el repositorio
  echo.
  echo 🌐 El sitio estará disponible en:
  echo https://zamora16.github.io/unmasking-gambling/
) else (
  echo ❌ Error en el build
  pause
  exit /b 1
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul
