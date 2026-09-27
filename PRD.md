# PRD: Bank Sampah Digital

## 1. Ringkasan Produk

Bank Sampah Digital adalah aplikasi web internal untuk mengelola operasional bank sampah tingkat RT/RW/komunitas: mendata nasabah, mendata jenis sampah beserta harga per kilogram, mencatat setoran sampah dan konversinya menjadi saldo, mencatat penarikan saldo, serta menampilkan laporan rekap bulanan. Aplikasi ini menggantikan pencatatan manual di buku tabungan kertas dengan pencatatan digital yang tetap sesederhana buku tabungan aslinya.

## 2. Latar Belakang & Masalah

Bank sampah komunitas umumnya masih mencatat setoran dan saldo nasabah secara manual di buku tulis atau kartu tabungan fisik. Cara ini punya beberapa masalah operasional yang berulang:

- Perhitungan nilai rupiah dari berat sampah dilakukan manual, rawan salah hitung.
- Riwayat transaksi tersebar di banyak buku fisik sehingga sulit direkap saat dibutuhkan laporan bulanan.
- Ketika harga jenis sampah berubah, tidak ada cara mudah memastikan histori transaksi lama tetap memakai harga lama.
- Tidak ada validasi otomatis saat nasabah menarik saldo melebihi saldo yang tersedia.

Aplikasi ini dibangun untuk mengatasi masalah-masalah tersebut dalam skala penggunaan satu bank sampah (single tenant, single process), bukan untuk menggantikan sistem perbankan.

## 3. Tujuan

- Petugas dapat mencatat setoran sampah dan penarikan saldo nasabah dengan cepat dan tanpa hitung manual.
- Saldo nasabah selalu konsisten dengan riwayat setoran dan penarikan yang tercatat.
- Histori setoran tidak berubah nilainya walau harga jenis sampah diedit di kemudian hari (snapshot harga).
- Petugas dapat melihat rekap total sampah terkelola dan nilai rupiah per bulan untuk keperluan laporan ke pengurus/warga.

## 4. Peran Pengguna

### 4.1 Admin / Petugas Bank Sampah
Mengelola seluruh data: master nasabah, master jenis sampah dan harga, mencatat setoran, mencatat penarikan, dan melihat laporan. Pada versi ini aplikasi belum memiliki sistem login/otentikasi terpisah (lihat Batasan), sehingga siapa pun yang mengakses aplikasi berperan sebagai petugas.

### 4.2 Nasabah
Warga yang menyetorkan sampah dan memiliki saldo di bank sampah. Pada versi ini nasabah tidak login sendiri; data dan riwayat nasabah dikelola dan dilihat oleh petugas atas nama nasabah (misalnya saat nasabah datang langsung ke sekretariat bank sampah).

## 5. Ruang Lingkup

### Termasuk
- CRUD data nasabah (nama, kode/nomor rekening nasabah, saldo berjalan).
- CRUD data jenis sampah dan harga per kilogram.
- Pencatatan setoran sampah dengan konversi otomatis ke nilai rupiah dan penambahan saldo.
- Pencatatan penarikan saldo dengan validasi saldo cukup.
- Riwayat setoran dan penarikan per nasabah.
- Laporan rekap bulanan: total berat per jenis sampah, total nilai rupiah, total setoran, total penarikan.
- Dashboard ringkasan.

### Tidak Termasuk (di luar lingkup versi ini)
- Login/otentikasi multi-pengguna dan manajemen hak akses.
- Aplikasi/portal terpisah untuk nasabah mengecek saldo sendiri secara mandiri (misalnya via HP nasabah).
- Integrasi pembayaran/transfer bank sungguhan untuk pencairan saldo.
- Multi-cabang atau multi-bank sampah dalam satu instalasi (single tenant).
- Notifikasi otomatis (SMS/WhatsApp/email) ke nasabah.

## 6. User Stories

### Sebagai Admin/Petugas
- Saya ingin menambah nasabah baru beserta kode rekeningnya, supaya nasabah baru bisa langsung mulai menyetor sampah.
- Saya ingin mengubah data nasabah (nama, kode) jika ada kesalahan input.
- Saya ingin menambah jenis sampah baru beserta harga per kg, supaya jenis sampah yang belum terdaftar bisa langsung diterima.
- Saya ingin mengubah harga jenis sampah kapan saja mengikuti harga pasar terbaru, tanpa mengubah nilai transaksi lama.
- Saya ingin mencatat setoran sampah seorang nasabah (pilih nasabah, pilih jenis sampah, input berat) dan sistem otomatis menghitung nilai rupiah serta menambah saldo nasabah.
- Saya ingin mencatat penarikan saldo nasabah, dan sistem menolak jika saldo tidak mencukupi, disertai pesan yang jelas.
- Saya ingin melihat riwayat setoran dan penarikan seorang nasabah untuk mengecek histori transaksinya.
- Saya ingin melihat laporan total sampah terkelola per bulan untuk dilaporkan ke pengurus RT/RW.

