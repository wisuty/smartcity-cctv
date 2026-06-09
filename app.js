const nodes = [
    { id: '1', name: "ทม.ราชบุรี", dist: "เมือง", status: "ok" },
    { id: '2', name: "ทม.บ้านโป่ง", dist: "บ้านโป่ง", status: "warn" }
];

if (!localStorage.getItem('smartcity_users')) {
    localStorage.setItem('smartcity_users', JSON.stringify([{ username: 'admin', password: '123', role: 'admin', name: 'Admin' }]));
}

function attemptLogin() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('smartcity_users'));
    const found = users.find(u => u.username === user && u.password === pass);

    if (found) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUsername', found.username);
        location.reload();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('login-error').innerText = "รหัสผิด!";
    }
}

function loadDashboardData() {
    const tbody = document.getElementById('device-tbody');
    tbody.innerHTML = nodes.map(n => `<tr><td>${n.dist}</td><td>${n.name}</td><td>${n.status}</td></tr>`).join('');
}

function applyRoleRestrictions(role) {
    if (role === 'admin') {
        const sidebar = document.getElementById('sidebar');
        const adminBtn = document.createElement('button');
        adminBtn.className = 'menu-item';
        adminBtn.innerHTML = '👤 จัดการผู้ใช้';
        adminBtn.onclick = () => { switchPage('users'); renderUserTable(); };
        sidebar.appendChild(adminBtn);
    }
}

function renderUserTable() {
    const tbody = document.getElementById('user-table-body');
    const users = JSON.parse(localStorage.getItem('smartcity_users'));
    tbody.innerHTML = users.map((u, i) => `<tr><td>${u.name}</td><td>${u.username}</td><td>${u.role}</td><td>${u.username !== 'admin' ? `<button class="btn-delete" onclick="deleteUser(${i})">ลบ</button>` : '-'}</td></tr>`).join('');
}

function addUser() {
    const users = JSON.parse(localStorage.getItem('smartcity_users'));
    users.push({ name: document.getElementById('new-user-name').value, username: document.getElementById('new-user-id').value, password: document.getElementById('new-user-pass').value, role: document.getElementById('new-user-role').value });
    localStorage.setItem('smartcity_users', JSON.stringify(users));
    renderUserTable();
}

function deleteUser(i) {
    const users = JSON.parse(localStorage.getItem('smartcity_users'));
    users.splice(i, 1);
    localStorage.setItem('smartcity_users', JSON.stringify(users));
    renderUserTable();
}

function switchPage(id) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active-page'));
    document.getElementById('page-' + id).classList.add('active-page');
}

function logout() { sessionStorage.clear(); location.reload(); }

window.onload = () => {
    if (sessionStorage.getItem('isLoggedIn')) {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
        const user = JSON.parse(localStorage.getItem('smartcity_users')).find(u => u.username === sessionStorage.getItem('currentUsername'));
        document.getElementById('current-username').innerText = user.name;
        applyRoleRestrictions(user.role);
        loadDashboardData();
        const map = L.map('map').setView([13.55, 99.7], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
};
