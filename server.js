'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const methodOverride = require('method-override');
const store = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Helpers ----------

function formatRupiah(value) {
  const num = Number(value) || 0;
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

function formatKg(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' kg';
}

function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

app.locals.formatRupiah = formatRupiah;
app.locals.formatKg = formatKg;
app.locals.formatTanggal = formatTanggal;

// Flash message sederhana lewat query string (tanpa session, cukup untuk demo single-process).
app.use((req, res, next) => {
  res.locals.flash = req.query.flash || null;
  res.locals.flashType = req.query.flashType === 'error' ? 'error' : 'success';
  next();
});

function redirectWithFlash(res, url, type, message) {
  const sep = url.includes('?') ? '&' : '?';
  res.redirect(`${url}${sep}flash=${encodeURIComponent(message)}&flashType=${type}`);
}

function findById(collection, id) {
  return store.find(collection, (r) => r.id === id)[0] || null;
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return NaN;
  const n = Number(String(value).replace(',', '.'));
  return n;
}

// ---------- Dashboard ----------

app.get('/', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah');
    const jenisSampahList = store.readAll('jenisSampah');
    const setoranList = store.readAll('setoran');
    const penarikanList = store.readAll('penarikan');

    const totalSaldo = nasabahList.reduce((sum, n) => sum + (Number(n.saldo) || 0), 0);

    const aktivitas = []
      .concat(
        setoranList.map((s) => ({
          jenis: 'setoran',
          tanggal: s.tanggal,
          createdAt: s.createdAt,
          nasabahId: s.nasabahId,
          label: s.jenisSampahNama,
          nilai: s.nilaiRupiah,
        })),
        penarikanList.map((p) => ({
          jenis: 'penarikan',
          tanggal: p.tanggal,
          createdAt: p.createdAt,
          nasabahId: p.nasabahId,
          label: 'Penarikan saldo',
          nilai: p.nominal,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map((item) => {
        const nasabah = findById('nasabah', item.nasabahId);
        return Object.assign({}, item, { nasabahNama: nasabah ? nasabah.nama : 'Nasabah tidak ditemukan' });
      });

    res.render('dashboard', {
      title: 'Dashboard',
      active: 'dashboard',
      totalNasabah: nasabahList.length,
      totalJenisSampah: jenisSampahList.length,
      totalSaldo,
      aktivitas,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Nasabah ----------

app.get('/nasabah', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah').sort((a, b) => a.kode.localeCompare(b.kode));
    res.render('nasabah/index', {
      title: 'Nasabah',
      active: 'nasabah',
      nasabahList,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/nasabah/baru', (req, res) => {
  res.render('nasabah/form', {
    title: 'Tambah Nasabah',
    active: 'nasabah',
    mode: 'create',
    values: { kode: '', nama: '', alamat: '', telepon: '' },
    errors: {},
  });
});

app.post('/nasabah', (req, res, next) => {
  try {
    const kode = (req.body.kode || '').trim();
    const nama = (req.body.nama || '').trim();
    const alamat = (req.body.alamat || '').trim();
    const telepon = (req.body.telepon || '').trim();

    const errors = {};
    if (!kode) errors.kode = 'Kode nasabah wajib diisi.';
    if (!nama) errors.nama = 'Nama nasabah wajib diisi.';
    if (kode && store.find('nasabah', (n) => n.kode.toLowerCase() === kode.toLowerCase()).length > 0) {
      errors.kode = 'Kode nasabah sudah dipakai, gunakan kode lain.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('nasabah/form', {
        title: 'Tambah Nasabah',
        active: 'nasabah',
        mode: 'create',
        values: { kode, nama, alamat, telepon },
        errors,
      });
    }

    store.insert('nasabah', {
      id: crypto.randomUUID(),
      kode,
      nama,
      alamat,
      telepon,
      saldo: 0,
      createdAt: new Date().toISOString(),
    });

    redirectWithFlash(res, '/nasabah', 'success', `Nasabah "${nama}" berhasil ditambahkan.`);
  } catch (err) {
    next(err);
  }
});

app.get('/nasabah/:id/edit', (req, res, next) => {
  try {
    const nasabah = findById('nasabah', req.params.id);
    if (!nasabah) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan',
        active: 'nasabah',
        statusCode: 404,
        message: 'Nasabah yang dicari tidak ditemukan. Mungkin sudah dihapus.',
      });
    }
    res.render('nasabah/form', {
      title: 'Ubah Nasabah',
      active: 'nasabah',
      mode: 'edit',
      nasabahId: nasabah.id,
      values: nasabah,
      errors: {},
    });
  } catch (err) {
    next(err);
  }
});

app.put('/nasabah/:id', (req, res, next) => {
  try {
    const nasabah = findById('nasabah', req.params.id);
    if (!nasabah) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan',
        active: 'nasabah',
        statusCode: 404,
        message: 'Nasabah yang diubah tidak ditemukan.',
      });
    }

    const kode = (req.body.kode || '').trim();
    const nama = (req.body.nama || '').trim();
    const alamat = (req.body.alamat || '').trim();
    const telepon = (req.body.telepon || '').trim();

    const errors = {};
    if (!kode) errors.kode = 'Kode nasabah wajib diisi.';
    if (!nama) errors.nama = 'Nama nasabah wajib diisi.';
    const dup = store.find(
      'nasabah',
      (n) => n.id !== nasabah.id && n.kode.toLowerCase() === kode.toLowerCase()
    );
    if (kode && dup.length > 0) {
      errors.kode = 'Kode nasabah sudah dipakai nasabah lain.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('nasabah/form', {
        title: 'Ubah Nasabah',
        active: 'nasabah',
        mode: 'edit',
        nasabahId: nasabah.id,
        values: { kode, nama, alamat, telepon },
        errors,
      });
    }

    store.update('nasabah', nasabah.id, { kode, nama, alamat, telepon });
    redirectWithFlash(res, '/nasabah', 'success', `Data nasabah "${nama}" berhasil diperbarui.`);
  } catch (err) {
    next(err);
  }
});

