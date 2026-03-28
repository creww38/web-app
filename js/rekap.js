// ==============================================================
// REKAP ABSENSI MODULE
// ==============================================================

// Load Rekap Absensi
async function loadRekapAbsensi() {
  setActiveMenu('Laporan');
  
  const html = `
        <div class="view-section active animate-fade-in" id="view-rekap-absensi">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-100 bg-gray-50/50">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">Laporan Kehadiran</h3>
                            <p class="text-xs text-gray-500">Rekap data absensi siswa berdasarkan periode.</p>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row gap-3 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div class="w-full md:flex-1">
                            <label class="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Dari Tanggal</label>
                            <input type="date" id="fStart" class="w-full border-gray-300 rounded-lg text-xs p-2.5">
                        </div>
                        <div class="w-full md:flex-1">
                            <label class="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Sampai Tanggal</label>
                            <input type="date" id="fEnd" class="w-full border-gray-300 rounded-lg text-xs p-2.5">
                        </div>
                        <div class="w-full md:flex-1">
                            <label class="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Filter Kelas</label>
                            <select id="fKelasRekap" class="w-full border-gray-300 rounded-lg text-xs p-2.5 bg-white">
                                <option value="">Semua Kelas</option>
                            </select>
                        </div>
                        <div class="flex gap-2 w-full md:w-auto">
                            <button onclick="applyFilter()" class="flex-1 md:flex-none bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-md hover:bg-indigo-700 transition">
                                <i class="fas fa-search"></i> Cari Data
                            </button>
                            <button onclick="exportToExcel()" id="btnExportExcel" class="flex-1 md:flex-none bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-md hover:bg-emerald-700 transition">
                                <i class="fas fa-file-excel"></i> Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div id="rekapContainer" class="hidden">
                    <div class="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-gray-500 font-bold">Tampilkan</span>
                            <select onchange="handleTableLimit('rekap', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                        <div class="relative w-full md:w-64">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-search text-gray-400 text-xs"></i>
                            </div>
                            <input type="text" oninput="handleTableSearch('rekap', this.value)" class="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full pl-10 p-2" placeholder="Cari Siswa / Kelas...">
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left min-w-[900px]">
                            <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase font-semibold">
                                 <tr>
                                    <th class="p-4 text-center w-10">No</th>
                                    <th class="p-4">Tanggal</th>
                                    <th class="p-4">Nama Siswa</th>
                                    <th class="p-4 text-center">Kelas</th>
                                    <th class="p-4 text-center">Jam Datang</th>
                                    <th class="p-4 text-center">Jam Pulang</th>
                                    <th class="p-4 text-center">Keterangan</th>
                                    <th class="p-4 text-center">Status</th>
                                 </tr>
                            </thead>
                            <tbody id="tbody-rekap" class="bg-white divide-y divide-gray-50 text-sm"></tbody>
                        </table>
                    </div>

                    <div id="footer-rekap" class="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
                        <span id="info-rekap">Menampilkan 0 data</span>
                        <div class="flex gap-1">
                            <button onclick="changePage('rekap', -1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-prev-rekap">Prev</button>
                            <button onclick="changePage('rekap', 1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-next-rekap">Next</button>
                        </div>
                    </div>
                </div>
                
                <div id="rekapEmptyState" class="text-center p-16 flex flex-col items-center justify-center">
                    <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-4 text-4xl">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h4 class="font-bold text-gray-800 text-lg">Menunggu Filter</h4>
                    <p class="text-gray-500 text-sm mt-1">Silakan pilih rentang tanggal mulai dan akhir, lalu klik tombol <b>Cari Data</b>.</p>
                </div>
                
                <div id="rekapLoading" class="hidden text-center p-16 flex flex-col items-center justify-center">
                    <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <h4 class="font-bold text-gray-800">Sedang Memproses...</h4>
                    <p class="text-gray-500 text-xs mt-1">Mengambil data dari server</p>
                </div>
            </div>
        </div>
    `;
  
  renderView(html);
  
  // Reset View State
  document.getElementById('rekapEmptyState')?.classList.remove('hidden');
  document.getElementById('rekapContainer')?.classList.add('hidden');
  document.getElementById('rekapLoading')?.classList.add('hidden');
  tableState.rekap.fullData = [];
  
  // Populate kelas dropdown
  const selectKelas = document.getElementById('fKelasRekap');
  if (selectKelas && existingClasses.length > 0) {
    selectKelas.innerHTML = '<option value="">Semua Kelas</option>' +
      existingClasses.map(k => `<option value="${k}">${k}</option>`).join('');
  }
}

