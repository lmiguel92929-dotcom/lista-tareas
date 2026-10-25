# Guía de Contribución — Mini Task

¡Gracias por tu interés en contribuir a **Mini Task**! Este documento describe el flujo de trabajo colaborativo, los estándares de código y las buenas prácticas para colaborar en este repositorio.

---

## Índice

1. [Filosofía y Separación de Responsabilidades](#filosofía-y-separación-de-responsabilidades)
2. [Contrato de Integración](#contrato-de-integración)
3. [Estrategia de Ramas (Git Flow)](#estrategia-de-ramas-git-flow)
4. [Estándares de Código](#estándares-de-código)
5. [Pull Requests y Revisión](#pull-requests-y-revisión)
6. [Coautoría en Commits](#coautoría-en-commits)

---

## 1. Filosofía y Separación de Responsabilidades

Para asegurar un desarrollo armónico y sin colisiones entre desarrolladores y agentes, el proyecto mantiene responsabilidades independientes:

- **Equipo de Diseño y Documentación (Antigravity):**
  - Estilos visuales: `css/styles.css`
  - Documentación: `README.md`, `docs/user-guide.md`, `docs/contributing.md`
- **Equipo de Lógica y Estructura (Codex):**
  - Estructura HTML: `index.html`
  - Lógica JavaScript: `js/tasks.js`, `js/storage.js`
  - Pruebas automatizadas: `tests/tasks.test.js`

> **Importante:** Ningún colaborador debe modificar o sobrescribir archivos asignados al otro equipo de forma unilateral.

---

## 2. Contrato de Integración

Cualquier funcionalidad compartida debe respetar estrictamente el contrato de selectores acordado:

| Selector | Tipo | Propósito |
|---|---|---|
| `#task-form` | `<form>` | Formulario principal para agregar tareas |
| `#task-input` | `<input>` | Campo de texto de la tarea |
| `#task-list` | `<ul>` | Lista de tareas agregadas |
| `#task-count` | `<p>` | Contador dinámico de tareas |
| `#status-message` | `<p>` | Mensajes de validación y estado |

Si se requiere agregar nuevos elementos o clases, debe proponerse previamente a través de un **Issue** o debate en **Discussions**.

---

## 3. Estrategia de Ramas (Git Flow)

1. **Rama principal (`main`)**: Siempre debe mantenerse funcional y desplegable.
2. **Ramas de funcionalidad (`feature/`)**:
   - Usar el prefijo correspondiente al equipo:
     - `feature/antigravity-*` para diseño y documentación.
     - `feature/codex-*` para estructura y lógica.
3. **Flujo de trabajo**:
   ```bash
   # 1. Actualizar main
   git checkout main
   git pull origin main

   # 2. Crear rama específica
   git checkout -b feature/antigravity-mi-mejora

   # 3. Realizar commits pequeños y atómicos
   git add <archivos>
   git commit -m "feat(modulo): descripción clara del cambio"

   # 4. Publicar rama y abrir Pull Request
   git push -u origin feature/antigravity-mi-mejora
   ```

---

## 4. Estándares de Código

### CSS
- **Puro y sin dependencias**: No utilizar frameworks externos (Tailwind, Bootstrap, etc.).
- **Variables semánticas**: Utilizar las propiedades personalizadas definidas en `:root` (colores, espaciados, radios y sombras).
- **Accesibilidad**: Mantener ratios de contraste WCAG AA, estilos de enfoque visibles (`:focus-visible`) y soporte para `prefers-reduced-motion` y `prefers-color-scheme`.

### Commits
- Seguir la convención de commits convencionales:
  - `feat`: Nuevas características.
  - `fix`: Corrección de errores.
  - `docs`: Modificaciones en documentación.
  - `style`: Formato o estilos sin cambios lógicos.
  - `refactor`: Refactorización de código existente.

---

## 5. Pull Requests y Revisión

- Abrir siempre el Pull Request contra la rama `main`.
- Proporcionar una descripción clara de los cambios realizados, las pruebas ejecutadas y los issues relacionados.
- Verificar que no existan conflictos antes de fusionar.

---

## 6. Coautoría en Commits

En contribuciones conjuntas donde participen ambos desarrolladores, registrar la coautoría mediante el trailer estándar de Git en el mensaje del commit:

```git
feat: coordinar mejora de interfaz y lógica de almacenamiento

Co-authored-by: NadiaEnoaRizoAvalos <Nadia.RizoAvalos@alu.frt.utn.edu.ar>
```

Esto asegura que GitHub reconozca y atribuya correctamente el logro y la autoría compartida a ambos desarrolladores.