app.delete('/nasabah/:id', (req, res, next) => {
  try {
    const nasabah = findById('nasabah', req.params.id);
    if (!nasabah) {
      return redirectWithFlash(res, '/nasabah', 'error', 'Nasabah tidak ditemukan.');
    }
    const punyaSetoran = store.find('setoran', (s) => s.nasabahId === nasabah.id).length > 0;
    const punyaPenarikan = store.find('penarikan', (p) => p.nasabahId === nasabah.id).length > 0;
    if (punyaSetoran || punyaPenarikan) {
      return redirectWithFlash(
        res,
        '/nasabah',
        'error',
        `Nasabah "${nasabah.nama}" tidak bisa dihapus karena sudah punya riwayat transaksi.`
      );
    }
    store.remove('nasabah', nasabah.id);
    redirectWithFlash(res, '/nasabah', 'success', `Nasabah "${nasabah.nama}" berhasil dihapus.`);
  } catch (err) {
    next(err);
  }
});

app.get('/nasabah/:id', (req, res, next) => {
  try {
    const nasabah = findById('nasabah', req.params.id);
    if (!nasabah) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan',
        active: 'nasabah',
        statusCode: 404,
        message: 'Nasabah yang dicari tidak ditemukan. Mungkin sudah dihapus.',
      });
    }
    const riwayatSetoran = store
      .find('setoran', (s) => s.nasabahId === nasabah.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const riwayatPenarikan = store
      .find('penarikan', (p) => p.nasabahId === nasabah.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render('nasabah/detail', {
      title: `Nasabah ${nasabah.nama}`,
      active: 'nasabah',
      nasabah,
      riwayatSetoran,
      riwayatPenarikan,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Jenis Sampah ----------

app.get('/jenis-sampah', (req, res, next) => {
  try {
    const list = store.readAll('jenisSampah').sort((a, b) => a.nama.localeCompare(b.nama));
    res.render('jenisSampah/index', {
      title: 'Jenis Sampah',
      active: 'jenis-sampah',
      list,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/jenis-sampah/baru', (req, res) => {
  res.render('jenisSampah/form', {
    title: 'Tambah Jenis Sampah',
    active: 'jenis-sampah',
    mode: 'create',
    values: { nama: '', hargaPerKg: '' },
    errors: {},
  });
});

app.post('/jenis-sampah', (req, res, next) => {
  try {
    const nama = (req.body.nama || '').trim();
    const hargaPerKg = toNumber(req.body.hargaPerKg);

    const errors = {};
    if (!nama) errors.nama = 'Nama jenis sampah wajib diisi.';
    if (isNaN(hargaPerKg) || hargaPerKg <= 0) {
      errors.hargaPerKg = 'Harga per kg wajib diisi dengan angka lebih besar dari 0.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('jenisSampah/form', {
        title: 'Tambah Jenis Sampah',
        active: 'jenis-sampah',
        mode: 'create',
        values: { nama, hargaPerKg: req.body.hargaPerKg },
        errors,
      });
    }

    const now = new Date().toISOString();
    store.insert('jenisSampah', {
      id: crypto.randomUUID(),
      nama,
      hargaPerKg,
      createdAt: now,
      updatedAt: now,
    });

    redirectWithFlash(res, '/jenis-sampah', 'success', `Jenis sampah "${nama}" berhasil ditambahkan.`);
  } catch (err) {
    next(err);
  }
});

app.get('/jenis-sampah/:id/edit', (req, res, next) => {
  try {
    const item = findById('jenisSampah', req.params.id);
    if (!item) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan',
        active: 'jenis-sampah',
        statusCode: 404,
        message: 'Jenis sampah yang dicari tidak ditemukan.',
      });
    }
    res.render('jenisSampah/form', {
      title: 'Ubah Jenis Sampah',
      active: 'jenis-sampah',
      mode: 'edit',
      itemId: item.id,
      values: item,
      errors: {},
    });
  } catch (err) {
    next(err);
  }
});

app.put('/jenis-sampah/:id', (req, res, next) => {
  try {
    const item = findById('jenisSampah', req.params.id);
    if (!item) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan',
        active: 'jenis-sampah',
        statusCode: 404,
        message: 'Jenis sampah yang diubah tidak ditemukan.',
      });
    }

    const nama = (req.body.nama || '').trim();
    const hargaPerKg = toNumber(req.body.hargaPerKg);

    const errors = {};
    if (!nama) errors.nama = 'Nama jenis sampah wajib diisi.';
    if (isNaN(hargaPerKg) || hargaPerKg <= 0) {
      errors.hargaPerKg = 'Harga per kg wajib diisi dengan angka lebih besar dari 0.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('jenisSampah/form', {
        title: 'Ubah Jenis Sampah',
        active: 'jenis-sampah',
        mode: 'edit',
        itemId: item.id,
        values: { nama, hargaPerKg: req.body.hargaPerKg },
        errors,
      });
    }

    store.update('jenisSampah', item.id, { nama, hargaPerKg, updatedAt: new Date().toISOString() });
    redirectWithFlash(
      res,
      '/jenis-sampah',
      'success',
      `Jenis sampah "${nama}" berhasil diperbarui. Harga baru berlaku untuk setoran berikutnya, riwayat lama tidak berubah.`
    );
  } catch (err) {
    next(err);
  }
});

