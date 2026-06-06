const cloudflareUrl = "https://handbags-nitrogen-creator-appointment.trycloudflare.com";

setInterval(() => { 
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString('th-TH'); 
}, 1000);

let map;
let mapTileLayer;
let currentLayer = 'status'; 
const markerStore = {};
let zoneContainer;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if(sidebar) {
        sidebar.classList.toggle('collapsed');
        setTimeout(() => { if (map) map.invalidateSize(); }, 320);
    }
}

// โหลดข้อมูลเสียงล่วงหน้า (แก้ปัญหา Chrome หาเสียงไม่เจอในรอบแรก)
window.speechSynthesis.onvoiceschanged = function() {
    window.speechSynthesis.getVoices();
};

// 🌟 แก้ปัญหาเสียงเป็นภาษาอังกฤษ
function testTTS() {
    const textEl = document.getElementById('tts-text');
    if (!textEl) return;
    
    const text = textEl.value;
    if (!text.trim()) {
        alert("กรุณาพิมพ์ข้อความที่ต้องการประกาศก่อนครับ");
        return;
    }

    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // ล้างคิวเสียงเก่า
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH'; 
        
        // ค้นหาเสียงภาษาไทยจากเบราว์เซอร์
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(voice => voice.lang.includes('th') || voice.lang.includes('TH'));
        
        if (thaiVoice) {
            utterance.voice = thaiVoice; // ถ้าเจอเสียงคนไทยให้บังคับใช้
        }
        
        speechSynthesis.speak(utterance);
    } else {
        alert("เบราว์เซอร์ของท่านไม่รองรับระบบเสียงสังเคราะห์ (TTS) ครับ");
    }
}

const nodes = [
    { id: '1', name: "ทม.ราชบุรี", dist: "เมือง", lat: 13.5350, lng: 99.8190, ip: "10.0.1.10", status: "ok", temp: 34, hum: 55, pm: 25 },
    { id: '2', name: "ต.หน้าเมือง", dist: "เมือง", lat: 13.5400, lng: 99.8250, ip: "10.0.1.11", status: "ok", temp: 33, hum: 58, pm: 28 },
    { id: '3', name: "ต.เจดีย์หัก", dist: "เมือง", lat: 13.5550, lng: 99.8100, ip: "10.0.1.12", status: "warn", temp: 35, hum: 52, pm: 42 },
    { id: '4', name: "ต.ดอนตะโก", dist: "เมือง", lat: 13.5200, lng: 99.8000, ip: "10.0.1.13", status: "ok", temp: 32, hum: 60, pm: 22 },
    { id: '5', name: "ต.โคกหม้อ", dist: "เมือง", lat: 13.5600, lng: 99.8300, ip: "10.0.1.14", status: "err", temp: "-", hum: "-", pm: "-" },
    { id: '6', name: "ต.พงสวาย", dist: "เมือง", lat: 13.5450, lng: 99.8350, ip: "10.0.1.15", status: "ok", temp: 33, hum: 55, pm: 24 },
    { id: '7', name: "ทม.บ้านโป่ง", dist: "บ้านโป่ง", lat: 13.8160, lng: 99.8760, ip: "10.0.2.10", status: "warn", temp: 35, hum: 50, pm: 55 }
];

let alertHtml = "";
nodes.forEach(node => {
    node.cams = [1, 1, 1, 0];
    node.camSources = [1, 2, 3, 4];
    if(node.status === 'err') alertHtml += `<div class="alert-item danger">🔴 ${node.name} ออฟไลน์</div>`;
});

document.addEventListener('DOMContentLoaded', () => {
    zoneContainer = document.getElementById('zone-checkboxes');
    if(alertHtml !== "") document.getElementById('ai-alerts-box').innerHTML = alertHtml;
    else document.getElementById('ai-alerts-box').innerHTML = `<div style="text-align:center; color:#2ec4b6;">🟢 ระบบเครือข่ายปกติ 100%</div>`;

    map = L.map('map', { zoomControl: false }).setView([13.55, 99.7], 10);
    // 🌟 เปลี่ยนแผนที่เริ่มต้นเป็นสีสว่าง (Voyager)
    mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

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

    setTimeout(() => { if(map) map.invalidateSize(); }, 400);
    updateDashboardUI(nodes[0]);

    makeDraggable('win-status', 'drag-status');
    makeDraggable('win-audio', 'drag-audio');
    makeDraggable('win-ai', 'drag-ai');
});

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
                cctvGrid.innerHTML += `<div class="camera-box"><span class="cam-tag">CAM 0${i+1}</span><div class="no-signal">STANDBY</div></div>`;
            } else { 
                cctvGrid.innerHTML += `<div class="camera-box"><span class="cam-tag" style="background:#e63946;">CAM 0${i+1} ERR</span><div class="no-signal" style="color:#e63946;">⚠️ NO SIGNAL</div></div>`;
            }
        } else { 
            cctvGrid.innerHTML += `<div class="camera-box"><div class="no-signal" style="color:var(--text-muted); border: 1px dashed var(--border-color);">⚪<br>ไม่มีกล้อง</div></div>`;
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

function setLayer(type, btn) {
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLayer = type;
    Object.values(markerStore).forEach(item => { item.marker.setIcon(createIcon(item.data, type)); });
}

function switchPage(pageId, btn, callback) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active-page'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active-page');
    btn.classList.add('active');
    if(pageId === 'dashboard') { setTimeout(() => map.invalidateSize(), 200); }
    if(callback) callback();
}

