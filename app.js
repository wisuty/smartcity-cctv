const nodes = [{id:'1',name:"ทม.ราชบุรี",dist:"เมือง",status:"ok"},{id:'2',name:"ทม.บ้านโป่ง",dist:"บ้านโป่ง",status:"err"}];

function dragElement(elmnt) {
    elmnt.querySelector('.window-header').onmousedown = e => {
        let pos1 = e.clientX - elmnt.offsetLeft, pos2 = e.clientY - elmnt.offsetTop;
        document.onmousemove = e => { elmnt.style.top = (e.clientY - pos2) + "px"; elmnt.style.left = (e.clientX - pos1) + "px"; };
        document.onmouseup = () => document.onmousemove = null;
    };
}

function initDashboard() {
    const tbody = document.getElementById('device-tbody');
    tbody.innerHTML = nodes.map(n => `<tr><td>${n.dist}</td><td>${n.name}</td><td>${n.status}</td></tr>`).join('');
    
    const alertBox = document.getElementById('ai-alerts-box');
    alertBox.innerHTML = nodes.filter(n => n.status === 'err').map(n => `<p style="color:red;">🔴 ${n.name} ออฟไลน์</p>`).join('');
    
    const map = L.map('map').setView([13.55, 99.7], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    dragElement(document.getElementById('draggable-win'));
}

function attemptLogin() {
    const user = document.getElementById('login-username').value;
    const users = JSON.parse(localStorage.getItem('smartcity_users') || '[{"username":"admin","password":"123","role":"admin","name":"Admin"}]');
    if (users.find(u => u.username === user)) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUsername', user);
        location.reload();
    }
}

function switchPage(id) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active-page'));
    document.getElementById('page-' + id).classList.add('active-page');
}

window.onload = () => {
    if (sessionStorage.getItem('isLoggedIn')) {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
        const user = JSON.parse(localStorage.getItem('smartcity_users')).find(u => u.username === sessionStorage.getItem('currentUsername'));
        if(user.role === 'admin') document.getElementById('admin-menu').style.display = 'block';
        initDashboard();
    }
};

function logout() { sessionStorage.clear(); location.reload(); }
