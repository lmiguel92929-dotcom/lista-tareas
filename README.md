# Mini Task

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility WCAG AA](https://img.shields.io/badge/accessibility-WCAG%20AA-success.svg)](#accesibilidad)
[![CSS3 Pure](https://img.shields.io/badge/CSS3-Pure%20Styles-informational.svg)](#tecnolog%C3%ADas)

**Mini Task** es una aplicación web ágil, moderna y accesible para la gestión de tareas cotidianas. Diseñada bajo un enfoque minimalista y de alto rendimiento, permite a los usuarios organizar sus actividades diarias con una experiencia visual pulida y retroalimentación inmediata.

El proyecto es el resultado del desarrollo colaborativo entre desarrolladores con segregación de responsabilidades: diseño y documentación a cargo de **Google Antigravity** y estructura y lógica a cargo de **Codex**.

---

## Características Principales

- **Gestión Ágil de Tareas:** Creación instantánea de tareas con validación en tiempo real.
- **Diseño Mobile-First & Responsive:** Adaptación óptima y fluida a teléfonos móviles, tablets y computadoras de escritorio.
- **Accesibilidad Integral (WCAG 2.1 AA):**
  - Ratios de contraste de color certificados para alta legibilidad.
  - Indicadores de enfoque visible (`:focus-visible`) para navegación 100% por teclado.
  - Soporte de reducción de movimiento (`prefers-reduced-motion`).
- **Modo Oscuro Integrado:** Detección automática de la preferencia del sistema (`prefers-color-scheme: dark`) para mayor confort visual.
- **Contador Dinámico de Tareas:** Indicador visual estilizado con estado en tiempo real.
- **Estados de Componentes Visuales:** Tratamiento específico para tareas activas, tareas completadas (`.completed`), estados hover, active y mensajes de validación.
- **Respaldo y Transferencia de Datos:** Exportación e importación segura de tareas en formato JSON con validación aditiva y prevención de conflictos.

---

## Tecnologías Utilizadas

- **HTML5 Semántico:** Estructura accesible con roles y atributos ARIA (`role="status"`, `aria-live="polite"`, `aria-describedby`).
- **CSS3 Puro:** Sistema de diseño propio sin dependencias externas ni frameworks pesados, basado en Custom Properties (variables CSS), Flexbox y Grid.
- **Vanilla JavaScript:** Lógica ligera, nativa y modular.
- **Git & GitHub:** Flujo de colaboración mediante ramas de funcionalidad, Pull Requests e integración continua.

---

## Estructura de Carpetas

```text
lista-tareas/
├── css/
│   └── styles.css          # Sistema de diseño, tokens, componentes y media queries
├── docs/
│   ├── contributing.md     # Guía detallada para desarrolladores y colaboradores
│   └── user-guide.md       # Manual de uso paso a paso para el usuario final
├── js/
│   ├── storage.js          # Persistencia de datos en almacenamiento local (Codex)
│   └── tasks.js            # Lógica de manipulación de tareas y eventos (Codex)
├── tests/
│   └── tasks.test.js       # Pruebas automatizadas unitarias (Codex)
├── .gitignore              # Archivos y carpetas excluidas del control de versiones
├── index.html              # Estructura semántica de la aplicación (Codex)
└── README.md               # Documentación general del proyecto
```

---

## Instalación y Ejecución

Al ser una aplicación frontend estática y ligera, no requiere pasos de compilación ni dependencias complejas:

### 1. Clonar el repositorio
```bash
git clone https://github.com/lmiguel92929-dotcom/lista-tareas.git
cd lista-tareas
```

### 2. Ejecutar la aplicación
Podés ejecutar la aplicación de cualquiera de las siguientes formas:

- **Directamente en el navegador:** Haciendo doble clic sobre el archivo `index.html`.
- **Con Live Server (VS Code):** Haciendo clic derecho sobre `index.html` y seleccionando **"Open with Live Server"**.
- **Con Node / `npx serve`:**
  ```bash
  npx serve .
  ```

---

## Contrato de Integración

El proyecto se rige por un contrato estricto de selectores e identificadores compartidos entre la capa de presentación y la capa de lógica:

| Identificador | Elemento | Responsabilidad |
|---|---|---|
| `#task-form` | `<form>` | Contenedor del formulario de alta |
| `#task-input` | `<input>` | Entrada de texto de la tarea |
| `#task-list` | `<ul>` | Lista renderizada de tareas |
| `#task-count` | `<p>` | Contador numérico de tareas |
| `#status-message` | `<p>` | Canal de anuncios y validación de estado |
| `#task-transfer` | `<section>` | Contenedor de las acciones de transferencia y respaldo |
| `#export-btn` | `<button>` | Disparador para exportar y descargar respaldo JSON |
| `#import-btn` | `<button>` | Disparador para abrir selector de archivo de respaldo |
| `#import-file-input` | `<input type="file">` | Campo de archivo oculto/accesible para carga del JSON |

Para proponer modificaciones sobre este contrato, consultá la [Guía de Contribución](docs/contributing.md).

---

## Documentación Adicional

- [Guía de Uso para el Usuario](docs/user-guide.md): Instrucciones detalladas sobre cómo agregar tareas, navegar por teclado y aprovechar la interfaz.
- [Guía de Contribución](docs/contributing.md): Flujo de trabajo con Git, estándares de código, coautoría y reglas de colaboración.

---

## Equipo de Desarrollo y Reconocimientos

Este proyecto ha sido desarrollado en forma colaborativa por:

- **lmiguel92929-dotcom** (Diseño de interfaz, CSS accesible, arquitectura visual y documentación) — asistido por **Google Antigravity**.
- **NadiaEnoaRizoAvalos** (Estructura semántica HTML, lógica JavaScript y pruebas) — asistida por **Codex**.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consultá los términos para más información.
