/* ARQUIVO: assets/app.js */

var map = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    center: [-46.633, -23.550], zoom: 14, pitch: 45, bearing: -20, maxZoom: 18,
    preserveDrawingBuffer: true,
    dragBox: false, boxZoom: false 
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

class HomeButton {
    onAdd(map) {
        this.container = document.createElement('div');
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this.container.innerHTML = '<button type="button" title="Voltar ao Centro" style="font-size:16px; cursor:pointer;">🏠</button>';
        this.container.onclick = () => { map.flyTo({ center: [-46.633, -23.550], zoom: 14, pitch: 45, bearing: -20 }); };
        return this.container;
    }
    onRemove() { this.container.parentNode.removeChild(this.container); }
}

class SelectButton {
    onAdd(map) {
        this.container = document.createElement('div');
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this.btn = document.createElement('button');
        this.btn.type = 'button';
        this.btn.id = 'btn-selection-tool';
        this.btn.title = 'Desenhar Área Livre (Laço)';
        this.btn.style.fontSize = '18px';
        this.btn.style.cursor = 'pointer';
        this.btn.innerHTML = '✏️'; 
        this.btn.onclick = () => { toggleSelectMode(this.btn); };
        this.btn.classList.add('btn-disabled'); 
        this.container.appendChild(this.btn);
        return this.container;
    }
    onRemove() { this.container.parentNode.removeChild(this.container); }
}

map.addControl(new HomeButton(), "top-right");
map.addControl(new SelectButton(), "top-right");

// A escala agora fica no bottom-right, liberando a visão onde estava
map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');

// --- LÓGICA DE ABRIR/FECHAR O PAINEL E SUAS SEÇÕES ---
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
toggleBtn.addEventListener('click', () => { 
    sidebar.classList.toggle('collapsed'); 
    toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '❯' : '❮'; 
});

window.toggleSection = function(bodyId, headerEl) {
    var content = document.getElementById(bodyId);
    var icon = headerEl.querySelector('.toggle-icon');
    if (content.style.display === "none") {
        content.style.display = "block";
        icon.innerHTML = "▼";
        headerEl.classList.remove('closed');
    } else {
        content.style.display = "none";
        icon.innerHTML = "▶";
        headerEl.classList.add('closed');
    }
};

// --- LÓGICA DE REDIMENSIONAMENTO MANUAL ---
function makeResizable(div) {
    const resizers = div.querySelectorAll('.resizer');
    const minW = 200, minH = 100;

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = parseInt(document.defaultView.getComputedStyle(div).width, 10);
            const startH = parseInt(document.defaultView.getComputedStyle(div).height, 10);
            const startLeft = div.offsetLeft;
            const startTop = div.offsetTop;

            const onMouseMove = (e) => {
                if (resizer.classList.contains('resizer-r')) {
                    div.style.width = Math.max(minW, startW + e.clientX - startX) + 'px';
                } else if (resizer.classList.contains('resizer-b')) {
                    div.style.height = Math.max(minH, startH + e.clientY - startY) + 'px';
                } else if (resizer.classList.contains('resizer-l')) {
                    const w = startW - (e.clientX - startX);
                    if (w > minW) { div.style.width = w + 'px'; div.style.left = (startLeft + (e.clientX - startX)) + 'px'; }
                } else if (resizer.classList.contains('resizer-t')) {
                    const h = startH - (e.clientY - startY);
                    if (h > minH) { div.style.height = h + 'px'; div.style.top = (startTop + (e.clientY - startY)) + 'px'; }
                } 
                else if (resizer.classList.contains('resizer-br')) {
                    div.style.width = Math.max(minW, startW + e.clientX - startX) + 'px';
                    div.style.height = Math.max(minH, startH + e.clientY - startY) + 'px';
                }
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });
}

// --- LÓGICA DE SELEÇÃO LIVRE (LASSO) ---
let isSelecting = false;
let isDrawing = false;
let lassoPolygon = []; 
let lassoPixels = [];  
let resultsElement = document.getElementById('results-card');
let resultsContent = document.getElementById('results-content');
let selectBtnRef = null;

makeResizable(resultsElement);

map.on('load', () => {
    map.addSource('lasso-source', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'geometry': { 'type': 'Polygon', 'coordinates': [[]] } }
    });
    map.addLayer({ 'id': 'lasso-fill', 'type': 'fill', 'source': 'lasso-source', 'paint': { 'fill-color': '#2F80ED', 'fill-opacity': 0.3 } });
    map.addLayer({ 'id': 'lasso-line', 'type': 'line', 'source': 'lasso-source', 'paint': { 'line-color': '#2F80ED', 'line-width': 2, 'line-dasharray': [2, 2] } });
});

function toggleSelectMode(btn) {
    if (btn.classList.contains('btn-disabled')) return; 

    isSelecting = !isSelecting;
    selectBtnRef = btn;
    
    if (isSelecting) {
        btn.classList.add('select-btn-active');
        map.getCanvas().style.cursor = 'crosshair';
        map.dragPan.disable(); 
        resultsElement.style.display = 'none';
        clearLasso();
    } else {
        btn.classList.remove('select-btn-active');
        map.getCanvas().style.cursor = '';
        map.dragPan.enable();
        clearLasso();
    }
}

