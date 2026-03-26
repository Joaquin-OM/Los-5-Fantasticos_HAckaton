// Base simulada estática
const defaultState = {
    shipments: [
        { id: '#ENV-401', hotel: 'Hotel Ritz', driver: 'Carlos R.', status: 'preparado', time: '14:00 - 16:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-402', hotel: 'Hotel Hilton', driver: 'Ana G.', status: 'entregado', time: '08:00 - 10:00', dirtyCarts: 4, type: 'Solo Entrega', signature: null },
        { id: '#ENV-403', hotel: 'Four Seasons', driver: 'Carlos R.', status: 'en_camino', time: '16:00 - 18:00', dirtyCarts: null, type: 'Recogida Ropa Sucia', signature: null },
        { id: '#ENV-404', hotel: 'Marriott', driver: 'Ana G.', status: 'preparado', time: 'Mañana', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-405', hotel: 'Meliá Palma', driver: 'Carlos R.', status: 'preparado', time: '09:00 - 11:00', dirtyCarts: null, type: 'Solo Entrega', signature: null },
        { id: '#ENV-406', hotel: 'Iberostar', driver: 'Carlos R.', status: 'en_camino', time: '11:00 - 13:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-407', hotel: 'Riu Palace', driver: 'Carlos R.', status: 'preparado', time: '12:00 - 14:00', dirtyCarts: null, type: 'Recogida Ropa Sucia', signature: null }
    ],
    tickets: [
        { id: '#TK-9021', ref: '#ENV-402', desc: 'Agregar 2 carros extras de toallas piscina', date: 'Hoy, 09:30', status: 'revision' }
    ],
    jaulas: {
        enviadas: [
            { id: 'JLA-912A', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: '10:15' },
            { id: 'JLA-913B', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: '10:16' },
            { id: 'JLA-880C', hotel: 'Meliá Palma', driver: 'Carlos R.', date: '09:20' }
        ],
        retiradas: [
            { id: 'JLA-742X', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: '10:20' },
            { id: 'JLA-743Y', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: '10:21' },
            { id: 'JLA-744Z', hotel: 'Meliá Palma', driver: 'Carlos R.', date: '09:30' }
        ]
    }
};

// Cargar estado persistivo
const loadState = () => {
    const savedData = localStorage.getItem('polarier_data');
    return savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(defaultState)); 
};

let appState = loadState();
if(!appState.jaulas || (appState.jaulas.enviadas.length === 0 && appState.jaulas.retiradas.length === 0)) { 
    appState.jaulas = JSON.parse(JSON.stringify(defaultState.jaulas)); 
    saveState();
}

const saveState = () => {
    localStorage.setItem('polarier_data', JSON.stringify(appState));
};

// Mapeos UI
const statusMap = {
    'pendiente': { label: 'Sin Asignar', class: 'ghost', icon: 'ph-clock' },
    'preparado': { label: 'Preparado', class: 'pending', icon: 'ph-package' },
    'en_camino': { label: 'En Ruta', class: 'in-progress', icon: 'ph-truck' },
    'entregado': { label: 'Completado', class: 'completed', icon: 'ph-check-circle' }
};

