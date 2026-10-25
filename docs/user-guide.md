# Guía de Uso — Mini Task

Bienvenido a la guía de usuario de **Mini Task**. Esta aplicación te permite organizar tus tareas cotidianas de forma rápida, accesible y sin distracciones.

---

## Índice

1. [Primeros Pasos](#primeros-pasos)
2. [Agregar una Nueva Tarea](#agregar-una-nueva-tarea)
3. [Validación y Mensajes de Estado](#validación-y-mensajes-de-estado)
4. [Visualización y Contador de Tareas](#visualización-y-contador-de-tareas)
5. [Tareas Completadas](#tareas-completadas)
6. [Navegación por Teclado y Accesibilidad](#navegación-por-teclado-y-accesibilidad)
7. [Modo Oscuro Automático](#modo-oscuro-automático)
8. [Uso en Dispositivos Móviles](#uso-en-dispositivos-móviles)

---

## 1. Primeros Pasos

Para comenzar a utilizar Mini Task:
1. Abrí el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Safari, Edge) o utilizá un servidor local como Live Server.
2. La interfaz cargará centrada en pantalla, lista para recibir tus tareas.

---

## 2. Agregar una Nueva Tarea

1. Ubicá el campo de texto con la etiqueta **"Nueva tarea"** (`#task-input`).
2. Escribí la descripción de tu tarea (por ejemplo: *"Preparar presentación de sprint"*).
3. Hacé clic en el botón **"Agregar tarea"** o presioná la tecla <kbd>Enter</kbd> en tu teclado.
4. Tu tarea aparecerá de inmediato en la lista **"Mis tareas"** (`#task-list`).

---

## 3. Validación y Mensajes de Estado

Mini Task incluye validaciones visuales instantáneas:

- **Campo vacío:** Si intentás agregar una tarea sin escribir texto, el campo se resaltará con un borde rojo y un sutil fondo de advertencia (`aria-invalid="true"`). Debajo aparecerá el mensaje informativo: *"Escribí una tarea antes de agregarla."*
- **Tarea agregada:** Al registrar una tarea exitosamente, el campo se limpiará, el foco regresará al campo de texto y se confirmará la acción con el mensaje *"Tarea agregada."*

---

## 4. Visualización y Contador de Tareas

En la sección **"Mis tareas"**:
- El contador superior (`#task-count`) muestra la cantidad de tareas registradas (ejemplo: `0 tareas`, `1 tarea`, `3 tareas`).
- Si la lista está vacía, se visualiza un estado amigable indicando que no tenés tareas pendientes.

---

## 5. Tareas Completadas

Cuando una tarea se marca como realizada:
- El texto de la tarea se muestra tachado y con una opacidad reducida (`.completed`).
- La tarjeta de la tarea adquiere un fondo atenuado y emite un pulso visual sutil para que confirmes el cambio de estado de manera intuitiva.
- Podés interactuar mediante controles accesibles (`.btn-toggle` o casilla de verificación) compatibles con navegación secuencial por teclado.

---

## 6. Navegación por Teclado y Accesibilidad

Mini Task cumple con los lineamientos de accesibilidad web (WCAG AA):
- **Navegación con <kbd>Tab</kbd>**: Podés recorrer todos los elementos interactivos secuencialmente.
- **Anillos de enfoque visibles**: Todos los controles destacan con un anillo de enfoque azul índigo (`:focus-visible`) de alto contraste.
- **Lectores de pantalla**: Los estados de validación utilizan atributos ARIA (`role="status"`, `aria-live="polite"`, `aria-invalid`) para anunciar cambios de estado en tiempo real.
- **Sensibilidad al movimiento**: Respeta la preferencia `prefers-reduced-motion` del sistema operativo, desactivando animaciones y transiciones no esenciales.

---

## 7. Modo Oscuro Automático

La interfaz detecta automáticamente las preferencias de tu sistema operativo (`prefers-color-scheme: dark`):
- **Modo Claro:** Fondo blanco nieve y slate con acentos índigo y púrpura.
- **Modo Oscuro:** Fondo azul pizarra profundo con superficies oscuras de alto contraste, reduciendo la fatiga visual en entornos de poca luz.

---

## 8. Uso en Dispositivos Móviles

Mini Task cuenta con un diseño fluido y Mobile-First:
- El formulario se reorganiza verticalmente en pantallas estrechas.
- Los botones y campos de entrada cuentan con áreas de toque amplias (mínimo 44px de altura) para facilitar la interacción táctil con una sola mano.
