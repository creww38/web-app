// ==============================================================
// GURU MANAGEMENT MODULE
// ==============================================================

// Load Data Guru
async function loadDataGuru() {
  setActiveMenu('Data Guru');
  
  const html = `
        <div class="view-section active animate-fade-in" id="view-data-guru">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-3 md:p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div><h3 class="font-bold text-xs md:text-sm text-gray-800">Manajemen Guru</h3></div>
                    <div class="flex items-center gap-2">
                        <button onclick="refreshData('guru')" class="bg-white text-gray-600 border border-gray-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button onclick="showAddGuruModal()" class="bg-purple-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                </div>

                <div class="p-3 md:p-4 bg-white border-b border-gray-100 flex flex-col gap-3">
                    <div class="flex flex-col sm:flex-row items-center gap-2 text-xs">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-500 font-bold">Show</span>
                            <select onchange="handleTableLimit('guru', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                        <select id="filterKelasGuru" onchange="handleTableClassFilter('guru', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2 w-full sm:w-40 font-bold">
                            <option value="">Semua Kelas</option>
                        </select>
                    </div>

                    <div class="relative w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-xs"></i>
                        </div>
                        <input type="text" oninput="handleTableSearch('guru', this.value)" class="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full pl-10 p-2" placeholder="Cari Username...">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[500px]">
                        <thead class="bg-gray-50 text-gray-500 text-[8px] md:text-[10px] uppercase font-semibold">
                            <tr>
                                <th class="p-2 md:p-3 text-center w-10">No</th>
                                <th class="p-2 md:p-3">Username</th>
                                <th class="p-2 md:p-3">Wali Kelas</th>
                                <th class="p-2 md:p-3">Password</th>
                                <th class="p-2 md:p-3 text-center">Aksi</th>
                            </thead>
                            <tbody id="tbody-guru" class="divide-y divide-gray-50 bg-white text-xs"></tbody>
                         </thead>
                        </tbody>
                    </table>
                </div>

                <div id="footer-guru" class="p-3 md:p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-[10px] md:text-xs text-gray-500">
                    <span id="info-guru">Menampilkan 0 data</span>
                    <div class="flex gap-1">
                        <button onclick="changePage('guru', -1)" class="px-2 md:px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" id="btn-prev-guru">Prev</button>
                        <button onclick="changePage('guru', 1)" class="px-2 md:px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" id="btn-next-guru">Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;
  
  renderView(html);
  
  // Populate kelas dropdown
  const dropdown = document.getElementById('filterKelasGuru');
  if (dropdown && existingClasses.length > 0) {
    dropdown.innerHTML = '<option value="">Semua Kelas</option>' +
      existingClasses.map(k => `<option value="${k}">${k}</option>`).join('');
  }
  
  if (tableState.guru.fullData.length > 0) {
    processTableData('guru');
  } else {
    document.getElementById('tbody-guru').innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Memuat data guru...</td></tr>';
    const result = await callAPI('getGuruList');
    if (result.success) {
      tableState.guru.fullData = result.data;
      processTableData('guru');
    } else {
      showAlert('error', result.message);
    }
  }
}

// Render Guru Rows
function renderGuruRows(data, startIdx) {
  const tbody = document.getElementById('tbody-guru');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map((guru, i) => `
        <tr class="hover:bg-gray-50 transition border-b border-gray-50 group">
            <td class="p-4 text-center text-gray-500 text-sm">${startIdx + i + 1}</td>
            <td class="p-4 text-sm font-bold text-gray-800">${guru.username}</td>
            <td class="p-4 text-sm text-gray-600">
                ${guru.kelas ? `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">${guru.kelas}</span>` : '<span class="text-gray-400 italic text-xs">Semua Akses</span>'}
            </td>
            <td class="p-4 text-sm text-gray-400 font-mono">••••••••</td>
            <td class="p-4 text-center">
                <div class="flex justify-center space-x-2 opacity-80 group-hover:opacity-100">
                    <button onclick='editGuru(${JSON.stringify(guru).replace(/'/g, "&#39;")})' class="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Edit Akun">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGuruConfirm('${guru.username}')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hapus Akun">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show Add Guru Modal