// Estado UI Local
let currentUser = null; 
let currentShipmentToCompleteId = null;

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
function renderClientView() {
    const myShipments = appState.shipments.filter(s => s.hotel === currentUser.hotel);
    const activeShipment = myShipments.find(s => s.status !== 'entregado') || myShipments[0]; 
    
    // 1. Monitorear pedido
    const pbContainer = document.getElementById('client-progress-bar');
    const detContainer = document.getElementById('client-shipment-details');
    
    if (activeShipment && activeShipment.status !== 'entregado') { 
        let pct = activeShipment.status === 'preparado' ? 0 : activeShipment.status === 'en_camino' ? 50 : 100;
        
        pbContainer.innerHTML = `
            <div class="status-line-bg"></div>
            <div class="status-line-fill" style="width: ${pct}%"></div>
            <div class="status-step ${pct >= 0 ? 'completed' : ''} ${pct === 0 ? 'active' : ''}">
                <div class="step-icon">1</div>
                <p>Preparado</p>
            </div>
            <div class="status-step ${pct >= 50 ? 'completed' : ''} ${pct === 50 ? 'active' : ''}">
                <div class="step-icon">2</div>
                <p>En Ruta</p>
            </div>
            <div class="status-step ${pct === 100 ? 'completed active' : ''}">
                <div class="step-icon">3</div>
                <p>Completado</p>
            </div>
        `;

        detContainer.innerHTML = `
            <div class="flex-between">
                <div>
                    <p class="text-sm text-muted">ID REFERENCIA</p>
                    <p class="fw-500">${activeShipment.id}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">TIPO OPERACIÓN</p>
                    <p class="fw-500">${activeShipment.type}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">VENTANA HORARIA</p>
                    <p class="fw-500">${activeShipment.time}</p>
                </div>
            </div>
        `;
    } else {
        pbContainer.innerHTML = '';
        detContainer.innerHTML = `<div class="empty-state"><p>No tienes pedidos en curso actualmente</p></div>`;
    }

    // 2. Historial de pedidos
    const historyBody = document.getElementById('client-history-body');
    if(historyBody) {
        if(myShipments.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Sin pedidos previos.</td></tr>`;
        } else {
            historyBody.innerHTML = myShipments.map(s => `
                <tr>
                    <td class="fw-500">${s.id}</td>
                    <td>${s.type}</td>
                    <td>${s.time}</td>
                    <td><span class="badge ${statusMap[s.status]?.class || 'ghost'}">${statusMap[s.status]?.label || s.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // 3. Incidencias y Soporte
    const myTickets = appState.tickets.filter(t => t.hotel === null || t.hotel === currentUser.hotel); 
    const supportTickets = myTickets.filter(t => t.isIncident !== true);
    const incidentTickets = myTickets.filter(t => t.isIncident === true);

    const supportBody = document.getElementById('client-tickets-body');
    if (supportBody) {
        if (supportTickets.length === 0) {
            supportBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay tickets de soporte.</td></tr>`;
        } else {
            supportBody.innerHTML = supportTickets.map(t => `
                <tr>
                    <td class="fw-500">${t.id}</td>
                    <td><span class="badge ghost">${t.ref}</span></td>
                    <td>${t.desc}</td>
                    <td>${t.date}</td>
                    <td><span class="badge ${t.status === 'revision' ? 'in-progress' : 'completed'}">${t.status === 'revision' ? 'Bajo Revisión' : 'Cerrado'}</span></td>
                </tr>
            `).join('');
        }
    }

    const incidentsBody = document.getElementById('client-incidents-body');
    if (incidentsBody) {
        if (incidentTickets.length === 0) {
            incidentsBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No has reportado incidencias.</td></tr>`;
        } else {
            incidentsBody.innerHTML = incidentTickets.map(t => `
                <tr>
                    <td class="fw-500">${t.id}</td>
                    <td><span class="badge ghost">${t.ref}</span></td>
                    <td>${t.desc}</td>
                    <td>${t.date}</td>
                    <td><span class="badge ${t.status === 'revision' ? 'in-progress' : 'completed'}">${t.status === 'revision' ? 'En Revisión' : 'Resuelto'}</span></td>
                </tr>
            `).join('');
        }
    }

    // Poblamos los selects
    const refEnvioSupport = document.getElementById('ticket-ref-envio');
    const refEnvioIncident = document.getElementById('incident-ref-envio');
    const optionsHTML = myShipments.map(s => `<option value="${s.id}">${s.id} - ${s.type} (${statusMap[s.status]?.label || s.status})</option>`).join('');
    if(refEnvioSupport) refEnvioSupport.innerHTML = optionsHTML;
    if(refEnvioIncident) refEnvioIncident.innerHTML = optionsHTML;
}

document.getElementById('new-shipment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('new-shipment-time').value;
    const type = document.getElementById('new-shipment-type').value;
    const newId = '#ENV-' + Math.floor(Math.random() * 900 + 500);
    appState.shipments.unshift({
        id: newId, hotel: currentUser.hotel, driver: 'Sin Asignar', status: 'pendiente', time: time, dirtyCarts: null, type: type, signature: null
    });
    saveState();
    showToast(`Pedido confirmado (${newId})`);
    renderClientView();
    e.target.reset();
    
    const monitorBtn = document.querySelector('#sidebar-links a[onclick*="client-monitor-order"]');
    if(monitorBtn) switchClientView('client-monitor-order', monitorBtn);
});

document.getElementById('btn-new-ticket')?.addEventListener('click', () => {
    document.getElementById('modal-ticket').classList.add('show');
});

document.getElementById('form-create-ticket')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ref = document.getElementById('ticket-ref-envio').value;
    const desc = document.getElementById('ticket-desc').value;
    const newId = '#TK-' + Math.floor(Math.random() * 9000 + 1000);
    
    appState.tickets.unshift({
        id: newId, ref: ref, hotel: currentUser.hotel, desc: desc, date: 'Justo Ahora', status: 'revision', isIncident: false
    });
    saveState();
    
    document.getElementById('modal-ticket').classList.remove('show');
    showToast('Ticket generado');
    renderClientView();
    e.target.reset();
});

