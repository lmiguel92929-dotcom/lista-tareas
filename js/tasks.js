'use strict';

function createTask(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Escribí una tarea antes de agregarla.');
  }
  return { id: globalThis.crypto.randomUUID(), text: text.trim(), completed: false };
}

function initTaskApp(document) {
  const form = document.querySelector('#task-form');
  const input = document.querySelector('#task-input');
  const list = document.querySelector('#task-list');
  const count = document.querySelector('#task-count');
  const status = document.querySelector('#status-message');
  const tasks = [];

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let task;
    try {
      task = createTask(input.value);
    } catch (error) {
      status.textContent = error.message;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    tasks.push(task);
    const item = document.createElement('li');
    item.className = 'task-item';
    item.dataset.taskId = task.id;
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    item.append(text);
    list.append(item);
    count.textContent = `${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'}`;
    status.textContent = 'Tarea agregada.';
    input.removeAttribute('aria-invalid');
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
