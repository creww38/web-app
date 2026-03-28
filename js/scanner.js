// ==============================================================
// QR CODE SCANNER MODULE
// ==============================================================

let html5QrCode = null;
let isScanning = false;

// Load Scan Absensi
function loadScanAbsensi() {
  setActiveMenu('Scan Absensi');
  
  const html = `
        <div class="view-section active animate-fade-in" id="view-scanner">
            <div class="max-w-xs mx-auto">
                <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div class="p-4 bg-gray-900 text-white text-center">
                        <h3 class="font-bold text-lg tracking-wide">Scanner QR Code</h3>
                    </div>
                    <div class="p-4">
                        <div class="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 shadow-inner">
                            <div id="reader" class="w-full h-full object-cover"></div>
                            <div id="camLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                                <i class="fas fa-circle-notch fa-spin text-2xl mb-2 text-indigo-500"></i>
                                <p class="text-xs font-medium text-white">Memuat...</p>
                            </div>
                        </div>
                        <div id="scanResult" class="hidden mb-4 text-center text-xs font-bold animate-fade-in"></div>
                        <div class="flex gap-2 mb-2">
                            <button onclick="startCamera('environment')" class="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-bold text-xs hover:bg-blue-100">Belakang</button>
                            <button onclick="startCamera('user')" class="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg font-bold text-xs hover:bg-purple-100">Depan</button>
                        </div>
                        <button onclick="stopAndBack(true)" class="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-xs hover:bg-gray-200">Kembali</button>
                    </div>
                </div>
            </div>
        </div>
    `;
  
  renderView(html);
  isScanning = false;
  setTimeout(() => { startCamera('environment'); }, 500);
}

// Start Camera
function startCamera(mode) {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      initCamera(mode);
    }).catch(err => initCamera(mode));
  } else {
    initCamera(mode);
  }
}

// Initialize Camera
function initCamera(mode) {
  const loading = document.getElementById('camLoading');
  if (loading) loading.classList.remove('hidden');
  
  html5QrCode = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
  
  html5QrCode.start({ facingMode: mode }, config,
    (decodedText) => onScanSuccess(decodedText),
    (errorMessage) => { /* ignore */ }
  ).then(() => {
    if (loading) loading.classList.add('hidden');
    isScanning = false;
  }).catch((err) => {
    if (loading) loading.classList.add('hidden');
    const resDiv = document.getElementById('scanResult');
    if (resDiv) {
      resDiv.classList.remove('hidden');
      resDiv.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-sm">Gagal Mengakses Kamera: ${err}</div>`;
    }
  });
}

// On Scan Success
async function onScanSuccess(decodedText) {
  if (!decodedText || decodedText.trim() === "" || isScanning) return;
  isScanning = true;
  
  const resultDiv = document.getElementById('scanResult');
  if (!resultDiv) return;
  
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = `
        <div class="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 flex items-center justify-center animate-pulse font-bold shadow-sm">
            <i class="fas fa-circle-notch fa-spin mr-3"></i> Memproses Data...
        </div>`;
  
  const result = await callAPI('processAbsen', { nisn: decodedText });
  
  if (result.success) {
    const color = result.type === 'datang' ? 'green' : 'blue';
    resultDiv.innerHTML = `
            <div class="bg-${color}-50 text-${color}-900 p-6 rounded-2xl border border-${color}-100 shadow-md animate-fade-in relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10"><i class="fas fa-check-circle text-6xl"></i></div>
                <h3 class="font-bold text-xl uppercase mb-1 tracking-tight">${result.nama}</h3>
                <p class="text-sm font-semibold opacity-70 mb-4">${result.kelas}</p>
                <div class="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-${color}-200 inline-block">
                    <div class="text-xs uppercase tracking-widest font-bold opacity-60 mb-1">${result.message}</div>
                    <div class="text-3xl font-mono font-bold">${result.type === 'datang' ? result.jamDatang : result.jamPulang}</div>
                </div>
                <p class="text-xs mt-4 font-bold uppercase tracking-wide opacity-50 animate-pulse">Siap untuk siswa berikutnya...</p>
            </div>`;
    setTimeout(() => { isScanning = false; }, 3000);
  } else {
    resultDiv.innerHTML = `
            <div class="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-100 shadow-sm flex items-center space-x-4">
                <div class="bg-red-100 p-3 rounded-full"><i class="fas fa-times text-xl"></i></div>
                <div class="text-left">
                    <h4 class="font-bold">Gagal!</h4>
                    <p class="text-sm opacity-90">${result.message}</p>
                </div>
            </div>`;
    setTimeout(() => { isScanning = false; }, 4000);
  }
}

// Stop Scanner and Back
function stopAndBack(redirect = true) {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
      isScanning = false;
      if (redirect && currentUser) returnToDashboard();
    }).catch(() => {
      html5QrCode = null;
      if (redirect && currentUser) returnToDashboard();
    });
  } else {
    if (redirect && currentUser) returnToDashboard();
  }
}

// Return to Dashboard
function returnToDashboard() {
  if (currentUser?.role === 'admin') loadAdminDashboard();
  else if (currentUser?.role === 'guru') loadGuruDashboard();
  else loadSiswaDashboard();
}

// Stop Scanner (alias)
function stopScanner() {
  stopAndBack(false);
}

// Export to window
window.loadScanAbsensi = loadScanAbsensi;
window.startCamera = startCamera;
window.stopAndBack = stopAndBack;
window.stopScanner = stopScanner;