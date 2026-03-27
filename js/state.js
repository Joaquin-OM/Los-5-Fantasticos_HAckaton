// Base simulada estática
const defaultState = {
    shipments: [
        { id: '#ENV-401', hotel: 'Hotel Ritz', driver: 'Carlos R.', status: 'en_camino', time: '14:00 - 16:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-402', hotel: 'Hotel Hilton', driver: 'Ana G.', status: 'entregado', time: '08:00 - 10:00', dirtyCarts: 4, type: 'Solo Entrega', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' },
        { id: '#ENV-403', hotel: 'Four Seasons', driver: 'Carlos R.', status: 'en_camino', time: '16:00 - 18:00', dirtyCarts: null, type: 'Recogida Ropa Sucia', signature: null },
        { id: '#ENV-404', hotel: 'Marriott', driver: 'Ana G.', status: 'preparado', time: 'Mañana', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
        { id: '#ENV-405', hotel: 'Meliá Palma', driver: 'Carlos R.', status: 'preparado', time: '09:00 - 11:00', dirtyCarts: null, type: 'Solo Entrega', signature: null },
        { id: '#ENV-406', hotel: 'Iberostar', driver: 'Carlos R.', status: 'entregado', time: '11:00 - 13:00', dirtyCarts: 2, type: 'Limpios + Recogida', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' },
        { id: '#ENV-407', hotel: 'Riu Palace', driver: 'Carlos R.', status: 'preparado', time: '12:00 - 14:00', dirtyCarts: null, type: 'Recogida Ropa Sucia', signature: null },
        { id: '#ENV-408', hotel: 'Hotel Hilton', driver: 'Sin Asignar', status: 'pendiente', time: '10:00 - 12:00', dirtyCarts: null, type: 'Solo Recogida', signature: null },
        { id: '#ENV-409', hotel: 'Four Seasons', driver: 'Ana G.', status: 'entregado', time: '09:00 - 11:00', dirtyCarts: 6, type: 'Limpios + Recogida', signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' },
        { id: '#ENV-410', hotel: 'Marriott', driver: 'Luis M.', status: 'en_camino', time: '15:00 - 17:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null }
    ],
    tickets: [
        { id: '#TK-9021', ref: '#ENV-402', hotel: 'Hotel Hilton', desc: 'Agregar 2 carros extras de toallas piscina', date: 'Hoy, 09:30', status: 'revision', isIncident: false },
        { id: '#INC-1022', ref: '#ENV-406', hotel: 'Iberostar', desc: 'Faltaron 2 juegos de sábanas king size', date: 'Hoy, 10:15', status: 'cerrado', isIncident: true },
        { id: '#TK-9023', ref: '#ENV-401', hotel: 'Hotel Ritz', desc: 'Solicitud de recogida urgente adicional', date: 'Justo ahora', status: 'revision', isIncident: false },
        { id: '#INC-1024', ref: 'Ruta Sur', hotel: null, desc: 'Atasco en la vía de cintura - Retraso 20min', date: 'Hoy, 08:45', status: 'revision', isIncident: true }
    ],
    jaulas: {
        enviadas: [
            { id: 'JLA-912A', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: 'Hoy, 10:15' },
            { id: 'JLA-913B', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: 'Hoy, 10:16' },
            { id: 'JLA-880C', hotel: 'Meliá Palma', driver: 'Carlos R.', date: 'Hoy, 09:20' },
            { id: 'JLA-110D', hotel: 'Hotel Hilton', driver: 'Ana G.', date: 'Hoy, 08:30' },
            { id: 'JLA-111E', hotel: 'Four Seasons', driver: 'Ana G.', date: 'Hoy, 11:00' }
        ],
        retiradas: [
            { id: 'JLA-742X', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: 'Hoy, 10:20' },
            { id: 'JLA-743Y', hotel: 'Hotel Ritz', driver: 'Carlos R.', date: 'Hoy, 10:21' },
            { id: 'JLA-744Z', hotel: 'Meliá Palma', driver: 'Carlos R.', date: 'Hoy, 09:30' },
            { id: 'JLA-220W', hotel: 'Hotel Hilton', driver: 'Ana G.', date: 'Hoy, 08:45' },
            { id: 'JLA-330V', hotel: 'Four Seasons', driver: 'Ana G.', date: 'Hoy, 11:15' }
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

// Forzado demo: Asegurar que el pedido del Ritz esté en reparto para la demo
const ritzShipment = appState.shipments.find(s => s.id === '#ENV-401');
if (ritzShipment && ritzShipment.status === 'preparado') {
    ritzShipment.status = 'en_camino';
    saveState();
}

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

