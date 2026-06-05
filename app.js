const cloudflareUrl = "https://handbags-nitrogen-creator-appointment.trycloudflare.com";
setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('th-TH'); }, 1000);

// --- Theme & Pages ---
let mapTileLayer;
function toggleTheme(isLight) {
    if(isLight) {
        document.body.classList.add('light-theme');
        mapTileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    } else {
        document.body.classList.remove('light-theme');
        mapTileLayer.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
    }
}
function switchPage(pageId, btn, callback) {
    document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.getElementById('page-' + pageId).style.display = (pageId === 'dashboard') ? 'flex' : 'block';
    btn.classList.add('active');
    if(pageId === 'dashboard') setTimeout(() => map.invalidateSize(), 100);
    if(callback) callback();
}

// --- Window Manager ---
function minimizeWindow(id) { document.getElementById(id).classList.add('minimized'); }
function maximizeWindow(id) { document.getElementById(id).classList.remove('minimized'); }
function closeWindow(id) { 
    document.getElementById(id).style.display = 'none'; 
    // อัปเดตสวิตช์ในหน้าตั้งค่าให้เป็นปิดด้วย
    let toggleBtn = document.getElementById('toggle-' + id);
    if(toggleBtn) toggleBtn.checked = false;
}
function toggleWindowVisibility(id, isVisible) {
    document.getElementById(id).style.display = isVisible ? 'flex' : 'none';
}
function resetWindows() {
    let w1 = document.getElementById('win-status'); w1.style.top = '20px'; w1.style.right = '20px'; w1.style.left = 'auto'; w1.style.display = 'flex'; maximizeWindow('win-status'); document.getElementById('toggle-win-status').checked = true;
    let w2 = document.getElementById('win-audio'); w2.style.top = '280px'; w2.style.right = '20px'; w2.style.left = 'auto'; w2.style.display = 'flex'; maximizeWindow('win-audio'); document.getElementById('toggle-win-audio').checked = true;
    let w3 = document.getElementById('win-ai'); w3.style.top = '20px'; w3.style.left = '20px'; w3.style.right = 'auto'; w3.style.display = 'flex'; maximizeWindow('win-ai'); document.getElementById('toggle-win-ai').checked = true;
    switchPage('dashboard', document.querySelector('.menu-item'));
}

function makeDraggable(winId, headerId) {
    const win = document.getElementById(winId); const header = document.getElementById(headerId);
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        document.querySelectorAll('.floating-window').forEach(w => w.style.zIndex = 2000);
        win.style.zIndex = 2001;
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = closeDragElement; document.onmousemove = elementDrag;
    };
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
        pos3 = e.clientX; pos4 = e.clientY;
        win.style.top = Math.max(0, win.offsetTop - pos2) + "px";
        win.style.left = Math.max(0, win.offsetLeft - pos1) + "px";
        win.style.right = "auto";
    }
    function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
}
makeDraggable('win-status', 'drag-status');
makeDraggable('win-audio', 'drag-audio');
makeDraggable('win-ai', 'drag-ai');

// --- Map & Data ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array;
}

