# 🎰 Unmasking Gambling - Astro

Una plataforma educativa moderna sobre los riesgos del gambling y juego responsable, construida con Astro, React y Tailwind CSS.

## 🚀 Características

- **🎯 Simulador interactivo de slots** con gráficos en tiempo real
- **🛤️ "El Camino"** - Guía interactiva de 6 pasos para juego responsable
- **📊 Visualizaciones de datos** sobre RTP y probabilidades
- **🆘 Recursos de ayuda** completos y actualizados
- **📱 Diseño responsive** optimizado para móviles
- **⚡ Rendimiento excepcional** gracias a Astro
- **🔍 SEO optimizado** para máxima visibilidad

## 🛠️ Tecnologías

- **[Astro](https://astro.build/)** - Framework web moderno
- **[React](https://reactjs.org/)** - Para componentes interactivos
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilos utilitarios
- **[Lightweight Charts](https://tradingview.github.io/lightweight-charts/)** - Gráficos financieros

## 📦 Instalación

1. **Instala las dependencias:**
   ```bash
   npm install
   ```

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construye para producción:**
   ```bash
   npm run build
   ```

4. **Preview de la build:**
   ```bash
   npm run preview
   ```

## 📁 Estructura del Proyecto

```
unmasking-gambling-astro/
├── src/
│   ├── layouts/
│   │   └── MainLayout.astro          # Layout principal
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro          # Navegación principal
│   │   │   └── Footer.astro          # Pie de página
│   │   └── simulators/
│   │       └── SlotSimulator.tsx     # Simulador interactivo
│   ├── pages/
│   │   ├── index.astro               # Página principal
│   │   ├── ayuda.astro               # Recursos de ayuda
│   │   ├── slots/
│   │   │   ├── index.astro           # Sección de slots
│   │   │   └── rtp.astro             # Simulador RTP
│   │   ├── sports/
│   │   │   └── index.astro           # Apuestas deportivas
│   │   ├── roulette/
│   │   │   └── index.astro           # Ruleta
│   │   └── the-way/
│   │       ├── index.astro           # El Camino - Principal
│   │       ├── paso-1.astro          # Paso 1: ¿Por qué adictivo?
│   │       ├── paso-2.astro          # Paso 2: Reconocer problema
│   │       ├── paso-3.astro          # Paso 3: Sesgos mentales
│   │       ├── paso-4.astro          # Paso 4: Autocontrol
│   │       ├── paso-5.astro          # Paso 5: Plan personal
│   │       └── paso-6.astro          # Paso 6: Red de apoyo
│   └── public/
│       └── images/                   # Imágenes y assets
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

## 🎯 Funcionalidades Principales

### 🎰 Simulador de Slots
- Configuración interactiva de RTP, apuesta y número de tiradas
- Gráficos en tiempo real de evolución del saldo
- Cálculos matemáticos precisos sobre valor esperado
- Interfaz educativa que muestra por qué la casa siempre gana

### 🛤️ El Camino (6 Pasos)
1. **¿Por qué adictivo?** - Psicología de la adicción
2. **Reconocer el problema** - Señales de advertencia
3. **Sesgos mentales** - Trampas cognitivas
4. **Autocontrol** - Técnicas de autorregulación
5. **Plan personal** - Estrategias adaptadas
6. **Red de apoyo** - Recursos y comunidad

### 🆘 Recursos de Ayuda
- Autoevaluación interactiva
- Directorio completo de organizaciones
- Líneas de ayuda 24/7
- Protocolos de emergencia
- Información para familias

## 🎨 Diseño y UX

- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **Accesibilidad**: Cumple estándares WCAG
- **Navegación intuitiva**: Flujo claro y lógico
- **Carga rápida**: Optimizado para rendimiento
- **Interactividad**: Elementos que mejoran la experiencia

## 📈 SEO y Performance

- **Meta tags optimizados** para cada página
- **Sitemap automático** generado por Astro
- **Estructura semántica** HTML5
- **Core Web Vitals** optimizados
- **Lazy loading** de imágenes y componentes pesados

## 🚀 Despliegue

El proyecto está configurado para desplegarse fácilmente en:

- **Netlify**: `npm run build` + deploy de `dist/`
- **Vercel**: Configuración automática para Astro
- **GitHub Pages**: Con GitHub Actions
- **Cloudflare Pages**: Deploy directo desde repo

### Variables de Entorno (Opcionales)

Crea un archivo `.env` para configuraciones específicas:

```env
PUBLIC_SITE_URL=https://tu-dominio.com
PUBLIC_ANALYTICS_ID=tu-google-analytics-id
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📞 Recursos de Ayuda

Si tú o alguien conocido necesita ayuda con problemas de juego:

- **Línea Nacional**: 900 200 999 (24h, gratuito)
- **FEJAR**: www.fejar.org
- **Autoexclusión**: www.autoexclusion.es
- **Jugar Bien**: www.jugarbien.es

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Ángel Zamora Martínez**  
Experto en psicología clínica y adicciones comportamentales

---

⚠️ **Importante**: Este sitio web tiene fines educativos. Si sientes que tienes problemas con el juego, busca ayuda profesional inmediatamente.