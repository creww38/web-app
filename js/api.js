// ==============================================================
// API COMMUNICATION
// ==============================================================

// Mock Data for Demo Mode
const MOCK_DATA = {
  // Demo Siswa
  siswaList: [
    { nisn: '1234567890', nama: 'Ahmad Fauzi', kelas: 'XII IPA 1', jenisKelamin: 'Laki-laki', tanggalLahir: '2005-01-15', agama: 'Islam', namaAyah: 'Budi Santoso', namaIbu: 'Siti Aminah', noHp: '081234567890', alamat: 'Jl. Merdeka No.1' },
    { nisn: '1234567891', nama: 'Budi Santoso', kelas: 'XII IPA 1', jenisKelamin: 'Laki-laki', tanggalLahir: '2005-03-20', agama: 'Islam', namaAyah: 'Ahmad Fauzi', namaIbu: 'Dewi Kartika', noHp: '081234567891', alamat: 'Jl. Sudirman No.5' },
    { nisn: '1234567892', nama: 'Citra Dewi', kelas: 'XII IPA 2', jenisKelamin: 'Perempuan', tanggalLahir: '2005-05-10', agama: 'Islam', namaAyah: 'Hendra Gunawan', namaIbu: 'Rini Andriani', noHp: '081234567892', alamat: 'Jl. Diponegoro No.10' }
  ],
  
  // Demo Guru
  guruList: [
    { username: 'ahmad_guru', kelas: 'XII IPA 1', password: '******' },
    { username: 'siti_guru', kelas: 'XI IPA 1', password: '******' },
    { username: 'budi_guru', kelas: 'X IPA 1', password: '******' }
  ],
  
  // Demo Monitoring
  monitoringData: () => {
    const today = getTodayDate();
    return [
      { nisn: '1234567890', nama: 'Ahmad Fauzi', kelas: 'XII IPA 1', jamDatang: '07:25', jamPulang: '-', keterangan: 'Tepat Waktu', status: 'Hadir' },
      { nisn: '1234567891', nama: 'Budi Santoso', kelas: 'XII IPA 1', jamDatang: '07:45', jamPulang: '-', keterangan: 'Terlambat (15 m)', status: 'Hadir' },
      { nisn: '1234567892', nama: 'Citra Dewi', kelas: 'XII IPA 2', jamDatang: '-', jamPulang: '-', keterangan: '-', status: 'Belum Absen' }
    ];
  },
  
  // Demo Hari Libur
  liburList: [
    { tanggal: '2026-01-01', keterangan: 'Tahun Baru Masehi' },
    { tanggal: '2026-01-28', keterangan: 'Isra Miraj' }
  ],
  
  // Demo Absensi
  absensiList: () => {
    const today = getTodayDate();
    return [
      { tanggal: today, nisn: '1234567890', nama: 'Ahmad Fauzi', kelas: 'XII IPA 1', jamDatang: '07:25', jamPulang: '15:30', keterangan: 'Tepat Waktu', status: 'Hadir' },
      { tanggal: today, nisn: '1234567891', nama: 'Budi Santoso', kelas: 'XII IPA 1', jamDatang: '07:45', jamPulang: '15:30', keterangan: 'Terlambat', status: 'Hadir' }
    ];
  }
};

// Main API Call Function
async function callAPI(action, data = {}) {
  if (CONFIG.DEMO_MODE) {
    return mockAPIResponse(action, data);
  }
  
  try {
    const response = await fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        data,
        token: window.currentUser?.token
      })
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Gagal terhubung ke server' };
  }
}

// Mock API Response for Demo
function mockAPIResponse(action, data) {
  const today = getTodayDate();
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  switch (action) {
    case 'login':
      if (data.username === 'admin' && data.password === 'admin') {
        return { success: true, user: { role: 'admin', nama: 'Administrator', username: 'admin', token: 'demo_token_admin' } };
      }
      if (data.username === 'guru' && data.password === 'guru') {
        return { success: true, user: { role: 'guru', nama: 'Bapak Ahmad', username: 'guru', kelas: 'XII IPA 1', token: 'demo_token_guru' } };
      }
      if (data.nisn) {
        const siswa = MOCK_DATA.siswaList.find(s => s.nisn === data.nisn);
        if (siswa) {
          return { success: true, user: { role: 'siswa', ...siswa, token: 'demo_token_siswa' } };
        }
        return { success: false, message: 'NISN tidak ditemukan' };
      }
      return { success: false, message: 'Username/password salah' };
      
    case 'getMonitoringRealtime':
      let data_monitoring = MOCK_DATA.monitoringData();
      if (data.kelas) {
        data_monitoring = data_monitoring.filter(m => m.kelas === data.kelas);
      }
      return { success: true, data: data_monitoring };
      
    case 'getSiswaList':
      return { success: true, data: MOCK_DATA.siswaList };
      
    case 'getGuruList':
      return { success: true, data: MOCK_DATA.guruList };
      
    case 'getHariLibur':
      return { success: true, data: MOCK_DATA.liburList };
      
    case 'getAbsensiList':
      let absensi = MOCK_DATA.absensiList();
      if (data.kelas) {
        absensi = absensi.filter(a => a.kelas === data.kelas);
      }
      if (data.tanggalMulai && data.tanggalAkhir) {
        absensi = absensi.filter(a => a.tanggal >= data.tanggalMulai && a.tanggal <= data.tanggalAkhir);
      }
      return { success: true, data: absensi };
      
    case 'getAbsensiToday':
      const absen = MOCK_DATA.absensiList().find(a => a.nisn === data.nisn && a.tanggal === today);
      return { success: true, data: absen || null, isLibur: false };
      
    case 'processAbsen':
      const siswa = MOCK_DATA.siswaList.find(s => s.nisn === data.nisn);
      if (!siswa) {
        return { success: false, message: 'NISN tidak terdaftar' };
      }
      return {
        success: true,
          message: 'Absen berhasil dicatat',
          type: 'datang',
          jamDatang: now,
          nama: siswa.nama,
          kelas: siswa.kelas
      };
      
    case 'addSiswa':
    case 'updateSiswa':
    case 'deleteSiswa':
    case 'addGuru':
    case 'updateGuru':
    case 'deleteGuru':
    case 'addHariLibur':
    case 'updateHariLibur':
    case 'deleteHariLibur':
    case 'updateAbsensiStatus':
    case 'saveAppConfig':
      return { success: true, message: 'Operasi berhasil' };
      
    case 'getAppConfig':
      return { success: true, data: CONFIG.DEFAULT_SETTINGS };
      
    case 'generateExcel':
      return { success: true, url: '#', message: 'File Excel berhasil dibuat' };
      
    default:
      return { success: true, data: [] };
  }
}

// Export to window
window.callAPI = callAPI;