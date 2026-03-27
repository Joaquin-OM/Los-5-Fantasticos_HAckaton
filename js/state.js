// Base simulada estática
const defaultState = {
    shipments: [
        { id: '#ENV-401', hotel: 'Hotel Ritz', driver: 'Carlos R.', status: 'en_camino', time: '14:00 - 16:00', dirtyCarts: null, type: 'Limpios + Recogida', signature: null },
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