app.delete('/jenis-sampah/:id', (req, res, next) => {
  try {
    const item = findById('jenisSampah', req.params.id);
    if (!item) {
      return redirectWithFlash(res, '/jenis-sampah', 'error', 'Jenis sampah tidak ditemukan.');
    }
    const punyaSetoran = store.find('setoran', (s) => s.jenisSampahId === item.id).length > 0;
    if (punyaSetoran) {
      return redirectWithFlash(
        res,
        '/jenis-sampah',
        'error',
        `Jenis sampah "${item.nama}" tidak bisa dihapus karena sudah punya riwayat setoran.`
      );
    }
    store.remove('jenisSampah', item.id);
    redirectWithFlash(res, '/jenis-sampah', 'success', `Jenis sampah "${item.nama}" berhasil dihapus.`);
  } catch (err) {
    next(err);
  }
});

// ---------- Setoran ----------

app.get('/setoran', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah');
    const setoranList = store
      .readAll('setoran')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((s) => {
        const nasabah = findById('nasabah', s.nasabahId);
        return Object.assign({}, s, { nasabahNama: nasabah ? nasabah.nama : 'Nasabah tidak ditemukan' });
      });

    res.render('setoran/index', {
      title: 'Setoran',
      active: 'setoran',
      setoranList,
      punyaNasabah: nasabahList.length > 0,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/setoran/baru', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah').sort((a, b) => a.nama.localeCompare(b.nama));
    const jenisSampahList = store.readAll('jenisSampah').sort((a, b) => a.nama.localeCompare(b.nama));

    if (nasabahList.length === 0 || jenisSampahList.length === 0) {
      return res.render('setoran/form', {
        title: 'Catat Setoran',
        active: 'setoran',
        belumSiap: true,
        punyaNasabah: nasabahList.length > 0,
        punyaJenisSampah: jenisSampahList.length > 0,
        nasabahList,
        jenisSampahList,
        values: {},
        errors: {},
      });
    }

    res.render('setoran/form', {
      title: 'Catat Setoran',
      active: 'setoran',
      belumSiap: false,
      nasabahList,
      jenisSampahList,
      values: { nasabahId: req.query.nasabahId || '', jenisSampahId: '', beratKg: '' },
      errors: {},
    });
  } catch (err) {
    next(err);
  }
});

