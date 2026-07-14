<p align="center">
  <img width="320" src="https://wpimg.wallstcn.com/ecc53a42-d79b-42e2-8852-5126b810a4c8.svg">
</p>

<p align="center">
  <a href="https://github.com/vuejs/core">
    <img src="https://img.shields.io/badge/vue-3.4-brightgreen.svg" alt="vue">
  </a>
  <a href="https://github.com/element-plus/element-plus">
    <img src="https://img.shields.io/badge/element--plus-2.7-brightgreen.svg" alt="element-plus">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-5.4-blue.svg" alt="typescript">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/vite-5.2-646cff.svg" alt="vite">
  </a>
  <a href="https://github.com/PanJiaChen/vue-element-admin/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>
  <a href="https://github.com/PanJiaChen/vue-element-admin/releases">
    <img src="https://img.shields.io/github/release/PanJiaChen/vue-element-admin.svg" alt="GitHub release">
  </a>
  <a href="https://gitter.im/vue-element-admin/discuss">
    <img src="https://badges.gitter.im/Join%20Chat.svg" alt="gitter">
  </a>
  <a href="https://panjiachen.github.io/vue-element-admin-site/donate">
    <img src="https://img.shields.io/badge/%24-donate-ff69b4.svg" alt="donate">
  </a>
</p>

