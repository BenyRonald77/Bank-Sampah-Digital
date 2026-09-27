# Arahan Desain: Bank Sampah Digital

> Catatan jujur: arahan desain ini dibuat oleh agent (bukan brief asli pemilik produk) karena belum ada brand guideline. Ini pilihan opsi 2 pada wizard antislop R-37: agent menentukan arah desain sendiri dengan peringatan bahwa hasilnya adalah interpretasi, bukan identitas yang sudah divalidasi pemilik produk. Jika suatu saat ada brand guideline asli, arahan di file ini yang harus mengalah.

## Identitas & Kepribadian Brand

Bank Sampah Digital bukan aplikasi marketing, ini adalah **alat kerja harian** untuk petugas bank sampah RT/RW dan nasabahnya: mencatat setoran, mengubah berat sampah jadi saldo, dan menarik saldo. Kepribadiannya mengikuti benda yang selama ini dipakai bank sampah manual: **buku tabungan (passbook) dan kupon setoran**. Bukan "aplikasi hijau eco-friendly bergradasi", tapi buku catatan yang jujur, mudah dipindai, dan tidak neko-neko. Nada bicara: lugas, seperti petugas koperasi menjelaskan ke nasabah, bukan copywriting startup.

## Palet Warna

| Peran | Warna | Kode Hex | Alasan |
|---|---|---|---|
| Inti 1 (tinta/header) | Teal Tinta | `#1F3D3B` | Meniru warna tinta stempel/cap koperasi pada buku tabungan lama; dipakai untuk header, nav, teks penting agar kontras tinggi di atas kertas |
| Inti 2 (kertas) | Kraft Pudar | `#F4EEE1` | Warna kertas kraft/warkat setoran, jadi latar utama yang hangat, bukan putih steril generik |
| Inti 3 (garis/permukaan) | Cokelat Kayu | `#6B4A2F` | Warna sampul buku tabungan/meja kayu petugas, dipakai untuk border kartu dan teks sekunder agar terasa "fisik" bukan digital datar |
| Aksen | Kuning Kunyit | `#C77F14` | Warna tinta stempel "LUNAS/DITERIMA" pada kupon; dipakai satu tempat saja: tombol aksi utama dan nilai rupiah positif (setoran masuk) |

Warna status fungsional (bukan bagian palet inti, hanya dipakai untuk makna): merah senja `#9B3B2C` untuk error/saldo kurang, hijau lumut `#3F6B4A` untuk konfirmasi berhasil. Total tetap dalam batas 2-3 warna inti + 1 aksen (R-29); status color adalah semantic color, bukan dekorasi.

## Tipografi

- **Judul/heading**: tumpukan font serif sistem (`Georgia, "Iowan Old Style", "Palatino Linotype", serif`). Alasan: memberi kesan "buku besar/ledger" yang menjadi identitas produk, tanpa bergantung pada font eksternal (aplikasi tetap tampil benar walau perangkat offline atau CDN font diblok).
- **Isi/body**: tumpukan font sistem sans (`-apple-system, "Segoe UI", Roboto, sans-serif`). Alasan: keterbacaan tinggi di layar kecil untuk petugas yang input data cepat, dan nol dependensi jaringan.
- **Angka rupiah & berat (kg)**: tumpukan monospace sistem (`"SFMono-Regular", Consolas, "Liberation Mono", monospace`), hanya dipakai di kolom angka pada tabel. Alasan: lebar karakter tetap membuat kolom uang rata dan gampang dipindai mata petugas saat rekap, persis seperti kolom di buku kas manual.

## Motif Identitas

**Sobekan kupon (perforasi)**: setiap baris riwayat transaksi (setoran/penarikan) digambar seperti sobekan kupon setoran, dengan garis putus-putus tipis di sisi kiri dan sudut kartu tidak membulat penuh (radius kecil, bukan pill). Motif ini diulang di seluruh halaman riwayat & laporan sehingga menjadi penanda "ini transaksi keuangan yang tercatat", bukan sekadar daftar generik.

## Tiga Dial (ENERGY / RHYTHM / MOTION)

- **ENERGY: 1** (tenang, mendekati GOV.UK). Alasan: ini alat administrasi keuangan komunitas yang dipakai berulang setiap hari, bukan halaman promosi; kepercayaan datang dari kejelasan, bukan dari energi visual tinggi.
- **RHYTHM: 2** (konsisten dengan sedikit variasi). Alasan: halaman form (setoran/penarikan) beda kebutuhan dengan halaman tabel (laporan/riwayat), tapi tetap satu sistem token dan komponen supaya petugas tidak perlu belajar ulang tiap halaman.
- **MOTION: 1** (hanya hover/focus state). Alasan: aplikasi input data operasional, animasi berlebih hanya memperlambat petugas yang mengetik cepat; transisi dipakai secukupnya untuk umpan balik (misal warna tombol saat hover/focus), tidak ada scroll-reveal atau parallax.

## Design Read

Membaca ini sebagai: aplikasi internal pencatatan keuangan komunitas untuk petugas bank sampah dan nasabah, gaya visual "buku tabungan koperasi", dial ENERGY 1 / RHYTHM 2 / MOTION 1.
