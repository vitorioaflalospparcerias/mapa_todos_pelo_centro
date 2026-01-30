/* ARQUIVO: assets/app.js */

var map = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    center: [-46.633, -23.550], zoom: 14, pitch: 45, bearing: -20, maxZoom: 18,
    preserveDrawingBuffer: true,
    dragBox: false, boxZoom: false 
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

// BOTÕES CUSTOMIZADOS
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
        this.btn.title = 'Selecionar Área (Ative uma camada para usar)';
        this.btn.style.fontSize = '18px';
        this.btn.style.cursor = 'pointer';
        this.btn.innerHTML = '⛝'; 
        this.btn.onclick = () => { toggleSelectMode(this.btn); };
        this.btn.classList.add('btn-disabled'); // Começa desabilitado
        this.container.appendChild(this.btn);
        return this.container;
    }
    onRemove() { this.container.parentNode.removeChild(this.container); }
}

map.addControl(new HomeButton(), "top-right");
map.addControl(new SelectButton(), "top-right");
map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

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

// --- LÓGICA DE SELEÇÃO ---
let isSelecting = false;
let startPoint = null;
let currentPoint = null;
let boxElement = document.getElementById('selection-box');
let resultsElement = document.getElementById('results-card');
let resultsContent = document.getElementById('results-content');
let selectBtnRef = null;

// Inicializa redimensionamento
makeResizable(resultsElement);

function toggleSelectMode(btn) {
    if (btn.classList.contains('btn-disabled')) return; // Bloqueia se desabilitado

    isSelecting = !isSelecting;
    selectBtnRef = btn;
    if (isSelecting) {
        btn.classList.add('select-btn-active');
        map.getCanvas().style.cursor = 'crosshair';
        map.dragPan.disable();
        resultsElement.style.display = 'none';
    } else {
        btn.classList.remove('select-btn-active');
        map.getCanvas().style.cursor = '';
        map.dragPan.enable();
        boxElement.style.display = 'none';
    }
}

// Verifica se há camadas de dados ativas para habilitar o botão
function checkSelectButton() {
    const btn = document.getElementById('btn-selection-tool');
    if (!btn) return;

    let allDataLayers = [];
    for (let key in layersByTab) {
        allDataLayers = allDataLayers.concat(layersByTab[key]);
    }

    let hasActiveLayer = allDataLayers.some(id => {
        // Ignora densidade demográfica (socio_dens) para ativação do botão
        if (id === 'socio_dens') return false;
        return map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible';
    });

    if (hasActiveLayer) {
        btn.classList.remove('btn-disabled');
        btn.title = 'Selecionar Área';
    } else {
        btn.classList.add('btn-disabled');
        btn.title = 'Ative uma camada para usar a seleção';
        
        // --- CORREÇÃO DO BUG ---
        // Se desabilitar, FORÇA SAÍDA do modo de seleção IMEDIATAMENTE
        isSelecting = false; 
        if(selectBtnRef) selectBtnRef.classList.remove('select-btn-active');
        map.getCanvas().style.cursor = '';
        map.dragPan.enable();
        boxElement.style.display = 'none';
        
        closeResults();
    }
}

map.on('mousedown', (e) => {
    if (!isSelecting) return;
    startPoint = e.point;
    currentPoint = e.point;
    boxElement.style.display = 'block';
    updateBox();
});

map.on('mousemove', (e) => {
    if (!isSelecting || !startPoint) return;
    currentPoint = e.point;
    updateBox();
});

map.on('mouseup', (e) => {
    if (!isSelecting || !startPoint) return;
    finishSelection(startPoint, e.point);
    startPoint = null;
    currentPoint = null;
    boxElement.style.display = 'none';
    toggleSelectMode(selectBtnRef); 
});

function updateBox() {
    const minX = Math.min(startPoint.x, currentPoint.x);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxY = Math.max(startPoint.y, currentPoint.y);
    boxElement.style.left = minX + 'px';
    boxElement.style.top = minY + 'px';
    boxElement.style.width = (maxX - minX) + 'px';
    boxElement.style.height = (maxY - minY) + 'px';
}

