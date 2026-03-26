// LOGIC: SWITCH VIEW
function switchView(viewId) {
    views.forEach(v => v.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
}

// LOGIC: INIT DASHBOARD
function initDashboardView() {
    document.getElementById('user-greeting').textContent = `Hola, ${currentUser.name}`;
    
    const sidebar = document.getElementById('sidebar-links');
    if (currentUser.role === 'client') {
        sidebar.innerHTML = `
            <li><a href="#" class="nav-item active" onclick="switchClientView('client-make-order', this)"><i class="ph ph-plus-circle"></i> <span>Hacer un pedido</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchClientView('client-monitor-order', this)"><i class="ph ph-eye"></i> <span>Monitorear pedido</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchClientView('client-incidents', this)"><i class="ph ph-warning"></i> <span>Incidencias</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchClientView('client-order-history', this)"><i class="ph ph-clock-counter-clockwise"></i> <span>Historial de pedidos</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchClientView('client-support', this)"><i class="ph ph-lifebuoy"></i> <span>Soporte</span></a></li>
        `;
        document.getElementById('current-page-title').textContent = `Hacer un pedido`;
        switchDashboardRole('client-dashboard');
        renderClientView();
        switchClientView('client-make-order', sidebar.querySelector('a'));
    } 
    else if (currentUser.role === 'driver') {
        sidebar.innerHTML = `
            <li><a href="#" class="nav-item active" onclick="switchDriverView('driver-route', this)"><i class="ph-fill ph-map-trifold"></i> <span>Ruta de Trabajo</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchDriverView('driver-scanner', this)"><i class="ph-fill ph-qr-code"></i> <span>Escanear Bolsa</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchDriverView('driver-history', this)"><i class="ph-fill ph-check-square-offset"></i> <span>Historial de Entregas</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchDriverView('driver-incident', this)"><i class="ph-fill ph-warning"></i> <span>Reportar Problema</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchDriverView('driver-profile', this)"><i class="ph-fill ph-user"></i> <span>Mi Vehículo</span></a></li>
        `;
        document.getElementById('current-page-title').textContent = `Ruta de Trabajo`;
        switchDashboardRole('driver-dashboard');
        renderDriverView();
        switchDriverView('driver-route', sidebar.querySelector('a'));
    }
    else {
        sidebar.innerHTML = `
            <li><a href="#" class="nav-item active" onclick="switchAdminView('admin-overview', this)"><i class="ph-fill ph-chart-line-up"></i> <span>Overview Global</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchAdminView('admin-hotels', this)"><i class="ph-fill ph-buildings"></i> <span>Base Hoteles</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchAdminView('admin-shipments', this)"><i class="ph-fill ph-truck"></i> <span>Operaciones</span></a></li>
            <li><a href="#" class="nav-item" onclick="switchAdminView('admin-tickets', this)"><i class="ph-fill ph-ticket"></i> <span>Tickets</span></a></li>
        `;
        document.getElementById('current-page-title').textContent = `Overview Global`;
        switchDashboardRole('admin-dashboard');
        renderAdminView();
        switchAdminView('admin-overview', sidebar.querySelector('a'));
    }
}

function switchDashboardRole(id) {
    document.querySelectorAll('.role-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

window.switchClientView = function(viewId, element) {
    document.querySelectorAll('#client-dashboard .sub-view').forEach(v => v.classList.remove('active'));
    let target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    if (element) {
        document.querySelectorAll('#sidebar-links a').forEach(a => a.classList.remove('active'));
        element.classList.add('active');
        
        const titleMap = {
            'client-make-order': 'Hacer un pedido',
            'client-monitor-order': 'Monitorear pedido',
            'client-incidents': 'Incidencias',
            'client-order-history': 'Historial de pedidos',
            'client-support': 'Soporte'
        };
        document.getElementById('current-page-title').textContent = titleMap[viewId] || `Portal del Hotel`;
    }
}

window.switchDriverView = function(viewId, element) {
    document.querySelectorAll('#driver-dashboard .sub-view').forEach(v => v.classList.remove('active'));
    let target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    // Leaflet map fix when showing the map container
    if (viewId === 'driver-route' && typeof driverMap !== 'undefined' && driverMap) {
        setTimeout(() => driverMap.invalidateSize(), 300);
    }
    
    if (viewId === 'driver-scanner') {
        setTimeout(() => { if (typeof iniciarEscaner === 'function') iniciarEscaner(); }, 300);
    } else {
        if (typeof html5QrcodeScanner !== 'undefined' && html5QrcodeScanner) {
            try { html5QrcodeScanner.pause(); } catch(e) {}
        }
    }

    if (element) {
        document.querySelectorAll('#sidebar-links a').forEach(a => a.classList.remove('active'));
        element.classList.add('active');
        
        const titleMap = {
            'driver-route': 'Ruta de Trabajo',
            'driver-scanner': 'Escanear Bolsa',
            'driver-history': 'Historial de Entregas',
            'driver-incident': 'Reporte de Rutas',
            'driver-profile': 'Mi Vehículo / Perfil'
        };
        document.getElementById('current-page-title').textContent = titleMap[viewId] || `Portal Logístico`;
    }
}

window.switchAdminView = function(viewId, element) {
    document.querySelectorAll('#admin-dashboard .sub-view').forEach(v => v.classList.remove('active'));
    let target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    // Leaflet map fix
    if (viewId === 'admin-overview' && typeof adminMap !== 'undefined' && adminMap) {
        setTimeout(() => adminMap.invalidateSize(), 300);
    }
    
    if (element) {
        document.querySelectorAll('#sidebar-links a').forEach(a => a.classList.remove('active'));
        element.classList.add('active');
        
        const titleMap = {
            'admin-overview': 'Overview Global',
            'admin-hotels': 'Directorio de Clientes',
            'admin-shipments': 'Gestión de Operaciones',
            'admin-tickets': 'Centro de Resoluciones'
        };
        document.getElementById('current-page-title').textContent = titleMap[viewId] || `Administración`;
    }
}

// CLIENT ROLE (HOTEL) LOGIC