// Apply Filter
async function applyFilter() {
  const emptyState = document.getElementById('rekapEmptyState');
  const container = document.getElementById('rekapContainer');
  const loading = document.getElementById('rekapLoading');
  
  emptyState.classList.add('hidden');
  container.classList.add('hidden');
  loading.classList.remove('hidden');
  
  const filter = {
    tanggalMulai: document.getElementById('fStart')?.value,
    tanggalAkhir: document.getElementById('fEnd')?.value,
    kelas: document.getElementById('fKelasRekap')?.value
  };
  
  if (!filter.tanggalMulai || !filter.tanggalAkhir) {
    loading.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showAlert('error', 'Harap pilih rentang tanggal terlebih dahulu');
    return;
  }
  
  const result = await callAPI('getAbsensiList', filter);
  loading.classList.add('hidden');
  container.classList.remove('hidden');
  
  if (result.success) {
    tableState.rekap.fullData = result.data;
    processTableData('rekap');
  } else {
    tableState.rekap.fullData = [];
    processTableData('rekap');
  }
}

// Render Rekap Rows
function renderRekapRows(data) {
  const tbody = document.getElementById('tbody-rekap');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map((d, i) => {
    const ketHtml = getKeteranganBadge(d.keterangan);
    const statusHtml = getStatusBadge(d.status || 'Hadir');
    
    return `
            <tr class="hover:bg-gray-50 border-b border-gray-50 transition">
                <td class="p-4 text-center text-gray-500 text-xs">${i + 1}</td>
                <td class="p-4 text-sm text-gray-600">${formatDate(d.tanggal, 'date')}</td>
                <td class="p-4 text-sm font-bold text-gray-900">${d.nama}</td>
                <td class="p-4 text-center text-sm text-gray-600"><span class="bg-gray-100 px-2 py-1 rounded text-xs font-bold">${d.kelas}</span></td>
                <td class="p-4 text-center text-sm font-mono text-gray-600">${d.jamDatang || '-'}</td>
                <td class="p-4 text-center text-sm font-mono text-gray-600">${d.jamPulang || '-'}</td>
                <td class="p-4 text-center align-middle">${ketHtml}</td>
                <td class="p-4 text-center text-sm">${statusHtml}</td>
            </tr>
        `;
  }).join('');
}

// Export to Excel
async function exportToExcel() {
  const start = document.getElementById('fStart')?.value;
  const end = document.getElementById('fEnd')?.value;
  const kelas = document.getElementById('fKelasRekap')?.value;
  
  if (!start || !end) {
    showAlert('error', 'Harap pilih rentang tanggal terlebih dahulu.');
    return;
  }
  
  const btn = document.getElementById('btnExportExcel');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memproses...';
  
  const result = await callAPI('generateExcel', {
    type: 'laporan_absensi',
    filters: { tanggalMulai: start, tanggalAkhir: end, kelas: kelas }
  });
  
  btn.disabled = false;
  btn.innerHTML = originalText;
  
  if (result.success) {
    window.open(result.url, '_blank');
    showAlert('success', 'File Excel berhasil diunduh!');
  } else {
    showAlert('error', result.message);
  }
}

// Export to window
window.loadRekapAbsensi = loadRekapAbsensi;
window.applyFilter = applyFilter;
window.renderRekapRows = renderRekapRows;
window.exportToExcel = exportToExcel;