const nodes = [
    { id: '1', name: "ทม.ราชบุรี", dist: "เมือง", lat: 13.5350, lng: 99.8190, ip: "10.0.1.10", status: "ok", temp: 34, hum: 55, pm: 25 },
    { id: '2', name: "ต.หน้าเมือง", dist: "เมือง", lat: 13.5400, lng: 99.8250, ip: "10.0.1.11", status: "ok", temp: 33, hum: 58, pm: 28 },
    { id: '3', name: "ต.เจดีย์หัก", dist: "เมือง", lat: 13.5550, lng: 99.8100, ip: "10.0.1.12", status: "warn", temp: 35, hum: 52, pm: 42 },
    { id: '4', name: "ต.ดอนตะโก", dist: "เมือง", lat: 13.5200, lng: 99.8000, ip: "10.0.1.13", status: "ok", temp: 32, hum: 60, pm: 22 },
    { id: '5', name: "ต.โคกหม้อ", dist: "เมือง", lat: 13.5600, lng: 99.8300, ip: "10.0.1.14", status: "err", temp: "-", hum: "-", pm: "-" },
    { id: '6', name: "ต.พงสวาย", dist: "เมือง", lat: 13.5450, lng: 99.8350, ip: "10.0.1.15", status: "ok", temp: 33, hum: 55, pm: 24 },
    { id: '7', name: "ทม.บ้านโป่ง", dist: "บ้านโป่ง", lat: 13.8160, lng: 99.8760, ip: "10.0.2.10", status: "warn", temp: 35, hum: 50, pm: 55 },
    { id: '8', name: "ต.ท่าผา", dist: "บ้านโป่ง", lat: 13.8300, lng: 99.8600, ip: "10.0.2.11", status: "ok", temp: 34, hum: 52, pm: 28 },
    { id: '9', name: "ต.เบิกไพร", dist: "บ้านโป่ง", lat: 13.8200, lng: 99.8500, ip: "10.0.2.12", status: "ok", temp: 34, hum: 54, pm: 30 },
    { id: '10', name: "ต.หนองอ้อ", dist: "บ้านโป่ง", lat: 13.7900, lng: 99.8800, ip: "10.0.2.13", status: "ok", temp: 35, hum: 51, pm: 35 },
    { id: '11', name: "ต.กรับใหญ่", dist: "บ้านโป่ง", lat: 13.8800, lng: 99.8100, ip: "10.0.2.14", status: "ok", temp: 33, hum: 56, pm: 20 },
    { id: '12', name: "ต.เขาขลุง", dist: "บ้านโป่ง", lat: 13.8900, lng: 99.7800, ip: "10.0.2.15", status: "err", temp: "-", hum: "-", pm: "-" },
    { id: '13', name: "ทม.โพธาราม", dist: "โพธาราม", lat: 13.6930, lng: 99.8490, ip: "10.0.3.10", status: "ok", temp: 33, hum: 55, pm: 30 },
    { id: '14', name: "ต.เจ็ดเสมียน", dist: "โพธาราม", lat: 13.6500, lng: 99.8300, ip: "10.0.3.11", status: "ok", temp: 33, hum: 58, pm: 25 },
    { id: '15', name: "ต.คลองตาคต", dist: "โพธาราม", lat: 13.7050, lng: 99.8550, ip: "10.0.3.12", status: "warn", temp: 34, hum: 54, pm: 45 },
    { id: '16', name: "ต.บ้านสิงห์", dist: "โพธาราม", lat: 13.6800, lng: 99.8800, ip: "10.0.3.13", status: "ok", temp: 32, hum: 60, pm: 28 },
    { id: '17', name: "ต.ดอนทราย", dist: "โพธาราม", lat: 13.7200, lng: 99.8200, ip: "10.0.3.14", status: "ok", temp: 33, hum: 57, pm: 29 },
    { id: '18', name: "ต.ดำเนินสะดวก", dist: "ดำเนินฯ", lat: 13.5180, lng: 99.9320, ip: "10.0.4.10", status: "ok", temp: 34, hum: 65, pm: 22 },
    { id: '19', name: "ต.ศรีสุราษฎร์", dist: "ดำเนินฯ", lat: 13.4900, lng: 99.9400, ip: "10.0.4.11", status: "ok", temp: 33, hum: 68, pm: 20 },
    { id: '20', name: "ต.แพงพวย", dist: "ดำเนินฯ", lat: 13.5300, lng: 99.9500, ip: "10.0.4.12", status: "warn", temp: 35, hum: 62, pm: 38 },
    { id: '21', name: "ต.บัวงาม", dist: "ดำเนินฯ", lat: 13.4800, lng: 99.9100, ip: "10.0.4.13", status: "ok", temp: 33, hum: 64, pm: 24 },
    { id: '22', name: "ทต.จอมบึง", dist: "จอมบึง", lat: 13.6210, lng: 99.5930, ip: "10.0.5.10", status: "ok", temp: 31, hum: 60, pm: 15 },
    { id: '23', name: "ต.ด่านทับตะโก", dist: "จอมบึง", lat: 13.6600, lng: 99.5000, ip: "10.0.5.11", status: "warn", temp: 30, hum: 62, pm: 18 },
    { id: '24', name: "ต.ปากช่อง", dist: "จอมบึง", lat: 13.6400, lng: 99.4500, ip: "10.0.5.12", status: "ok", temp: 29, hum: 65, pm: 12 },
    { id: '25', name: "ต.แก้มอ้น", dist: "จอมบึง", lat: 13.6800, lng: 99.4200, ip: "10.0.5.13", status: "ok", temp: 30, hum: 61, pm: 14 },
    { id: '26', name: "ต.สวนผึ้ง", dist: "สวนผึ้ง", lat: 13.5410, lng: 99.3080, ip: "10.0.6.10", status: "ok", temp: 28, hum: 75, pm: 10 },
    { id: '27', name: "ต.ป่าหวาย", dist: "สวนผึ้ง", lat: 13.5000, lng: 99.4000, ip: "10.0.6.11", status: "err", temp: "-", hum: "-", pm: "-" },
    { id: '28', name: "ต.ท่าเคย", dist: "สวนผึ้ง", lat: 13.4800, lng: 99.3500, ip: "10.0.6.12", status: "ok", temp: 29, hum: 70, pm: 14 },
    { id: '29', name: "ต.ตะนาวศรี", dist: "สวนผึ้ง", lat: 13.5100, lng: 99.2500, ip: "10.0.6.13", status: "ok", temp: 27, hum: 78, pm: 8 },
    { id: '30', name: "ต.บางแพ", dist: "บางแพ", lat: 13.6930, lng: 99.9320, ip: "10.0.7.10", status: "ok", temp: 33, hum: 55, pm: 30 },
    { id: '31', name: "ต.วังเย็น", dist: "บางแพ", lat: 13.7200, lng: 99.9200, ip: "10.0.7.11", status: "warn", temp: 34, hum: 53, pm: 40 },
    { id: '32', name: "ต.หัวโพ", dist: "บางแพ", lat: 13.6600, lng: 99.9400, ip: "10.0.7.12", status: "ok", temp: 32, hum: 58, pm: 25 },
    { id: '33', name: "ทต.ปากท่อ", dist: "ปากท่อ", lat: 13.3720, lng: 99.8430, ip: "10.0.8.10", status: "ok", temp: 32, hum: 58, pm: 18 },
    { id: '34', name: "ต.ทุ่งหลวง", dist: "ปากท่อ", lat: 13.3000, lng: 99.7800, ip: "10.0.8.11", status: "warn", temp: 33, hum: 55, pm: 35 },
    { id: '35', name: "ต.วัดยางงาม", dist: "ปากท่อ", lat: 13.3900, lng: 99.8600, ip: "10.0.8.12", status: "ok", temp: 31, hum: 60, pm: 20 },
    { id: '36', name: "ต.ดอนทราย", dist: "ปากท่อ", lat: 13.3500, lng: 99.8200, ip: "10.0.8.13", status: "ok", temp: 32, hum: 59, pm: 22 },
    { id: '37', name: "ต.วัดเพลง", dist: "วัดเพลง", lat: 13.4380, lng: 99.8890, ip: "10.0.9.10", status: "ok", temp: 33, hum: 60, pm: 21 },
    { id: '38', name: "ต.เกาะศาลพระ", dist: "วัดเพลง", lat: 13.4200, lng: 99.8700, ip: "10.0.9.11", status: "ok", temp: 32, hum: 62, pm: 19 },
    { id: '39', name: "ต.จอมประทัด", dist: "วัดเพลง", lat: 13.4600, lng: 99.8900, ip: "10.0.9.12", status: "ok", temp: 33, hum: 58, pm: 23 },
    { id: '40', name: "ต.บ้านคา", dist: "บ้านคา", lat: 13.4210, lng: 99.4210, ip: "10.0.10.10", status: "ok", temp: 29, hum: 70, pm: 12 },
    { id: '41', name: "ต.บ้านบึง", dist: "บ้านคา", lat: 13.4500, lng: 99.4500, ip: "10.0.10.11", status: "warn", temp: 30, hum: 68, pm: 25 },
    { id: '42', name: "ต.หนองพันจันทร์", dist: "บ้านคา", lat: 13.3900, lng: 99.4800, ip: "10.0.10.12", status: "ok", temp: 28, hum: 72, pm: 10 }
];

