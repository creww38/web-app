// ==============================================================
// DASHBOARD MODULE
// ==============================================================

let adminChartInstance = null;
let guruChartInstance = null;
let existingClasses = [];

// Initialize Dashboard
async function initDashboard() {
    const name = currentUser?.nama || currentUser?.username || 'User';
    document.getElementById('navUserName').textContent = name;
    document.getElementById('navUserRole').textContent = (currentUser?.role || 'user').toUpperCase();
    document.getElementById('navUserInitial').textContent = name.charAt(0).toUpperCase();

    // Build Sidebar Menu
    const menuContainer = document.getElementById('sidebarMenu');
    let menuHTML = '';

    const createMenuItem = (label, icon, onclick, isDefaultActive = false) => {
        const hideText = !window.isSidebarOpen ? 'hidden' : '';
        const centerClass = !window.isSidebarOpen ? 'justify-center px-0' : 'space-x-3 px-4';
        const baseStyle = `flex items-center ${centerClass} py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap cursor-pointer `;
        const activeStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50";
        const inactiveStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";
        const currentStyle = isDefaultActive ? (baseStyle + activeStyle) : (baseStyle + inactiveStyle);

        return `<a data-name="${label}" onclick="${onclick}" class="${currentStyle}">
            <i class="fas ${icon} w-6 text-center flex-shrink-0 group-hover:scale-110 transition-transform"></i>
            <span class="sidebar-label font-medium transition-opacity duration-300 ${hideText}">${label}</span>
        </a>`;
    };

    if (currentUser?.role === 'admin') {
        menuHTML += createMenuItem('Dashboard', 'fa-home', 'loadAdminDashboard()', true);
        menuHTML += createMenuItem('Data Siswa', 'fa-user-graduate', 'loadDataSiswa()');
        menuHTML += createMenuItem('Data Guru', 'fa-chalkboard-teacher', 'loadDataGuru()');
        menuHTML += createMenuItem('Laporan', 'fa-clipboard-list', 'loadRekapAbsensi()');
        menuHTML += createMenuItem('Kelola Absen', 'fa-calendar-times', 'loadKelolaAbsen()');
        menuHTML += createMenuItem('Scan Absensi', 'fa-qrcode', 'loadScanAbsensi()');
        loadAdminDashboard();
    } 
    else if (currentUser?.role === 'guru') {
        menuHTML += createMenuItem('Dashboard', 'fa-home', 'loadGuruDashboard()', true);
        menuHTML += createMenuItem('Monitoring', 'fa-eye', 'loadMonitoringAbsensi()');
        menuHTML += createMenuItem('Scan Absensi', 'fa-qrcode', 'loadScanAbsensi()');
        loadGuruDashboard();
    } 
    else if (currentUser?.role === 'siswa') {
        menuHTML += createMenuItem('Dashboard', 'fa-home', 'loadSiswaDashboard()', true);
        menuHTML += createMenuItem('Kartu Saya', 'fa-id-card', 'loadQRCodeSiswa()');
        loadSiswaDashboard();
    }

    menuContainer.innerHTML = menuHTML;
    await loadKelasSuggestions();
}

// Load Kelas Suggestions
async function loadKelasSuggestions() {
    const result = await callAPI('getKelasList');
    if (result.success && result.data) {
        existingClasses = result.data;
    } else {
        existingClasses = CONFIG.DEFAULT_CLASSES;
    }
    
    // Populate class dropdowns
    const dropdowns = ['filterKelasSiswa', 'filterKelasGuru', 'fKelasRekap'];
    dropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Semua Kelas</option>' + 
                existingClasses.map(k => `<option value="${k}">${k}</option>`).join('');
        }
    });
}

// Render View Container
function renderView(html) {
    const container = document.getElementById('view-container');
    if (container) {
        container.innerHTML = html;
    }
}

