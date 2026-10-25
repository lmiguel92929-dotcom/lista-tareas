'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTask } = require('../js/tasks.js');

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
