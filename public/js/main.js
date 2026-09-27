(function () {
  'use strict';

  // Tutup pesan flash (sukses/error) tanpa reload.
  var dismissBtn = document.getElementById('flash-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', function () {
      var flash = document.getElementById('flash-message');
      if (flash && flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    });
  }

  // Konfirmasi sebelum menghapus data master (nasabah/jenis sampah).
  // Form tetap berfungsi tanpa JS; ini hanya lapisan konfirmasi tambahan.
  var confirmForms = document.querySelectorAll('[data-confirm]');
  confirmForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var message = form.getAttribute('data-confirm');
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  // Pratinjau otomatis nilai rupiah pada form setoran: berat (kg) x harga per kg.
  var beratInput = document.getElementById('input-berat');
  var jenisSelect = document.getElementById('input-jenis-sampah');
  var previewBox = document.getElementById('preview-nilai');

  function formatRupiahClient(value) {
    var rounded = Math.round(value);
    return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function updateSetoranPreview() {
    if (!beratInput || !jenisSelect || !previewBox) return;
    var selected = jenisSelect.options[jenisSelect.selectedIndex];
    var harga = selected ? parseFloat(selected.getAttribute('data-harga')) : NaN;
    var berat = parseFloat(beratInput.value);

    if (!selected || !selected.value || isNaN(harga)) {
      previewBox.textContent = 'Pilih jenis sampah untuk melihat estimasi nilai.';
      return;
    }
    if (isNaN(berat) || berat <= 0) {
      previewBox.textContent = 'Masukkan berat (kg) untuk melihat estimasi nilai.';
      return;
    }
    var nilai = berat * harga;
    previewBox.textContent =
      'Estimasi: ' + berat + ' kg x ' + formatRupiahClient(harga) + '/kg = ' + formatRupiahClient(nilai);
  }

  if (beratInput && jenisSelect && previewBox) {
    beratInput.addEventListener('input', updateSetoranPreview);
    jenisSelect.addEventListener('change', updateSetoranPreview);
    updateSetoranPreview();
  }
})();