document.getElementById('form-create-incident')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ref = document.getElementById('incident-ref-envio').value;
    const desc = document.getElementById('incident-desc').value;
    const newId = '#INC-' + Math.floor(Math.random() * 9000 + 1000);
    
    appState.tickets.unshift({
        id: newId, ref: ref, hotel: currentUser.hotel, desc: desc, date: 'Justo Ahora', status: 'revision', isIncident: true
    });
    saveState();
    
    document.getElementById('modal-incident').classList.remove('show');
    showToast('Incidencia reportada');
    renderClientView();
    e.target.reset();
});


// MAPA LEAFLET PARA CHOFER
let driverMap = null;
let camionesData = [];

// DRIVER ROLE LOGIC
async function renderDriverView() {
    // Cargar camiones
    if (camionesData.length === 0) {
        try {
            const res = await fetch('camiones.json');
            if(res.ok) {
                const data = await res.json();
                camionesData = data.vehiculos || [];
            }
        } catch(e) {
            console.warn("Fallo cargando camiones.json");
        }
    }
    // Inicializar o recargar mapa si estamos en la vista de conductor
    if (document.getElementById('mallorca-map')) {
        if (!driverMap) {
            driverMap = L.map('mallorca-map').setView([39.6953, 2.9920], 9);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(driverMap);

            // Marcador Central Polarier
            const polarierIcon = L.divIcon({ html: '<div style="font-size:24px; text-shadow:0 0 5px #fff;">🏢</div>', className: 'custom-div-icon', iconSize: [24,24], iconAnchor: [12,24] });
            const hubCoords = [39.5696, 2.6502]; // Palma
            L.marker(hubCoords, {icon: polarierIcon}).addTo(driverMap).bindPopup('<b>Polarier Central (Palma)</b>');

            const hotelesMap = {
                'Hotel Ritz': [39.5085, 2.5366],     // Magaluf
                'Hotel Hilton': [39.8525, 3.1189],   // Alcudia
                'Four Seasons': [39.7118, 3.4611],   // Cala Ratjada
                'Marriott': [39.5393, 2.7487]        // Arenal
            };

            const hotelIcon = L.divIcon({ html: '<div style="font-size:24px; text-shadow:0 0 5px #fff;">🏨</div>', className: 'custom-div-icon', iconSize: [24,24], iconAnchor: [12,24] });
            
            const myRoutes = appState.shipments.filter(s => s.driver === currentUser.name);
            const pendingRoutes = myRoutes.filter(s => s.status !== 'entregado');
            
            const routeCoords = [hubCoords];
            
            pendingRoutes.forEach(s => {
                const coords = hotelesMap[s.hotel] || [39.6953 + (Math.random()-0.5)*0.2, 2.9920 + (Math.random()-0.5)*0.2];
                L.marker(coords, {icon: hotelIcon}).addTo(driverMap).bindPopup(`<b>${s.hotel}</b><br>Envío: ${s.id}`);
                routeCoords.push(coords);
            });

            if (routeCoords.length > 1) {
                L.polyline(routeCoords, {color: '#f59e0b', weight: 4, dashArray: '5, 10'}).addTo(driverMap);
                driverMap.fitBounds(L.polyline(routeCoords).getBounds(), {padding: [30, 30]});
            }
        }
        setTimeout(() => driverMap.invalidateSize(), 300);
    }

    // 1. Ruta de Hoy
    const list = document.getElementById('driver-routes');
    const stats = document.getElementById('driver-stats');
    
    const myRoutes = appState.shipments.filter(s => s.driver === currentUser.name);
    const pendingRoutes = myRoutes.filter(s => s.status !== 'entregado');
    const doneRoutes = myRoutes.filter(s => s.status === 'entregado');

    if(stats) {
        stats.innerHTML = `
            <div class="stat-box">
                <span class="text-xs text-muted">PENDIENTES</span>
                <span class="stat-value text-main">${pendingRoutes.length}</span>
            </div>
            <div class="stat-box">
                <span class="text-xs text-muted">COMPLETADOS</span>
                <span class="stat-value text-success">${doneRoutes.length}</span>
            </div>
        `;
    }

    if(list) {
        if (pendingRoutes.length === 0) {
            list.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-4">No tienes entregas pendientes hoy</td></tr>`;
        } else {
            list.innerHTML = pendingRoutes.map(s => {
                let badge = '';
                if(s.status === 'preparado') badge = `<span class="badge pending">Preparado</span>`;
                else if(s.status === 'en_camino') badge = `<span class="badge in-progress">En Ruta</span>`;
                else if(s.status === 'pendiente') badge = `<span class="badge ghost">Sin Asignar</span>`;
                
                return `
                <tr>
                    <td style="padding: 1rem;">
                        <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                                <span class="fw-600 font-size:1.05rem; color:var(--text-main);">${s.hotel}</span> 
                                ${badge}
                            </div>
                            <span class="text-sm text-muted" style="display:flex; align-items:center; gap:0.4rem;">
                                <i class="ph-fill ph-tag"></i> <span class="text-primary fw-500">${s.id}</span>
                                <span style="opacity:0.3;">|</span>
                                <i class="ph-fill ph-clock"></i> ${s.time}
                            </span>
                        </div>
                    </td>
                    <td style="text-align: center; vertical-align: middle;">
                        <button class="btn btn-sm btn-primary" onclick="openCompleteShipment('${s.id}', '${s.hotel}')" style="width: 100%; justify-content:center;">
                            Entregar
                        </button>
                    </td>
                </tr>
            `}).join('');
        }
    }

    // 2. Historial de Entregas
    const historyBody = document.getElementById('driver-history-body');
    if (historyBody) {
        if (doneRoutes.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay entregas completadas aún.</td></tr>`;
        } else {
            historyBody.innerHTML = doneRoutes.map(s => `
                <tr>
                    <td class="fw-500">${s.id}</td>
                    <td>${s.hotel}</td>
                    <td>${s.time}</td>
                    <td class="text-sm">${s.type} ${s.signature ? '<br><span class="text-xs text-success">Firmado</span>' : ''}</td>
                </tr>
            `).join('');
        }
    }

    // 3. Reportar Problema
    const incidentRef = document.getElementById('driver-incident-ref');
    if (incidentRef) {
        incidentRef.innerHTML = `<option value="Ninguno">Ninguno / General</option>` + 
            myRoutes.map(s => `<option value="${s.id}">${s.id} - ${s.hotel}</option>`).join('');
    }

    // 4. Mi Vehículo
    const profileName = document.getElementById('driver-profile-name');
    if(profileName) profileName.textContent = currentUser.name;
    
    const vehicleInfo = document.getElementById('driver-vehicle-info');
    if(vehicleInfo) {
        if(camionesData.length > 0) {
            const camion = currentUser.name.includes('Carlos') ? camionesData[0] : (camionesData[1] || camionesData[0]);
            vehicleInfo.innerHTML = `
                <div>
                    <span class="text-sm text-muted">Matrícula</span><br>
                    <strong class="mt-1" style="display:inline-block">${camion.matricula}</strong>
                </div>
                <div>
                    <span class="text-sm text-muted">Vehículo</span><br>
                    <strong class="mt-1" style="display:inline-block">${camion.marca} ${camion.modelo}</strong>
                </div>
                <div>
                    <span class="text-sm text-muted">Próxima ITV</span><br>
                    <strong class="mt-1 text-success" style="display:inline-block">${camion.estado_itv.proxima_inspeccion}</strong>
                </div>
            `;
        } else {
            vehicleInfo.innerHTML = `<div class="text-center w-100 py-2"><i class="ph ph-warning text-danger"></i> Datos no disponibles</div>`;
        }
    }

    // 5. Jaulas Escaneadas
    const tbodyEnviadas = document.getElementById('table-jaulas-enviadas');
    if (tbodyEnviadas) {
        const env = appState.jaulas.enviadas.filter(j => j.driver === currentUser.name) || [];
        if (env.length === 0) {
            tbodyEnviadas.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">Ninguna enviada</td></tr>`;
        } else {
            tbodyEnviadas.innerHTML = env.map(j => `<tr><td class="fw-500">${j.id}</td><td>${j.hotel}</td></tr>`).join('');
        }
    }

    const tbodyRetiradas = document.getElementById('table-jaulas-retiradas');
    if (tbodyRetiradas) {
        const ret = appState.jaulas.retiradas.filter(j => j.driver === currentUser.name) || [];
        if (ret.length === 0) {
            tbodyRetiradas.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">Ninguna retirada</td></tr>`;
        } else {
            tbodyRetiradas.innerHTML = ret.map(j => `<tr><td class="fw-500">${j.id}</td><td>${j.hotel}</td></tr>`).join('');
        }
    }
}