app.post('/setoran', (req, res, next) => {
  try {
    const nasabahId = (req.body.nasabahId || '').trim();
    const jenisSampahId = (req.body.jenisSampahId || '').trim();
    const beratKg = toNumber(req.body.beratKg);

    const nasabahList = store.readAll('nasabah').sort((a, b) => a.nama.localeCompare(b.nama));
    const jenisSampahList = store.readAll('jenisSampah').sort((a, b) => a.nama.localeCompare(b.nama));

    const nasabah = findById('nasabah', nasabahId);
    const jenisSampah = findById('jenisSampah', jenisSampahId);

    const errors = {};
    if (!nasabah) errors.nasabahId = 'Pilih nasabah yang valid.';
    if (!jenisSampah) errors.jenisSampahId = 'Pilih jenis sampah yang valid.';
    if (isNaN(beratKg) || beratKg <= 0) {
      errors.beratKg = 'Berat harus diisi dengan angka lebih besar dari 0.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('setoran/form', {
        title: 'Catat Setoran',
        active: 'setoran',
        belumSiap: false,
        nasabahList,
        jenisSampahList,
        values: { nasabahId, jenisSampahId, beratKg: req.body.beratKg },
        errors,
      });
    }

    const nilaiRupiah = beratKg * jenisSampah.hargaPerKg;
    const now = new Date();

    store.insert('setoran', {
      id: crypto.randomUUID(),
      nasabahId: nasabah.id,
      jenisSampahId: jenisSampah.id,
      jenisSampahNama: jenisSampah.nama,
      beratKg,
      hargaPerKgSaatItu: jenisSampah.hargaPerKg,
      nilaiRupiah,
      tanggal: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
    });

    store.update('nasabah', nasabah.id, { saldo: (Number(nasabah.saldo) || 0) + nilaiRupiah });

    redirectWithFlash(
      res,
      `/nasabah/${nasabah.id}`,
      'success',
      `Setoran ${formatKg(beratKg)} ${jenisSampah.nama} tercatat, saldo bertambah ${formatRupiah(nilaiRupiah)}.`
    );
  } catch (err) {
    next(err);
  }
});

// ---------- Penarikan ----------

