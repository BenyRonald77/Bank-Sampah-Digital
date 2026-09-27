'use strict';

/*
 * Data layer sederhana berbasis file JSON.
 *
 * Ini bukan database production-grade, ini pilihan jujur untuk aplikasi
 * skala demo/single-process: satu file JSON per koleksi di folder data/,
 * dibaca dan ditulis secara sinkron. Cukup untuk satu bank sampah dengan
 * jumlah nasabah dan transaksi skala kecil-menengah, tidak untuk beban
 * tulis bersamaan yang tinggi.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePathFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureFile(collection) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const file = filePathFor(collection);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]\n', 'utf8');
  }
  return file;
}

function readAll(collection) {
  const file = ensureFile(collection);
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Data pada ${collection}.json tidak valid: ${err.message}`);
  }
}

function writeAll(collection, records) {
  const file = ensureFile(collection);
  fs.writeFileSync(file, JSON.stringify(records, null, 2) + '\n', 'utf8');
}

function find(collection, predicate) {
  const all = readAll(collection);
  if (typeof predicate !== 'function') return all;
  return all.filter(predicate);
}

function insert(collection, record) {
  const all = readAll(collection);
  all.push(record);
  writeAll(collection, all);
  return record;
}

function update(collection, id, patch) {
  const all = readAll(collection);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = Object.assign({}, all[idx], patch);
  writeAll(collection, all);
  return all[idx];
}

function remove(collection, id) {
  const all = readAll(collection);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  writeAll(collection, all);
  return true;
}

module.exports = { readAll, find, insert, update, remove };
