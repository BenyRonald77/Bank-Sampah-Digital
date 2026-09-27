# Bank Sampah Digital

Aplikasi web untuk mengelola operasional bank sampah komunitas (RT/RW): data nasabah, data jenis sampah dan harga per kilogram, pencatatan setoran sampah, penarikan saldo, dan laporan rekap bulanan. Lihat `PRD.md` untuk detail kebutuhan produk dan `DESIGN.md` untuk arahan desain.

## Cara Install & Menjalankan

Butuh Node.js versi 18 ke atas.

```bash
npm install
npm start
```

Aplikasi berjalan di `http://localhost:3000` secara default. Untuk memakai port lain, set variabel lingkungan `PORT`:

```bash
PORT=4000 npm start
```

## Reset Data (Reseed)

Data operasional disimpan sebagai file JSON di folder `data/`. Untuk mengembalikan data ke kondisi awal (data contoh saat aplikasi pertama kali di-setup):

```bash
npm run seed
```

Perintah ini menimpa isi `data/*.json` dengan salinan awal dari folder `seed/`.

## Pilihan Teknis

- **Express + EJS**: server-rendered, tanpa build step, mudah dijalankan di mana saja. Layout header/nav/footer dipakai konsisten lewat partial EJS (`views/partials`).
- **CSS murni + vanilla JS**: tanpa framework front-end, supaya dependensi tetap minim dan gampang dirawat untuk aplikasi internal skala kecil.
- **Data layer file JSON (`lib/store.js`)**: tanpa database/driver native, supaya instalasi selalu berhasil di lingkungan mana pun tanpa proses build native. Ini pilihan yang jujur untuk skala pemakaian satu bank sampah (demo/operasional kecil), bukan disamarkan sebagai database production-grade.

## Struktur Data

Struktur entitas (Nasabah, Jenis Sampah, Setoran, Penarikan) dijelaskan lengkap di `PRD.md` bagian Data Model.