function finishSelection(p1, p2) {
    if (Math.abs(p1.x - p2.x) < 5 && Math.abs(p1.y - p2.y) < 5) return;
    const bbox = [[Math.min(p1.x, p2.x), Math.min(p1.y, p2.y)], [Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)]];
    const features = map.queryRenderedFeatures(bbox);
    calculateStats(features);
}

function calculateStats(features) {
    const stats = {};
    const staticLabels = { 
        'estab':'Estabelecimentos', 
        'fav':'Favelas', 'cort':'Cortiços', 'lote':'Loteamentos', 
        'parques':'Parques', 'pracas':'Praças', 'arvores':'Árvores', 
        'tomb_status':'Bens Tombados',
        'uso': 'Uso do Solo',
        'tomb_orgao': 'Tombamento (Jurisdição)',
        // Não precisamos de map para pop/dom aqui pq tratamos separado
    };
    
    // VARIÁVEIS PARA SOMA
    let sumPop = 0;
    let sumDom = 0;
    let hasSocioPop = false;
    let hasSocioDom = false;
    let processedIds = new Set(); // Para evitar somar o mesmo polígono 2x se ele estiver em 2 tiles

    features.forEach(f => {
        const layerId = f.layer.id;
        
        // Ignora densidade demográfica
        if (layerId === 'socio_dens') return;

        // LÓGICA DE SOMA (População e Domicílios)
        if (layerId === 'socio_pop' || layerId === 'socio_dom') {
            // Cria ID único baseado nas coordenadas ou ID da feature para deduplicar
            // (Tiles cortam polígonos, queryRenderedFeatures pode pegar pedaços)
            // Se o GeoJSON tiver IDs é melhor, senão usamos string da geometria
            const uniqueId = layerId + '_' + (f.id || JSON.stringify(f.geometry.coordinates[0][0])); 
            
            if (!processedIds.has(uniqueId)) {
                processedIds.add(uniqueId);
                
                // Pega valor numérico das propriedades
                if (layerId === 'socio_pop') { 
                    sumPop += (f.properties.populacao || 0); 
                    hasSocioPop = true; 
                }
                if (layerId === 'socio_dom') { 
                    sumDom += (f.properties.domicilios || 0); 
                    hasSocioDom = true; 
                }
            }
            return; // Pula resto da lógica para essas camadas
        }

        let groupName = null;
        if (typeof infraLabels !== 'undefined' && infraLabels[layerId]) {
            groupName = infraLabels[layerId];
        } else if (staticLabels[layerId]) {
            groupName = staticLabels[layerId];
        }

        if (groupName) {
            if (!stats[layerId]) stats[layerId] = { name: groupName, count: 0, items: [] };
            stats[layerId].items.push(f);
        }
    });

    let html = '';
    let foundAny = false;

    // 1. EXIBE RESULTADOS SOMA SOCIO
    if (hasSocioPop) {
        foundAny = true;
        html += `<div class="count-item"><div class="count-title">População Absoluta</div><div class="count-row"><span>Total na área</span> <span>${sumPop.toLocaleString('pt-BR')} hab</span></div></div>`;
    }
    if (hasSocioDom) {
        foundAny = true;
        html += `<div class="count-item"><div class="count-title">Total de Domicílios</div><div class="count-row"><span>Total na área</span> <span>${sumDom.toLocaleString('pt-BR')} dom</span></div></div>`;
    }

    // 2. EXIBE USO DO SOLO (Agrupa por tipo)
    if (stats['uso']) {
        foundAny = true;
        const usos = stats['uso'].items;
        const usoCounts = {};
        const uniqueGeoms = new Set();
        
        usos.forEach(f => {
            // Deduplica geometries
            const geomKey = JSON.stringify(f.geometry.coordinates);
            if(!uniqueGeoms.has(geomKey)){
                uniqueGeoms.add(geomKey);
                const desc = f.properties.tx_uso_h_p || "Outros";
                usoCounts[desc] = (usoCounts[desc] || 0) + 1;
            }
        });
        
        const sortedUsos = Object.entries(usoCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">Uso do Solo (Lotes: ${uniqueGeoms.size})</div>`;
        sortedUsos.slice(0, 10).forEach(([name, count]) => {
            html += `<div class="count-row"><span>${name}</span> <span>${count}</span></div>`;
        });
        html += `</div>`;
        delete stats['uso'];
    }

    // 3. EXIBE TOMBAMENTO POR JURISDIÇÃO
    if (stats['tomb_orgao']) {
        foundAny = true;
        const tombs = stats['tomb_orgao'].items;
        const tombCounts = {};
        const uniqueGeoms = new Set();

        tombs.forEach(f => {
            const geomKey = JSON.stringify(f.geometry.coordinates);
            if(!uniqueGeoms.has(geomKey)){
                uniqueGeoms.add(geomKey);
                const desc = f.properties.jurisdicao || "Outros";
                tombCounts[desc] = (tombCounts[desc] || 0) + 1;
            }
        });

        const sortedTombs = Object.entries(tombCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">Tombamento (Jurisdição)</div>`;
        sortedTombs.forEach(([name, count]) => {
            html += `<div class="count-row"><span>${name}</span> <span>${count}</span></div>`;
        });
        html += `</div>`;
        delete stats['tomb_orgao'];
    }

    // 4. EXIBE ESTABELECIMENTOS
    if (stats['estab']) {
        foundAny = true;
        const estabs = stats['estab'].items;
        const cnaeCounts = {};
        estabs.forEach(f => {
            const desc = f.properties.desc_classe || "Não Informado";
            cnaeCounts[desc] = (cnaeCounts[desc] || 0) + 1;
        });
        const sortedCnaes = Object.entries(cnaeCounts).sort((a,b) => b[1] - a[1]);
        html += `<div class="count-item"><div class="count-title">🏪 Estabelecimentos (Total: ${estabs.length})</div>`;
        sortedCnaes.slice(0, 10).forEach(([name, count]) => {
            html += `<div class="count-row"><span>${name.substring(0, 40)}${name.length>40?'...':''}</span> <span>${count}</span></div>`;
        });
        if (sortedCnaes.length > 10) {
            const rest = sortedCnaes.slice(10).reduce((acc, curr) => acc + curr[1], 0);
            html += `<div class="count-row" style="color:#999;"><span>Outros...</span> <span>${rest}</span></div>`;
        }
        html += `</div>`;
        delete stats['estab'];
    }

    // 5. RESTO (Infra, Habitação, etc)
    for (const [id, data] of Object.entries(stats)) {
        foundAny = true;
        // Deduplica contagem por geometria
        const uniqueSet = new Set(data.items.map(f => JSON.stringify(f.geometry.coordinates)));
        html += `<div class="count-item"><div class="count-title">${data.name}</div><div class="count-row"><span>Quantidade</span> <span>${uniqueSet.size}</span></div></div>`;
    }

    if (!foundAny) html = '<p style="text-align:center; color:#777;">Nenhum item das camadas ativas encontrado nesta área.</p>';
    
    resultsContent.innerHTML = html;
    resultsElement.style.display = 'flex';
}

window.closeResults = function() { document.getElementById('results-card').style.display = 'none'; }

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

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
toggleBtn.addEventListener('click', () => { sidebar.classList.toggle('collapsed'); toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '»' : '«'; });

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
    "tab-uso":   ["uso", "tomb_status", "tomb_orgao", "fav", "cort", "lote", "estab"], 
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
    checkSelectButton(); // <<< CHECA BOTÃO
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
    checkSelectButton(); // <<< CHECA BOTÃO
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
        const socioIds = ['socio_dens', 'socio_pop', 'socio_dom'];
        if (socioIds.includes(id)) {
            const conflict = socioIds.find(otherId => { if (otherId === id) return false; const otherChk = document.getElementById('chk-' + otherId); return otherChk && otherChk.checked; });
            if (conflict) { alert(`Visualização Conflitante!`); chk.checked = false; return; }
        }
        const tombIds = ['tomb_status', 'tomb_orgao'];
        if (tombIds.includes(id)) {
            tombIds.forEach(otherId => { if (otherId !== id) { const otherChk = document.getElementById('chk-' + otherId); if (otherChk && otherChk.checked) { otherChk.checked = false; setLayout(otherId, "none"); } } });
        }
    }
    var vis = chk.checked ? "visible" : "none";
    setLayout(id, vis);
    if (chk.checked) { flashLayer(id); if (map.getLayer(id + "_l")) flashLayer(id + "_l"); }
    updateLegends(); checkTransparency(); keepLabelsOnTop();
    checkSelectButton(); // <<< CHECA BOTÃO
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
        const groundLayers = ["socio_dens", "socio_pop", "socio_dom", "fav", "cort", "lote", "uso", "parques", "pracas", "arvores", "tomb", "tomb_status", "tomb_orgao", "estab"];
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
    var note = document.getElementById("nota-sobreposicao");
    if(note) note.style.display = estab ? "block" : "none";
}

