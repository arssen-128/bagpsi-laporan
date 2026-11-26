(function () {
  var PANGKAT = ['JENDERAL', 'KOMJEN', 'IRJEN', 'BRIGJEN', 'KOMBES', 'AKBP', 'KOMPOL', 'AKP', 'IPTU', 'IPDA', 'AIPTU', 'AIPDA', 'BRIPKA', 'BRIGPOL', 'BRIPTU', 'BRIPDA'];
  var SKOR = { JENDERAL: 17, KOMJEN: 16, IRJEN: 15, BRIGJEN: 14, KOMBES: 13, AKBP: 12, KOMPOL: 11, AKP: 10, IPTU: 9, IPDA: 8, AIPTU: 7, AIPDA: 6, BRIPKA: 5, BRIGPOL: 4, BRIGADIR: 4, BRIPTU: 3, BRIPDA: 2 };
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var daftar = document.getElementById('daftar');
  var tpl = document.getElementById('tpl');
  var jenis = document.getElementById('jenis');

  function pilihanJam() {
    var jam = '<select class="jj"><option value="">--</option>';
    var menit = '<select class="mm"><option value="">--</option>';
    for (var i = 0; i < 24; i++) jam += '<option>' + String(i).padStart(2, '0') + '</option>';
    for (var j = 0; j < 60; j++) menit += '<option>' + String(j).padStart(2, '0') + '</option>';
    return jam + '</select><span>.</span>' + menit + '</select>';
  }

  function isiPangkat(select) {
    select.innerHTML = '<option value="">Pangkat</option>' + PANGKAT.map(function (p) {
      return '<option value="' + p + '">' + p + '</option>';
    }).join('');
  }

  function tambahKartu(diam) {
    if (jenis.value === 'karo_sdm' && daftar.children.length >= 1) return;
    var kartu = tpl.content.firstElementChild.cloneNode(true);
    kartu.querySelectorAll('.jam').forEach(function (kotak) { kotak.innerHTML = pilihanJam(); });
    isiPangkat(kartu.querySelector('.pangkat'));
    daftar.appendChild(kartu);
    nomor();
    if (diam !== true) gambar();
  }

  function pasangWaktu(kotak, nilai) {
    var jj = kotak.querySelector('.jj');
    var mm = kotak.querySelector('.mm');
    var cocok = /^(\d{2}):(\d{2})/.exec(nilai || '');
    jj.value = cocok ? cocok[1] : '';
    mm.value = cocok ? cocok[2] : '';
  }

  function pasangOrang(kartu, orang) {
    if (!orang || !orang.pangkat || !orang.nama) return;
    var item = document.createElement('div');
    item.className = 'orang-item';
    item.dataset.pangkat = orang.pangkat;
    item.dataset.nama = orang.nama;
    item.dataset.gelar = orang.gelar || '';
    item.dataset.jabatan = orang.jabatan || '';
    item.innerHTML = '<div><b></b><span></span></div><button type="button" class="teks buang">Hapus</button>';
    item.querySelector('b').textContent = orang.pangkat + ' ' + orang.nama;
    item.querySelector('span').textContent = [item.dataset.gelar, item.dataset.jabatan].filter(Boolean).join(' · ');
    kartu.querySelector('.terpilih').appendChild(item);
  }

  function isiKartu(kartu, item) {
    if (!item) return;
    kartu.querySelector('.nama').value = item.nama || '';
    kartu.querySelector('.tanggal').value = item.tanggal || '';
    kartu.querySelector('.hari').value = item.hari || '';
    pasangWaktu(kartu.querySelector('.mulai'), item.mulai);
    var hingga = item.selesai === 'hingga';
    kartu.querySelector('.hingga').checked = hingga;
    kartu.querySelector('.selesai').querySelectorAll('select').forEach(function (select) { select.disabled = hingga; });
    if (!hingga) pasangWaktu(kartu.querySelector('.selesai'), item.selesai);
    kartu.querySelector('.lokasi').value = item.lokasi || '';
    kartu.querySelector('.uraian').value = item.uraian || '';
    kartu.querySelector('.hasil').value = item.hasil || '';
    (item.orang || []).forEach(function (orang) { pasangOrang(kartu, orang); });
    urut(kartu);
  }

  function bacaDraf() {
    try {
      var data = JSON.parse(localStorage.getItem('bagpsi-halaman') || '');
      if (!data || !Array.isArray(data.kegiatan)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function pulihkan() {
    var data = bacaDraf();
    if (!data) {
      tambahKartu();
      return;
    }
    if (data.jenis === 'karopsi' || data.jenis === 'karo_sdm') jenis.value = data.jenis;
    document.getElementById('penerima').value = data.penerima || '';
    document.getElementById('pembuka').value = data.pembuka || '';
    document.getElementById('penutup').value = data.penutup || '';
    var kegiatan = data.kegiatan.length ? data.kegiatan : [{}];
    if (jenis.value !== 'karopsi') kegiatan = kegiatan.slice(0, 1);
    kegiatan.forEach(function (item) {
      tambahKartu(true);
      isiKartu(daftar.lastElementChild, item);
    });
    if (!daftar.children.length) tambahKartu(true);
    nomor();
    gambar();
  }

  function nomor() {
    Array.from(daftar.children).forEach(function (kartu, i) {
      kartu.querySelector('.judul-kegiatan').textContent = 'Kegiatan ' + (i + 1);
      kartu.querySelector('.hapus').hidden = daftar.children.length === 1;
    });
    document.getElementById('tambah').hidden = jenis.value === 'karo_sdm';
  }

  function nilaiJam(kotak, hingga) {
    if (hingga) return 'hingga';
    var jj = kotak.querySelector('.jj').value;
    var mm = kotak.querySelector('.mm').value;
    if (!jj && !mm) return '';
    return (jj || '00') + ':' + (mm || '00');
  }

  function kumpulkan() {
    return {
      jenis: jenis.value,
      penerima: document.getElementById('penerima').value,
      pembuka: document.getElementById('pembuka').value,
      penutup: document.getElementById('penutup').value,
      kegiatan: Array.from(daftar.querySelectorAll('.kegiatan')).map(function (kartu) {
        return {
          nama: kartu.querySelector('.nama').value.trim(),
          tanggal: kartu.querySelector('.tanggal').value,
          hari: kartu.querySelector('.hari').value.trim(),
          mulai: nilaiJam(kartu.querySelector('.mulai'), false),
          selesai: nilaiJam(kartu.querySelector('.selesai'), kartu.querySelector('.hingga').checked),
          lokasi: kartu.querySelector('.lokasi').value.trim(),
          uraian: kartu.querySelector('.uraian').value,
          hasil: kartu.querySelector('.hasil').value,
          orang: Array.from(kartu.querySelectorAll('.orang-item')).map(function (el) {
            return { pangkat: el.dataset.pangkat, nama: el.dataset.nama, gelar: el.dataset.gelar, jabatan: el.dataset.jabatan };
          })
        };
      })
    };
  }

  function romawi(angka) {
    var peta = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    var hasil = '';
    peta.forEach(function (item) {
      while (angka >= item[0]) { hasil += item[1]; angka -= item[0]; }
    });
    return hasil;
  }

  function tanggalTeks(nilai) {
    if (!nilai) return '';
    var bagian = nilai.split('-');
    return String(Number(bagian[2])) + ' ' + BULAN[Number(bagian[1]) - 1] + ' ' + bagian[0];
  }

  function jamTeks(mulai, selesai) {
    var rapi = function (jam) {
      var cocok = /^(\d{2}):(\d{2})/.exec(jam || '');
      return cocok ? cocok[1] + '.' + cocok[2] : '';
    };
    var a = rapi(mulai);
    if (selesai === 'hingga') return a ? a + ' WIB hingga selesai' : '';
    var b = rapi(selesai);
    if (a && b) return a + '-' + b + ' WIB';
    return a ? a + ' WIB' : '';
  }

  function barisIsi(teks) {
    return String(teks || '').split(/\n+/).map(function (baris) { return baris.trim(); }).filter(Boolean).map(function (baris, i) {
      return (i + 1) + '. ' + baris;
    }).join('\n');
  }

  function orangTeks(daftarOrang) {
    return daftarOrang.map(function (orang, i) {
      var nama = (orang.pangkat + ' ' + orang.nama).trim();
      if (orang.gelar) nama += ', ' + orang.gelar;
      var baris = (i + 1) + '. ' + nama;
      if (orang.jabatan) baris += '\n   ' + orang.jabatan;
      return baris;
    }).join('\n');
  }

  

  function susun(data) {
    var blok = [];

    // =====================================
    // HEADER WAJIB LAPORAN BAGPSI
    // =====================================

    blok.push(
        '*KEPADA:*',
        (data.penerima || 'Yth. KARO SDM POLDA BANTEN').trim(),
        '',
        '*DARI:*',
        'KABAGPSI RO SDM POLDA BANTEN',
        '',
        '*PERIHAL:*',
        '',
        '*LAPORAN KEGIATAN BAGPSI RO SDM POLDA BANTEN*',
        '',
        '*TEMBUSAN:*',
        '1. Psikolog Utama Ropsi SSDM Polri;',
        '2. Para Kabag di lingkungan Ropsi SSDM Polri;',
        '3. Psikolog Madya Ropsi SSDM Polri.',
        '',
        'Assalamualaikum Wr. Wb.',
        'Salam sejahtera untuk kita semua.',
        'Om Swastyastu.',
        'Namo Buddhaya.',
        'Salam Kebajikan.',
        ''
    );

    // =====================================
    // ISI LAPORAN
    // =====================================

    var isi = data.jenis === 'karopsi'
        ? karopsi(data.kegiatan)
        : karo(data.kegiatan[0] || {});

    if (isi) blok.push(isi);

    // =====================================
    // PENUTUP
    // =====================================

    if (data.penutup && data.penutup.trim()) {
        blok.push('', data.penutup.trim());
    }

    // =====================================
    // SLOGAN RESMI BAGPSI
    // =====================================

    blok.push(
        '',
        'DUMM',
        '',
        'KABAGPSI RO SDM POLDA BANTEN',
        '',
        'SDM BERKEUNGGULAN',
        'POLISI BERSAMA MASYARAKAT',
        'INDONESIA MAJU'
    );

    return blok.join('\n').trim() + '\n';
}



  function waktu(item) {
    var baris = [];
    var tanggal = tanggalTeks(item.tanggal);
    var hari = item.hari || '';
    if (hari || tanggal) baris.push('Hari/Tanggal: ' + [hari, tanggal].filter(Boolean).join(', '));
    var jam = jamTeks(item.mulai, item.selesai);
    if (jam) baris.push('Waktu: ' + jam);
    if (item.lokasi) baris.push('Tempat: ' + item.lokasi);
    return baris.join('\n');
  }

  function karo(item) {
    var bagian = [
      ['KEGIATAN', item.nama || ''],
      ['WAKTU DAN TEMPAT', waktu(item)],
      ['URAIAN KEGIATAN', barisIsi(item.uraian)],
      ['HASIL KEGIATAN', barisIsi(item.hasil)],
      ['PELAKSANA', orangTeks(item.orang || [])]
    ].filter(function (bagianItem) { return bagianItem[1]; });
    return bagian.map(function (bagianItem, i) {
      return '*' + romawi(i + 1) + '. ' + bagianItem[0] + '*\n' + bagianItem[1];
    }).join('\n\n');
  }

  function karopsi(kegiatan) {
    return kegiatan.map(function (item, index) {
      var bagian = [
        ['Waktu', waktu(item).split('\n').filter(function (baris) { return baris.indexOf('Tempat:') !== 0; }).join('\n')],
        ['Tempat', item.lokasi || ''],
        ['Pelaksana', orangTeks(item.orang || [])],
        ['Uraian', barisIsi(item.uraian)],
        ['Hasil', barisIsi(item.hasil)]
      ].filter(function (bagianItem) { return bagianItem[1]; });
      var judul = '*' + romawi(index + 1) + (item.nama ? '. ' + item.nama : '') + '*';
      return [judul].concat(bagian.map(function (bagianItem) {
        return '\n*' + bagianItem[0] + '*\n' + bagianItem[1];
      })).join('\n');
    }).join('\n\n');
  }

  function gambar() {
    var data = kumpulkan();
    document.getElementById('hasil').textContent = susun(data);
    localStorage.setItem('bagpsi-halaman', JSON.stringify(data));
  }

  function urut(kartu) {
    var kotak = kartu.querySelector('.terpilih');
    Array.from(kotak.children).sort(function (a, b) {
      var beda = (SKOR[b.dataset.pangkat] || 0) - (SKOR[a.dataset.pangkat] || 0);
      if (beda) return beda;
      return a.dataset.nama.localeCompare(b.dataset.nama, 'id', { sensitivity: 'base' });
    }).forEach(function (el) { kotak.appendChild(el); });
  }

  document.getElementById('tambah').addEventListener('click', tambahKartu);
  jenis.addEventListener('change', function () {
    document.getElementById('penerima').value = jenis.value === 'karopsi' ? 'Yth. KAROPSI SSDM POLRI' : 'Yth. KARO SDM POLDA BANTEN';
    while (daftar.children.length > 1) daftar.lastElementChild.remove();
    if (!daftar.children.length) tambahKartu();
    nomor();
    gambar();
  });
  document.body.addEventListener('input', function (e) {
    var kartu = e.target.closest('.kegiatan');
    if (e.target.classList.contains('tanggal') && kartu) {
      kartu.querySelector('.hari').value = e.target.value ? HARI[new Date(e.target.value + 'T00:00:00').getDay()] : '';
    }
    gambar();
  });
  document.body.addEventListener('change', function (e) {
    if (e.target.classList.contains('hingga')) {
      var kotak = e.target.closest('.kegiatan').querySelector('.selesai');
      kotak.querySelectorAll('select').forEach(function (select) { select.disabled = e.target.checked; });
    }
    gambar();
  });
  document.body.addEventListener('click', function (e) {
    var kartu = e.target.closest('.kegiatan');
    if (e.target.classList.contains('tambah-orang') && kartu) {
      var pangkat = kartu.querySelector('.pangkat').value;
      var nama = kartu.querySelector('.nama-orang').value.trim();
      if (!pangkat || !nama) return;
      pasangOrang(kartu, {
        pangkat: pangkat,
        nama: nama,
        gelar: kartu.querySelector('.gelar').value.trim(),
        jabatan: kartu.querySelector('.jabatan').value.trim()
      });
      kartu.querySelector('.pangkat').value = '';
      kartu.querySelector('.nama-orang').value = '';
      kartu.querySelector('.gelar').value = '';
      kartu.querySelector('.jabatan').value = '';
      urut(kartu);
      gambar();
    }
    if (e.target.classList.contains('buang')) {
      var induk = e.target.closest('.kegiatan');
      e.target.closest('.orang-item').remove();
      urut(induk);
      gambar();
    }
    if (e.target.classList.contains('hapus') && daftar.children.length > 1) {
      kartu.remove();
      nomor();
      gambar();
    }
  });
  document.getElementById('salin').addEventListener('click', function () {
    navigator.clipboard.writeText(document.getElementById('hasil').textContent);
    document.getElementById('salin').textContent = 'Tersalin';
  });
  document.getElementById('baru').addEventListener('click', function () {
    if (!window.confirm('Draf di HP ini akan dihapus. Lanjutkan?')) return;
    localStorage.removeItem('bagpsi-halaman');
    location.reload();
  });

  pulihkan();
})();
