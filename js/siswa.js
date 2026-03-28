// ==============================================================
// SISWA MANAGEMENT MODULE
// ==============================================================

// Load Data Siswa
async function loadDataSiswa() {
    setActiveMenu('Data Siswa');
    
    const html = `
        <div class="view-section active animate-fade-in" id="view-data-siswa">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-3 md:p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div><h3 class="font-bold text-xs md:text-sm text-gray-800">Direktori Siswa</h3></div>
                    <div class="flex items-center gap-2">
                        <button onclick="refreshData('siswa')" class="bg-white text-gray-600 border border-gray-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button onclick="showAddSiswaModal()" class="bg-indigo-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                </div>

                <div class="p-3 md:p-4 bg-white border-b border-gray-100 flex flex-col gap-3">
                    <div class="flex flex-col sm:flex-row items-center gap-2 text-xs">
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <span class="text-gray-500 font-bold whitespace-nowrap text-[10px] md:text-xs">Show</span>
                            <select onchange="handleTableLimit('siswa', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] md:text-xs rounded-lg p-2 w-full sm:w-auto">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                        <select id="filterKelasSiswa" onchange="handleTableClassFilter('siswa', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] md:text-xs rounded-lg p-2 w-full sm:w-40 font-bold">
                            <option value="">Semua Kelas</option>
                        </select>
                    </div>

                    <div class="relative w-full">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-xs"></i>
                        </div>
                        <input type="text" oninput="handleTableSearch('siswa', this.value)" class="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full pl-10 p-2" placeholder="Cari Nama / NISN...">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[500px]">
                        <thead class="bg-gray-50 text-gray-500 text-[8px] md:text-[10px] uppercase font-semibold">
                            <tr>
                                <th class="p-2 md:p-3 text-center w-10">No</th>
                                <th class="p-2 md:p-3">Nama</th>
                                <th class="p-2 md:p-3 hidden md:table-cell">NISN</th>
                                <th class="p-2 md:p-3">Kelas</th>
                                <th class="p-2 md:p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-siswa" class="divide-y divide-gray-50 bg-white text-xs"></tbody>
                    </table>
                </div>

                <div id="footer-siswa" class="p-3 md:p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-[10px] md:text-xs text-gray-500">
                    <span id="info-siswa">Menampilkan 0 data</span>
                    <div class="flex gap-1">
                        <button onclick="changePage('siswa', -1)" class="px-2 md:px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" id="btn-prev-siswa">Prev</button>
                        <button onclick="changePage('siswa', 1)" class="px-2 md:px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" id="btn-next-siswa">Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderView(html);
    
    // Populate kelas dropdown
    const dropdown = document.getElementById('filterKelasSiswa');
    if (dropdown && existingClasses.length > 0) {
        dropdown.innerHTML = '<option value="">Semua Kelas</option>' + 
            existingClasses.map(k => `<option value="${k}">${k}</option>`).join('');
    }

    if (tableState.siswa.fullData.length > 0) {
        processTableData('siswa');
    } else {
        document.getElementById('tbody-siswa').innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Memuat data siswa...</td></tr>';
        const result = await callAPI('getSiswaList');
        if (result.success) {
            tableState.siswa.fullData = result.data;
            processTableData('siswa');
        } else {
            showAlert('error', result.message);
        }
    }
}

// Render Siswa Rows
function renderSiswaRows(data, startIdx) {
    const tbody = document.getElementById('tbody-siswa');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map((siswa, i) => `
        <tr class="hover:bg-gray-50 transition border-b border-gray-50 group">
            <td class="p-4 text-center text-gray-500 text-sm">${startIdx + i + 1}</td>
            <td class="p-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                        ${siswa.nama.charAt(0)}
                    </div>
                    <div>
                        <div class="font-bold text-sm text-gray-900">${siswa.nama}</div>
                        <div class="text-xs text-gray-500 md:hidden">${siswa.nisn}</div>
                    </div>
                </div>
            </td>
            <td class="p-4 hidden md:table-cell text-sm text-gray-600 font-mono">${siswa.nisn}</td>
            <td class="p-4 hidden sm:table-cell"><span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">${siswa.kelas}</span></td>
            <td class="p-4 text-center">
                <div class="flex justify-center space-x-2 opacity-80 group-hover:opacity-100">
                    <button onclick='viewSiswa(${JSON.stringify(siswa).replace(/'/g, "&#39;")})' class="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick='editSiswa(${JSON.stringify(siswa).replace(/'/g, "&#39;")})' class="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSiswaConfirm('${siswa.nisn}', '${siswa.nama}')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="generateQRForSiswa('${siswa.nisn}', '${siswa.nama}', '${siswa.kelas}')" class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="QR Code">
                        <i class="fas fa-qrcode"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show Add Siswa Modal
function showAddSiswaModal() {
    showModal(createSiswaModal());
}

// Edit Siswa
function editSiswa(s) {
    showModal(createSiswaModal(s));
}

// View Siswa Detail
function viewSiswa(siswa) {
    showModal(createViewSiswaModal(siswa));
}

// Create Siswa Modal
function createSiswaModal(s = null) {
    const isEdit = s !== null;
    const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all";
    const labelClass = "block mb-1 text-xs font-bold text-gray-500 uppercase tracking-wide";
    
    return `
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-800">${isEdit ? 'Edit Data Siswa' : 'Registrasi Siswa Baru'}</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
            </div>
            <div class="p-6 max-h-[75vh] overflow-y-auto">
                <form onsubmit="saveSiswa(event, ${isEdit})" class="space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="${labelClass}">Nama Lengkap</label>
                            <input type="text" name="nama" value="${s?.nama || ''}" required class="${inputClass}" placeholder="Sesuai Akta Kelahiran">
                        </div>
                        <div>
                            <label class="${labelClass}">NISN</label>
                            <input type="number" name="nisn" value="${s?.nisn || ''}" required ${isEdit ? 'readonly class="' + inputClass + ' opacity-60 cursor-not-allowed"' : `class="${inputClass}"`} placeholder="Nomor Induk">
                        </div>
                        <div class="relative group">
                            <label class="${labelClass}">Kelas</label>
                            <input type="text" name="kelas" id="inputKelas" 
                                value="${s?.kelas || ''}" required class="${inputClass}" 
                                placeholder="Ketik atau pilih kelas" autocomplete="off"
                                onfocus="openKelasDropdown()" oninput="filterKelasDropdown(this.value)" onblur="closeKelasDropdown()">
                            <div id="dropdownKelasList" class="hidden absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto mt-1"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label class="${labelClass}">Jenis Kelamin</label>
                            <select name="jenisKelamin" class="${inputClass}">
                                <option value="Laki-laki" ${s?.jenisKelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                                <option value="Perempuan" ${s?.jenisKelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label class="${labelClass}">Tanggal Lahir</label>
                            <input type="date" name="tanggalLahir" value="${s?.tanggalLahir || ''}" required class="${inputClass}">
                        </div>
                        <div>
                            <label class="${labelClass}">Agama</label>
                            <select name="agama" class="${inputClass}">
                                <option value="Islam" ${s?.agama === 'Islam' ? 'selected' : ''}>Islam</option>
                                <option value="Kristen" ${s?.agama === 'Kristen' ? 'selected' : ''}>Kristen</option>
                                <option value="Katolik" ${s?.agama === 'Katolik' ? 'selected' : ''}>Katolik</option>
                                <option value="Hindu" ${s?.agama === 'Hindu' ? 'selected' : ''}>Hindu</option>
                                <option value="Buddha" ${s?.agama === 'Buddha' ? 'selected' : ''}>Buddha</option>
                                <option value="Lainnya" ${s?.agama === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label class="${labelClass}">Nama Ayah</label>
                            <input type="text" name="namaAyah" value="${s?.namaAyah || ''}" class="${inputClass}">
                        </div>
                        <div>
                            <label class="${labelClass}">Nama Ibu</label>
                            <input type="text" name="namaIbu" value="${s?.namaIbu || ''}" class="${inputClass}">
                        </div>
                        <div>
                            <label class="${labelClass}">No. Handphone</label>
                            <input type="tel" name="noHp" value="${s?.noHp || ''}" class="${inputClass}">
                        </div>
                    </div>
                    <div>
                        <label class="${labelClass}">Alamat Lengkap</label>
                        <textarea name="alamat" rows="2" class="${inputClass}">${s?.alamat || ''}</textarea>
                    </div>
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onclick="closeModal()" class="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition">Batal</button>
                        <button type="submit" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">Simpan Data</button>
                    </div>
                    ${isEdit ? `<input type="hidden" name="oldNisn" value="${s.nisn}">` : ''}
                </form>
            </div>
        </div>`;
}

// Create View Siswa Modal
function createViewSiswaModal(s) {
    const item = (label, value, icon) => `
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div class="flex items-center gap-2 mb-1">
                <i class="fas ${icon} text-gray-400 text-xs"></i>
                <span class="text-[10px] uppercase font-bold text-gray-500">${label}</span>
            </div>
            <div class="text-sm font-bold text-gray-800 break-words">${value || '-'}</div>
        </div>
    `;

    return `
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full animate-fade-in">
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-start">
                <div class="flex gap-4 items-center">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                        ${s.nama.charAt(0)}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold">${s.nama}</h3>
                        <p class="opacity-90 text-sm">${s.nisn} • ${s.kelas}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 max-h-[70vh] overflow-y-auto">
                <div class="mb-6">
                    <h4 class="text-sm font-bold text-emerald-700 mb-3">Data Pribadi</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${item('Jenis Kelamin', s.jenisKelamin, 'fa-venus-mars')}
                        ${item('Tanggal Lahir', s.tanggalLahir, 'fa-birthday-cake')}
                        ${item('Agama', s.agama, 'fa-pray')}
                        ${item('No. HP', s.noHp, 'fa-phone')}
                    </div>
                </div>
                <div class="mb-6">
                    <h4 class="text-sm font-bold text-emerald-700 mb-3">Data Orang Tua</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${item('Nama Ayah', s.namaAyah, 'fa-male')}
                        ${item('Nama Ibu', s.namaIbu, 'fa-female')}
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-emerald-700 mb-3">Alamat</h4>
                    <div class="bg-gray-50 p-4 rounded-xl flex gap-3">
                        <i class="fas fa-home text-gray-400 mt-1"></i>
                        <p class="text-sm text-gray-700">${s.alamat || 'Alamat belum diisi.'}</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button onclick="editSiswa(${JSON.stringify(s).replace(/"/g, '&quot;')})" class="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-200">Edit Data</button>
                <button onclick="closeModal()" class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300">Tutup</button>
            </div>
        </div>`;
}

// Save Siswa
async function saveSiswa(e, isEdit) {
    e.preventDefault();
    showLoading();

    const fd = new FormData(e.target);
    const siswaData = {
        nama: fd.get('nama'),
        nisn: fd.get('nisn'),
        jenisKelamin: fd.get('jenisKelamin'),
        tanggalLahir: fd.get('tanggalLahir'),
        agama: fd.get('agama'),
        namaAyah: fd.get('namaAyah'),
        namaIbu: fd.get('namaIbu'),
        noHp: fd.get('noHp'),
        kelas: fd.get('kelas'),
        alamat: fd.get('alamat')
    };

    let result;
    if (isEdit) {
        const oldNisn = fd.get('oldNisn');
        result = await callAPI('updateSiswa', { oldNisn, data: siswaData });
    } else {
        result = await callAPI('addSiswa', siswaData);
    }
    
    hideLoading();
    if (result.success) {
        closeModal();
        tableState.siswa.fullData = [];
        loadDataSiswa();
        showAlert('success', result.message);
    } else {
        showAlert('error', result.message);
    }
}

// Delete Siswa Confirm
async function deleteSiswaConfirm(nisn, nama) {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Data siswa "${nama}" akan dihapus secara permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        showLoading();
        const res = await callAPI('deleteSiswa', { nisn });
        hideLoading();
        
        if (res.success) {
            tableState.siswa.fullData = [];
            loadDataSiswa();
            Swal.fire('Terhapus!', 'Data siswa berhasil dihapus.', 'success');
        } else {
            Swal.fire('Gagal!', res.message, 'error');
        }
    }
}

// Generate QR for Siswa
function generateQRForSiswa(nisn, nama, kelas) {
    loadQRCodeSiswa(nisn, nama, kelas);
}

// Export to window
window.loadDataSiswa = loadDataSiswa;
window.renderSiswaRows = renderSiswaRows;
window.showAddSiswaModal = showAddSiswaModal;
window.editSiswa = editSiswa;
window.viewSiswa = viewSiswa;
window.saveSiswa = saveSiswa;
window.deleteSiswaConfirm = deleteSiswaConfirm;
window.generateQRForSiswa = generateQRForSiswa;