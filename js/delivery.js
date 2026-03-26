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
