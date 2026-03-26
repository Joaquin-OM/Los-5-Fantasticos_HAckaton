async function renderAdminView() {
    // 1. Cargar datos de hoteles si aún no existen
    if (hotelsData.length === 0) {
        try {
            const res = await fetch('datos/hoteles.json');
            if(res.ok) hotelsData = await res.json();
            else throw new Error('Network response not ok');
        } catch(e) {
            console.warn("Fallo cargando datos/hoteles.json, usando datos básicos.");
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