function addTooltip(layerId, propName) {
    if (layerId === 'estab') {
        map.on('click', layerId, (e) => {
            if (isSelecting) return;
            const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
            if (!features.length) return;
            if (currentClickPopup) { currentClickPopup.remove(); currentClickPopup = null; }
            const dictPrecisao = { "numero": "🟢 Exata", "numero_aproximado": "🟡 Aproximada", "logradouro": "🟠 Rua", "cep": "🔴 Genérica", "localidade": "🔴 Genérica", "municipio": "🔴 Genérica" };
            let htmlContent = `<div style="border-bottom: 2px solid #1ABC9C; margin-bottom: 8px; font-weight:bold; font-size:12px; color:#1ABC9C; text-transform:uppercase;">ESTABELECIMENTOS NO LOCAL</div><ul style="margin:0; padding-left:0; list-style-type: none;">`;
            let processedNames = new Set();
            features.forEach(f => {
                const props = f.properties;
                let uniqueKey = JSON.stringify(props);
                if (!processedNames.has(uniqueKey)) {
                    processedNames.add(uniqueKey);
                    const endereco = props['endereco_completo'] || props['endereco'] || '-';
                    const cnae_desc = props['desc_classe'] || "Atividade Não Informada";
                    const rawPrecisao = props['precisao'] || props['precisão'] || '';
                    const txtPrecisao = dictPrecisao[rawPrecisao] || rawPrecisao || '-';
                    htmlContent += `<li style="margin-bottom:12px; color:#eee; border-bottom:1px solid #444; padding-bottom:8px;">
                        <div style="font-weight:bold; color:#fff; font-size:12px; margin-bottom:4px; line-height:1.3;">${cnae_desc}</div>
                        <div style="margin-bottom:3px; font-size:11px;">📍 <span style="color:#ccc;">${endereco}</span></div>
                        <div style="font-size:11px;">🎯 <b>Geolocalização:</b> <span style="color:#FFD700;">${txtPrecisao}</span></div>
                    </li>`;
                }
            });
            htmlContent += `</ul><div style="margin-top:10px; padding-top:8px; border-top: 1px dashed #666; font-size:10px; color:#aaa; line-height:1.3;"><b>Entenda a Precisão:</b><br>Exata (Lote) vs Aproximada (Rua/CEP).</div>`;
            currentClickPopup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, className: 'sticky-popup', maxWidth: '340px' })
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
        if(typeof data.dist !== 'undefined') { map.addSource("dist", {type:"geojson", data:data.dist}); map.addLayer({ id: "dist", type: "line", source: "dist", paint: { "line-color": "#7570b3", "line-width": 2, "line-dasharray": [2, 2] }, layout: { visibility: "none" } }); }
        if(typeof data.piu !== 'undefined') { map.addSource("piu", {type:"geojson", data:data.piu}); map.addLayer({ id: "piu", type: "line", source: "piu", paint: {"line-color": "#FF0000", "line-width": 3}, layout: {visibility: "visible"} }); }
        if(typeof data.tri !== 'undefined') { map.addSource("tri", {type:"geojson", data:data.tri}); map.addLayer({ id: "tri", type: "line", source: "tri", paint: {"line-color": "#000", "line-width": 2}, layout: {visibility: "none"} }); }
        
        // --- RECUPERANDO A CAMADA DE EDIFICAÇÕES 3D (CORREÇÃO) ---
        if(typeof data.edif !== 'undefined') {
             map.addSource("edif", {type:"geojson", data:data.edif});
             map.addLayer({
                 id: "edif",
                 type: "fill-extrusion", // <--- AQUI ESTÁ O 3D DE VOLTA!
                 source: "edif",
                 paint: {
                     "fill-extrusion-color": ["get", "cor_hex"],
                     "fill-extrusion-height": ["get", "altura"],
                     "fill-extrusion-base": 0,
                     "fill-extrusion-opacity": 0.9
                 },
                 layout: { visibility: "visible" }
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