### Sebagai Nasabah (dilayani oleh petugas)
- Saya ingin sampah yang saya setorkan dihitung dengan harga yang berlaku saat itu, secara adil dan konsisten.
- Saya ingin bisa menarik saldo tabungan saya kapan saja selama saldo mencukupi.
- Saya ingin bisa melihat riwayat setoran saya untuk memastikan semua sampah yang saya setorkan sudah tercatat.

## 7. Functional Requirements

**FR-1. Master Data Nasabah**
- FR-1.1 Sistem menampilkan daftar nasabah beserta kode, nama, dan saldo berjalan.
- FR-1.2 Sistem menyediakan form tambah nasabah (kode rekening unik, nama wajib diisi).
- FR-1.3 Sistem menyediakan form edit data nasabah (kode, nama).
- FR-1.4 Sistem menolak penghapusan nasabah yang sudah memiliki riwayat setoran/penarikan, dengan pesan error yang jelas, untuk menjaga integritas histori transaksi.
- FR-1.5 Saldo nasabah tidak dapat diedit langsung oleh petugas; saldo hanya berubah melalui transaksi setoran atau penarikan.
- FR-1.6 Sistem menampilkan halaman detail nasabah berisi data nasabah dan riwayat setoran serta penarikannya.

**FR-2. Master Data Jenis Sampah**
- FR-2.1 Sistem menampilkan daftar jenis sampah beserta harga per kg saat ini.
- FR-2.2 Sistem menyediakan form tambah jenis sampah (nama, harga per kg dalam Rupiah).
- FR-2.3 Sistem menyediakan form edit jenis sampah, termasuk mengubah harga per kg kapan saja.
- FR-2.4 Perubahan harga jenis sampah tidak mengubah nilai rupiah transaksi setoran yang sudah tercatat sebelumnya (lihat FR-3.3).
- FR-2.5 Sistem menolak penghapusan jenis sampah yang sudah memiliki riwayat setoran, dengan pesan error yang jelas.

**FR-3. Pencatatan Setoran Sampah**
- FR-3.1 Sistem menyediakan form setoran: pilih nasabah, pilih jenis sampah, input berat (kg).
- FR-3.2 Sistem menghitung nilai rupiah setoran = berat (kg) x harga per kg jenis sampah yang berlaku saat setoran dibuat.
- FR-3.3 Sistem menyimpan snapshot harga per kg dan nama jenis sampah pada record setoran, sehingga histori tidak berubah walau harga master diedit di kemudian hari.
- FR-3.4 Sistem menambahkan nilai rupiah setoran ke saldo nasabah secara otomatis setelah setoran tersimpan.
- FR-3.5 Sistem menampilkan riwayat setoran, baik secara global maupun per nasabah, dengan tanggal, jenis sampah, berat, harga per kg saat itu, dan nilai rupiah.
- FR-3.6 Sistem menolak input berat nol atau negatif, dengan pesan error yang jelas.

**FR-4. Penarikan Saldo Nasabah**
- FR-4.1 Sistem menyediakan form penarikan: pilih nasabah, input nominal penarikan (Rupiah).
- FR-4.2 Sistem memvalidasi saldo nasabah mencukupi sebelum penarikan diproses; jika tidak cukup, sistem menolak dengan pesan error yang menyebutkan saldo tersedia.
- FR-4.3 Sistem mengurangi saldo nasabah sesuai nominal penarikan yang berhasil diproses.
- FR-4.4 Sistem mencatat riwayat penarikan dengan tanggal dan nominal.
- FR-4.5 Sistem menolak input nominal penarikan nol atau negatif, dengan pesan error yang jelas.

