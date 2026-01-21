/* ARQUIVO: assets/app.js */

// --- 1. INICIALIZAÇÃO DO MAPA ---
var map = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    center: [-46.633, -23.550], zoom: 14, pitch: 45, bearing: -20, maxZoom: 18
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

// Home Button
class HomeButton {
    onAdd(map) {
        this.map = map;
        this.container = document.createElement('div');
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this.container.innerHTML = '<button type="button" title="Voltar ao Centro" style="font-size:16px; cursor:pointer;">🏠</button>';
        this.container.onclick = () => { this.map.flyTo({ center: [-46.633, -23.550], zoom: 14, pitch: 45, bearing: -20 }); };
        return this.container;
    }
    onRemove() { this.container.parentNode.removeChild(this.container); this.map = undefined; }
}
map.addControl(new HomeButton(), "top-right");
map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

var hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: 'tooltip-popup' });

// --- UI ---
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '»' : '«';
});

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

// Acordeão
window.toggleCat = function(id) {
    var content = document.getElementById(id);
    var header = content.previousElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
        header.classList.remove("open");
    } else {
        content.style.display = "block";
        header.classList.add("open");
    }
}

// --- CONFIGURAÇÃO DAS ABAS (ATUALIZADA COM TRANSPORTE) ---
var layersByTab = {
    "tab-socio": [],
    "tab-uso":   ["uso", "tomb", "fav", "cort", "lote"],
    "tab-amb":   ["parques", "pracas", "arvores"],
    
    // LISTA COMPLETA DE INFRAESTRUTURA (Incluindo Transporte agora)
    "tab-infra": [
        // Transporte (NOVO)
        "trans_metro_est", "trans_trem_est", "trans_metro_lin", "trans_trem_lin", 
        "trans_bus_term", "trans_bus_pt", "trans_bike",

        // Equipamentos Originais
        "infra_abs_bomprato", "infra_abs_feira", "infra_abs_mercado", "infra_abs_sacolao",
        "infra_soc_equip", "infra_conc_parc", "infra_wifi",
        "infra_cult_biblio", "infra_cult_espaco", "infra_cult_museu", "infra_cult_teatro",
        "infra_edu_tecnico", "infra_edu_infantil", "infra_edu_outros", "infra_edu_privada", "infra_edu_publica", "infra_edu_sist_s",
        "infra_esp_centro", "infra_esp_clube", "infra_esp_cdc", "infra_esp_estadio",
        "infra_sau_ambul", "infra_sau_hosp", "infra_sau_outros", "infra_sau_mental", "infra_sau_ubs", "infra_sau_dst", "infra_sau_urgencia",
        "infra_seg_bombeiro", "infra_seg_gcm", "infra_seg_civil", "infra_seg_militar",
        "infra_serv_descomplica", "infra_serv_consulado", "infra_serv_correios", "infra_serv_poupatempo", "infra_serv_receita", "infra_serv_sabesp", "infra_serv_shopping"
    ]
};

function switchTab(tabId, btn) {
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");

    for (var tab in layersByTab) {
        if (tab !== tabId) {
            layersByTab[tab].forEach(layerId => {
                var chk = document.getElementById("chk-" + layerId);
                if(chk) chk.checked = false; 
                setLayout(layerId, "none");
            });
        }
    }
    updateLegends();
    checkTransparency();
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
    updateLegends();
    checkTransparency();
}

// Navegação
window.flyToLocation = function(lat, lng, zoom, pitch, bearing) {
    map.flyTo({ center: [lng, lat], zoom: zoom || 16, pitch: pitch || 60, bearing: bearing || -20, speed: 1.2, curve: 1.5 });
}

// Efeito Pisca-Pisca
function flashLayer(id) {
    if (!map.getLayer(id)) return;
    const originalColor = (id === 'piu') ? '#FF0000' : '#000000';
    const originalWidth = (id === 'piu') ? 3 : 2;
    const highlightColor = '#F1C40F';
    const highlightWidth = 8;
    map.setPaintProperty(id, 'line-color', highlightColor);
    map.setPaintProperty(id, 'line-width', highlightWidth);
    map.setPaintProperty(id, 'line-opacity', 0.8);
    setTimeout(() => {
        map.setPaintProperty(id, 'line-color', originalColor);
        map.setPaintProperty(id, 'line-width', originalWidth);
        map.setPaintProperty(id, 'line-opacity', 1);
        setTimeout(() => {
            map.setPaintProperty(id, 'line-color', highlightColor);
            map.setPaintProperty(id, 'line-width', highlightWidth);
            map.setPaintProperty(id, 'line-opacity', 0.8);
            setTimeout(() => {
                map.setPaintProperty(id, 'line-color', originalColor);
                map.setPaintProperty(id, 'line-width', originalWidth);
                map.setPaintProperty(id, 'line-opacity', 1);
            }, 300);
        }, 300);
    }, 300);
}

