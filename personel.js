(function () {
  'use strict';

  var client = null;
  var currentUser = null;
  var isAdmin = false;
  var records = [];

  var panel = document.getElementById('master-personel');
  var contentGrid = document.querySelector('.content-grid');
  var form = document.getElementById('personel-form');
  var statusNode = document.getElementById('personel-status');
  var listNode = document.getElementById('personel-list');

  function byId(id) { return document.getElementById(id); }

  function setStatus(message, isError) {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.classList.toggle('error', !!isError);
  }

  function showMaster() {
    if (!panel || !contentGrid) return;
    panel.hidden = false;
    contentGrid.classList.add('master-view');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('[data-personel-nav]').forEach(function (el) {
      el.classList.add('active');
    });
  }

  function hideMaster() {
    if (!panel || !contentGrid) return;
    panel.hidden = true;
    contentGrid.classList.remove('master-view');
    document.querySelectorAll('[data-personel-nav]').forEach(function (el) {
      el.classList.remove('active');
    });
    document.getElementById('area-editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('[data-personel-nav]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      showMaster();
    });
  });
  var closeButton = byId('tutup-master-personel');
  if (closeButton) closeButton.addEventListener('click', hideMaster);

  function fillActivitySelects() {
    var selects = document.querySelectorAll('.pilih-master-personel');
    selects.forEach(function (select) {
      var oldValue = select.value;
      select.replaceChildren();
      var first = document.createElement('option');
      first.value = '';
      first.textContent = records.length ? 'Pilih personel...' : 'Belum ada personel aktif';
      select.appendChild(first);

      records.filter(function (person) { return person.status === 'aktif'; })
        .forEach(function (person) {
          var option = document.createElement('option');
          option.value = person.id;
          option.textContent = person.pangkat + ' ' + person.nama +
            (person.jabatan ? ' — ' + person.jabatan : '');
          select.appendChild(option);
        });
      if (oldValue && records.some(function (person) { return person.id === oldValue && person.status === 'aktif'; })) {
        select.value = oldValue;
      }
    });
  }

  window.BAGPSI_REFRESH_PERSONEL_SELECTS = fillActivitySelects;

  function selectPersonel(select) {
    var card = select.closest('.kegiatan');
    if (!card) return;
    var person = records.find(function (item) { return item.id === select.value; });
    card.querySelector('.pangkat').value = person ? person.pangkat : '';
    card.querySelector('.nama-orang').value = person ? person.nama : '';
    card.querySelector('.gelar').value = person ? (person.gelar || '') : '';
    card.querySelector('.jabatan').value = person ? (person.jabatan || '') : '';
  }

  document.body.addEventListener('change', function (event) {
    if (event.target.classList.contains('pilih-master-personel')) {
      selectPersonel(event.target);
    }
  });

  function clearForm() {
    if (!form) return;
    form.reset();
    byId('personel-id').value = '';
    var save = byId('simpan-personel');
    if (save) save.textContent = 'Simpan personel';
  }

  function editPersonel(id) {
    var person = records.find(function (item) { return item.id === id; });
    if (!person || !isAdmin) return;
    byId('personel-id').value = person.id;
    byId('master-nrp').value = person.nrp || '';
    byId('master-pangkat').value = person.pangkat || '';
    byId('master-nama').value = person.nama || '';
    byId('master-gelar').value = person.gelar || '';
    byId('master-jabatan').value = person.jabatan || '';
    byId('master-bagian').value = person.bagian || '';
    byId('simpan-personel').textContent = 'Perbarui personel';
    byId('master-nama').focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function renderList() {
    if (!listNode) return;
    var query = (byId('cari-personel').value || '').trim().toLocaleLowerCase('id');
    var filter = byId('filter-status-personel').value;
    var visible = records.filter(function (person) {
      var statusMatch = filter === 'semua' || person.status === filter;
      var haystack = [person.nrp, person.pangkat, person.nama, person.gelar, person.jabatan, person.bagian]
        .filter(Boolean).join(' ').toLocaleLowerCase('id');
      return statusMatch && (!query || haystack.indexOf(query) !== -1);
    });

    listNode.replaceChildren();
    if (!visible.length) {
      var empty = document.createElement('div');
      empty.className = 'personel-empty';
      empty.textContent = 'Tidak ada data personel yang cocok.';
      listNode.appendChild(empty);
      return;
    }

    visible.forEach(function (person) {
      var row = document.createElement('div');
      row.className = 'personel-row';

      var main = document.createElement('div');
      main.className = 'personel-row-main';
      var name = document.createElement('strong');
      name.textContent = person.pangkat + ' ' + person.nama;
      var detail = document.createElement('small');
      detail.textContent = [
        person.gelar,
        person.jabatan,
        person.bagian,
        person.nrp ? 'NRP ' + person.nrp : '',
        person.status === 'aktif' ? 'Aktif' : 'Nonaktif'
      ].filter(Boolean).join(' · ');
      main.append(name, detail);
      row.appendChild(main);

      if (isAdmin) {
        var actions = document.createElement('div');
        actions.className = 'personel-row-actions';

        var edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'button-outline';
        edit.textContent = 'Edit';
        edit.addEventListener('click', function () { editPersonel(person.id); });
        actions.appendChild(edit);

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'button-outline';
        toggle.textContent = person.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan';
        toggle.addEventListener('click', function () { ubahStatus(person); });
        actions.appendChild(toggle);
        row.appendChild(actions);
      }
      listNode.appendChild(row);
    });
  }

  async function ubahStatus(person) {
    if (!isAdmin) return;
    var nextStatus = person.status === 'aktif' ? 'nonaktif' : 'aktif';
    var question = nextStatus === 'nonaktif'
      ? 'Nonaktifkan ' + person.nama + '? Data tidak akan dihapus dan riwayat laporan tetap utuh.'
      : 'Aktifkan kembali ' + person.nama + '?';
    if (!window.confirm(question)) return;

    setStatus('Memperbarui status personel...');
    var result = await client.from('personel_master')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', person.id);
    if (result.error) {
      setStatus('Gagal memperbarui: ' + result.error.message, true);
      return;
    }
    await loadPersonel();
    setStatus('Status personel berhasil diperbarui.');
  }

  async function savePersonel(event) {
    event.preventDefault();
    if (!isAdmin || !currentUser) {
      setStatus('Hanya admin yang dapat menambah atau mengubah master personel.', true);
      return;
    }

    var id = byId('personel-id').value;
    var payload = {
      nrp: byId('master-nrp').value.trim() || null,
      pangkat: byId('master-pangkat').value,
      nama: byId('master-nama').value.trim(),
      gelar: byId('master-gelar').value.trim() || null,
      jabatan: byId('master-jabatan').value.trim() || null,
      bagian: byId('master-bagian').value.trim() || null,
      updated_at: new Date().toISOString()
    };

    if (!payload.pangkat || !payload.nama) {
      setStatus('Pangkat dan nama wajib diisi.', true);
      return;
    }

    var button = byId('simpan-personel');
    button.disabled = true;
    setStatus('Menyimpan data personel ke Supabase...');

    var result;
    if (id) {
      result = await client.from('personel_master')
        .update(payload).eq('id', id).select().single();
    } else {
      payload.created_by = currentUser.id;
      result = await client.from('personel_master')
        .insert(payload).select().single();
    }

    button.disabled = false;
    if (result.error) {
      setStatus('Gagal menyimpan personel: ' + result.error.message, true);
      return;
    }

    clearForm();
    await loadPersonel();
    setStatus('Data personel berhasil disimpan ke database online.');
  }

  async function loadPersonel() {
    if (!client || !currentUser) return;
    setStatus('Memuat database personel...');
    var result = await client.from('personel_master')
      .select('id,nrp,pangkat,nama,gelar,jabatan,bagian,status,created_at,updated_at')
      .order('nama', { ascending: true });

    if (result.error) {
      setStatus('Gagal memuat master personel: ' + result.error.message, true);
      return;
    }

    records = result.data || [];
    fillActivitySelects();
    renderList();
    setStatus(records.length + ' data personel tersedia di database online.');
  }

  async function checkAdmin() {
    if (!client || !currentUser) return;
    var result = await client.rpc('is_bagpsi_admin');
    isAdmin = !result.error && result.data === true;
    var adminArea = byId('personel-admin-area');
    if (adminArea) adminArea.hidden = !isAdmin;
    if (!isAdmin) {
      setStatus('Mode lihat saja. Hubungi administrator BAGPSI untuk menambah atau mengubah personel.');
    }
  }

  async function onSession(session) {
    currentUser = session && session.user ? session.user : null;
    if (!currentUser) {
      records = [];
      fillActivitySelects();
      listNode.replaceChildren();
      return;
    }
    await checkAdmin();
    await loadPersonel();
  }

  async function init() {
    client = window.BAGPSI_SUPABASE_CLIENT || null;
    if (!client) {
      setStatus('Client Supabase belum terhubung. Periksa patch pada laporan.js dan urutan script di index.html.', true);
      return;
    }

    form.addEventListener('submit', savePersonel);
    byId('batal-edit-personel').addEventListener('click', clearForm);
    byId('cari-personel').addEventListener('input', renderList);
    byId('filter-status-personel').addEventListener('change', renderList);

    var sessionResult = await client.auth.getSession();
    if (sessionResult.error) {
      setStatus('Gagal memeriksa sesi: ' + sessionResult.error.message, true);
      return;
    }
    await onSession(sessionResult.data.session);

    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        Promise.resolve().then(function () { onSession(session); });
      }
    });
  }

  init();
})();
