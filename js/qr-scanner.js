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
