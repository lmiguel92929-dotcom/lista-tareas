'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTask } = require('../js/tasks.js');
const { initTaskApp } = require('../js/tasks.js');
const { loadTasks, saveTasks } = require('../js/storage.js');

test('crea una tarea pendiente y recorta espacios exteriores', () => {
  const task = createTask('  Comprar pan  ');
  assert.equal(task.text, 'Comprar pan');
  assert.equal(task.completed, false);
  assert.match(task.id, /^[0-9a-f-]{36}$/);
});

test('rechaza entradas vacías y valores que no son texto', () => {
  for (const value of ['', '   ', '\n\t', null, undefined, 42]) {
    assert.throws(() => createTask(value), /Escribí una tarea/);
  }
});

test('asigna identificadores distintos a tareas con el mismo texto', () => {
  assert.notEqual(createTask('Leer').id, createTask('Leer').id);
});

test('conserva caracteres especiales como texto', () => {
  assert.equal(createTask('<img src=x onerror=alert(1)>').text, '<img src=x onerror=alert(1)>');
});

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('localStorage recupera listas vacías, tareas pendientes y completadas', () => {
  const storage = memoryStorage();
  assert.deepEqual(loadTasks(storage), []);
  const tasks = [createTask('Leer'), { ...createTask('Comprar'), completed: true }];
  saveTasks(tasks, storage);
  assert.deepEqual(loadTasks(storage), tasks);
  saveTasks([], storage);
  assert.deepEqual(loadTasks(storage), []);
});

test('rechaza datos dañados sin reemplazarlos', () => {
  const task = createTask('Leer');
  for (const raw of ['{', 'null', '{}', '[null]', JSON.stringify([{ ...task, completed: 'false' }]),
    JSON.stringify([{ ...task, text: ' ' }]), JSON.stringify([task, task])]) {
    const storage = memoryStorage();
    storage.setItem('mini-task.tasks', raw);
    assert.throws(() => loadTasks(storage));
    assert.equal(storage.getItem('mini-task.tasks'), raw);
  }
});

test('propaga fallos de lectura y escritura para que la interfaz informe el error', () => {
  const storage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
  };
  assert.throws(() => loadTasks(storage), /SecurityError/);
  assert.throws(() => saveTasks([], storage), /QuotaExceededError/);
});

// Simula únicamente los elementos usados por la interfaz, sin dependencias de DOM.
function app(storage) {
  function element() {
    return {
      children: [], attributes: {}, dataset: {}, listeners: {}, value: '',
      append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); }); },
      remove() { this.parent.children = this.parent.children.filter(node => node !== this); },
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      addEventListener(type, callback) { this.listeners[type] = callback; },
      focus() { this.focused = true; },
      dispatch(type) { this.listeners[type]({ preventDefault() {} }); },
    };
  }
  const nodes = Object.fromEntries(['task-form', 'task-input', 'task-list', 'task-count', 'status-message']
    .map(id => [id, element()]));
  nodes['task-form'].reset = () => { nodes['task-input'].value = ''; };
  initTaskApp({ querySelector: selector => nodes[selector.slice(1)], createElement: element }, storage);
  return {
    nodes,
    submit(text) { nodes['task-input'].value = text; nodes['task-form'].dispatch('submit'); },
  };
}

test('interfaz crea, completa, vuelve a pendiente, recupera y elimina tareas', () => {
  const memory = memoryStorage();
  const storage = { loadTasks: () => loadTasks(memory), saveTasks: tasks => saveTasks(tasks, memory) };
  const first = app(storage);
  first.submit('   ');
  assert.equal(first.nodes['task-list'].children.length, 0);
  assert.equal(first.nodes['task-input'].attributes['aria-invalid'], 'true');
  first.submit('<b>Leer</b>');
  const item = first.nodes['task-list'].children[0];
  assert.equal(item.children[1].textContent, '<b>Leer</b>');
  assert.equal(first.nodes['task-input'].value, '');
  const checkbox = item.children[0];
  for (const completed of [true, false, true]) {
    checkbox.checked = completed;
    checkbox.dispatch('change');
    assert.equal(loadTasks(memory)[0].completed, completed);
    assert.equal(item.className.includes('completed'), completed);
  }
  const reloaded = app(storage);
  const restored = reloaded.nodes['task-list'].children[0];
  assert.equal(restored.children[0].checked, true);
  assert.match(reloaded.nodes['task-count'].textContent, /0 pendientes/);
  restored.children[2].dispatch('click');
  assert.deepEqual(loadTasks(memory), []);
  assert.equal(reloaded.nodes['task-list'].children.length, 0);
  assert.equal(reloaded.nodes['task-input'].focused, true);
});

test('un fallo al guardar conserva la lista, el checkbox y la entrada sin anunciar éxito', () => {
  const existing = createTask('Existente');
  const { nodes, submit } = app({
    loadTasks: () => [existing],
    saveTasks() { throw new Error('Sin espacio'); },
  });
  submit('Nueva');
  assert.equal(nodes['task-input'].value, 'Nueva');
  assert.equal(nodes['task-list'].children.length, 1);
  const item = nodes['task-list'].children[0];
  item.children[0].checked = true;
  item.children[0].dispatch('change');
  assert.equal(item.children[0].checked, false);
  item.children[2].dispatch('click');
  assert.equal(nodes['task-list'].children.length, 1);
  assert.match(nodes['status-message'].textContent, /No se pudo guardar/);
  assert.equal(nodes['status-message'].className, 'status-message error');
});

test('un fallo al recuperar datos impide sobrescribir el almacenamiento', () => {
  let writes = 0;
  const { nodes, submit } = app({
    loadTasks() { throw new Error('Datos corruptos'); },
    saveTasks() { writes++; },
  });
  assert.match(nodes['status-message'].textContent, /No se pudieron recuperar/);
  submit('Nueva');
  assert.equal(writes, 0);
  assert.equal(nodes['task-list'].children.length, 0);
});
