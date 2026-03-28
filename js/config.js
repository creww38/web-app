// ==============================================================
// KONFIGURASI APLIKASI
// ==============================================================

const CONFIG = {
  // API URL - GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyZmnDpNxh2z1W1pVaKLaXEvWMv8Z7-kqRVZGIzfkHtHdb7cX4dS7NxWPFv0RwyIHP0yg/exec',
  
  // Mode Demo (true = menggunakan data mock, false = menggunakan API real)
  DEMO_MODE: false,
  
  // Default Settings
  DEFAULT_SETTINGS: {
    jam_masuk_mulai: '06:30',
    jam_masuk_akhir: '07:30',
    jam_pulang_mulai: '14:30',
    jam_pulang_akhir: '15:30',
    nama_sekolah: 'MA Plus Keterampilan Tarbiyatusshibyan',
    kepala_sekolah: 'Dr. H. Ahmad Fauzi, M.Pd',
    nip_kepala: '196512311995121001',
    tempat_ttd: 'Bengkulu'
  },
  
  // Default Kelas
  DEFAULT_CLASSES: ['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2', 'XII IPA 1', 'XII IPA 2'],
  
  // Status Kehadiran
  STATUS_OPTIONS: ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Belum Absen'],
  
  // Colors for Status
  STATUS_COLORS: {
    'Hadir': 'bg-green-100 text-green-700',
    'Sakit': 'bg-yellow-100 text-yellow-700',
    'Izin': 'bg-blue-100 text-blue-700',
    'Alpa': 'bg-red-100 text-red-700',
    'Belum Absen': 'bg-gray-100 text-gray-600'
  },
  
  // Keterangan Warna
  KETERANGAN_STYLES: {
    'Terlambat': 'text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-100 text-[10px]',
    'Pulang Cepat': 'text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded border border-orange-100 text-[10px]',
    'Tepat Waktu': 'text-emerald-600 font-bold text-[10px]'
  }
};

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}