**FR-5. Laporan Bulanan**
- FR-5.1 Sistem menyediakan halaman laporan dengan filter bulan dan tahun.
- FR-5.2 Sistem menampilkan total berat (kg) per jenis sampah pada bulan/tahun yang difilter.
- FR-5.3 Sistem menampilkan total nilai rupiah dari seluruh setoran pada bulan/tahun yang difilter.
- FR-5.4 Sistem menampilkan jumlah total transaksi setoran dan jumlah total transaksi penarikan pada bulan/tahun yang difilter.
- FR-5.5 Sistem menampilkan total nominal penarikan pada bulan/tahun yang difilter.
- FR-5.6 Jika tidak ada transaksi pada bulan/tahun yang difilter, sistem menampilkan pesan kosong yang jelas, bukan tabel kosong tanpa keterangan.

**FR-6. Dashboard**
- FR-6.1 Sistem menampilkan ringkasan: jumlah nasabah terdaftar, jumlah jenis sampah terdaftar, total saldo seluruh nasabah, dan beberapa transaksi terbaru.
- FR-6.2 Dashboard menampilkan pesan yang actionable ketika belum ada data sama sekali (misalnya belum ada nasabah), bukan sekadar "tidak ada data".

## 8. Data Model

| Entitas | Field | Keterangan |
|---|---|---|
| Nasabah | id | UUID, primary key |
| | kode | Kode/nomor rekening nasabah, unik |
| | nama | Nama nasabah |
| | alamat | Opsional |
| | telepon | Opsional |
| | saldo | Saldo berjalan (Rupiah), diubah hanya lewat transaksi |
| | createdAt | Timestamp dibuat |
| JenisSampah | id | UUID, primary key |
| | nama | Nama jenis sampah (contoh: Botol Plastik PET) |
| | hargaPerKg | Harga per kg saat ini (Rupiah), bisa diubah admin |
| | createdAt | Timestamp dibuat |
| | updatedAt | Timestamp terakhir diubah |
| Setoran | id | UUID, primary key |
| | nasabahId | Relasi ke Nasabah |
| | jenisSampahId | Relasi ke JenisSampah |
| | jenisSampahNama | Snapshot nama jenis sampah saat transaksi |
| | beratKg | Berat sampah yang disetor (kg) |
| | hargaPerKgSaatItu | Snapshot harga per kg saat transaksi dibuat |
| | nilaiRupiah | beratKg x hargaPerKgSaatItu |
| | tanggal | Tanggal setoran (dipakai untuk filter laporan bulanan) |
| | createdAt | Timestamp dibuat |
| Penarikan | id | UUID, primary key |
| | nasabahId | Relasi ke Nasabah |
| | nominal | Nominal penarikan (Rupiah) |
| | tanggal | Tanggal penarikan (dipakai untuk filter laporan bulanan) |
| | createdAt | Timestamp dibuat |

## 9. Non-Functional Requirements

- **Performa**: seluruh operasi baca/tulis menggunakan file JSON lokal yang dibaca/ditulis secara sinkron; ditujukan untuk skala penggunaan satu bank sampah (puluhan hingga beberapa ratus nasabah), bukan untuk beban tinggi atau akses bersamaan dalam jumlah besar.
- **Aksesibilitas**: mengacu pada prinsip antislop (R-03, R-25, R-32): kontras teks memenuhi WCAG AA, seluruh elemen interaktif bisa dioperasikan dengan keyboard, ada indikator fokus yang terlihat jelas, dan tidak ada horizontal overflow di layar kecil.
- **Keamanan dasar input**: seluruh input form divalidasi di sisi server (tipe angka untuk berat/nominal/harga, field wajib tidak boleh kosong, nilai berat dan nominal harus lebih besar dari nol) sebelum disimpan ke data store.
- **Keandalan data historis**: nilai transaksi setoran tidak boleh berubah akibat perubahan harga master di kemudian hari (snapshot harga wajib diterapkan konsisten).

## 10. Batasan & Asumsi

- Aplikasi berjalan sebagai proses tunggal (single process) tanpa database server terpisah; penyimpanan menggunakan file JSON di folder `data/`. Ini pilihan yang wajar untuk skala demo/operasional kecil, bukan untuk beban produksi besar dengan banyak penulisan bersamaan.
- Belum ada sistem login/otentikasi; siapa pun yang mengakses aplikasi dianggap sebagai petugas bank sampah. Penambahan otentikasi adalah pekerjaan lanjutan di luar lingkup versi ini.
- Satu instalasi aplikasi diasumsikan melayani satu bank sampah (single tenant).
- Mata uang yang dipakai adalah Rupiah dan tidak ada dukungan mata uang lain.
- Tidak ada data statistik pemakaian, testimoni, atau klaim performa yang dicantumkan di aplikasi ini karena belum ada data real dari penggunaan sungguhan.
