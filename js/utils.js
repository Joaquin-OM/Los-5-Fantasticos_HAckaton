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