function renderDeviceTable() {
    const tbody = document.getElementById('device-tbody');
    tbody.innerHTML = "";
    nodes.forEach(n => {
        let ping = n.status === 'err' ? '<span style="color:#e63946">Timeout</span>' : `${Math.floor(Math.random()*10+10)} ms`;
        let sensors = n.status === 'err' ? '-' : `${n.temp}°C / ${n.pm} µg`;
        tbody.innerHTML += `<tr><td>อ.${n.dist}</td><td><b>${n.name}</b></td><td>${n.ip}</td><td>${ping}</td><td>${sensors}</td><td>ปกติ</td></tr>`;
    });
}

const btnPtt = document.getElementById('btn-ptt');
const speakingIcon = L.divIcon({ className: 'custom-div-icon', html: "<div style='background-color:#dc3545; width:22px; height:22px; border-radius:50%; border:2px solid #fff; display:flex; justify-content:center; align-items:center; font-size:10px;'>📢</div>", iconSize: [22, 22], iconAnchor: [11, 11] });
function startSpeak(e) {
    if(e) e.preventDefault();
    if(btnPtt) { btnPtt.style.background = "#ffc107"; btnPtt.style.color = "#000"; btnPtt.innerHTML = "🔴 กำลังส่งเสียงประกาศ..."; }
    document.querySelectorAll('.zone-cb').forEach(cb => { if(cb.checked && !cb.disabled) markerStore[cb.value].marker.setIcon(speakingIcon); });
}
function stopSpeak(e) {
    if(e) e.preventDefault();
    if(btnPtt) { btnPtt.style.background = ""; btnPtt.style.color = ""; btnPtt.innerHTML = "🎙️ กดค้างเพื่อพูด (PTT)"; }
    Object.values(markerStore).forEach(item => { item.marker.setIcon(createIcon(item.data, currentLayer)); });
}

function minimizeWindow(id) { document.getElementById(id).classList.add('minimized'); }
function maximizeWindow(id) { document.getElementById(id).classList.remove('minimized'); }
function closeWindow(id) { document.getElementById(id).style.display = 'none'; let toggleBtn = document.getElementById('toggle-' + id); if(toggleBtn) toggleBtn.checked = false; }
function toggleWindowVisibility(id, isVisible) { document.getElementById(id).style.display = isVisible ? 'flex' : 'none'; }
function resetWindows() {
    let w1 = document.getElementById('win-status'); w1.style.top = '20px'; w1.style.right = '20px'; w1.style.left = 'auto'; w1.style.display = 'flex'; maximizeWindow('win-status'); document.getElementById('toggle-win-status').checked = true;
    let w2 = document.getElementById('win-audio'); w2.style.top = '280px'; w2.style.right = '20px'; w2.style.left = 'auto'; w2.style.display = 'flex'; maximizeWindow('win-audio'); document.getElementById('toggle-win-audio').checked = true;
    let w3 = document.getElementById('win-ai'); w3.style.top = '20px'; w3.style.left = '20px'; w3.style.right = 'auto'; w3.style.display = 'none'; maximizeWindow('win-ai'); document.getElementById('toggle-win-ai').checked = false;
    switchPage('dashboard', document.querySelector('.menu-item'));
}
function makeDraggable(winId, headerId) {
    const win = document.getElementById(winId); const header = document.getElementById(headerId);
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        document.querySelectorAll('.floating-window').forEach(w => w.style.zIndex = 2000); win.style.zIndex = 2001;
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = closeDragElement; document.onmousemove = elementDrag;
    };
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
        win.style.top = Math.max(0, win.offsetTop - pos2) + "px"; win.style.left = Math.max(0, win.offsetLeft - pos1) + "px"; win.style.right = "auto";
    }
    function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
}

function toggleTheme(isLight) {
    if(isLight) {
        document.body.classList.add('light-theme');
        mapTileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    } else {
        document.body.classList.remove('light-theme');
        mapTileLayer.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
    }
}