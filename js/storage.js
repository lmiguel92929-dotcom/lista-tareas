'use strict';

const MiniTaskStorage = (() => {
  const key = 'mini-task.tasks';

  function loadTasks(storage = globalThis.localStorage) {
    const raw = storage.getItem(key);
    if (raw === null) return [];
    return validateTasks(JSON.parse(raw));
  }

  function validateTasks(tasks) {
    const ids = new Set();
    if (!Array.isArray(tasks) || !tasks.every(task => {
      if (!task || typeof task.id !== 'string' || !task.id.trim() ||
          typeof task.text !== 'string' || !task.text.trim() ||
          typeof task.completed !== 'boolean' || ids.has(task.id)) return false;
      ids.add(task.id);
      return true;
    })) {
      throw new Error('Los datos guardados no tienen un formato válido.');
    }
    return tasks.map(({ id, text, completed }) => ({ id, text, completed }));
  }

  function saveTasks(tasks, storage = globalThis.localStorage) {
    storage.setItem(key, JSON.stringify(tasks));
  }

  function exportTasks(storage = globalThis.localStorage) {
    return JSON.stringify({ format: 'mini-task', version: 1, tasks: loadTasks(storage) }, null, 2);
  }

  function importTasks(text, storage = globalThis.localStorage) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > 1024 * 1024) {
      throw new Error('Elegí un archivo JSON de hasta 1 MiB.');
    }
    let backup;
    try {
      backup = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
      throw new Error('El archivo no contiene JSON válido.');
    }
    if (!backup || backup.format !== 'mini-task' || backup.version !== 1) {
      throw new Error('El archivo no es un respaldo compatible de Mini Task (versión 1).');
    }
    const incoming = validateTasks(backup.tasks);
    const existing = loadTasks(storage);
    const byId = new Map(existing.map(task => [task.id, task]));
    const added = [];
    for (const task of incoming) {
      const current = byId.get(task.id);
      if (!current) {
        added.push(task);
      } else if (current.text !== task.text || current.completed !== task.completed) {
        throw new Error('Una tarea del respaldo entra en conflicto con una tarea existente. No se importó ningún cambio.');
      }
    }
    const tasks = [...existing, ...added];
    if (added.length) saveTasks(tasks, storage);
    return { tasks, added: added.length, skipped: incoming.length - added.length };
  }

  return { loadTasks, saveTasks, exportTasks, importTasks };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniTaskStorage;
}
