async function renderDriverView() {
    // Cargar camiones
    if (camionesData.length === 0) {
        try {
            const res = await fetch('datos/camiones.json');
            if(res.ok) {
                const data = await res.json();
                camionesData = data.vehiculos || [];
            }
        } catch(e) {
            console.warn("Fallo cargando datos/camiones.json");
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