function setLayout(id, vis) {
    if(map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    if(map.getLayer(id+"_l")) map.setLayoutProperty(id+"_l", "visibility", vis);
}

window.toggleL = function(id) {
    var chk = document.getElementById("chk-" + id);
    var vis = chk.checked ? "visible" : "none";
    setLayout(id, vis);
    if (chk.checked && (id === 'piu' || id === 'tri')) flashLayer(id);
    updateLegends();
    checkTransparency();
}

// --- CHECAGEM DE TRANSPARÊNCIA (CORRIGIDO PARA TRANSPORTE) ---
function checkTransparency() {
    if (!map.getLayer('edif')) return;
    const activeTabPane = document.querySelector('.tab-pane.active');
    const activeTabId = activeTabPane ? activeTabPane.id : null;
    let targetOpacity = 0.95; 
    
    if (activeTabId === 'tab-infra') {
        const infraLayers = layersByTab["tab-infra"];
        // Agora verifica também se algum transporte está ligado
        const isAnyInfraChecked = infraLayers.some(id => {
            const el = document.getElementById("chk-" + id);
            return el && el.checked;
        });
        if (isAnyInfraChecked) targetOpacity = 0.08; 
    } else {
        const groundLayers = ["fav", "cort", "lote", "uso", "parques", "pracas"];
        const isAnyGroundChecked = groundLayers.some(id => {
            const el = document.getElementById("chk-" + id);
            return el && el.checked;
        });
        if (isAnyGroundChecked) targetOpacity = 0.3;
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
}

function addTooltip(layerId, propName) {
    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        var desc = e.features[0].properties[propName];
        if(desc && desc !== "null" && desc !== "undefined") {
            hoverPopup.setLngLat(e.lngLat).setHTML(desc).addTo(map);
        }
    });
    map.on('mousemove', layerId, (e) => { if (hoverPopup.isOpen()) hoverPopup.setLngLat(e.lngLat); });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; hoverPopup.remove(); });
}

// LOAD
map.on("load", function () {
    // Adiciona a base de satélite (que raramente dá erro)
    map.addSource('satellite-source', {
        'type': 'raster', 'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        'tileSize': 256, 'attribution': '&copy; Esri', 'maxzoom': 17
    });
    map.addLayer({ 'id': 'satellite-layer', 'type': 'raster', 'source': 'satellite-source', 'paint': {}, 'layout': { 'visibility': 'none' }});

    // --- BLOCO DE SEGURANÇA (TRY / CATCH) ---
    // Se der erro em qualquer camada aqui dentro, ele não trava o loader
    try {
        if (typeof initUso === "function") initUso(map);
        if (typeof initAmb === "function") initAmb(map);
        if (typeof initInfra === "function") initInfra(map);

        if(typeof data.edif !== 'undefined' && data.edif !== "null") {
            map.addSource("edif", {type:"geojson", data:data.edif});
            map.addLayer({
                id: "edif", type: "fill-extrusion", source: "edif",
                paint: { "fill-extrusion-color": ["get", "cor_hex"], "fill-extrusion-height": ["get", "altura"], "fill-extrusion-opacity": 0.95 },
                layout: { visibility: "visible" }
            });
        }
        if(typeof data.dist !== 'undefined') { map.addSource("dist", {type:"geojson", data:data.dist}); map.addLayer({ id: "dist", type: "line", source: "dist", paint: {"line-color": "#7570b3", "line-width": 2, "line-dasharray": [2, 2]}, layout: {visibility: "none"} }); }
        if(typeof data.piu !== 'undefined') { map.addSource("piu", {type:"geojson", data:data.piu}); map.addLayer({ id: "piu", type: "line", source: "piu", paint: {"line-color": "#FF0000", "line-width": 3}, layout: {visibility: "visible"} }); }
        if(typeof data.tri !== 'undefined') { map.addSource("tri", {type:"geojson", data:data.tri}); map.addLayer({ id: "tri", type: "line", source: "tri", paint: {"line-color": "#000", "line-width": 2}, layout: {visibility: "none"} }); }

        setStyle('mapa');
        updateLegends();
        checkTransparency();
        
        // INTRO CINEMÁTICA (Coloquei dentro do try também)
        map.jumpTo({ center: [-46.633, -23.550], zoom: 12, pitch: 0, bearing: 0 });
        setTimeout(() => { map.flyTo({ center: [-46.633, -23.550], zoom: 14.5, pitch: 55, bearing: -20, speed: 0.5, curve: 1 }); }, 800);

    } catch (erro) {
        // Se houver erro, mostramos no console, mas o código segue para esconder o loader
        console.error("ERRO CRÍTICO NO CARREGAMENTO DAS CAMADAS:", erro);
    }

    // --- LIBERA O LOADER (AGORA FORA DO RISCO) ---
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => { document.getElementById('loader').style.display = 'none'; }, 500);
});

// Autocomplete
const input = document.getElementById("search-input");
const suggestionsBox = document.getElementById("suggestions");
const clearBtn = document.getElementById("clear-btn");
let marker = null; let debounceTimer;
function toggleClearBtn() { clearBtn.style.display = (input.value.length > 0 || marker !== null) ? "block" : "none"; }
clearBtn.addEventListener("click", function() { input.value = ""; suggestionsBox.style.display = "none"; if (marker) { marker.remove(); marker = null; } toggleClearBtn(); });
input.addEventListener("input", function() { toggleClearBtn(); clearTimeout(debounceTimer); if (this.value.length < 3) { suggestionsBox.style.display = "none"; return; } debounceTimer = setTimeout(() => { fetch("https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + encodeURIComponent(this.value + ", São Paulo")).then(res => res.json()).then(data => { suggestionsBox.innerHTML = ""; if(data.length){ suggestionsBox.style.display = "block"; data.forEach(p => { let div = document.createElement("div"); div.className = "suggestion-item"; div.innerText = p.display_name.split(",")[0]; div.onclick = () => { map.flyTo({center:[p.lon, p.lat], zoom:18, pitch:60}); if(marker) marker.remove(); marker = new maplibregl.Marker({color: "#EB5757"}).setLngLat([p.lon, p.lat]).setPopup(new maplibregl.Popup().setText(p.display_name.split(",")[0])).addTo(map).togglePopup(); suggestionsBox.style.display = "none"; input.value = p.display_name.split(",")[0]; toggleClearBtn(); }; suggestionsBox.appendChild(div); }); } }); }, 500); });
document.addEventListener("click", function(e) { if (e.target !== input && e.target !== suggestionsBox && e.target !== clearBtn) { suggestionsBox.style.display = "none"; } });