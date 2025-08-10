#!/bin/bash

echo "🔍 Verificando configuración de GitHub Pages..."
echo ""

echo "✅ Verificando astro.config.mjs..."
if grep -q "base: '/unmasking-gambling'" astro.config.mjs; then
    echo "   Base path configurado correctamente: /unmasking-gambling"
else
    echo "   ❌ Base path no encontrado o incorrecto"
fi

echo ""
echo "✅ Verificando archivos en public/..."
if [ -f "public/favicon.svg" ]; then
    echo "   favicon.svg existe"
else
    echo "   ❌ favicon.svg no encontrado"
fi

if [ -f "public/images/og-image.svg" ]; then
    echo "   og-image.svg existe"
else
    echo "   ❌ og-image.svg no encontrado"
fi

echo ""
echo "✅ Verificando referencias en MainLayout.astro..."
if grep -q "import.meta.env.BASE_URL" src/layouts/MainLayout.astro; then
    echo "   Referencias BASE_URL encontradas - ✅"
else
    echo "   ❌ Referencias BASE_URL no encontradas"
fi

echo ""
echo "🚀 Para probar localmente:"
echo "   npm run dev"
echo ""
echo "🌐 Para desplegar a GitHub Pages:"
echo "   git add ."
echo "   git commit -m 'Fix asset paths for GitHub Pages'"
echo "   git push origin main"
echo ""
echo "📝 La web debería estar disponible en:"
echo "   https://zamora16.github.io/unmasking-gambling/"
