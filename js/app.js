// ==============================================================
// MAIN APPLICATION INITIALIZATION
// ==============================================================

// Global variable for sidebar state
let isSidebarOpen = true;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Set current date
  const dateElement = document.getElementById('currentDateDisplay');
  if (dateElement) {
    dateElement.textContent = formatDate(new Date());
  }
  
  // Check session
  checkSession();
  
  // Handle window resize for sidebar
  window.addEventListener('resize', handleWindowResize);
});

// Handle Window Resize
function handleWindowResize() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');
  
  if (window.innerWidth >= 768) {
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  }
}

// Show View (for backward compatibility)
function showView(viewId) {
  // This is handled by renderView in dashboard.js
  console.log('Show view:', viewId);
}

// Export to window
window.isSidebarOpen = isSidebarOpen;
window.showView = showView;