app.get('/penarikan', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah');
    const penarikanList = store
      .readAll('penarikan')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((p) => {
        const nasabah = findById('nasabah', p.nasabahId);
        return Object.assign({}, p, { nasabahNama: nasabah ? nasabah.nama : 'Nasabah tidak ditemukan' });
      });

    res.render('penarikan/index', {
      title: 'Penarikan',
      active: 'penarikan',
      penarikanList,
      punyaNasabah: nasabahList.length > 0,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/penarikan/baru', (req, res, next) => {
  try {
    const nasabahList = store.readAll('nasabah').sort((a, b) => a.nama.localeCompare(b.nama));

    if (nasabahList.length === 0) {
      return res.render('penarikan/form', {
        title: 'Tarik Saldo',
        active: 'penarikan',
        belumSiap: true,
        nasabahList,
        values: {},
        errors: {},
      });
    }

    res.render('penarikan/form', {
      title: 'Tarik Saldo',
      active: 'penarikan',
      belumSiap: false,
      nasabahList,
      values: { nasabahId: req.query.nasabahId || '', nominal: '' },
      errors: {},
    });
  } catch (err) {
    next(err);
  }
});

app.post('/penarikan', (req, res, next) => {
  try {
    const nasabahId = (req.body.nasabahId || '').trim();
    const nominal = toNumber(req.body.nominal);

    const nasabahList = store.readAll('nasabah').sort((a, b) => a.nama.localeCompare(b.nama));
    const nasabah = findById('nasabah', nasabahId);

    const errors = {};
    if (!nasabah) errors.nasabahId = 'Pilih nasabah yang valid.';
    if (isNaN(nominal) || nominal <= 0) {
      errors.nominal = 'Nominal penarikan harus diisi dengan angka lebih besar dari 0.';
    }
    if (nasabah && !isNaN(nominal) && nominal > 0 && nominal > (Number(nasabah.saldo) || 0)) {
      errors.nominal = `Saldo tidak mencukupi. Saldo tersedia saat ini: ${formatRupiah(nasabah.saldo)}.`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('penarikan/form', {
        title: 'Tarik Saldo',
        active: 'penarikan',
        belumSiap: false,
        nasabahList,
        values: { nasabahId, nominal: req.body.nominal },
        errors,
      });
    }

    const now = new Date();
    store.insert('penarikan', {
      id: crypto.randomUUID(),
      nasabahId: nasabah.id,
      nominal,
      tanggal: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
    });

    store.update('nasabah', nasabah.id, { saldo: (Number(nasabah.saldo) || 0) - nominal });

    redirectWithFlash(
      res,
      `/nasabah/${nasabah.id}`,
      'success',
      `Penarikan ${formatRupiah(nominal)} berhasil dicatat.`
    );
  } catch (err) {
    next(err);
  }
});

// ---------- Laporan ----------

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

app.get('/laporan', (req, res, next) => {
  try {
    const now = new Date();
    const bulan = parseInt(req.query.bulan, 10) || now.getMonth() + 1;
    const tahun = parseInt(req.query.tahun, 10) || now.getFullYear();

    const bulanValid = bulan >= 1 && bulan <= 12;
    const tahunValid = tahun >= 2000 && tahun <= 2100;

    if (!bulanValid || !tahunValid) {
      return res.status(400).render('laporan/index', {
        title: 'Laporan Bulanan',
        active: 'laporan',
        bulan,
        tahun,
        namaBulan: NAMA_BULAN,
        errorFilter: 'Bulan atau tahun yang dipilih tidak valid.',
        adaData: false,
        perJenis: [],
        totalNilaiSetoran: 0,
        totalBeratSetoran: 0,
        jumlahSetoran: 0,
        jumlahPenarikan: 0,
        totalNominalPenarikan: 0,
      });
    }

    const prefix = `${tahun}-${String(bulan).padStart(2, '0')}`;
    const setoranBulanIni = store.find('setoran', (s) => (s.tanggal || '').startsWith(prefix));
    const penarikanBulanIni = store.find('penarikan', (p) => (p.tanggal || '').startsWith(prefix));

    const perJenisMap = {};
    setoranBulanIni.forEach((s) => {
      if (!perJenisMap[s.jenisSampahNama]) {
        perJenisMap[s.jenisSampahNama] = { nama: s.jenisSampahNama, totalBerat: 0, totalNilai: 0 };
      }
      perJenisMap[s.jenisSampahNama].totalBerat += Number(s.beratKg) || 0;
      perJenisMap[s.jenisSampahNama].totalNilai += Number(s.nilaiRupiah) || 0;
    });
    const perJenis = Object.values(perJenisMap).sort((a, b) => b.totalNilai - a.totalNilai);

    const totalNilaiSetoran = setoranBulanIni.reduce((sum, s) => sum + (Number(s.nilaiRupiah) || 0), 0);
    const totalBeratSetoran = setoranBulanIni.reduce((sum, s) => sum + (Number(s.beratKg) || 0), 0);
    const totalNominalPenarikan = penarikanBulanIni.reduce((sum, p) => sum + (Number(p.nominal) || 0), 0);

    res.render('laporan/index', {
      title: 'Laporan Bulanan',
      active: 'laporan',
      bulan,
      tahun,
      namaBulan: NAMA_BULAN,
      errorFilter: null,
      adaData: setoranBulanIni.length > 0 || penarikanBulanIni.length > 0,
      perJenis,
      totalNilaiSetoran,
      totalBeratSetoran,
      jumlahSetoran: setoranBulanIni.length,
      jumlahPenarikan: penarikanBulanIni.length,
      totalNominalPenarikan,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- 404 ----------

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan',
    active: '',
    statusCode: 404,
    message: 'Halaman yang Anda cari tidak ada. Periksa kembali alamat yang dituju.',
  });
});

// ---------- Error handler ----------

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack || err);
  res.status(500).render('error', {
    title: 'Terjadi Kesalahan',
    active: '',
    statusCode: 500,
    message: 'Terjadi kesalahan pada server. Silakan coba lagi, atau hubungi petugas jika terus berulang.',
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Bank Sampah Digital berjalan di http://localhost:${PORT}`);
});