document.getElementById('driver-incident-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ref = document.getElementById('driver-incident-ref').value;
    const type = document.getElementById('driver-incident-type').value;
    const desc = document.getElementById('driver-incident-desc').value;
    const newId = '#INC-' + Math.floor(Math.random() * 9000 + 1000);
    
    appState.tickets.unshift({
        id: newId, ref: ref !== 'Ninguno' ? ref : 'Ruta general', hotel: null, driver: currentUser.name, desc: `(${type}) ${desc}`, date: 'Justo Ahora', status: 'revision', isIncident: true
    });
    saveState();
    
    showToast('Alerta enviada a central');
    e.target.reset();
    
    const routeBtn = document.querySelector('#sidebar-links a[onclick*="driver-route"]');
    if(routeBtn) switchDriverView('driver-route', routeBtn);
});

// FIRMA DIGITAL LOGIC
let signatureCanvas, signatureCtx;
let isDrawing = false;

function initSignaturePad() {
    signatureCanvas = document.getElementById('signature-pad');
    if (!signatureCanvas) return;
    signatureCtx = signatureCanvas.getContext('2d');

    // Mouse Events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);

    // Touch Events (Móviles)
    signatureCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    signatureCanvas.addEventListener('touchmove', draw, { passive: false });
    signatureCanvas.addEventListener('touchend', stopDrawing);

    document.getElementById('clear-signature')?.addEventListener('click', clearSignaturePad);
}