function showAddGuruModal() {
  showModal(createGuruModal());
}

// Edit Guru
function editGuru(guruData) {
  showModal(createGuruModal(guruData));
}

// Create Guru Modal
function createGuruModal(guru = null) {
  const isEdit = guru !== null;
  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-3 transition-all mb-4";
  
  let kelasOptions = '<option value="">-- Pilih Kelas (Opsional) --</option>';
  if (existingClasses && existingClasses.length > 0) {
    existingClasses.forEach(k => {
      const selected = (guru && guru.kelas === k) ? 'selected' : '';
      kelasOptions += `<option value="${k}" ${selected}>${k}</option>`;
    });
  }
  
  return `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden">
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            <div class="text-center mb-6">
                <div class="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"><i class="fas fa-chalkboard-teacher"></i></div>
                <h3 class="font-bold text-xl text-gray-800">${isEdit ? 'Edit Akun Guru' : 'Tambah Guru'}</h3>
            </div>
            <form onsubmit="saveGuru(event, ${isEdit})">
                <label class="block mb-1 text-xs font-bold text-gray-500 uppercase">Username</label>
                <input name="username" value="${guru?.username || ''}" placeholder="Username" required class="${inputClass}">
                <label class="block mb-1 text-xs font-bold text-gray-500 uppercase">Password</label>
                <input name="password" value="${guru?.password || ''}" placeholder="Password" required class="${inputClass}">
                <label class="block mb-1 text-xs font-bold text-gray-500 uppercase">Wali Kelas Untuk</label>
                <select name="kelas" class="${inputClass}">${kelasOptions}</select>
                <p class="text-[10px] text-gray-400 -mt-3 mb-4">Jika dipilih, guru hanya bisa melihat siswa di kelas ini.</p>
                ${isEdit ? `<input type="hidden" name="oldUsername" value="${guru.username}">` : ''}
                <div class="flex gap-3 mt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">Batal</button>
                    <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg">Simpan</button>
                </div>
            </form>
        </div>`;
}

// Save Guru
async function saveGuru(e, isEdit) {
  e.preventDefault();
  showLoading();
  
  const fd = new FormData(e.target);
  const username = fd.get('username');
  const password = fd.get('password');
  const kelas = fd.get('kelas');
  
  let result;
  if (isEdit) {
    const oldUsername = fd.get('oldUsername');
    result = await callAPI('updateGuru', { oldUsername, username, password, kelas });
  } else {
    result = await callAPI('addGuru', { username, password, kelas });
  }
  
  hideLoading();
  if (result.success) {
    closeModal();
    tableState.guru.fullData = [];
    loadDataGuru();
    showAlert('success', isEdit ? 'Data guru berhasil diperbarui' : 'Akun Guru berhasil dibuat');
  } else {
    showAlert('error', result.message);
  }
}

// Delete Guru Confirm
async function deleteGuruConfirm(username) {
  const result = await Swal.fire({
    title: 'Hapus Guru?',
    text: `Akun "${username}" akan dihapus.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  });
  
  if (result.isConfirmed) {
    showLoading();
    const res = await callAPI('deleteGuru', { username });
    hideLoading();
    
    if (res.success) {
      tableState.guru.fullData = [];
      loadDataGuru();
      showAlert('success', 'Akun guru berhasil dihapus');
    } else {
      showAlert('error', res.message);
    }
  }
}

// Export to window
window.loadDataGuru = loadDataGuru;
window.renderGuruRows = renderGuruRows;
window.showAddGuruModal = showAddGuruModal;
window.editGuru = editGuru;
window.saveGuru = saveGuru;
window.deleteGuruConfirm = deleteGuruConfirm;