function clearLasso() {
    lassoPolygon = [];
    lassoPixels = [];
    if (map.getSource('lasso-source')) {
        map.getSource('lasso-source').setData({ 'type': 'Feature', 'geometry': { 'type': 'Polygon', 'coordinates': [[]] } });
    }
}

function updateLassoRender() {
    if (lassoPolygon.length < 3) return;
    let closedPoly = [...lassoPolygon, lassoPolygon[0]];
    map.getSource('lasso-source').setData({ 'type': 'Feature', 'geometry': { 'type': 'Polygon', 'coordinates': [closedPoly] } });
}

map.on('mousedown', (e) => {
    if (!isSelecting) return;
    isDrawing = true;
    clearLasso();
    lassoPolygon.push([e.lngLat.lng, e.lngLat.lat]);
    lassoPixels.push([e.point.x, e.point.y]);
});

map.on('mousemove', (e) => {
    if (!isSelecting || !isDrawing) return;
    lassoPolygon.push([e.lngLat.lng, e.lngLat.lat]);
    lassoPixels.push([e.point.x, e.point.y]);
    updateLassoRender();
});

map.on('mouseup', (e) => {
    if (!isSelecting || !isDrawing) return;
    isDrawing = false;
    if (lassoPolygon.length > 3) { finishLassoSelection(); } else { clearLasso(); }
    toggleSelectMode(selectBtnRef); 
});

function isLeft(P0, P1, P2) { return ((P1[0] - P0[0]) * (P2[1] - P0[1]) - (P2[0] - P0[0]) * (P1[1] - P0[1])); }

function pointInPolygon(point, vs) {
    let wn = 0; 
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        if (vs[j][1] <= point[1]) {
            if (vs[i][1] > point[1]) { if (isLeft(vs[j], vs[i], point) > 0) wn++; }
        } else {
            if (vs[i][1] <= point[1]) { if (isLeft(vs[j], vs[i], point) < 0) wn--; }
        }
    }
    return wn !== 0; 
}

function finishLassoSelection() {
    const xs = lassoPixels.map(p => p[0]);
    const ys = lassoPixels.map(p => p[1]);
    const bbox = [ [Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)] ];
    if (bbox[0][0] === bbox[1][0] || bbox[0][1] === bbox[1][1]) return;
    
    const rawFeatures = map.queryRenderedFeatures(bbox);
    const featuresDentro = rawFeatures.filter(f => {
        if (!f.geometry) return false;
        if (f.geometry.type === 'Point') {
            return pointInPolygon(f.geometry.coordinates, lassoPolygon);
        } else if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
            let samplePoint = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0][0] : f.geometry.coordinates[0][0][0];
            return pointInPolygon(samplePoint, lassoPolygon);
        }
        return false;
    });

    calculateStats(featuresDentro);
}

function checkSelectButton() {
    const btn = document.getElementById('btn-selection-tool');
    if (!btn) return;
    let allDataLayers = [];
    for (let key in layersByTab) { allDataLayers = allDataLayers.concat(layersByTab[key]); }
    let hasActiveLayer = allDataLayers.some(id => {
        if (id === 'socio_dens') return false;
        return map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible';
    });

    if (hasActiveLayer) {
        btn.classList.remove('btn-disabled');
        btn.title = 'Selecionar Área Livre';
    } else {
        btn.classList.add('btn-disabled');
        btn.title = 'Ative uma camada para usar a seleção';
        isSelecting = false; 
        if(selectBtnRef) selectBtnRef.classList.remove('select-btn-active');
        map.getCanvas().style.cursor = '';
        map.dragPan.enable();
        clearLasso();
        closeResults();
    }
}