function getPointerPos(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    // Escalar la posición por si el canvas está redimensionado por CSS
    const scaleX = signatureCanvas.width / rect.width;
    const scaleY = signatureCanvas.height / rect.height;
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    e.preventDefault(); // Prevenir scroll en móviles
    isDrawing = true;
    const pos = getPointerPos(e);
    signatureCtx.beginPath();
    signatureCtx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    signatureCtx.lineTo(pos.x, pos.y);
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.strokeStyle = '#000';
    signatureCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    signatureCtx.beginPath();
}

function clearSignaturePad() {
    if (signatureCtx) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
}


window.openCompleteShipment = function(id, hotel) {
    currentShipmentToCompleteId = id;
    const shipment = appState.shipments.find(s => s.id === id);
    if(shipment) {
        document.getElementById('albaran-hotel-name').textContent = shipment.hotel;
        document.getElementById('albaran-shipment-id').textContent = shipment.id;
        document.getElementById('albaran-shipment-type').textContent = shipment.type;
        document.getElementById('albaran-shipment-driver').textContent = shipment.driver;
    }
    
    // Preparar el formulario
    document.getElementById('dirty-carts').value = '';
    document.getElementById('shipment-incidence').value = '';
    clearSignaturePad(); 
    document.getElementById('modal-complete-shipment').classList.add('show');
}

document.getElementById('form-complete-shipment')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const carts = document.getElementById('dirty-carts').value;
    const incidenceMsg = document.getElementById('shipment-incidence').value;
    const signatureData = signatureCanvas.toDataURL(); // Extraer imagen de la firma
    
    const shipment = appState.shipments.find(s => s.id === currentShipmentToCompleteId);
    if(shipment) {
        shipment.status = 'entregado';
        shipment.dirtyCarts = carts;
        shipment.signature = signatureData; 
        if (incidenceMsg.trim() !== '') {
            // Register incidence
            const newId = '#INC-' + Math.floor(Math.random() * 9000 + 1000);
            appState.tickets.unshift({
                id: newId, ref: shipment.id, hotel: shipment.hotel, driver: shipment.driver, desc: `(En entrega) ${incidenceMsg}`, date: 'Justo Ahora', status: 'revision', isIncident: true
            });
        }
        saveState();
        showToast(incidenceMsg.trim() !== '' ? `Envío completado (Incidencia registrada)` : `Envío completado`);
        renderDriverView();
    }
    
    document.getElementById('modal-complete-shipment').classList.remove('show');
    e.target.reset();
});

