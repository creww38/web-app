// ==============================================================
// TABLE STATE MANAGEMENT
// ==============================================================

// Table State
const tableState = {
  siswa: { fullData: [], filtered: [], limit: 10, page: 1, search: '', classFilter: '' },
  guru: { fullData: [], filtered: [], limit: 10, page: 1, search: '', classFilter: '' },
  libur: { fullData: [], filtered: [], limit: 10, page: 1, search: '' },
  rekap: { fullData: [], filtered: [], limit: 10, page: 1, search: '' },
  monitoring: { fullData: [], filtered: [], limit: 10, page: 1, search: '', statusFilter: '' }
};

// Process Table Data (Filter, Search, Pagination)
function processTableData(type) {
  const state = tableState[type];
  if (!state) return;
  
  let result = [...state.fullData];
  
  // Apply Class Filter
  if ((type === 'siswa' || type === 'guru') && state.classFilter) {
    result = result.filter(item => item.kelas === state.classFilter);
  }
  
  // Apply Status Filter
  if (type === 'monitoring' && state.statusFilter) {
    result = result.filter(item => item.status === state.statusFilter);
  }
  
  // Apply Search
  if (state.search) {
    const query = state.search.toLowerCase();
    result = result.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(query))
    );
  }
  
  state.filtered = result;
  
  // Pagination
  const total = state.filtered.length;
  const totalPages = Math.ceil(total / state.limit);
  
  if (state.page > totalPages && totalPages > 0) state.page = totalPages;
  if (total === 0) state.page = 1;
  
  const startIdx = (state.page - 1) * state.limit;
  const endIdx = startIdx + state.limit;
  const pagedData = state.filtered.slice(startIdx, endIdx);
  
  // Render based on type
  const renderers = {
    siswa: () => renderSiswaRows(pagedData, startIdx),
    guru: () => renderGuruRows(pagedData, startIdx),
    libur: () => renderLiburRows(pagedData, startIdx),
    rekap: () => renderRekapRows(pagedData),
    monitoring: () => renderMonitoringRows(pagedData, startIdx)
  };
  
  if (renderers[type]) renderers[type]();
  
  updatePaginationUI(type, startIdx, pagedData.length, total, state.page, totalPages);
}

// Update Pagination UI
function updatePaginationUI(type, startIdx, currentCount, total, currentPage, totalPages) {
  const infoEl = document.getElementById(`info-${type}`);
  const btnPrev = document.getElementById(`btn-prev-${type}`);
  const btnNext = document.getElementById(`btn-next-${type}`);
  
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Tidak ada data ditemukan.';
    } else {
      const end = startIdx + currentCount;
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${end} dari ${total} data`;
    }
  }
  if (btnPrev) btnPrev.disabled = currentPage === 1;
  if (btnNext) btnNext.disabled = currentPage >= totalPages;
}

// Handle Table Search
function handleTableSearch(type, query) {
  if (tableState[type]) {
    tableState[type].search = query.toLowerCase();
    tableState[type].page = 1;
    processTableData(type);
  }
}

// Handle Table Class Filter
function handleTableClassFilter(type, value) {
  if (tableState[type]) {
    tableState[type].classFilter = value;
    tableState[type].page = 1;
    processTableData(type);
  }
}

// Handle Table Status Filter
function handleTableStatusFilter(type, status) {
  if (tableState[type]) {
    tableState[type].statusFilter = status;
    tableState[type].page = 1;
    processTableData(type);
  }
}

// Handle Table Limit Change
function handleTableLimit(type, limit) {
  if (tableState[type]) {
    tableState[type].limit = limit === 'all' ? Infinity : parseInt(limit);
    tableState[type].page = 1;
    processTableData(type);
  }
}

// Handle Page Change
function changePage(type, direction) {
  const state = tableState[type];
  if (!state) return;
  
  const maxPage = Math.ceil(state.filtered.length / state.limit);
  const newPage = state.page + direction;
  
  if (newPage >= 1 && newPage <= maxPage) {
    state.page = newPage;
    processTableData(type);
  }
}

// Export to window
window.tableState = tableState;
window.processTableData = processTableData;
window.handleTableSearch = handleTableSearch;
window.handleTableClassFilter = handleTableClassFilter;
window.handleTableStatusFilter = handleTableStatusFilter;
window.handleTableLimit = handleTableLimit;
window.changePage = changePage;