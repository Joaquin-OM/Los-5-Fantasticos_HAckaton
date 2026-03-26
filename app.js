// Base simulada estática
const defaultState = {
    shipments: [
        { id: '#ENV-401', hotel: 'Hotel Ritz', driver: 'Carlos R.', status: 'preparado', time: '14:00 - 16:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-402', hotel: 'Hotel Hilton', driver: 'Ana G.', status: 'entregado', time: '08:00 - 10:00', dirtyCarts: 4, type: 'Solo Entrega', signature: null },
        { id: '#ENV-403', hotel: 'Four Seasons', driver: 'Carlos R.', status: 'en_camino', time: '16:00 - 18:00', dirtyCarts: null, type: 'Recogida Ropa Sucia', signature: null },
        { id: '#ENV-404', hotel: 'Marriott', driver: 'Ana G.', status: 'preparado', time: 'Mañana', dirtyCarts: null, type: 'Limpios + Recogida', signature: null }
    ],
    tickets: [
        { id: '#TK-9021', ref: '#ENV-402', desc: 'Agregar 2 carros extras de toallas piscina', date: 'Hoy, 09:30', status: 'revision' }
    ]
};

// Cargar estado persistivo
const loadState = () => {
    const savedData = localStorage.getItem('polarier_data');
    return savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(defaultState)); 
};

let appState = loadState();

const saveState = () => {
    localStorage.setItem('polarier_data', JSON.stringify(appState));
};

// Mapeos UI
const statusMap = {
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
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('polarier_user');
    currentUser = null;
    showToast('Sesión cerrada');
    switchView('login-section');
});

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
            <li><a href="#" class="active"><i class="ph-fill ph-map-trifold"></i> <span>Ruta de Trabajo</span></a></li>
            <li><a href="#"><i class="ph ph-user"></i> <span>Mi Perfil</span></a></li>
        `;
        document.getElementById('current-page-title').textContent = `Portal Logístico - ${currentUser.name}`;
        switchDashboardRole('driver-dashboard');
        renderDriverView();
    }
    else {
        sidebar.innerHTML = `
            <li><a href="#" class="active"><i class="ph-fill ph-chart-line-up"></i> <span>Overview Global</span></a></li>
            <li><a href="#"><i class="ph ph-buildings"></i> <span>Hoteles</span></a></li>
            <li><a href="#"><i class="ph ph-truck"></i> <span>Flota y Envíos</span></a></li>
        `;
        document.getElementById('current-page-title').textContent = `Administración Polarier`;
        switchDashboardRole('admin-dashboard');
        renderAdminView();
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
        id: newId, hotel: currentUser.hotel, driver: 'Asignando...', status: 'preparado', time: time, dirtyCarts: null, type: type, signature: null
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


// DRIVER ROLE LOGIC
function renderDriverView() {
    const list = document.getElementById('driver-routes');
    const stats = document.getElementById('driver-stats');
    
    const myRoutes = appState.shipments.filter(s => s.driver === currentUser.name);
    const pending = myRoutes.filter(s => s.status !== 'entregado');
    const done = myRoutes.length - pending.length;

    stats.innerHTML = `
        <div class="stat-box">
            <span class="text-xs text-muted">PENDIENTES</span>
            <span class="stat-value text-main">${pending.length}</span>
        </div>
        <div class="stat-box">
            <span class="text-xs text-muted">COMPLETADOS</span>
            <span class="stat-value text-success">${done}</span>
        </div>
    `;

    if (myRoutes.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>Tu hoja de ruta está vacía</p></div>`;
        return;
    }

    list.innerHTML = myRoutes.map(s => {
        const isDone = s.status === 'entregado';
        return `
        <div class="route-item ${isDone ? 'completed-item' : ''}">
            <div>
                <div class="mb-2">
                    <span class="badge ${statusMap[s.status].class}">${statusMap[s.status].label}</span>
                    <span class="text-xs fw-500 text-muted ms-2">${s.id}</span>
                </div>
                <h4>${s.hotel}</h4>
                <div class="mt-2 text-sm text-muted">
                   <span>🕒 ${s.time}</span> | <span>📦 ${s.type}</span>
                </div>
            </div>
            <div>
                ${!isDone ? 
                `<button class="btn btn-sm btn-primary" onclick="openCompleteShipment('${s.id}', '${s.hotel}')">
                    Entregar
                </button>` : 
                `<span class="text-success fw-500">Hecho</span>`}
            </div>
        </div>
    `}).join('');
}

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
    document.getElementById('complete-shipment-hotel').textContent = hotel;
    clearSignaturePad(); // Limpiar la firma anterior al abrir el modal
    document.getElementById('modal-complete-shipment').classList.add('show');
}

document.getElementById('form-complete-shipment')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const carts = document.getElementById('dirty-carts').value;
    const signatureData = signatureCanvas.toDataURL(); // Extraer imagen de la firma
    
    // Validar firma vacía verificando los píxeles (opcional, en este caso solo guardamos la imagen generada)
    
    const shipment = appState.shipments.find(s => s.id === currentShipmentToCompleteId);
    if(shipment) {
        shipment.status = 'entregado';
        shipment.dirtyCarts = carts;
        shipment.signature = signatureData; // Guardar firma en el estado del envío
        saveState();
        showToast(`Envío completado`);
        renderDriverView();
    }
    
    document.getElementById('modal-complete-shipment').classList.remove('show');
    e.target.reset();
});

// ADMIN ROLE LOGIC
function renderAdminView() {
    const tbody = document.getElementById('admin-shipments-body');
    
    document.getElementById('admin-stat-transit').textContent = appState.shipments.filter(s => s.status === 'en_camino').length;
    document.getElementById('admin-stat-tickets').textContent = appState.tickets.filter(t => t.status === 'revision').length;

    if (appState.shipments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No hay operaciones.</td></tr>`;
        return;
    }

    tbody.innerHTML = appState.shipments.map(s => `
        <tr>
            <td class="fw-500">${s.id}</td>
            <td>${s.hotel}</td>
            <td class="text-muted">${s.driver}</td>
            <td><span class="badge ${statusMap[s.status].class}">${statusMap[s.status].label}</span></td>
            <td>${s.time}</td>
            <td class="text-sm">
                ${s.type} 
                ${s.dirtyCarts !== null ? `<br><span class="text-xs text-success">(Retornó ${s.dirtyCarts} carros)</span>` : ''}
                ${s.signature ? `<br><span class="text-xs text-primary fw-500"><i class="ph-fill ph-pen-nib"></i> Firmado</span>` : ''}
            </td>
        </tr>
    `).join('');
}


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