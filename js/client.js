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
