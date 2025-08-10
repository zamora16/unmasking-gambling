@echo off
echo 🔧 SOLUCIÓN ALTERNATIVA: Recrear astro.config.mjs
echo.

echo 📄 Respaldando configuración actual...
if exist astro.config.mjs (
    copy astro.config.mjs astro.config.backup.mjs
    echo    ✅ Respaldo creado: astro.config.backup.mjs
)

echo.
echo 🗑️ Eliminando archivo problemático...
if exist astro.config.mjs (
    del astro.config.mjs
    echo    ✅ astro.config.mjs eliminado
)

echo.
echo 📝 Recreando astro.config.mjs desde cero...

echo import { defineConfig } from 'astro/config'; > astro.config.mjs
echo import tailwind from '@astrojs/tailwind'; >> astro.config.mjs
echo import react from '@astrojs/react'; >> astro.config.mjs
echo. >> astro.config.mjs
echo // https://astro.build/config >> astro.config.mjs
echo export default defineConfig({ >> astro.config.mjs
echo   integrations: [ >> astro.config.mjs
echo     tailwind(), >> astro.config.mjs
echo     react() >> astro.config.mjs
echo   ], >> astro.config.mjs
echo   site: 'https://zamora16.github.io', >> astro.config.mjs
echo   // Solo usar base en producción para GitHub Pages >> astro.config.mjs
echo   base: process.env.NODE_ENV === 'production' ? '/unmasking-gambling' : undefined, >> astro.config.mjs
echo   output: 'static', >> astro.config.mjs
echo   compressHTML: true >> astro.config.mjs
echo }); >> astro.config.mjs

echo    ✅ astro.config.mjs recreado

echo.
echo 🧹 Limpiando caché...
if exist .astro rmdir /s /q .astro

echo.
echo 🚀 Probando configuración...
npm run dev
