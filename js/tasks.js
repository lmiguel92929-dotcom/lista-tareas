'use strict';

function createTask(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Escribí una tarea antes de agregarla.');
  }
  return { id: globalThis.crypto.randomUUID(), text: text.trim(), completed: false };
}

function initTaskApp(document, storage = typeof module !== 'undefined' && module.exports
  ? require('./storage.js') : MiniTaskStorage) {
  const form = document.querySelector('#task-form');
  const input = document.querySelector('#task-input');
  const list = document.querySelector('#task-list');
  const count = document.querySelector('#task-count');
  const status = document.querySelector('#status-message');
  let tasks = [];
  let storageReady = false;

  function message(text, error = false) {
    status.textContent = text;
    status.className = `status-message ${error ? 'error' : 'success'}`;
  }

  function updateCount() {
    const pending = tasks.filter(task => !task.completed).length;
    count.textContent = `${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'} · ${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`;
  }

  function commit(nextTasks) {
    try {
      storage.saveTasks(nextTasks);
      tasks = nextTasks;
      updateCount();
      return true;
    } catch {
      message('No se pudo guardar el cambio. Revisá el espacio y los permisos de almacenamiento del navegador e intentá nuevamente.', true);
      return false;
    }
  }

  function appendTask(task) {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;
    item.dataset.taskId = task.id;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Completada: ${task.text}`);
    checkbox.addEventListener('change', () => {
      const completed = checkbox.checked;
      if (commit(tasks.map(current => current.id === task.id ? { ...current, completed } : current))) {
        item.className = `task-item${completed ? ' completed' : ''}`;
        message(completed ? 'Tarea completada.' : 'Tarea marcada como pendiente.');
      } else {
        checkbox.checked = !completed;
      }
    });
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button button-delete';
    remove.textContent = 'Eliminar';
    remove.setAttribute('aria-label', `Eliminar tarea: ${task.text}`);
    remove.addEventListener('click', () => {
      if (commit(tasks.filter(current => current.id !== task.id))) {
        item.remove();
        input.focus();
        message('Tarea eliminada.');
      }
    });
    item.append(checkbox, text, remove);
    list.append(item);
  }

  function recoverTasks() {
    try {
      tasks = storage.loadTasks();
      storageReady = true;
      tasks.forEach(appendTask);
      updateCount();
      return true;
    } catch {
      message('No se pudieron recuperar tus tareas. No se sobrescribieron los datos. Revisá los permisos del navegador; si los datos están dañados, conservá una copia antes de repararlos. Luego intentá agregar la tarea nuevamente.', true);
      return false;
    }
  }

  recoverTasks();
  updateCount();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let task;
    try {
      task = createTask(input.value);
    } catch (error) {
      message(error.message, true);
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    if (!storageReady && !recoverTasks()) return;
    if (!commit([...tasks, task])) return;
    appendTask(task);
    message('Tarea agregada.');
    form.reset();
    input.focus();
  });

  const exportBtn = document.querySelector('#export-btn');
  const importBtn = document.querySelector('#import-btn');
  const importInput = document.querySelector('#import-file-input');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const json = storage.exportTasks();
        const date = new Date().toISOString().split('T')[0];
        const filename = `mini-task-backup-${date}.json`;
        const blob = new globalThis.Blob([json], { type: 'application/json' });
        if (globalThis.URL && typeof globalThis.URL.createObjectURL === 'function') {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          if (document.body) {
            document.body.append(a);
            a.click();
            a.remove();
          }
          globalThis.URL.revokeObjectURL(url);
        }
        message('Respaldo exportado exitosamente.');
      } catch (error) {
        message(error.message || 'Error al exportar tareas.', true);
      }
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const text = typeof file.text === 'function' ? await file.text() : String(file);
        const result = storage.importTasks(text);
        if (typeof list.replaceChildren === 'function') {
          list.replaceChildren();
        } else {
          list.children = [];
        }
        tasks = storage.loadTasks();
        tasks.forEach(appendTask);
        updateCount();
        const summary = result.skipped > 0
          ? `Se importaron ${result.added} ${result.added === 1 ? 'tarea nueva' : 'tareas nuevas'} (${result.skipped} ya estaban al día).`
          : `Se importaron ${result.added} ${result.added === 1 ? 'tarea nueva' : 'tareas nuevas'}.`;
        message(summary);
      } catch (error) {
        message(error.message || 'Error al importar tareas.', true);
      } finally {
        importInput.value = '';
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTask, initTaskApp };
}
if (typeof document !== 'undefined') {
  initTaskApp(document);
}