// --- CÁLCULOS ESTATÍSTICOS COM FLEXBOX E TEXTO QUEBRADO ---
function calculateStats(features) {
    const stats = {};
    const staticLabels = { 
        'estab':'Usos dos Estabelecimentos', 
        'iptu':'Características dos Imóveis',
        'fav':'Favelas', 'cort':'Cortiços', 'lote':'Loteamentos', 
        'parques':'Parques', 'pracas':'Praças', 'arvores':'Árvores', 
        'tomb_geral': 'Bens Tombados (Área Geral)',
        'tomb_status':'Bens Tombados (Por Status)',
        'uso': 'Uso do Solo',
        'tomb_orgao': 'Bens Tombados (Jurisdição)',
    };
    
    let sumPop = 0; let sumDom = 0; let hasSocioPop = false; let hasSocioDom = false;
    let iptuStats = { count: 0, sumAreaConst: 0, sumAreaTerr: 0, sumPav: 0 };
    let terrenosAgrupados = new Map(); 
    let hasIptu = false;
    let processedIds = new Set(); 

    features.forEach(f => {
        const layerId = f.layer.id;
        if (layerId === 'socio_dens') return;

        const uniqueId = layerId + '_' + JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties);

        if (layerId === 'socio_pop' || layerId === 'socio_dom') {
            if (!processedIds.has(uniqueId)) {
                processedIds.add(uniqueId);
                if (layerId === 'socio_pop') { sumPop += (f.properties.populacao || 0); hasSocioPop = true; }
                if (layerId === 'socio_dom') { sumDom += (f.properties.domicilios || 0); hasSocioDom = true; }
            }
            return; 
        }

        if (layerId === 'iptu') {
            if (!processedIds.has(uniqueId)) {
                processedIds.add(uniqueId);
                hasIptu = true;
                iptuStats.count++;
                iptuStats.sumAreaConst += (parseFloat(f.properties.area_construida) || 0);
                
                const coordKey = JSON.stringify(f.geometry.coordinates);
                const currTerr = parseFloat(f.properties.area_terreno) || 0;
                const currPav = parseFloat(f.properties.num_pavimentos) || 0;
                
                if (!terrenosAgrupados.has(coordKey)) { terrenosAgrupados.set(coordKey, { terr: currTerr, pav: currPav }); } 
                else { let existing = terrenosAgrupados.get(coordKey); terrenosAgrupados.set(coordKey, { terr: Math.max(existing.terr, currTerr), pav: Math.max(existing.pav, currPav) }); }
            }
            return;
        }

        let groupName = null;
        if (typeof infraLabels !== 'undefined' && infraLabels[layerId]) groupName = infraLabels[layerId];
        else if (staticLabels[layerId]) groupName = staticLabels[layerId];

        if (groupName) {
            if (!stats[layerId]) stats[layerId] = { name: groupName, count: 0, items: [] };
            stats[layerId].items.push(f); 
        }
    });

    let html = '';
    let foundAny = false;

    const renderRow = (name, count, isGray = false) => {
        const colorStyle = isGray ? 'color: #999;' : '';
        return `<div class="count-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; ${colorStyle}">
                    <span style="flex: 1; padding-right: 12px; line-height: 1.3; word-break: break-word; white-space: normal;">${name}</span> 
                    <span style="font-weight: bold; white-space: nowrap;">${count}</span>
                </div>`;
    };

    if (hasSocioPop) { foundAny = true; html += `<div class="count-item"><div class="count-title">População Absoluta</div>${renderRow('Total na área', `${sumPop.toLocaleString('pt-BR')} hab`)}</div>`; }
    if (hasSocioDom) { foundAny = true; html += `<div class="count-item"><div class="count-title">Total de Domicílios</div>${renderRow('Total na área', `${sumDom.toLocaleString('pt-BR')} dom`)}</div>`; }

    if (hasIptu && iptuStats.count > 0) {
        foundAny = true;
        let totalTerr = 0; let sumMaxPavs = 0; let numPredios = terrenosAgrupados.size;
        terrenosAgrupados.forEach(val => { totalTerr += val.terr; sumMaxPavs += val.pav; });
        const totalConst = iptuStats.sumAreaConst.toLocaleString('pt-BR', {maximumFractionDigits: 0});
        const areaTerrLabel = totalTerr.toLocaleString('pt-BR', {maximumFractionDigits: 0});
        const avgPav = numPredios > 0 ? (sumMaxPavs / numPredios).toFixed(1).replace('.', ',') : 0;

        html += `<div class="count-item"><div class="count-title">Características dos Imóveis (Lotes: ${numPredios} | Regs: ${iptuStats.count})</div>`;
        html += renderRow('Área Constr. Total', `${totalConst} m²`);
        html += renderRow('Área de Terreno Total', `${areaTerrLabel} m²`);
        html += renderRow('Média de Pavimentos', `${avgPav} andares`);
        html += `</div>`;
    }

    if (stats['uso']) {
        foundAny = true;
        const usoCounts = {}; const uniqueGeoms = new Set();
        stats['uso'].items.forEach(f => {
            const uniqueId = JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties);
            if(!uniqueGeoms.has(uniqueId)){ uniqueGeoms.add(uniqueId); const desc = f.properties.tx_uso_h_p || "Outros"; usoCounts[desc] = (usoCounts[desc] || 0) + 1; }
        });
        const sortedUsos = Object.entries(usoCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">Uso do Solo (Lotes: ${uniqueGeoms.size})</div>`;
        sortedUsos.slice(0, 10).forEach(([name, count]) => { html += renderRow(name, count); });
        html += `</div>`;
        delete stats['uso'];
    }

    if (stats['tomb_orgao']) {
        foundAny = true;
        const tombCounts = {}; const uniqueGeoms = new Set();
        stats['tomb_orgao'].items.forEach(f => {
            const uniqueId = JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties);
            if(!uniqueGeoms.has(uniqueId)){ uniqueGeoms.add(uniqueId); const desc = f.properties.jurisdicao || "Outros"; tombCounts[desc] = (tombCounts[desc] || 0) + 1; }
        });
        const sortedTombs = Object.entries(tombCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">Bens Tombados (Jurisdição)</div>`;
        sortedTombs.forEach(([name, count]) => { html += renderRow(name, count); });
        html += `</div>`;
        delete stats['tomb_orgao'];
    }
    
    if (stats['tomb_geral']) {
        foundAny = true;
        const uniqueGeoms = new Set();
        stats['tomb_geral'].items.forEach(f => { uniqueGeoms.add(JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties)); });
        html += `<div class="count-item"><div class="count-title">Bens Tombados (Área Geral)</div>${renderRow('Imóveis/Áreas Protegidas', uniqueGeoms.size)}</div>`;
        delete stats['tomb_geral'];
    }

    if (stats['estab']) {
        foundAny = true;
        const cnaeCounts = {}; const uniqueGeoms = new Set();
        stats['estab'].items.forEach(f => {
            const uniqueId = JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties);
            if(!uniqueGeoms.has(uniqueId)){ uniqueGeoms.add(uniqueId); const desc = f.properties.desc_classe || "Não Informado"; cnaeCounts[desc] = (cnaeCounts[desc] || 0) + 1; }
        });
        const sortedCnaes = Object.entries(cnaeCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">Usos dos Estabelecimentos (Total: ${uniqueGeoms.size})</div>`;
        sortedCnaes.slice(0, 10).forEach(([name, count]) => { html += renderRow(name, count); });
        if (sortedCnaes.length > 10) {
            const rest = sortedCnaes.slice(10).reduce((acc, curr) => acc + curr[1], 0);
            html += renderRow("Outros...", rest, true);
        }
        html += `</div>`;
        delete stats['estab'];
    }

    for (const [id, layerData] of Object.entries(stats)) {
        foundAny = true;
        const registrosUnicos = new Set(layerData.items.map(f => JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties)));
        const locaisUnicos = new Set(layerData.items.map(f => JSON.stringify(f.geometry.coordinates)));
        
        const totalRegistros = registrosUnicos.size; const totalLocais = locaisUnicos.size;

        html += `<div class="count-item"><div class="count-title">${layerData.name}</div>`;
        if (totalRegistros > totalLocais) {
            html += renderRow('Locais Físicos', totalLocais);
            html += `<div class="count-row" style="color:#aaa; font-size:10px; margin-top:-4px;"><span>↳ Total de Equipamentos/Anexos</span> <span>${totalRegistros}</span></div>`;
        } else {
            html += renderRow('Quantidade', totalLocais);
        }
        html += `</div>`;
    }

    if (!foundAny) html = '<p style="text-align:center; color:#777;">Nenhum item encontrado no perímetro desenhado.</p>';
    resultsContent.innerHTML = html;
    resultsElement.style.display = 'flex';
}

