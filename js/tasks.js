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
  const exportButton = document.querySelector('#export-btn');
  const importButton = document.querySelector('#import-btn');
  const fileInput = document.querySelector('#import-file-input');
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

  exportButton.addEventListener('click', () => {
    let url;
    try {
      const json = storage.exportTasks();
      const browser = document.defaultView;
      url = browser.URL.createObjectURL(new browser.Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      const date = new Date();
      const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      link.href = url;
      link.download = `mini-task-backup-${stamp}.json`;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
      message('Se inició la descarga del respaldo de tareas.');
    } catch {
      message('No se pudo exportar el respaldo. Revisá los datos guardados y los permisos del navegador. No se modificaron tus tareas.', true);
    } finally {
      if (url) document.defaultView.setTimeout(() => document.defaultView.URL.revokeObjectURL(url), 1000);
    }
  });

  importButton.addEventListener('click', () => fileInput.click());
  let importing = false;
  fileInput.addEventListener('change', async () => {
    if (importing) return;
    const file = fileInput.files[0];
    if (!file) return;
    importing = true;
    importButton.disabled = true;
    exportButton.disabled = true;
    fileInput.disabled = true;
    message('Importando respaldo…');
    try {
      if (file.size > 1024 * 1024) throw new Error('El archivo supera el límite de 1 MiB.');
      const result = storage.importTasks(await file.text());
      tasks = result.tasks;
      storageReady = true;
      list.replaceChildren();
      tasks.forEach(appendTask);
      updateCount();
      message(`Importación completada: ${result.added} tareas nuevas y ${result.skipped} duplicadas omitidas.`);
    } catch (error) {
      message(`No se pudo importar el respaldo. Revisá el archivo, el espacio y los permisos de almacenamiento. ${error.message}`, true);
    } finally {
      importing = false;
      importButton.disabled = false;
      exportButton.disabled = false;
      fileInput.disabled = false;
      fileInput.value = '';
      importButton.focus();
    }
  });

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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTask, initTaskApp };
}
if (typeof document !== 'undefined') {
  initTaskApp(document);
}
