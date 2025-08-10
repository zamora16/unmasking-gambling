#!/bin/bash

echo "🔧 Preparando configuración correcta para GitHub Pages..."
echo ""

echo "✅ Verificando archivos necesarios..."

# Verificar .nojekyll
if [ -f "public/.nojekyll" ]; then
    echo "   ✅ .nojekyll encontrado"
else
    echo "   ❌ .nojekyll no encontrado - creándolo..."
    touch "public/.nojekyll"
    echo "   ✅ .nojekyll creado"
fi

# Verificar workflow
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "   ✅ Workflow de deploy encontrado"
else
    echo "   ❌ Workflow no encontrado"
fi

echo ""
echo "🚀 Pasos para completar la configuración:"
echo ""
echo "1. Sube los cambios:"
echo "   git add ."
echo "   git commit -m 'Add .nojekyll and fix GitHub Pages config'"
echo "   git push origin main"
echo ""
echo "2. Ve a GitHub.com y configura Pages:"
echo "   https://github.com/zamora16/unmasking-gambling/settings/pages"
echo ""
echo "3. En 'Source' selecciona 'GitHub Actions' (NO 'Deploy from a branch')"
echo ""
echo "4. Espera a que termine el workflow en:"
echo "   https://github.com/zamora16/unmasking-gambling/actions"
echo ""
echo "5. Tu sitio estará disponible en:"
echo "   https://zamora16.github.io/unmasking-gambling/"
echo ""
echo "⚠️  IMPORTANTE: El build desde 'main' funciona con GitHub Actions,"
echo "   NO con Jekyll automático."
echo ""
