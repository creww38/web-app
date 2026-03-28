// ==============================================================
// LIBUR MANAGEMENT MODULE
// ==============================================================

// Load Kelola Absen (Hari Libur)
async function loadKelolaAbsen() {
    setActiveMenu('Kelola Absen');
    
    const html = `
        <div class="view-section active animate-fade-in" id="view-kelola-absen">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                        <div class="p-5 border-b border-gray-100 bg-indigo-50/50">
                            <h3 class="font-bold text-gray-800 flex items-center">
                                <i class="fas fa-clock text-indigo-600 mr-2"></i> Pengaturan Waktu
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">Konfigurasi jam operasional absensi.</p>
                        </div>
                        <div class="p-5">
                            <form onsubmit="saveGlobalConfig(event)">
                                <div class="space-y-4">
                                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 mb-2">Absen Datang</p>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-xs font-bold text-gray-700 mb-1">Mulai Buka</label>
                                                <input type="time" id="conf_masuk_mulai" name="jam_masuk_mulai" required class="w-full border-gray-300 rounded-lg text-xs p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-bold text-gray-700 mb-1">Batas Terlambat</label>
                                                <input type="time" id="conf_masuk_akhir" name="jam_masuk_akhir" required class="w-full border-gray-300 rounded-lg text-xs p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 mb-2">Absen Pulang</p>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-xs font-bold text-gray-700 mb-1">Mulai Buka</label>
                                                <input type="time" id="conf_pulang_mulai" name="jam_pulang_mulai" required class="w-full border-gray-300 rounded-lg text-xs p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-bold text-gray-700 mb-1">Tutup Absen</label>
                                                <input type="time" id="conf_pulang_akhir" name="jam_pulang_akhir" required class="w-full border-gray-300 rounded-lg text-xs p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" id="btnSaveConfig" class="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition">
                                    <i class="fas fa-save"></i> Simpan Pengaturan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div class="p-5 border-b border-gray-100 bg-gray-50/30">
                            <h3 class="font-bold text-gray-800">Daftar Hari Libur</h3>
                            <p class="text-xs text-gray-500 mt-1">Siswa tidak bisa absen pada tanggal ini.</p>
                        </div>

                        <div class="p-5 border-b border-gray-100">
                            <form onsubmit="handleAddLibur(event)" class="flex flex-col md:flex-row gap-3 items-end">
                                <div class="flex-1 w-full">
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</label>
                                    <input type="date" name="tanggal" required class="w-full border-gray-300 rounded-lg text-sm p-2.5">
                                </div>
                                <div class="flex-[2] w-full">
                                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Keterangan</label>
                                    <input type="text" name="keterangan" required placeholder="Contoh: Maulid Nabi / Cuti Bersama" class="w-full border-gray-300 rounded-lg text-sm p-2.5">
                                </div>
                                <button type="submit" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition w-full md:w-auto">
                                    <i class="fas fa-plus mr-1"></i> Tambah
                                </button>
                            </form>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase font-semibold">
                                    <tr>
                                        <th class="p-4 w-10 text-center">No</th>
                                        <th class="p-4">Tanggal</th>
                                        <th class="p-4">Keterangan</th>
                                        <th class="p-4 text-center w-20">Aksi</th>
                                    </thead>
                                    <tbody id="tbody-libur" class="divide-y divide-gray-50 text-sm"></tbody>
                                </thead>
                             </table>
                        </div>

                        <div id="footer-libur" class="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
                            <span id="info-libur">Menampilkan 0 data</span>
                            <div class="flex gap-1">
                                <button onclick="changePage('libur', -1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-prev-libur">Prev</button>
                                <button onclick="changePage('libur', 1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-next-libur">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderView(html);
    
    // Load Data Hari Libur
    document.getElementById('tbody-libur').innerHTML = '……<td colspan="4" class="p-8 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Memuat data...</td>……';
    
    const result = await callAPI('getHariLibur');
    if (result.success) {
        tableState.libur.fullData = result.data;
        processTableData('libur');
    } else {
        document.getElementById('tbody-libur').innerHTML = '……<td colspan="4" class="p-4 text-center text-red-500">Gagal memuat data.</td>……';
    }
    
    // Load Konfigurasi Jam
    loadGlobalConfig();
}

// Load Global Config
async function loadGlobalConfig() {
    const inputs = document.querySelectorAll('#view-kelola-absen input[type="time"]');
    inputs.forEach(el => el.disabled = true);

    const result = await callAPI('getAppConfig');
    inputs.forEach(el => el.disabled = false);
    
    if(result.success) {
        const conf = result.data;
        document.getElementById('conf_masuk_mulai').value = conf.jam_masuk_mulai || CONFIG.DEFAULT_SETTINGS.jam_masuk_mulai;
        document.getElementById('conf_masuk_akhir').value = conf.jam_masuk_akhir || CONFIG.DEFAULT_SETTINGS.jam_masuk_akhir;
        document.getElementById('conf_pulang_mulai').value = conf.jam_pulang_mulai || CONFIG.DEFAULT_SETTINGS.jam_pulang_mulai;
        document.getElementById('conf_pulang_akhir').value = conf.jam_pulang_akhir || CONFIG.DEFAULT_SETTINGS.jam_pulang_akhir;
    }
}

// Save Global Config
async function saveGlobalConfig(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveConfig');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';
    
    const newConfig = {
        jam_masuk_mulai: document.getElementById('conf_masuk_mulai').value,
        jam_masuk_akhir: document.getElementById('conf_masuk_akhir').value,
        jam_pulang_mulai: document.getElementById('conf_pulang_mulai').value,
        jam_pulang_akhir: document.getElementById('conf_pulang_akhir').value
    };

    const res = await callAPI('saveAppConfig', newConfig);
    btn.disabled = false;
    btn.innerHTML = originalText;
    
    if(res.success) {
        showAlert('success', 'Pengaturan waktu berhasil disimpan!');
    } else {
        showAlert('error', res.message);
    }
}

// Render Libur Rows
function renderLiburRows(data, startIdx) {
    const tbody = document.getElementById('tbody-libur');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '……<td colspan="4" class="p-8 text-center text-gray-400 italic">Tidak ada jadwal libur.</td>……';
        return;
    }
    
    tbody.innerHTML = data.map((item, i) => `
        <tr class="hover:bg-gray-50 border-b border-gray-50 transition group">
            <td class="p-4 text-center text-gray-500">${startIdx + i + 1}
                        <td class="p-4 font-mono font-medium text-indigo-700">
                ${formatDate(item.tanggal, 'full')}
            </td>
            <td class="p-4 font-bold text-gray-700">${item.keterangan}</td>
            <td class="p-4 text-center">
                <div class="flex justify-center space-x-2 opacity-80 group-hover:opacity-100">
                    <button onclick="editLibur('${item.tanggal}', '${item.keterangan}')" class="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteLiburConfirm('${item.tanggal}')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Edit Libur
function editLibur(tgl, ket) {
    showModal(createLiburModal({ tanggal: tgl, keterangan: ket }));
}

// Create Libur Modal
function createLiburModal(data) {
    const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all mb-4";
    
    return `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden animate-fade-in">
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            <div class="text-center mb-6">
                <div class="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"><i class="fas fa-calendar-day"></i></div>
                <h3 class="font-bold text-xl text-gray-800">Edit Hari Libur</h3>
                <p class="text-xs text-gray-500 mt-1">Perbarui tanggal atau keterangan</p>
            </div>
            <form onsubmit="saveUpdateLibur(event)">
                <input type="hidden" name="oldDate" value="${data.tanggal}">
                <label class="block mb-1 text-xs font-bold text-gray-500 uppercase">Tanggal</label>
                <input type="date" name="newDate" value="${data.tanggal}" required class="${inputClass}">
                <label class="block mb-1 text-xs font-bold text-gray-500 uppercase">Keterangan</label>
                <input type="text" name="newKeterangan" value="${data.keterangan}" required placeholder="Contoh: Cuti Bersama" class="${inputClass}">
                <div class="flex gap-3 mt-4">
                    <button type="button" onclick="closeModal()" class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">Batal</button>
                    <button type="submit" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold shadow-lg">Simpan Perubahan</button>
                </div>
            </form>
        </div>`;
}

// Save Update Libur
async function saveUpdateLibur(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveLibur');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';
    showLoading();
    
    const fd = new FormData(e.target);
    const oldDate = fd.get('oldDate');
    const newDate = fd.get('newDate');
    const newKet = fd.get('newKeterangan');
    
    const res = await callAPI('updateHariLibur', { oldDate, newDate, newKet });
    
    hideLoading();
    btn.disabled = false;
    btn.innerHTML = originalText;

    if (res.success) {
        closeModal();
        loadKelolaAbsen();
        showAlert('success', res.message);
    } else {
        showAlert('error', res.message);
    }
}

// Handle Add Libur
async function handleAddLibur(e) {
    e.preventDefault();
    showLoading();
    const fd = new FormData(e.target);
    const tgl = fd.get('tanggal');
    const ket = fd.get('keterangan');

    const res = await callAPI('addHariLibur', { tanggal: tgl, keterangan: ket });
    hideLoading();
    
    if (res.success) {
        e.target.reset();
        loadKelolaAbsen();
        showAlert('success', 'Jadwal libur ditambahkan');
    } else {
        showAlert('error', res.message);
    }
}

// Delete Libur Confirm
async function deleteLiburConfirm(tgl) {
    const result = await Swal.fire({
        title: 'Hapus Hari Libur?',
        text: `Hapus tanggal ${formatDate(tgl, 'full')} dari daftar libur.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        showLoading();
        const res = await callAPI('deleteHariLibur', { tanggal: tgl });
        hideLoading();
        
        if (res.success) {
            loadKelolaAbsen();
            showAlert('success', 'Jadwal libur dihapus');
        } else {
            showAlert('error', res.message);
        }
    }
}

// Export to window
window.loadKelolaAbsen = loadKelolaAbsen;
window.saveGlobalConfig = saveGlobalConfig;
window.renderLiburRows = renderLiburRows;
window.editLibur = editLibur;
window.handleAddLibur = handleAddLibur;
window.deleteLiburConfirm = deleteLiburConfirm;
window.saveUpdateLibur = saveUpdateLibur;