window.closeResults = function() { 
    document.getElementById('results-card').style.display = 'none'; 
    clearLasso(); 
}

// --- UI E POPUPS ---
var hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: 'tooltip-popup' });
var currentClickPopup = null; 

window.showInfo = function(layerId) {
    const card = document.getElementById('info-card');
    if(!card) return;
    const meta = (typeof LAYER_DATA !== 'undefined' && LAYER_DATA[layerId]) ? LAYER_DATA[layerId] : { title: "Camada", source: "SP Parcerias", year: "2024", desc: "Descrição técnica em atualização." };
    document.getElementById('info-title').innerText = meta.title;
    document.getElementById('info-source').innerText = meta.source;
    document.getElementById('info-year').innerText = meta.year;
    document.getElementById('info-desc').innerText = meta.desc;
    card.style.display = 'block';
}
window.closeInfo = function() { document.getElementById('info-card').style.display = 'none'; }

let currentPin = null;
window.scrollShortcuts = function(dir) { document.getElementById('shortcuts-list').scrollBy({ left: 150 * dir, behavior: 'smooth' }); }
document.addEventListener("DOMContentLoaded", () => {
    const chips = document.querySelectorAll(".chip-btn");
    chips.forEach(btn => {
        const closeSpan = document.createElement("span"); closeSpan.innerHTML = "✕"; closeSpan.className = "close-mark";
        closeSpan.onclick = (e) => { e.stopPropagation(); removePin(); };
        btn.appendChild(closeSpan);
    });
});
window.flyToLocation = function(lat, lng, zoom, pitch, bearing, title, btnElement) {
    removePin();
    map.flyTo({ center: [lng, lat], zoom: zoom || 16, pitch: pitch || 60, bearing: bearing || -20, speed: 1.2, curve: 1.5 });
    if (title) { currentPin = new maplibregl.Marker({ color: "#2F80ED" }).setLngLat([lng, lat]).setPopup(new maplibregl.Popup({ offset: 25 }).setText(title)).addTo(map).togglePopup(); }
    if (btnElement) { btnElement.classList.add("active"); }
}
function removePin() { if (currentPin) { currentPin.remove(); currentPin = null; } document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active")); }

function setStyle(style) {
    document.getElementById('btn-mapa').classList.remove('active');
    document.getElementById('btn-satelite').classList.remove('active');
    if (style === 'satellite') {
        document.getElementById('btn-satelite').classList.add('active');
        if(map.getLayer('satellite-layer')) map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
    } else {
        document.getElementById('btn-mapa').classList.add('active');
        if(map.getLayer('satellite-layer')) map.setLayoutProperty('satellite-layer', 'visibility', 'none');
    }
}
window.toggleCat = function(id) { var content = document.getElementById(id); var header = content.previousElementSibling; if (content.style.display === "block") { content.style.display = "none"; header.classList.remove("open"); } else { content.style.display = "block"; header.classList.add("open"); } }

var layersByTab = {
    "tab-socio": ["socio_dens", "socio_pop", "socio_dom"],
    "tab-uso":   ["uso", "tomb_geral", "tomb_status", "tomb_orgao", "fav", "cort", "lote", "estab", "iptu"], 
    "tab-amb":   ["parques", "pracas", "arvores"],
    "tab-infra": [ "trans_metro_est", "trans_trem_est", "trans_metro_lin", "trans_trem_lin", "trans_bus_term", "trans_bus_pt", "trans_bike", "infra_abs_bomprato", "infra_abs_feira", "infra_abs_mercado", "infra_abs_sacolao", "infra_soc_equip", "infra_conc_parc", "infra_wifi", "infra_cult_biblio", "infra_cult_espaco", "infra_cult_museu", "infra_cult_teatro", "infra_edu_tecnico", "infra_edu_infantil", "infra_edu_outros", "infra_edu_privada", "infra_edu_publica", "infra_edu_sist_s", "infra_esp_centro", "infra_esp_clube", "infra_esp_cdc", "infra_esp_estadio", "infra_sau_ambul", "infra_sau_hosp", "infra_sau_outros", "infra_sau_mental", "infra_sau_ubs", "infra_sau_dst", "infra_sau_urgencia", "infra_seg_bombeiro", "infra_seg_gcm", "infra_seg_civil", "infra_seg_militar", "infra_serv_consulado", "infra_serv_correios", "infra_serv_poupatempo", "infra_serv_shopping" ]
};

function keepLabelsOnTop() { if (map.getLayer('dist_labels')) { map.moveLayer('dist_labels'); } }

function switchTab(tabId, btn) {
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");
    for (var tab in layersByTab) {
        if (tab !== tabId) {
            layersByTab[tab].forEach(layerId => {
                var chk = document.getElementById("chk-" + layerId);
                if(chk) chk.checked = false; setLayout(layerId, "none");
            });
        }
    }
    updateLegends(); checkTransparency(); keepLabelsOnTop();
    checkSelectButton(); 
}

window.clearCurrentTab = function() {
    const activePane = document.querySelector('.tab-pane.active');
    if (!activePane) return;
    const tabId = activePane.id;
    const layers = layersByTab[tabId];
    if (!layers) return;
    layers.forEach(layerId => {
        const chk = document.getElementById("chk-" + layerId);
        if (chk) { chk.checked = false; setLayout(layerId, "none"); }
    });
    updateLegends(); checkTransparency(); keepLabelsOnTop();
    checkSelectButton(); 
}

function flashLayer(id) {
    if (!map.getLayer(id)) return;
    const type = map.getLayer(id).type;
    const highlightColor = '#F1C40F';
    let propColor, propSize, originalColor, originalSize;
    let highlightSize;
    if (type === 'circle') { propColor = 'circle-color'; propSize = 'circle-radius'; highlightSize = 10; } else if (type === 'line') { propColor = 'line-color'; propSize = 'line-width'; highlightSize = 6; } else if (type === 'fill') { propColor = 'fill-color'; propSize = 'fill-opacity'; highlightSize = 0.9; } else { return; }
    originalColor = map.getPaintProperty(id, propColor);
    originalSize = map.getPaintProperty(id, propSize);
    const blink = (count) => {
        if (count <= 0) { map.setPaintProperty(id, propColor, originalColor); if (originalSize !== undefined) map.setPaintProperty(id, propSize, originalSize); return; }
        map.setPaintProperty(id, propColor, highlightColor); if (type !== 'fill') map.setPaintProperty(id, propSize, highlightSize);
        setTimeout(() => { map.setPaintProperty(id, propColor, originalColor); if (originalSize !== undefined) map.setPaintProperty(id, propSize, originalSize); setTimeout(() => { blink(count - 1); }, 300); }, 300);
    };
    blink(2);
}

function setLayout(id, vis) {
    if(map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    if(map.getLayer(id+"_l")) map.setLayoutProperty(id+"_l", "visibility", vis);
}

window.toggleL = function(id) {
    var chk = document.getElementById("chk-" + id);
    if (!chk) return;
    
    if (chk.checked) {
        if (id === 'iptu') {
            const conflictLayers = ["uso", "tomb_geral", "tomb_status", "tomb_orgao", "fav", "cort", "lote", "estab", "socio_dens", "socio_pop", "socio_dom"];
            conflictLayers.forEach(otherId => {
                const otherChk = document.getElementById("chk-" + otherId);
                if (otherChk && otherChk.checked) {
                    otherChk.checked = false;
                    setLayout(otherId, "none");
                }
            });
        } else {
            const iptuChk = document.getElementById("chk-iptu");
            if (iptuChk && iptuChk.checked) {
                iptuChk.checked = false;
                setLayout("iptu", "none");
            }
        }

        const socioIds = ['socio_dens', 'socio_pop', 'socio_dom'];
        if (socioIds.includes(id)) {
            const conflict = socioIds.find(otherId => { if (otherId === id) return false; const otherChk = document.getElementById('chk-' + otherId); return otherChk && otherChk.checked; });
            if (conflict) { alert(`Visualização Conflitante!`); chk.checked = false; return; }
        }
        
        if (['tomb_geral', 'tomb_status', 'tomb_orgao'].includes(id)) {
             const tombIds = ['tomb_geral', 'tomb_status', 'tomb_orgao'];
             tombIds.forEach(otherId => { if (otherId !== id) { const otherChk = document.getElementById('chk-' + otherId); if (otherChk && otherChk.checked) { otherChk.checked = false; setLayout(otherId, "none"); } } });
        }
    }

    var vis = chk.checked ? "visible" : "none";
    setLayout(id, vis);
    if (chk.checked) { flashLayer(id); if (map.getLayer(id + "_l")) flashLayer(id + "_l"); }
    updateLegends(); checkTransparency(); keepLabelsOnTop();
    checkSelectButton(); 
}

function checkTransparency() {
    if (!map.getLayer('edif')) return;
    const activeTabPane = document.querySelector('.tab-pane.active');
    const activeTabId = activeTabPane ? activeTabPane.id : null;
    let targetOpacity = 0.9;
    if (activeTabId === 'tab-infra') {
        const infraLayers = layersByTab["tab-infra"];
        if (infraLayers.some(id => document.getElementById("chk-" + id)?.checked)) targetOpacity = 0.15; 
    } else {
        const groundLayers = ["socio_dens", "socio_pop", "socio_dom", "fav", "cort", "lote", "uso", "parques", "pracas", "arvores", "tomb_geral", "tomb_status", "tomb_orgao", "estab", "iptu"];
        if (groundLayers.some(id => document.getElementById("chk-" + id)?.checked)) targetOpacity = 0.15;
    }
    map.setPaintProperty('edif', 'fill-extrusion-opacity-transition', { duration: 300 });
    map.setPaintProperty('edif', 'fill-extrusion-opacity', targetOpacity);
}

function updateLegends() {
    var edif = document.getElementById("chk-edif")?.checked;
    document.getElementById("legenda-altura").style.display = edif ? "block" : "none";
    var uso = document.getElementById("chk-uso")?.checked;
    document.getElementById("legenda-uso").style.display = uso ? "block" : "none";
    var hab = ["chk-fav", "chk-cort", "chk-lote"].some(id => document.getElementById(id)?.checked);
    document.getElementById("legenda-hab").style.display = hab ? "block" : "none";
    var tGeral = document.getElementById("chk-tomb_geral")?.checked;
    if(document.getElementById("legenda-tomb-geral")) document.getElementById("legenda-tomb-geral").style.display = tGeral ? "block" : "none";
    var tStatus = document.getElementById("chk-tomb_status")?.checked;
    if(document.getElementById("legenda-tomb-status")) document.getElementById("legenda-tomb-status").style.display = tStatus ? "block" : "none";
    var tOrgao = document.getElementById("chk-tomb_orgao")?.checked;
    if(document.getElementById("legenda-tomb-orgao")) document.getElementById("legenda-tomb-orgao").style.display = tOrgao ? "block" : "none";
    var socioDens = document.getElementById("chk-socio_dens")?.checked;
    if(document.getElementById("legenda-socio")) document.getElementById("legenda-socio").style.display = socioDens ? "block" : "none";
    var socioPop = document.getElementById("chk-socio_pop")?.checked;
    if(document.getElementById("legenda-socio-pop")) document.getElementById("legenda-socio-pop").style.display = socioPop ? "block" : "none";
    var socioDom = document.getElementById("chk-socio_dom")?.checked;
    if(document.getElementById("legenda-socio-dom")) document.getElementById("legenda-socio-dom").style.display = socioDom ? "block" : "none";
    
    var estab = document.getElementById("chk-estab")?.checked;
    if(document.getElementById("legenda-estab-explica"))
        document.getElementById("legenda-estab-explica").style.display = estab ? "block" : "none";

    var iptu = document.getElementById("chk-iptu")?.checked;
    if(document.getElementById("legenda-iptu-explica"))
        document.getElementById("legenda-iptu-explica").style.display = iptu ? "block" : "none";
}

function addTooltip(layerId, propName) {
    if (layerId === 'estab' || layerId === 'iptu') {
        map.on('click', layerId, (e) => {
            if (isSelecting) return;
            
            const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
            if (!features.length) return;
            
            if (currentClickPopup) { currentClickPopup.remove(); currentClickPopup = null; }
            
            let headerColor = (layerId === 'estab') ? "#1ABC9C" : "#2980B9"; 
            let titleText = (layerId === 'estab') ? "USOS DOS ESTABELECIMENTOS" : "CARACTERÍSTICAS DOS IMÓVEIS";
            const fmt = (n) => n ? parseFloat(n).toLocaleString('pt-BR', {maximumFractionDigits: 0}) : '-';

            let totalUnidades = features.length;
            let enderecosUnicos = new Set();
            let areaConstruidaTotal = 0;
            let areaTerrenoMax = 0;
            let pavimentosMax = 0;
            let geocodeScore = 0; 
            
            let estabListString = "";
            let processedItems = new Set(); 

            features.forEach(f => {
                const p = f.properties;
                const uniqueId = JSON.stringify(f.geometry.coordinates) + '_' + JSON.stringify(f.properties);
                
                if (!processedItems.has(uniqueId)) {
                    processedItems.add(uniqueId);
                    
                    if (layerId === 'estab') {
                        const endereco = p['endereco_completo'] || p['endereco'] || '-';
                        const cnae_desc = p['desc_classe'] || "Atividade Não Informada";
                        const rawPrecisao = p['precisao'] || p['precisão'] || '';
                        const dictPrecisao = { "numero": "🟢 Exata", "numero_aproximado": "🟡 Aproximada", "logradouro": "🟠 Rua", "cep": "🔴 Genérica", "localidade": "🔴 Genérica", "municipio": "🔴 Genérica" };
                        const txtPrecisao = dictPrecisao[rawPrecisao] || rawPrecisao || '-';

                        estabListString += `<li style="margin-bottom:12px; color:#eee; border-bottom:1px solid #444; padding-bottom:8px;">
                            <div style="font-weight:bold; color:#fff; font-size:12px; margin-bottom:4px; line-height:1.3;">${cnae_desc}</div>
                            <div style="margin-bottom:3px; font-size:11px;">📍 <span style="color:#ccc;">${endereco}</span></div>
                            <div style="font-size:11px;">🎯 <b>Geolocalização:</b> <span style="color:#FFD700;">${txtPrecisao}</span></div>
                        </li>`;
                    } 
                    else {
                        const end = (p['logradouro'] || '') + ', ' + (p['numero'] || 'S/N');
                        const endLimpo = end.replace(/^, /, "").trim();
                        if(endLimpo.length > 3) enderecosUnicos.add(endLimpo);

                        if(p['area_construida']) areaConstruidaTotal += parseFloat(p['area_construida']);
                        if(p['area_terreno']) areaTerrenoMax = Math.max(areaTerrenoMax, parseFloat(p['area_terreno']));
                        if(p['num_pavimentos']) pavimentosMax = Math.max(pavimentosMax, parseFloat(p['num_pavimentos']));

                        const prec = (p['precisao'] || '').toLowerCase();
                        if (prec.includes('rooftop') || prec.includes('exact') || prec.includes('high') || (p['numero'] && p['numero'] !== '0' && p['numero'] !== '')) {
                            geocodeScore++;
                        }
                    }
                }
            });

            let htmlContent = `<div style="border-bottom: 2px solid ${headerColor}; margin-bottom: 8px; font-weight:bold; font-size:12px; color:${headerColor}; text-transform:uppercase;">${titleText}</div>`;
            
            if (layerId === 'estab') {
                 htmlContent += `<div style="margin-bottom:8px;"><b>${processedItems.size}</b> usos encontrados neste local.</div>`;
                 htmlContent += `<ul style="margin:0; padding-left:0; list-style-type: none; max-height:200px; overflow-y:auto;">${estabListString}</ul>`;
            } else {
                let listaEnderecos = Array.from(enderecosUnicos).sort();
                let displayEnd = "";
                let qtdEnderecos = enderecosUnicos.size;
                let pctTecnica = Math.round((geocodeScore / processedItems.size) * 100);
                
                let corBarra, textoBarra;
                if (qtdEnderecos > 1) {
                    corBarra = '#F39C12'; textoBarra = `Aglomerado (${qtdEnderecos} endereços)`;
                } else if (pctTecnica < 60) {
                    corBarra = '#E74C3C'; textoBarra = `Baixa (${pctTecnica}%)`;
                } else {
                    corBarra = '#27AE60'; textoBarra = `Exata (Lote Único)`;
                }
                
                if (listaEnderecos.length === 1) {
                    displayEnd = `<div style="font-size:13px; color:#fff; font-weight:bold; margin-bottom:5px;">📍 ${listaEnderecos[0]}</div>`;
                } else {
                    displayEnd = `<div style="font-size:11px; color:#F39C12; font-weight:bold; margin-bottom:4px;">⚠️ Múltiplos Endereços (${listaEnderecos.length}):</div>
                                  <div style="font-size:11px; color:#ddd; margin-bottom:8px; max-height:80px; overflow-y:auto; border-left:2px solid #F39C12; padding-left:5px; background:rgba(0,0,0,0.2);">
                                    ${listaEnderecos.map(e => `• ${e}`).join('<br>')}
                                  </div>`;
                }

                htmlContent += `
                    ${displayEnd}
                    <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:4px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>🏢 <b>Registros (IPTU):</b></span> <span style="color:#fff; font-weight:bold;">${processedItems.size}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>🏗️ <b>Área Constr. Total:</b></span> <span style="color:#fff;">${fmt(areaConstruidaTotal)} m²</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>📐 <b>Área do Terreno:</b></span> <span style="color:#fff;">${fmt(areaTerrenoMax)} m²</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>⬆️ <b>Pavimentos (Máx):</b></span> <span style="color:#fff;">${fmt(pavimentosMax)}</span>
                        </div>
                    </div>
                    <div style="font-size:10px; color:#aaa; border-top:1px dashed #555; padding-top:5px; display:flex; align-items:center; justify-content:space-between;">
                        <span>Precisão Espacial:</span>
                        <span style="color:${corBarra}; font-weight:bold; border:1px solid ${corBarra}; padding:1px 6px; border-radius:4px;">
                            ${textoBarra}
                        </span>
                    </div>
                `;
            }

            currentClickPopup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, className: 'sticky-popup', maxWidth: '320px' })
            .setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
            currentClickPopup.on('close', () => { currentClickPopup = null; });
        });
        
        map.on('mouseenter', layerId, () => { if(!isSelecting) map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, () => { if(!isSelecting) map.getCanvas().style.cursor = ''; });
    } else {
        map.on('mousemove', layerId, (e) => {
            if (isSelecting) return;
            map.getCanvas().style.cursor = 'pointer';
            const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
            if (!features.length) return;
            
            let title = "ITEM ENCONTRADO"; let layerColor = '#333';
            if (map.getLayer(layerId)) { const p = map.getLayer(layerId).paint; if(p['fill-color']) layerColor = p['fill-color']; else if(p['circle-color']) layerColor = p['circle-color']; }
            if (Array.isArray(layerColor)) layerColor = "#aaa"; 
            if (layerId.includes('tomb')) title = "BEM TOMBADO"; if (layerId === 'fav') title = "FAVELA"; if (layerId === 'uso') title = "USO DO SOLO";
            
            let htmlContent = `<div style="border-bottom: 2px solid ${layerColor}; margin-bottom: 6px; font-weight:bold; font-size:11px; color:#ffffff; text-transform:uppercase;">${title}</div><ul style="margin:0; padding-left:15px; list-style-type: disc;">`;
            let processedNames = new Set();
            features.forEach(f => {
                const props = f.properties;
                let nome = props[propName] || "Sem nome";
                nome = nome.replace(/Ã\?/g, "Ç").replace(/Ã\s/g, "Ã");
                
                if (layerId.includes('tomb') && props['bp_nome']) {
                    nome = props['bp_nome']; 
                }

                if (!processedNames.has(nome)) { processedNames.add(nome); htmlContent += `<li style="margin-bottom:3px; color:#fff;">${nome}</li>`; }
            });
            htmlContent += `</ul>`;
            hoverPopup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
        });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; hoverPopup.remove(); });
    }
}

