'use strict';

/*
 * Mengembalikan isi folder data/ ke data awal (seed) di folder seed/.
 * Jalankan dengan: npm run seed
 * Berguna saat data demo sudah berubah banyak dan ingin dikembalikan ke
 * kondisi awal untuk uji coba ulang.
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'seed');
const DATA_DIR = path.join(__dirname, '..', 'data');

const collections = ['nasabah', 'jenisSampah', 'setoran', 'penarikan'];

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

collections.forEach((name) => {
  const from = path.join(SEED_DIR, `${name}.json`);
  const to = path.join(DATA_DIR, `${name}.json`);
  fs.copyFileSync(from, to);
  console.log(`Reset ${name}.json ke data awal.`);
});

console.log('Selesai. Data telah dikembalikan ke kondisi awal (seed).');
