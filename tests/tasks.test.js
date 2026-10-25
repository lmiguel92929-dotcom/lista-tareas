'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTask } = require('../js/tasks.js');
const { initTaskApp } = require('../js/tasks.js');
const { loadTasks, saveTasks } = require('../js/storage.js');
const { exportTasks, importTasks } = require('../js/storage.js');

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
  const nodes = Object.fromEntries(['task-form', 'task-input', 'task-list', 'task-count', 'status-message', 'export-btn', 'import-btn', 'import-file-input']
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

test('reintenta una lectura fallida y conserva las tareas recuperadas al agregar', () => {
  const existing = createTask('Recuperada');
  let readable = false;
  let saved;
  const { nodes, submit } = app({
    loadTasks() {
      if (!readable) throw new Error('Lectura bloqueada');
      return [existing];
    },
    saveTasks(tasks) { saved = tasks; },
  });
  submit('Nueva');
  assert.equal(saved, undefined);
  readable = true;
  submit('Nueva');
  assert.equal(saved.length, 2);
  assert.deepEqual(saved[0], existing);
  assert.equal(nodes['task-list'].children.length, 2);
  submit('Otra');
  assert.equal(nodes['task-list'].children.length, 3);
});

test('una entrada válida deja de anunciarse inválida aunque falle el guardado', () => {
  const { nodes, submit } = app({
    loadTasks: () => [],
    saveTasks() { throw new Error('Sin espacio'); },
  });
  submit('');
  assert.equal(nodes['task-input'].attributes['aria-invalid'], 'true');
  submit('Válida');
  assert.equal(nodes['task-input'].attributes['aria-invalid'], undefined);
  assert.equal(nodes['task-input'].value, 'Válida');
  assert.match(nodes['status-message'].textContent, /No se pudo guardar/);
});

test('exportar e importar conserva texto Unicode, identificadores y estado', () => {
  const source = memoryStorage();
  const tasks = [createTask('Comprar café ☕'), { ...createTask('<b>Leer</b>'), completed: true }];
  saveTasks(tasks, source);
  const json = exportTasks(source);
  assert.equal(JSON.parse(json).version, 1);
  const destination = memoryStorage();
  assert.deepEqual(importTasks(json, destination), { tasks, added: 2, skipped: 0 });
  assert.deepEqual(loadTasks(destination), tasks);
  assert.deepEqual(importTasks('\uFEFF' + json, destination), { tasks, added: 0, skipped: 2 });
});

test('importar agrega sin eliminar tareas existentes y exporta una lista vacía', () => {
  const destination = memoryStorage();
  const existing = createTask('Local');
  saveTasks([existing], destination);
  assert.equal(importTasks(exportTasks(memoryStorage()), destination).added, 0);
  assert.deepEqual(loadTasks(destination), [existing]);
  const source = memoryStorage();
  const incoming = createTask('Importada');
  saveTasks([incoming], source);
  assert.deepEqual(importTasks(exportTasks(source), destination).tasks, [existing, incoming]);
});

test('rechaza respaldos inválidos sin alterar los datos locales', () => {
  const local = createTask('Local');
  const incoming = createTask('Importada');
  const wrap = tasks => JSON.stringify({ format: 'mini-task', version: 1, tasks });
  for (const json of ['{', 'null', '{}', '[]', JSON.stringify({ format: 'mini-task', version: 2, tasks: [] }),
    wrap([incoming, incoming]), wrap([{ ...incoming, completed: 'true' }]), wrap([incoming, { ...local, text: 'Conflicto' }])]) {
    const destination = memoryStorage();
    saveTasks([local], destination);
    const before = destination.getItem('mini-task.tasks');
    assert.throws(() => importTasks(json, destination));
    assert.equal(destination.getItem('mini-task.tasks'), before);
  }
});

test('rechaza archivos grandes midiendo bytes UTF-8 y entradas no textuales', () => {
  assert.throws(() => importTasks('é'.repeat(524289), memoryStorage()), /1 MiB/);
  assert.throws(() => importTasks(null, memoryStorage()), /archivo JSON/);
});

test('exportar e importar no sobrescribe almacenamiento local corrupto', () => {
  const destination = memoryStorage();
  destination.setItem('mini-task.tasks', '{');
  assert.throws(() => exportTasks(destination));
  assert.throws(() => importTasks(exportTasks(memoryStorage()), destination));
  assert.equal(destination.getItem('mini-task.tasks'), '{');
});

test('un fallo de escritura durante la importación se propaga sin anunciar éxito', () => {
  const source = memoryStorage();
  saveTasks([createTask('Importar')], source);
  const destination = { getItem: () => null, setItem() { throw new Error('Sin espacio'); } };
  assert.throws(() => importTasks(exportTasks(source), destination), /Sin espacio/);
});

test('interfaz exporta e importa tareas actualizando lista y estado', async () => {
  const memory = memoryStorage();
  const storage = {
    loadTasks: () => loadTasks(memory),
    saveTasks: tasks => saveTasks(tasks, memory),
    exportTasks: () => exportTasks(memory),
    importTasks: text => importTasks(text, memory),
  };
  const { nodes, submit } = app(storage);
  submit('Tarea 1');
  assert.equal(nodes['task-list'].children.length, 1);

  // Comprobar exportación
  let exportedData;
  const originalCreateObjectURL = globalThis.URL?.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL?.revokeObjectURL;
  if (!globalThis.URL) globalThis.URL = {};
  globalThis.URL.createObjectURL = (blob) => {
    exportedData = blob;
    return 'blob:mock-url';
  };
  globalThis.URL.revokeObjectURL = () => {};

  nodes['export-btn'].dispatch('click');

  if (originalCreateObjectURL) globalThis.URL.createObjectURL = originalCreateObjectURL;
  if (originalRevokeObjectURL) globalThis.URL.revokeObjectURL = originalRevokeObjectURL;

  assert.match(nodes['status-message'].textContent, /Respaldo exportado exitosamente/);
  assert.equal(exportedData instanceof Blob, true);

  // Comprobar importación
  let opened = false;
  nodes['import-file-input'].click = () => { opened = true; };
  nodes['import-btn'].dispatch('click');
  assert.equal(opened, true);

  const backupJson = JSON.stringify({
    format: 'mini-task',
    version: 1,
    tasks: [{ id: '99999999-9999-9999-9999-999999999999', text: 'Importada', completed: false }]
  });
  nodes['import-file-input'].files = [{ text: async () => backupJson }];
  await nodes['import-file-input'].listeners['change']();
  assert.match(nodes['status-message'].textContent, /Se importaron 1 tarea nueva/);
  assert.equal(nodes['task-list'].children.length, 2);
});