// Load Admin Dashboard
async function loadAdminDashboard() {
    setActiveMenu('Dashboard');
    renderView(await getAdminDashboardHTML());
    
    document.getElementById('adminDateDisplay').textContent = formatDate(new Date());
    
    const result = await callAPI('getMonitoringRealtime');
    if (result.success) {
        const data = result.data;
        const total = data.length;
        const hadir = data.filter(d => d.status === 'Hadir').length;
        const sakit = data.filter(d => d.status === 'Sakit').length;
        const izin = data.filter(d => d.status === 'Izin').length;
        const alpa = data.filter(d => d.status === 'Alpa').length;
        const belum = data.filter(d => d.status === 'Belum Absen').length;

        animateValue("admStatTotal", 0, total, 800);
        animateValue("admStatHadir", 0, hadir, 800);
        animateValue("admStatSakit", 0, sakit, 800);
        animateValue("admStatIzin", 0, izin, 800);
        animateValue("admStatAlpa", 0, alpa, 800);
        renderAdminChart(hadir, sakit, izin, alpa, belum);
    }
}

// Get Admin Dashboard HTML
async function getAdminDashboardHTML() {
    return `
        <div class="view-section active animate-fade-in" id="view-admin-dashboard">
            <div class="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8 gap-4">
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-gray-800">Dashboard Admin</h2>
                    <p class="text-xs md:text-sm text-gray-500 mt-1">Pusat kontrol data absensi sekolah.</p>
                </div>
                <div class="flex items-center gap-2 md:gap-3">
                    <span class="text-[10px] md:text-xs font-bold bg-white text-gray-600 px-2 md:px-3 py-1.5 rounded-lg border border-gray-200">
                        <i class="far fa-clock mr-1 md:mr-2"></i> <span id="adminDateDisplay">...</span>
                    </span>
                    <button onclick="refreshData('dashboard')" class="flex items-center space-x-1 md:space-x-2 text-xs font-bold text-white bg-indigo-600 px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md">
                        <i class="fas fa-sync-alt"></i> <span class="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
                ${createStatCard('Total Siswa', 'admStatTotal', 'fa-users', 'indigo')}
                ${createStatCard('Hadir', 'admStatHadir', 'fa-check', 'emerald')}
                ${createStatCard('Sakit', 'admStatSakit', 'fa-procedures', 'yellow')}
                ${createStatCard('Izin', 'admStatIzin', 'fa-paper-plane', 'blue')}
                ${createStatCard('Alpa', 'admStatAlpa', 'fa-times', 'red')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-700 mb-4"><i class="fas fa-chart-bar text-indigo-500 mr-2"></i> Grafik Statistik Kehadiran</h3>
                    <div class="relative w-full h-[250px] md:h-[350px]"><canvas id="adminAttendanceChart"></canvas></div>
                </div>
                <div class="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4"><i class="fas fa-bolt text-amber-500 mr-2"></i> Akses Cepat</h3>
                    <div class="space-y-2 md:space-y-3">
                        ${createQuickAccessButton('Scan Absensi', 'fa-qrcode', 'loadScanAbsensi()', 'indigo')}
                        ${createQuickAccessButton('Data Siswa', 'fa-user-graduate', 'loadDataSiswa()', 'blue')}
                        ${createQuickAccessButton('Laporan', 'fa-file-alt', 'loadRekapAbsensi()', 'emerald')}
                        ${createQuickAccessButton('Hari Libur', 'fa-calendar-times', 'loadKelolaAbsen()', 'rose')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper: Create Stat Card
function createStatCard(title, id, icon, color) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-500',
        emerald: 'bg-emerald-50 text-emerald-500',
        yellow: 'bg-yellow-50 text-yellow-500',
        blue: 'bg-blue-50 text-blue-500',
        red: 'bg-red-50 text-red-500'
    };
    return `
        <div class="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-${color}-100">
            <p class="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">${title}</p>
            <div class="flex items-center justify-between mt-1 md:mt-2">
                <h3 id="${id}" class="text-xl md:text-2xl font-bold text-gray-800">-</h3>
                <div class="${colors[color]} p-1.5 md:p-2 rounded-lg"><i class="fas ${icon} text-xs md:text-sm"></i></div>
            </div>
        </div>
    `;
}

// Helper: Create Quick Access Button
function createQuickAccessButton(title, icon, onclick, color) {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        blue: 'bg-blue-100 text-blue-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        rose: 'bg-rose-100 text-rose-600'
    };
    return `
        <button onclick="${onclick}" class="w-full flex items-center p-2 md:p-3 rounded-xl border border-gray-100 hover:bg-${color}-50 transition text-left">
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg ${colors[color]} flex items-center justify-center mr-2 md:mr-3">
                <i class="fas ${icon} text-xs md:text-sm"></i>
            </div>
            <div>
                <div class="font-bold text-xs text-gray-700">${title}</div>
                <div class="text-[8px] md:text-[10px] text-gray-400">Klik untuk membuka</div>
            </div>
        </button>
    `;
}

// Render Admin Chart
function renderAdminChart(hadir, sakit, izin, alpa, belum) {
    const ctx = document.getElementById('adminAttendanceChart');
    if (!ctx) return;
    if (adminChartInstance) adminChartInstance.destroy();

    adminChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Belum Absen'],
            datasets: [{
                label: 'Jumlah Siswa',
                data: [hadir, sakit, izin, alpa, belum],
                backgroundColor: ['#10B981', '#EAB308', '#3B82F6', '#EF4444', '#9CA3AF'],
                borderRadius: 8,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [2, 2] } }, x: { grid: { display: false } } }
        }
    });
}

// Load Guru Dashboard
async function loadGuruDashboard() {
    setActiveMenu('Dashboard');
    renderView(await getGuruDashboardHTML());
    
    document.getElementById('guruDashboardDate').textContent = formatDate(new Date());
    
    const myClass = currentUser?.role === 'guru' ? currentUser.kelas : null;
    const result = await callAPI('getMonitoringRealtime', { kelas: myClass });
    
    if (result.success) {
        const data = result.data;
        const totalSiswa = data.length;
        const sakit = data.filter(d => d.status === 'Sakit').length;
        const izin = data.filter(d => d.status === 'Izin').length;
        const alpa = data.filter(d => d.status === 'Alpa').length;
        const hadir = data.filter(d => d.status === 'Hadir').length;

        animateValue("statGuruTotal", 0, totalSiswa, 1000);
        animateValue("statGuruSakit", 0, sakit, 1000);
        animateValue("statGuruIzin", 0, izin, 1000);
        animateValue("statGuruAlpa", 0, alpa, 1000);
        renderGuruChart(hadir, sakit, izin, alpa);
    }
}

// Get Guru Dashboard HTML
async function getGuruDashboardHTML() {
    return `
        <div class="view-section active animate-fade-in" id="view-guru-dashboard">
            <div class="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8 gap-4">
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-gray-800">Dashboard Guru</h2>
                    <p class="text-xs md:text-sm text-gray-500 mt-1">Ringkasan aktivitas siswa hari ini.</p>
                </div>
                <div class="flex items-center gap-2 md:gap-3">
                    <span class="text-[10px] md:text-xs font-bold bg-indigo-50 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg border border-indigo-100">
                        <i class="far fa-calendar-alt mr-1 md:mr-2"></i> <span id="guruDashboardDate">...</span>
                    </span>
                    <button onclick="refreshData('dashboard')" class="flex items-center space-x-1 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                        <i class="fas fa-sync-alt"></i> <span class="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                ${createGuruStatCard('Total Siswa', 'statGuruTotal', 'fa-user-graduate', 'indigo')}
                ${createGuruStatCard('Sakit', 'statGuruSakit', 'fa-procedures', 'yellow')}
                ${createGuruStatCard('Izin', 'statGuruIzin', 'fa-envelope-open-text', 'blue')}
                ${createGuruStatCard('Alpa', 'statGuruAlpa', 'fa-times-circle', 'red')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-700 mb-4"><i class="fas fa-chart-bar text-indigo-500 mr-2"></i> Statistik Kehadiran Hari Ini</h3>
                    <div class="relative w-full h-[250px] md:h-[300px]"><canvas id="guruAttendanceChart"></canvas></div>
                </div>
                <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl text-center">
                    <div class="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl md:text-2xl mb-3 md:mb-4 mx-auto border border-white/20">
                        <i class="fas fa-qrcode"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-bold mb-2">Mulai Absensi</h3>
                    <p class="text-indigo-100 text-[10px] md:text-xs mb-4 md:mb-6">Buka pemindai kamera untuk absensi siswa</p>
                    <button onclick="loadScanAbsensi()" class="bg-white text-indigo-700 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-lg w-full">
                        Buka Scanner
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper: Create Guru Stat Card
function createGuruStatCard(title, id, icon, color) {
    const colors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600'
    };
    return `
        <div class="bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-${color}-100">
            <div class="w-8 h-8 md:w-12 md:h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <i class="fas ${icon} text-sm md:text-xl"></i>
            </div>
            <p class="text-[8px] md:text-xs font-bold text-gray-400 uppercase">${title}</p>
            <h3 id="${id}" class="text-xl md:text-3xl font-bold text-gray-800">-</h3>
        </div>
    `;
}

// Render Guru Chart
function renderGuruChart(hadir, sakit, izin, alpa) {
    const ctx = document.getElementById('guruAttendanceChart');
    if (!ctx) return;
    if (guruChartInstance) guruChartInstance.destroy();

    guruChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hadir', 'Sakit', 'Izin', 'Alpa'],
            datasets: [{
                label: 'Jumlah Siswa',
                data: [hadir, sakit, izin, alpa],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [2, 4] }, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }
        }
    });
}

