#!/bin/bash

echo "🚀 Verificando proyecto para despliegue..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: No se encuentra package.json. Asegúrate de estar en el directorio del proyecto."
  exit 1
fi

echo "✅ package.json encontrado"

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
else
  echo "✅ node_modules encontrado"
fi

# Verificar configuración de Astro
if [ -f "astro.config.mjs" ]; then
  echo "✅ astro.config.mjs configurado"
else
  echo "❌ Error: astro.config.mjs no encontrado"
  exit 1
fi

# Verificar workflow de GitHub Actions
if [ -f ".github/workflows/deploy.yml" ]; then
  echo "✅ Workflow de GitHub Actions configurado"
else
  echo "❌ Error: Workflow de GitHub Actions no encontrado"
  exit 1
fi

# Ejecutar chequeo de Astro
echo "🔍 Ejecutando chequeo de TypeScript..."
npm run astro check

if [ $? -eq 0 ]; then
  echo "✅ Chequeo de TypeScript exitoso"
else
  echo "❌ Error en chequeo de TypeScript"
  exit 1
fi

# Ejecutar build
echo "🏗️ Ejecutando build de producción..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build exitoso"
  echo ""
  echo "🎉 ¡Proyecto listo para desplegar!"
  echo ""
  echo "📋 Próximos pasos:"
  echo "1. git add ."
  echo "2. git commit -m 'Initial commit'"
  echo "3. git push origin main"
  echo "4. Configurar GitHub Pages en el repositorio"
  echo ""
  echo "🌐 El sitio estará disponible en:"
  echo "https://zamora16.github.io/unmasking-gambling/"
else
  echo "❌ Error en el build"
  exit 1
fi