let adminMap = null;
let hotelsData = [];

// ADMIN ROLE LOGIC
async function renderAdminView() {
    // 1. Cargar datos de hoteles si aún no existen
    if (hotelsData.length === 0) {
        try {
            const res = await fetch('hoteles.json');
            if(res.ok) hotelsData = await res.json();
            else throw new Error('Network response not ok');
        } catch(e) {
            console.warn("Fallo cargando hoteles.json, usando datos básicos.");
            hotelsData = appState.shipments.map(s => ({hotel: s.hotel, tiempo_m: 20, jaulas: 5}));
        }
    }

    // 2. Render Overview
    document.getElementById('admin-stat-hotels').textContent = hotelsData.length > 0 ? hotelsData.length : 12;
    document.getElementById('admin-stat-transit').textContent = appState.shipments.filter(s => s.status === 'en_camino').length;
    document.getElementById('admin-stat-tickets').textContent = appState.tickets.filter(t => t.status === 'revision').length;

    // Inicializar mapa global Admin
    if (document.getElementById('admin-map')) {
        if (!adminMap) {
            adminMap = L.map('admin-map').setView([39.6953, 2.9920], 9);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(adminMap);

            const polarierIcon = L.divIcon({ html: '<div style="font-size:24px; text-shadow:0 0 5px #fff;">🏢</div>', className: 'custom-div-icon', iconSize: [24,24], iconAnchor: [12,24] });
            const hubCoords = [39.5696, 2.6502]; 
            L.marker(hubCoords, {icon: polarierIcon}).addTo(adminMap).bindPopup('<b>Polarier Central</b>');

            const hotelIcon = L.divIcon({ html: '<div style="font-size:20px; text-shadow:0 0 5px #fff;">🏨</div>', className: 'custom-div-icon', iconSize: [20,20], iconAnchor: [10,20] });
            
            // Map over current active shipments to put markers
            appState.shipments.filter(s => s.status !== 'entregado').forEach((s, idx) => {
                const coords = [39.6953 + (Math.random()-0.5)*0.3, 2.9920 + (Math.random()-0.5)*0.3];
                L.marker(coords, {icon: hotelIcon}).addTo(adminMap).bindPopup(`<b>${s.hotel}</b><br>Envío: ${s.id} (${s.driver})`);
                L.polyline([hubCoords, coords], {color: '#facc15', weight: 2, opacity: 0.5, dashArray: '4, 8'}).addTo(adminMap);
            });
        }
        setTimeout(() => adminMap.invalidateSize(), 300);
    }

    // 3. Render Hotels DB
    const tbodyHotels = document.getElementById('admin-hotels-body');
    if (tbodyHotels) {
        tbodyHotels.innerHTML = hotelsData.map((h, i) => i < 50 ? `
            <tr>
                <td class="fw-500">${h.hotel}</td>
                <td>${h.tiempo_m}</td>
                <td><span class="badge ghost">${h.jaulas} jaulas</span></td>
            </tr>
        ` : '').join('') + (hotelsData.length > 50 ? `<tr><td colspan="3" class="text-center text-muted text-sm">+ ${hotelsData.length - 50} hoteles más (usa el buscador)</td></tr>` : '');
    }

    // 4. Render Shipments
    const tbodyShipments = document.getElementById('admin-shipments-body');
    if(tbodyShipments) {
        if (appState.shipments.length === 0) {
            tbodyShipments.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No hay operaciones.</td></tr>`;
        } else {
            tbodyShipments.innerHTML = appState.shipments.map(s => `
                <tr>
                    <td class="fw-500">${s.id}</td>
                    <td>${s.hotel}</td>
                    <td class="text-muted">${s.driver}</td>
                    <td><span class="badge ${statusMap[s.status]?.class || 'ghost'}">${statusMap[s.status]?.label || s.status}</span></td>
                    <td>${s.time}</td>
                    <td class="text-sm">
                        ${s.type} 
                        ${s.dirtyCarts !== null ? `<br><span class="text-xs text-success">(Retornó ${s.dirtyCarts} carros)</span>` : ''}
                        ${s.signature ? `<br><span class="text-xs text-primary fw-500"><i class="ph-fill ph-pen-nib"></i> Firmado</span>` : ''}
                    </td>
                    <td>
                        ${s.status === 'pendiente' ? `<button class="btn btn-sm btn-primary" onclick="openAssignDriver('${s.id}')">Asignar</button>` : `<span class="text-muted text-sm">--</span>`}
                    </td>
                </tr>
            `).join('');
        }
    }

    // 5. Render Tickets
    const tbodyTickets = document.getElementById('admin-tickets-body');
    if(tbodyTickets) {
        if (appState.tickets.length === 0) {
            tbodyTickets.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Bandeja limpia. No hay tickets.</td></tr>`;
        } else {
            tbodyTickets.innerHTML = appState.tickets.map(t => `
                <tr>
                    <td class="fw-500">${t.id}</td>
                    <td>${t.isIncident ? '<i class="ph-fill ph-warning text-danger"></i> Chofer' : '<i class="ph-fill ph-buildings text-primary"></i> Hotel'}</td>
                    <td><span class="badge ghost">${t.ref}</span></td>
                    <td>${t.desc}</td>
                    <td><span class="badge ${t.status === 'revision' ? 'in-progress' : 'completed'}">${t.status === 'revision' ? 'Bajo Revisión' : 'Cerrado'}</span></td>
                    <td>
                        ${t.status === 'revision' ? `<button class="btn btn-sm btn-secondary" onclick="closeTicket('${t.id}')">Marcar Resuelto</button>` : `<span class="text-success fw-500 text-sm">Cerrado</span>`}
                    </td>
                </tr>
            `).join('');
        }
    }
}

