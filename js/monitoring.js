// ==============================================================
// MONITORING MODULE
// ==============================================================

// Load Monitoring Absensi
async function loadMonitoringAbsensi() {
  setActiveMenu('Monitoring');
  
  const html = `
        <div class="view-section active animate-fade-in" id="view-monitoring">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h3 class="font-bold text-sm text-gray-800 mb-1">Monitoring Kehadiran</h3>
                        <p class="text-xs text-gray-500 font-medium">Data Realtime: <span id="monitoringDate" class="text-indigo-600 font-bold">...</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="exportMonitoringExcel()" id="btnExportMonitoring" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 transition">
                            <i class="fas fa-file-excel"></i> <span class="hidden sm:inline">Export Excel</span>
                        </button>
                        <button onclick="refreshData('monitoring')" class="bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="flex flex-col sm:flex-row items-center gap-2 text-xs w-full md:w-auto">
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <span class="text-gray-500 font-bold hidden sm:inline">Show</span>
                            <select onchange="handleTableLimit('monitoring', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2 w-full sm:w-auto">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                        <select onchange="handleTableStatusFilter('monitoring', this.value)" class="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2 font-bold w-full sm:w-auto">
                            <option value="">Semua Status</option>
                            <option value="Hadir">Hadir (Hijau)</option>
                            <option value="Sakit">Sakit (Kuning)</option>
                            <option value="Izin">Izin (Biru)</option>
                            <option value="Alpa">Alpa (Merah)</option>
                            <option value="Belum Absen">Belum Absen (Abu)</option>
                        </select>
                    </div>

                    <div class="relative w-full md:w-64">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-xs"></i>
                        </div>
                        <input type="text" oninput="handleTableSearch('monitoring', this.value)" class="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full pl-10 p-2" placeholder="Cari Nama / Kelas...">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[700px]">
                        <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase font-semibold">
                            <tr>
                                <th class="p-4 text-center w-10">No</th>
                                <th class="p-4">Siswa</th>
                                <th class="p-4 text-center">Kelas</th>
                                <th class="p-4 text-center">Jam Datang</th>
                                <th class="p-4 text-center">Jam Pulang</th>
                                <th class="p-4 text-center">Keterangan</th>
                                <th class="p-4 text-center">Status</th>
                            </thead>
                            <tbody id="tbody-monitoring" class="divide-y divide-gray-50 bg-white text-sm"></tbody>
                        </thead>
                    </table>
                </div>

                <div id="footer-monitoring" class="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
                    <span id="info-monitoring">Menampilkan 0 data</span>
                    <div class="flex gap-1">
                        <button onclick="changePage('monitoring', -1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-prev-monitoring">Prev</button>
                        <button onclick="changePage('monitoring', 1)" class="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" id="btn-next-monitoring">Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;
  
  renderView(html);
  document.getElementById('monitoringDate').textContent = formatDate(new Date());
  
  const myClass = currentUser?.role === 'guru' ? currentUser.kelas : null;
  
  if (tableState.monitoring.fullData.length > 0) {
    processTableData('monitoring');
  } else {
    document.getElementById('tbody-monitoring').innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Memuat data...</td></tr>';
    const result = await callAPI('getMonitoringRealtime', { kelas: myClass });
    if (result.success) {
      tableState.monitoring.fullData = result.data;
      processTableData('monitoring');
    } else {
      document.getElementById('tbody-monitoring').innerHTML = '<tr><td colspan="7" class="p-12 text-center text-gray-400">Data tidak ditemukan.</td></tr>';
    }
  }
}

// Render Monitoring Rows
function renderMonitoringRows(data, startIdx) {
  const tbody = document.getElementById('tbody-monitoring');
  if (!tbody) return;
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-gray-400 italic bg-white">Tidak ada data ditemukan.</td></tr>';
    return;
  }
  
  const canEdit = (currentUser?.role === 'guru' || currentUser?.role === 'admin');
  const cursorClass = canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-70';
  const disabledAttr = canEdit ? '' : 'disabled';
  
  tbody.innerHTML = data.map((d, i) => {
    let statusColor = 'bg-gray-100 text-gray-600';
    if (d.status === 'Hadir') statusColor = 'bg-green-100 text-green-700';
    else if (d.status === 'Izin') statusColor = 'bg-blue-100 text-blue-700';
    else if (d.status === 'Sakit') statusColor = 'bg-yellow-100 text-yellow-700';
    else if (d.status === 'Alpa') statusColor = 'bg-red-100 text-red-700';
    
    const ketHtml = getKeteranganBadge(d.keterangan);
    
    return `
            <tr class="hover:bg-gray-50 border-b border-gray-50 transition group">
                <td class="p-4 text-center text-gray-400 text-xs">${startIdx + i + 1}</td>
                <td class="p-4">
                    <div class="font-bold text-sm text-gray-900">${d.nama}</div>
                    <div class="text-xs text-gray-500 font-mono">${d.nisn}</div>
                </td>
                <td class="p-4 text-center"><span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold border border-indigo-100">${d.kelas}</span></td>
                <td class="p-4 text-center text-xs font-mono text-gray-600">${d.jamDatang}</td>
                <td class="p-4 text-center text-xs font-mono text-gray-600">${d.jamPulang}</td>
                <td class="p-4 text-center align-middle">${ketHtml}</td>
                <td class="p-4 text-center relative">
                    <select onchange="changeStatus('${d.nisn}', '${d.nama}', '${d.kelas}', this)" 
                        class="text-xs font-bold py-1.5 px-2 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none text-center w-32 ${statusColor} ${cursorClass}"
                        ${disabledAttr}>
                        <option value="Belum Absen" ${d.status === 'Belum Absen' ? 'selected' : ''}>Belum Absen</option>
                        <option value="Hadir" ${d.status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                        <option value="Izin" ${d.status === 'Izin' ? 'selected' : ''}>Izin</option>
                        <option value="Sakit" ${d.status === 'Sakit' ? 'selected' : ''}>Sakit</option>
                        <option value="Alpa" ${d.status === 'Alpa' ? 'selected' : ''}>Alpa</option>
                    </select>
                    ${canEdit ? '<i class="fas fa-chevron-down absolute right-6 top-1/2 transform -translate-y-1/2 text-[10px] pointer-events-none opacity-40"></i>' : ''}
                </td>
            </tr>
        `;
  }).join('');
}

// Change Status
async function changeStatus(nisn, nama, kelas, selectElement) {
  const newStatus = selectElement.value;
  selectElement.disabled = true;
  selectElement.style.opacity = '0.5';
  
  const result = await callAPI('updateAbsensiStatus', { nisn, nama, kelas, status: newStatus });
  
  selectElement.disabled = false;
  selectElement.style.opacity = '1';
  
  if (result.success) {
    let newColor = 'bg-gray-100 text-gray-600';
    if (newStatus === 'Hadir') newColor = 'bg-green-100 text-green-700';
    else if (newStatus === 'Izin') newColor = 'bg-blue-100 text-blue-700';
    else if (newStatus === 'Sakit') newColor = 'bg-yellow-100 text-yellow-700';
    else if (newStatus === 'Alpa') newColor = 'bg-red-100 text-red-700';
    
    selectElement.className = `text-xs font-bold py-1.5 px-2 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none text-center w-32 cursor-pointer ${newColor}`;
    showAlert('success', `Status ${nama} diperbarui menjadi ${newStatus}`);
  } else {
    showAlert('error', 'Gagal update: ' + result.message);
    loadMonitoringAbsensi();
  }
}

// Export Monitoring to Excel
async function exportMonitoringExcel() {
  const btn = document.getElementById('btnExportMonitoring');
  if (!btn) return;
  
  const originalContent = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memproses...';
  
  const myClass = (currentUser && currentUser.role === 'guru') ? currentUser.kelas : null;
  const result = await callAPI('generateExcel', { type: 'monitoring', filters: { kelas: myClass } });
  
  btn.disabled = false;
  btn.innerHTML = originalContent;
  
  if (result.success) {
    window.open(result.url, '_blank');
    showAlert('success', 'Data monitoring berhasil di-export!');
  } else {
    showAlert('error', result.message);
  }
}

// Export to window
window.loadMonitoringAbsensi = loadMonitoringAbsensi;
window.renderMonitoringRows = renderMonitoringRows;
window.changeStatus = changeStatus;
window.exportMonitoringExcel = exportMonitoringExcel;