let aiAlertHtml = "";
nodes.forEach(node => {
    let totalCams = Math.floor(Math.random() * 4) + 1; 
    node.cams = []; let brokenCount = 0;
    for(let i=0; i<totalCams; i++) {
        let isOk = (node.status === 'err') ? 0 : (Math.random() > 0.15 ? 1 : 0);
        node.cams.push(isOk); if(!isOk) brokenCount++;
    }
    node.camSources = [1, 2, 3, 4].sort(() => 0.5 - Math.random());
    
    if(node.status === 'err') aiAlertHtml += `<div class="alert-item danger">🔴 ${node.name} ออฟไลน์</div>`;
    else if(node.pm > 50) aiAlertHtml += `<div class="alert-item danger">😷 ฝุ่น PM2.5 สูง: ${node.name} (${node.pm} µg/m³)</div>`;
    else if(brokenCount > 0) aiAlertHtml += `<div class="alert-item">📹 กล้องขัดข้อง ${brokenCount} จุด ที่ ${node.name}</div>`;
});
if(aiAlertHtml !== "") document.getElementById('ai-alerts-box').innerHTML = aiAlertHtml;
else document.getElementById('ai-alerts-box').innerHTML = `<div style="text-align:center; color:#2ec4b6;">🟢 ระบบเครือข่ายปกติ 100%</div>`;