// Load Siswa Dashboard
async function loadSiswaDashboard() {
    setActiveMenu('Dashboard');
    renderView(await getSiswaDashboardHTML());
    
    try {
        if (currentUser) {
            const firstName = currentUser.nama ? currentUser.nama.split(' ')[0] : 'Siswa';
            document.getElementById('dashGreeting').textContent = firstName;
            document.getElementById('profileNameSidebar').textContent = currentUser.nama;
            document.getElementById('profileNisnSidebar').textContent = currentUser.nisn;
            document.getElementById('profileKelasSidebar').textContent = currentUser.kelas || '-';
        }
        document.getElementById('dashDate').textContent = formatDate(new Date());
    } catch (e) {}

    const result = await callAPI('getAbsensiToday', { nisn: currentUser?.nisn });
    
    const absensi = result.success ? result.data : null;
    const isLibur = result.isLibur;
    const infoLibur = result.keteranganLibur;

    const elHero = document.getElementById('heroCard');
    const elBadge = document.getElementById('dashStatusBadge');
    const elValMasuk = document.getElementById('valMasuk');
    const elValPulang = document.getElementById('valPulang');
    const elAlert = document.getElementById('alertBelumAbsen');

    if (isLibur) {
        if (elHero) elHero.className = "relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-red-800 p-6 text-white shadow-xl transition-all";
        if (elBadge) {
            elBadge.className = "px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold";
            elBadge.innerHTML = `<i class="fas fa-calendar-times mr-2"></i> HARI LIBUR - ${infoLibur}`;
        }
        if (elValMasuk && elValMasuk.parentElement) {
            elValMasuk.parentElement.innerHTML = `<div class="text-center py-2"><i class="fas fa-mug-hot text-3xl mb-2 opacity-80"></i><p class="text-sm font-bold">${infoLibur}</p><p class="text-[10px] mt-1 opacity-75">Tidak ada absensi hari ini</p></div>`;
            if(elValPulang && elValPulang.parentElement) elValPulang.parentElement.style.display = 'none';
        }
        if (elAlert) elAlert.classList.add('hidden');
        return;
    }

    if (!absensi) {
        if (elHero) elHero.className = "relative overflow-hidden rounded-3xl bg-slate-800 p-6 text-white shadow-xl transition-all";
        if (elBadge) {
            elBadge.className = "px-4 py-2 rounded-xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-200 text-xs font-bold animate-pulse";
            elBadge.innerHTML = `<i class="fas fa-circle text-[8px] mr-2"></i> BELUM ABSEN`;
        }
        if (elValMasuk) elValMasuk.textContent = "--:--";
        if (elValPulang) elValPulang.textContent = "--:--";
        if (elAlert) elAlert.classList.remove('hidden');
    } else {
        if (elAlert) elAlert.classList.add('hidden');
        if (elValMasuk) elValMasuk.textContent = absensi.jamDatang || "--:--";
        
        if (!absensi.jamPulang) {
            if (elHero) elHero.className = "relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-xl transition-all";
            if (elBadge) {
                elBadge.className = "px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold";
                elBadge.innerHTML = `<i class="fas fa-clock animate-pulse mr-2"></i> SEDANG BERLANGSUNG`;
            }
            if (elValPulang) elValPulang.textContent = "--:--";
        } else {
            if (elHero) elHero.className = "relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-800 p-6 text-white shadow-xl transition-all";
            if (elBadge) {
                elBadge.className = "px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold";
                elBadge.innerHTML = `<i class="fas fa-check-circle mr-2"></i> SELESAI HARI INI`;
            }
            if (elValPulang) elValPulang.textContent = absensi.jamPulang;
        }
    }
}

