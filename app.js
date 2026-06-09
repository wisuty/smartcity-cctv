// 1. ระบบ Draggable (ทำให้หน้าต่างขยับได้)
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.querySelector('.window-header').onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = () => document.onmouseup = null;
        document.onmousemove = e => {
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        };
    }
}

// 2. ระบบกราฟ (Chart.js)
function initChart() {
    const ctx = document.getElementById('pm25Chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['10:00', '11:00', '12:00', '13:00'],
            datasets: [{ label: 'PM2.5', data: [12, 19, 3, 5], borderColor: '#0d6efd' }]
        }
    });
}

// 3. ระบบแผนที่
function initMap() {
    const map = L.map('map').setView([13.55, 99.7], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// 4. Initialization
window.onload = () => {
    if (sessionStorage.getItem('isLoggedIn')) {
        document.getElementById('login-overlay').style.display = 'none';
        initMap();
        initChart();
        dragElement(document.getElementById('dashboard-window'));
    }
};

function attemptLogin() {
    // ใส่ Logic เดิมของคุณที่นี่
    sessionStorage.setItem('isLoggedIn', 'true');
    location.reload();
}