var map = L.map('map', { zoomControl: false }).setView([13.55, 99.7], 10);
mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let currentLayer = 'status'; 
const markerStore = {};
const zoneContainer = document.getElementById('zone-checkboxes');

// 💡 แก้บั๊กหมุดกระโดด: ใช้ Flex จัดกึ่งกลางชั้นนอกสุดของ divIcon เสมอ
function createIcon(node, type) {
    let innerHtml = "";
    if(type === 'status') {
        let color = node.status === 'ok' ? '#2ec4b6' : (node.status === 'warn' ? '#ffb703' : '#e63946');
        innerHtml = `<div style='background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid #000;'></div>`;
    } else {
        let val = type === 'pm25' ? node.pm : `${node.temp}°`;
        let bg = node.status === 'err' ? '#6c757d' : (type === 'pm25' ? (node.pm>50?'#e63946':'#2ec4b6') : '#4cc9f0');
        let txtColor = (type === 'pm25' && node.pm > 50) ? '#fff' : '#000';
        innerHtml = `<div style="background:${bg}; width:26px; height:26px; border-radius:50%; border:2px solid #fff; display:flex; justify-content:center; align-items:center; font-size:11px; font-weight:bold; color:${txtColor}">${val}</div>`;
    }
    // ห่อด้วย container 26x26 เพื่อให้ Leaflet ยึดจุดกึ่งกลาง (Anchor 13,13) ได้ตรงกันทุกเลเยอร์
    let htmlContent = `<div style="display:flex; justify-content:center; align-items:center; width:26px; height:26px;">${innerHtml}</div>`;
    return L.divIcon({ className: 'custom-div-icon', html: htmlContent, iconSize: [26, 26], iconAnchor: [13, 13] });
}

function updateDashboardUI(node) {
    document.getElementById('ui-cam-title').innerText = `📍 ${node.name} (อ.${node.dist})`;
    document.getElementById('cam-count-badge').innerText = `มีกล้องติดตั้ง ${node.cams.length} ตัว`;
    
    const cctvGrid = document.getElementById('cctv-grid');
    cctvGrid.innerHTML = "";
    for(let i=0; i<4; i++) {
        if(i < node.cams.length) { 
            if(node.cams[i] === 1) { 
                cctvGrid.innerHTML += `<div class="camera-box"><span class="cam-tag">CAM 0${i+1}</span><iframe class="cam-feed" allow="autoplay" muted src="${cloudflareUrl}/stream.html?src=cam${node.camSources[i]}&mode=webrtc"></iframe></div>`;
            } else { 
                cctvGrid.innerHTML += `<div class="camera-box"><span class="cam-tag" style="background:#e63946;">CAM 0${i+1} ERR</span><div class="no-signal" style="color:#e63946;">⚠️ NO SIGNAL</div></div>`;
            }
        } else { 
            cctvGrid.innerHTML += `<div class="camera-box"><div class="no-signal" style="color:var(--text-muted); border: 1px dashed var(--border-color);">⚪<br>ไม่มีกล้องติดตั้ง</div></div>`;
        }
    }

    document.getElementById('ui-node-name').innerText = `📍 ${node.name} (อ.${node.dist})`;
    document.getElementById('ui-vpn-ip').innerText = `IP: ${node.ip} | Ping: ${node.status === 'err' ? 'Timeout' : '12 ms'}`;
    document.getElementById('ui-temp').innerText = node.status === 'err' ? "--°C" : `${node.temp}°C`;
    document.getElementById('ui-hum').innerText = node.status === 'err' ? "--%" : `${node.hum}%`;
    let pmEl = document.getElementById('ui-pm');
    pmEl.innerText = node.status === 'err' ? "-- µg/m³" : `${node.pm} µg/m³`;
    if(node.pm > 50) pmEl.style.color = "#e63946"; else pmEl.style.color = "#2ec4b6";
}