// Get Siswa Dashboard HTML
async function getSiswaDashboardHTML() {
    return `
        <div class="view-section active animate-fade-in" id="view-siswa-dashboard">
            <div class="flex justify-end mb-4">
                <button onclick="refreshData('dashboard')" class="flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg">
                    <i class="fas fa-sync-alt"></i> <span class="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                <div class="lg:col-span-2 space-y-4 md:space-y-6">
                    <div id="heroCard" class="relative overflow-hidden rounded-3xl bg-slate-800 p-4 md:p-6 text-white shadow-xl transition-all">
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4 md:mb-6">
                                <div>
                                    <p id="dashDate" class="text-slate-300 text-[8px] md:text-[10px] font-bold tracking-widest uppercase mb-1">...</p>
                                    <h2 class="text-xl md:text-3xl font-bold tracking-tight mb-1">Hai, <span id="dashGreeting">Siswa</span></h2>
                                    <p class="text-slate-400 text-[10px] md:text-xs">Semoga harimu menyenangkan!</p>
                                </div>
                                <div id="dashStatusBadge" class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] md:text-xs font-bold">Memuat...</div>
                            </div>
                            <div class="grid grid-cols-2 gap-3 md:gap-4">
                                <div class="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                                    <div class="flex items-center gap-2 mb-1 md:mb-2 text-slate-300">
                                        <i class="fas fa-sign-in-alt text-[10px] md:text-xs"></i>
                                        <span class="text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Jam Datang</span>
                                    </div>
                                    <div id="valMasuk" class="font-mono text-lg md:text-2xl font-bold tracking-tight">--:--</div>
                                </div>
                                <div class="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                                    <div class="flex items-center gap-2 mb-1 md:mb-2 text-slate-300">
                                        <i class="fas fa-sign-out-alt text-[10px] md:text-xs"></i>
                                        <span class="text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Jam Pulang</span>
                                    </div>
                                    <div id="valPulang" class="font-mono text-lg md:text-2xl font-bold tracking-tight">--:--</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="alertBelumAbsen" class="hidden bg-rose-50 border border-rose-100 rounded-xl p-3 md:p-4 flex gap-3 items-start shadow-sm">
                        <div class="bg-white p-1.5 md:p-2 rounded-full text-rose-500 shadow-sm"><i class="fas fa-exclamation"></i></div>
                        <div>
                            <h4 class="text-xs md:text-sm font-bold text-rose-800">Peringatan Absensi</h4>
                            <p class="text-[10px] md:text-xs font-medium text-rose-600/80">Anda belum melakukan scan absensi datang hari ini.</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4 md:space-y-6">
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-12 md:h-16 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div class="relative z-10 -mt-2">
                            <div class="w-16 h-16 md:w-20 md:h-20 bg-white p-1 rounded-full mx-auto shadow-md">
                                <div class="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-2xl md:text-3xl text-slate-300">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                            <h3 id="profileNameSidebar" class="font-bold text-slate-800 text-sm md:text-lg mt-2 md:mt-3 truncate">Nama Siswa</h3>
                            <p id="profileNisnSidebar" class="text-[10px] md:text-xs font-mono text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded mt-1">1234567890</p>
                            
                            <div class="grid grid-cols-2 gap-2 mt-3 md:mt-4 text-left">
                                <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <p class="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold">Kelas</p>
                                    <p id="profileKelasSidebar" class="text-xs md:text-sm font-bold text-slate-700">-</p>
                                </div>
                                <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <p class="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold">Status</p>
                                    <p class="text-xs md:text-sm font-bold text-emerald-600">Aktif</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onclick="loadQRCodeSiswa()" class="w-full group relative overflow-hidden rounded-2xl bg-slate-900 p-1 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]">
                        <div class="relative bg-slate-900 rounded-[0.9rem] px-4 md:px-5 py-3 md:py-4 flex items-center justify-between">
                            <div class="text-left">
                                <h3 class="text-white font-bold text-xs md:text-sm">Kartu Digital</h3>
                                <p class="text-slate-400 text-[8px] md:text-[10px]">Tampilkan QR Code</p>
                            </div>
                            <div class="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center text-white text-base md:text-lg">
                                <i class="fas fa-qrcode"></i>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Set Active Menu
function setActiveMenu(targetName) {
    const allLinks = document.querySelectorAll('#sidebarMenu a');
    const isSidebarOpen = window.isSidebarOpen !== false;
    const centerClass = !isSidebarOpen ? 'justify-center px-0' : 'space-x-3 px-4';
    const baseStyle = `flex items-center ${centerClass} py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap cursor-pointer `;
    const activeStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50";
    const inactiveStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

    allLinks.forEach(link => {
        const menuName = link.getAttribute('data-name');
        if (menuName === targetName) {
            link.className = baseStyle + activeStyle;
        } else {
            link.className = baseStyle + inactiveStyle;
        }
    });
}

// Refresh Data
function refreshData(type) {
    const btnIcon = event?.currentTarget?.querySelector('i');
    if(btnIcon) btnIcon.classList.add('fa-spin');

    if (type === 'siswa') {
        tableState.siswa.fullData = [];
        loadDataSiswa();       
        showAlert('success', 'Data siswa diperbarui.');
    } 
    else if (type === 'guru') {
        tableState.guru.fullData = [];
        loadDataGuru();        
        showAlert('success', 'Data guru diperbarui.');
    }
    else if (type === 'dashboard') {
        if (currentUser?.role === 'admin') loadAdminDashboard();
        else if (currentUser?.role === 'guru') loadGuruDashboard();
        else loadSiswaDashboard();
        showAlert('success', 'Statistik Dashboard diperbarui.');
    }
    else if (type === 'monitoring') {
        tableState.monitoring.fullData = []; 
        loadMonitoringAbsensi(); 
        showAlert('success', 'Data monitoring diperbarui.');
    }

    if(btnIcon) setTimeout(() => btnIcon.classList.remove('fa-spin'), 1000);
}

// Export to window
window.initDashboard = initDashboard;
window.loadAdminDashboard = loadAdminDashboard;
window.loadGuruDashboard = loadGuruDashboard;
window.loadSiswaDashboard = loadSiswaDashboard;
window.refreshData = refreshData;
window.setActiveMenu = setActiveMenu;
window.renderView = renderView;
window.existingClasses = existingClasses;