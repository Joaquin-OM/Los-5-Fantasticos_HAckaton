// DOM Elements
const views = document.querySelectorAll('.view');
const btnLogout = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');

// INIT
document.addEventListener('DOMContentLoaded', () => {
    const logged = localStorage.getItem('polarier_user');
    if (logged) {
        currentUser = JSON.parse(logged);
        switchView('dashboard-container');
        initDashboardView();
    }
    initSignaturePad(); // Inicializar el canvas de firma
});

// LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.getElementById('role-select').value;
    
    // Asignar datos mock basados en rol
    if(role === 'client') currentUser = { role: 'client', name: 'Recepción Ritz', hotel: 'Hotel Ritz' };
    else if(role === 'driver') currentUser = { role: 'driver', name: 'Carlos R.', hotel: null };
    else currentUser = { role: 'admin', name: 'Admin Polarier', hotel: null };
    
    localStorage.setItem('polarier_user', JSON.stringify(currentUser));
    showToast(`Bienvenido de nuevo, ${currentUser.name}`);
    switchView('dashboard-container');
    initDashboardView();
});

// LOGOUT
const performLogout = () => {
    localStorage.removeItem('polarier_user');
    currentUser = null;
    showToast('Sesión cerrada');
    switchView('login-section');
};

if (btnLogout) btnLogout.addEventListener('click', performLogout);

const btnLogoutHeader = document.getElementById('logout-btn-header');
if (btnLogoutHeader) btnLogoutHeader.addEventListener('click', performLogout);

