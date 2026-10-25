'use strict';

const MiniTaskStorage = (() => {
  const key = 'mini-task.tasks';

  function loadTasks(storage = globalThis.localStorage) {
    const raw = storage.getItem(key);
    if (raw === null) return [];
    const tasks = JSON.parse(raw);
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

  return { loadTasks, saveTasks };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniTaskStorage;
}