window.closeTicket = function(id) {
    const t = appState.tickets.find(tk => tk.id === id);
    if(t) {
        t.status = 'cerrado';
        saveState();
        showToast(`Ticket ${id} marcado como resuelto`);
        renderAdminView();
    }
}

window.openAssignDriver = function(id) {
    document.getElementById('assign-shipment-id').value = id;
    document.getElementById('assign-shipment-display').value = id;
    document.getElementById('modal-assign-driver').classList.add('show');
}

document.getElementById('form-assign-driver')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('assign-shipment-id').value;
    const driver = document.getElementById('assign-driver-select').value;
    const shipment = appState.shipments.find(s => s.id === id);
    if(shipment) {
        shipment.driver = driver;
        shipment.status = 'preparado';
        saveState();
        showToast(`Chofer ${driver} asignado a ${id}`);
        renderAdminView();
    }
    document.getElementById('modal-assign-driver').classList.remove('show');
});


// GLOBAL UTILS
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) e.target.classList.remove('show');
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if(container.contains(toast)) toast.remove();
    }, 3000);
}

// LOGICA LECTOR QR GLOBAL
let html5QrcodeScanner = null;

window.iniciarEscaner = function() {
    if (html5QrcodeScanner) return; // ya inicializado
    if (typeof Html5QrcodeScanner === 'undefined') {
        console.error("Html5QrcodeScanner no está definido. Revisa el link de la librería en el HTML.");
        return;
    }
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    html5QrcodeScanner.render(onScanSuccess);
}

function onScanSuccess(decodedText) {
    document.getElementById('scanner-panel').style.display = 'none';
    document.getElementById('result-panel').style.display = 'block';
    document.getElementById('qr-result-text').innerText = decodedText;
    
    if(html5QrcodeScanner) {
        try { html5QrcodeScanner.pause(); } catch(e) {}
    }
}

window.reiniciarEscanerQR = function() {
    document.getElementById('result-panel').style.display = 'none';
    document.getElementById('scanner-panel').style.display = 'block';
    if(html5QrcodeScanner) {
        try { html5QrcodeScanner.resume(); } catch(e) {}
    }
}

window.registrarJaulaQR = function(tipo) {
    const jaulaId = document.getElementById('qr-result-text').innerText;
    const hotel = document.getElementById('qr-hotel-select').value;
    
    appState.jaulas[tipo].unshift({
        id: jaulaId,
        hotel: hotel,
        driver: currentUser.name,
        date: new Date().toLocaleTimeString()
    });
    
    saveState();
    renderDriverView();
    
    showToast(`Jaula ${jaulaId} marcada como ${tipo === 'enviada' ? 'Enviada' : 'Retirada'} en ${hotel}`, "success");
    reiniciarEscanerQR();
}