# Catatan Verifikasi Manual (R-35)

Verifikasi dilakukan dengan menjalankan server (`node server.js` dengan `PORT` khusus untuk pengujian) lalu mengirim request nyata memakai `curl` (GET halaman dan POST form-encoded untuk aksi create/update), memeriksa kode status HTTP, memeriksa isi respons, memeriksa data yang benar-benar tersimpan di `data/*.json`, dan memeriksa log server untuk stack trace. Setelah verifikasi selesai, data dikembalikan ke kondisi awal dengan `npm run seed`.

Catatan lingkungan: sandbox pengujian ini berbagi container dengan proses lain, sehingga port default `3000` kadang terpakai proses lain. Verifikasi akhir dijalankan dengan `PORT=58231` untuk menghindari bentrok, tanpa mengubah perilaku aplikasi (port tetap default `3000` saat dijalankan normal via `npm start`).

## Master Data Nasabah & Jenis Sampah

| Method | Path | Hasil |
|---|---|---|
| GET | `/` | 200, dashboard tampil |
| GET | `/nasabah` | 200, daftar nasabah tampil |
| GET | `/nasabah/baru` | 200, form tampil |
| POST | `/nasabah` (data valid) | 302 redirect ke `/nasabah` dengan pesan sukses, data tersimpan di `data/nasabah.json` |
| GET | `/nasabah/:id` | 200, detail nasabah tampil dengan state kosong "Belum ada setoran" dan "Belum ada penarikan" untuk nasabah baru |
| GET | `/nasabah/:id/edit` | 200, form edit terisi data nasabah |
| POST | `/nasabah/:id?_method=PUT` (data valid) | 302 redirect, perubahan tersimpan dan terlihat di daftar nasabah |
| POST | `/nasabah/:id?_method=DELETE` (nasabah punya riwayat transaksi) | 302 redirect ke `/nasabah` dengan pesan error, data TIDAK terhapus |
| POST | `/nasabah/:id?_method=DELETE` (nasabah tanpa riwayat) | 302 redirect dengan pesan sukses, data benar-benar terhapus dari `data/nasabah.json` |
| GET | `/jenis-sampah` | 200, daftar jenis sampah tampil |
| GET | `/jenis-sampah/baru` | 200, form tampil |
| POST | `/jenis-sampah` (data valid) | 302 redirect, data tersimpan |
| POST | `/jenis-sampah` (nama kosong, harga 0) | 400, form ditampilkan lagi dengan pesan error per field |
| GET | `/jenis-sampah/:id/edit` | 200, form edit terisi |
| POST | `/jenis-sampah/:id?_method=PUT` (ubah harga) | 302 redirect, harga baru tersimpan, pesan menegaskan histori lama tidak berubah |
| POST | `/jenis-sampah/:id?_method=DELETE` (punya riwayat setoran) | 302 redirect dengan pesan error, data TIDAK terhapus |
| POST | `/jenis-sampah/:id?_method=DELETE` (tanpa riwayat) | 302 redirect dengan pesan sukses, data benar-benar terhapus |

## Setoran & Konversi Saldo

| Method | Path | Hasil |
|---|---|---|
| GET | `/setoran` | 200, riwayat setoran tampil |
| GET | `/setoran/baru` | 200, form tampil dengan pratinjau nilai rupiah otomatis (JS) |
| POST | `/setoran` (nasabah + jenis sampah + berat 5 kg, harga 1.300/kg) | 302 redirect, nilai tercatat Rp 6.500 (5 x 1.300), saldo nasabah bertambah tepat Rp 6.500, terverifikasi lewat GET ulang halaman detail nasabah |
| POST | `/setoran` (berat 0) | 400, ditolak dengan pesan error |
| - | Uji snapshot harga | Setelah harga jenis sampah diedit dari 1.200 menjadi 1.300, riwayat setoran yang sudah tercatat sebelumnya tetap menampilkan harga lama (dicek langsung membandingkan sebelum/sesudah edit harga) |

## Penarikan Saldo

| Method | Path | Hasil |
|---|---|---|
| GET | `/penarikan` | 200, riwayat penarikan tampil |
| GET | `/penarikan/baru` | 200, form tampil |
| POST | `/penarikan` (nominal melebihi saldo tersedia) | 400, ditolak dengan pesan "Saldo tidak mencukupi. Saldo tersedia saat ini: Rp 6.500." (saldo aktual disebutkan di pesan) |
| POST | `/penarikan` (nominal valid, dalam batas saldo) | 302 redirect, saldo berkurang tepat sesuai nominal, terverifikasi lewat GET ulang halaman detail nasabah |
| POST | `/penarikan` (nominal 0) | 400, ditolak dengan pesan error |

## Laporan Bulanan

| Method | Path | Hasil |
|---|---|---|
| GET | `/laporan` (default, bulan berjalan) | 200 |
| GET | `/laporan?bulan=9&tahun=2026` | 200, total berat, total nilai, jumlah setoran, jumlah penarikan, dan total nominal penarikan sesuai perhitungan manual dari data seed + transaksi uji |
| GET | `/laporan?bulan=2&tahun=2020` (bulan tanpa transaksi) | 200, menampilkan state kosong "Belum ada transaksi di Februari 2020" beserta aksi "Catat Setoran" |
| GET | `/laporan?bulan=99&tahun=2026` (bulan di luar rentang valid) | 400, menampilkan state error filter tidak valid |

## Lainnya

| Method | Path | Hasil |
|---|---|---|
| GET | `/css/style.css` | 200 |
| GET | `/js/main.js` | 200 |
| GET | `/halaman-tidak-ada` | 404, halaman error kustom tampil dengan tombol kembali ke dashboard |

## Log Server

Log server (`console.error` untuk exception) dipantau sepanjang seluruh rangkaian pengujian di atas: tidak ada stack trace atau exception yang muncul. Semua respons error (400/404) berasal dari penanganan validasi yang disengaja di `server.js`, bukan dari crash.

## Kesimpulan

Seluruh rute utama (GET halaman dan POST aksi create/update/delete) sudah dicoba dengan data form-encoded nyata, hasilnya diverifikasi ulang lewat pembacaan data tersimpan, dan tidak ditemukan dead control atau request yang gagal di luar penanganan error yang memang disengaja. Data `data/*.json` dikembalikan ke kondisi seed awal setelah verifikasi (`npm run seed`) sebelum commit ini dibuat.