map.on("load", function () {
    map.addSource('satellite-source', { 'type': 'raster', 'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], 'tileSize': 256, 'attribution': '&copy; Esri', 'maxzoom': 17 });
    map.addLayer({ 'id': 'satellite-layer', 'type': 'raster', 'source': 'satellite-source', 'paint': {}, 'layout': { 'visibility': 'none' }});
    try {
        if (typeof initUso === "function") initUso(map);
        if (typeof initAmb === "function") initAmb(map);
        if (typeof initInfra === "function") initInfra(map);
        if (typeof initSocio === "function") initSocio(map); 
        if(typeof data.dist !== 'undefined' && data.dist !== 'null') { map.addSource("dist", {type:"geojson", data:data.dist}); map.addLayer({ id: "dist", type: "line", source: "dist", paint: { "line-color": "#7570b3", "line-width": 2, "line-dasharray": [2, 2] }, layout: { visibility: "none" } }); }
        if(typeof data.piu !== 'undefined' && data.piu !== 'null') { map.addSource("piu", {type:"geojson", data:data.piu}); map.addLayer({ id: "piu", type: "line", source: "piu", paint: {"line-color": "#FF0000", "line-width": 3}, layout: {visibility: "visible"} }); }
        if(typeof data.tri !== 'undefined' && data.tri !== 'null') { map.addSource("tri", {type:"geojson", data:data.tri}); map.addLayer({ id: "tri", type: "line", source: "tri", paint: {"line-color": "#000", "line-width": 2}, layout: {visibility: "none"} }); }
        
        if(typeof data.edif !== 'undefined' && data.edif !== 'null') {
             map.addSource("edif", {type:"geojson", data:data.edif});
             map.addLayer({
                 id: "edif",
                 type: "fill-extrusion",
                 source: "edif",
                 paint: {
                     "fill-extrusion-color": ["get", "cor_hex"],
                     "fill-extrusion-height": ["get", "altura"],
                     "fill-extrusion-base": 0,
                     "fill-extrusion-opacity": 0.9
                 },
                 layout: { visibility: "none" } 
             });
        }

        setStyle('mapa'); updateLegends(); checkTransparency(); keepLabelsOnTop(); 
        map.jumpTo({ center: [-46.633, -23.550], zoom: 12, pitch: 0, bearing: 0 });
        setTimeout(() => { map.flyTo({ center: [-46.633, -23.550], zoom: 14.5, pitch: 55, bearing: -20, speed: 0.5, curve: 1 }); }, 800);
        checkSelectButton(); 
    } catch (erro) { console.error("ERRO CRÍTICO:", erro); }
    document.getElementById('loader').style.opacity = '0'; setTimeout(() => { document.getElementById('loader').style.display = 'none'; }, 500);
});

const input = document.getElementById("search-input"); const suggestionsBox = document.getElementById("suggestions"); const clearBtn = document.getElementById("clear-btn"); let marker = null; let debounceTimer; function toggleClearBtn() { clearBtn.style.display = (input.value.length > 0 || marker !== null) ? "block" : "none"; } clearBtn.addEventListener("click", function() { input.value = ""; suggestionsBox.style.display = "none"; if (marker) { marker.remove(); marker = null; } toggleClearBtn(); }); input.addEventListener("input", function() { toggleClearBtn(); clearTimeout(debounceTimer); if (this.value.length < 3) { suggestionsBox.style.display = "none"; return; } debounceTimer = setTimeout(() => { fetch("https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + encodeURIComponent(this.value + ", São Paulo")).then(res => res.json()).then(data => { suggestionsBox.innerHTML = ""; if(data.length){ suggestionsBox.style.display = "block"; data.forEach(p => { let div = document.createElement("div"); div.className = "suggestion-item"; div.innerText = p.display_name.split(",")[0]; div.onclick = () => { map.flyTo({center:[p.lon, p.lat], zoom:18, pitch:60}); if(marker) marker.remove(); marker = new maplibregl.Marker({color: "#EB5757"}).setLngLat([p.lon, p.lat]).setPopup(new maplibregl.Popup().setText(p.display_name.split(",")[0])).addTo(map).togglePopup(); suggestionsBox.style.display = "none"; input.value = p.display_name.split(",")[0]; toggleClearBtn(); }; suggestionsBox.appendChild(div); }); } }); }, 500); }); document.addEventListener("click", function(e) { if (e.target !== input && e.target !== suggestionsBox && e.target !== clearBtn) { suggestionsBox.style.display = "none"; } });