Español | [English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

## Introducción

[vue-element-admin](https://panjiachen.github.io/vue-element-admin) es una interfaz de administración preparada para producción. Está basada en [Vue 3](https://github.com/vuejs/core) y usa el conjunto de herramientas de interfaz de usuario [Element Plus](https://github.com/element-plus/element-plus).

Vue Element Admin es una solución práctica construida sobre una pila de desarrollo moderna (Vue 3 + TypeScript + Vite + Pinia), con soporte i18n integrado, plantillas estándar para aplicaciones empresariales y un conjunto de características asombrosas. Esta herramienta ayuda a construir Aplicaciones de una sola página (SPA) grandes y complejas. Creo que lo que necesites hacer, este proyecto te ayudará.

- [Vista Previa de la Aplicación](https://panjiachen.github.io/vue-element-admin)

- [Documentación](https://panjiachen.github.io/vue-element-admin-site/)

- [Canal de Gitter](https://gitter.im/vue-element-admin/discuss)

- [Para Donaciones](https://panjiachen.github.io/vue-element-admin-site/donate/)

- [Enlace de Wiki](https://github.com/PanJiaChen/vue-element-admin/wiki)

- [Canal de Gitee](https://panjiachen.gitee.io/vue-element-admin/)

- Plantilla base recomendada para usar: [vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)
- Aplicación de Escritorio: [electron-vue-admin](https://github.com/PanJiaChen/electron-vue-admin)
- [awesome-project](https://github.com/PanJiaChen/vue-element-admin/issues/2312)

## Migración

**La versión actual es `v5.0+` y está construida sobre Vue 3 + TypeScript + Vite + Pinia + Element Plus.**

Si estás actualizando desde una rama `v4.x` anterior (Vue 2 + Vue CLI + Vuex + Element UI), por favor clona el repositorio nuevamente y migra tu código de negocio. La arquitectura de v5 no es compatible con el sistema de compilación de v4, y este proyecto ya no soporta Internet Explorer.

Si encuentras algún problema, no dudes en crear un [issue](https://github.com/PanJiaChen/vue-element-admin/issues/new).

**Este proyecto no está soportado para versiones antiguas de navegadores (ej. IE). Por favor agrega polyfills por tu cuenta si es necesario.**

## Preparación

Necesita instalar [node](https://nodejs.org/) y [git](https://git-scm.com/) localmente. El proyecto está basado en [ES2015+](https://es6.ruanyifeng.com/), [Vue 3](https://vuejs.org/), [Pinia](https://pinia.vuejs.org/), [vue-router](https://router.vuejs.org/), [Vite](https://vitejs.dev/), [axios](https://github.com/axios/axios) y [Element Plus](https://github.com/element-plus/element-plus). Toda la solicitud de datos simulada se realiza a través de [Mock.js](https://github.com/nuysoft/Mock).

Entender y aprender esto de antemano ayudará enormemente a usar este proyecto.

<p align="center">
  <img width="900" src="https://wpimg.wallstcn.com/a5894c1b-f6af-456e-82df-1151da0839bf.png">
</p>

## Patrocinantes

Sea un patrocinante y coloque su logo en nuestro README en GitHub con un enlace directo a su sitio web. [[Se un Patrocinante]](https://www.patreon.com/panjiachen)

### Akveo
<a href="https://store.akveo.com/products/vue-java-admin-dashboard-spring?utm_campaign=akveo_store-Vue-Vue_demo%2Fgithub&utm_source=vue_admin&utm_medium=referral&utm_content=github_banner"><img width="500px" src="https://raw.githubusercontent.com/PanJiaChen/vue-element-admin-site/master/docs/.vuepress/public/images/vue-java-banner.png" /></a><p>Get Java backend for Vue admin with 20% discount for 39$ use coupon code SWB0RAZPZR1M
</p>

### Flatlogic

<a href="https://flatlogic.com/admin-dashboards?from=vue-element-admin"><img width="150px" src="https://wpimg.wallstcn.com/9c0b719b-5551-4c1e-b776-63994632d94a.png" /></a><p>Admin Dashboard Templates made with Vue, React and Angular.</p>

## Características

```
- Iniciar / Cerrar Sesión

- Permisos de Autenticación
  - Página de Permisos
  - Directivas de permisos
  - Página de configuración de permisos
  - Autenticación por dos pasos

- Construcción Multi-entorno
  - Desarrollo (dev)
  - sit
  - Escenario de pruebas (stage)
  - Producción (prod)

- Características Globales
  - I18n
  - Temas dinámicos
  - Menu lateral dinámico (soporte a rutas multi-nivel)
  - Barra de rutas dinámica
  - Tags-view (Pestañas de página, soporta operación de clic derecho)
  - Svg Sprite
  - Datos de simulación con Mock
  - Pantalla completa
  - Menu lateral responsivo

- Editor
  - Editor de Texto Enriquecido
  - Editor Markdown
  - Editor JSON

- Excel
  - Exportación a Excel
  - Carga de Excel
  - Visualización de Excel
  - Exportación como ZIP

- Tabla
  - Tabla Dinámica
  - Tabla con Arrastrar y Soltar
  - Tabla de edición en línea

- Páginas de Error
  - 401
  - 404

- Componentes
  - Carga de Avatar
  - Botón para subir al inicio
  - Arrastrar y Soltar (Diálogo)
  - Arrastrar y Soltar (Seleccionar)
  - Arrastrar y Soltar (Kanban)
  - Arrastrar y Soltar (Lista)
  - Panel de división
  - Componente para soltar archivos
  - Adhesión de objetos
  - Contador hasta

- Ejemplo Avanzado
- Registro de Errores
- Tablero de indicadores
- Página de Guías
- ECharts (Gráficos)
- Portapapeles
- Convertidor de Markdown a HTML
```

## Iniciando

```bash
# clone el proyecto
git clone https://github.com/PanJiaChen/vue-element-admin.git

# vaya al directorio clonado
cd vue-element-admin

# instale las dependencias
npm install

# corra el proyecto como desarrollador
npm run dev
```

Automáticamente se abrirá el siguiente enlace en su navegador http://localhost:9527

## Construcción

```bash
# Construcción para entornos de producción
npm run build

# Construcción para entornos de staging
npm run build:stage
```

## Pruebas

```bash
# Ejecutar pruebas unitarias (Vitest)
npm run test:unit

# Ejecutar pruebas E2E (Playwright)
npm run test:e2e

# Ejecutar pruebas E2E con UI interactiva
npm run test:e2e:ui
```

## Avanzado

```bash
# Vista previa con efectos de entorno
npm run preview

# Verificación de tipos
npm run type-check

# Verificación de formato de código y auto-corrección
npm run lint
```

Vaya a [Documentación](https://panjiachen.github.io/vue-element-admin-site/guide/essentials/deploy.html) para mayor información

## Registro de Cambios

Los cambios detallados por cada liberación se encuentran en [notas de liberación](https://github.com/PanJiaChen/vue-element-admin/releases).

## Demostración en línea

[Vista Previa de la Aplicación](https://panjiachen.github.io/vue-element-admin)

## Donación

Si este proyecto es de mucha ayuda para ti, puedes comprarle al autor un vaso de jugo :tropical_drink:

![Donar](https://wpimg.wallstcn.com/bd273f0d-83a0-4ef2-92e1-9ac8ed3746b9.png)

[dona por Paypal](https://www.paypal.me/panfree23)

[Comprame un Café](https://www.buymeacoffee.com/Pan)

## Navegadores Soportados

Navegadores modernos (Vue 3 no soporta Internet Explorer).

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| últimas 2 versiones | últimas 2 versiones | últimas 2 versiones | últimas 2 versiones |

## Licencia

[MIT](https://github.com/PanJiaChen/vue-element-admin/blob/master/LICENSE)

Copyright (c) 2017-present PanJiaChen