let currentDistrict = "";
nodes.forEach(node => {
    var marker = L.marker([node.lat, node.lng], {icon: createIcon(node, 'status')}).addTo(map);
    markerStore[node.id] = { marker: marker, data: node };
    marker.on('click', () => updateDashboardUI(node));

    if(currentDistrict !== node.dist) {
        zoneContainer.innerHTML += `<div style="color:#0d6efd; font-size:12px; margin: 8px 0 4px 0; font-weight:bold;">อ.${node.dist}</div>`;
        currentDistrict = node.dist;
    }
    let isChecked = (node.status !== 'err') ? "checked" : "disabled"; 
    zoneContainer.innerHTML += `<label class="zone-label"><input type="checkbox" class="zone-cb dist-${node.dist}" value="${node.id}" ${isChecked}> ${node.name}</label>`;
});

updateDashboardUI(nodes[0]); 

function setLayer(type, btn) {
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLayer = type;
    Object.values(markerStore).forEach(item => { item.marker.setIcon(createIcon(item.data, type)); });
}

function renderDeviceTable() {
    const tbody = document.getElementById('device-tbody');
    tbody.innerHTML = "";
    nodes.forEach(n => {
        let ping = n.status === 'err' ? '<span style="color:#e63946">Timeout</span>' : `${Math.floor(Math.random()*10+10)} ms`;
        let sensors = n.status === 'err' ? '-' : `${n.temp}°C / ${n.pm} µg`;
        let brokenCams = n.cams.filter(c => c === 0).length;
        let camStatus = n.status === 'err' ? '<span style="color:#e63946">ดับทั้งหมด</span>' : (brokenCams > 0 ? `<span style="color:#ffb703">เสีย ${brokenCams}</span>` : `<span style="color:#2ec4b6">${n.cams.length} ตัว ปกติ</span>`);
        tbody.innerHTML += `<tr><td>อ.${n.dist}</td><td><b>${n.name}</b></td><td>${n.ip}</td><td>${ping}</td><td>${sensors}</td><td>${camStatus}</td></tr>`;
    });
}

// 🎙️ PTT Button Functions (เพิ่มรองรับจอสัมผัส)
const btnPtt = document.getElementById('btn-ptt');
const speakingIcon = L.divIcon({ className: 'custom-div-icon', html: "<div style='background-color:#dc3545; width:22px; height:22px; border-radius:50%; border:2px solid #fff; display:flex; justify-content:center; align-items:center; font-size:10px;'>📢</div>", iconSize: [22, 22], iconAnchor: [11, 11] });

function startSpeak(e) {
    if(e) e.preventDefault();
    btnPtt.style.background = "#ffc107"; btnPtt.style.color = "#000";
    btnPtt.innerHTML = "🔴 กำลังกระจายเสียง...";
    document.querySelectorAll('.zone-cb').forEach(cb => { if(cb.checked && !cb.disabled) markerStore[cb.value].marker.setIcon(speakingIcon); });
}

function stopSpeak(e) {
    if(e) e.preventDefault();
    btnPtt.style.background = ""; btnPtt.style.color = ""; // คืนค่าสีเดิมใน CSS
    btnPtt.innerHTML = "🎙️ กดค้างเพื่อพูด (PTT)";
    Object.values(markerStore).forEach(item => { item.marker.setIcon(createIcon(item.data, currentLayer)); });
}