/* ARQUIVO: assets/modules/logic_uso.js */

function initUso(map) {
    console.log(">>> Inicializando Módulo: Uso do Solo");

    // 1. USO DO SOLO
    if(data.uso && data.uso !== "null") {
        map.addSource("uso", { type: "geojson", data: data.uso });
        map.addLayer({
            id: "uso", type: "fill-extrusion", source: "uso",
            paint: { "fill-extrusion-color": ["get", "cor_hex"], "fill-extrusion-height": 2, "fill-extrusion-opacity": 0.9 },
            layout: { visibility: "none" }
        });
        addTooltip("uso", "tx_uso_h_p");
    }

    // 2. EDIFICAÇÕES
    if(data.edif && data.edif !== "null") {
        map.addSource("edif", { type: "geojson", data: data.edif });
        map.addLayer({
            id: "edif", type: "fill-extrusion", source: "edif",
            paint: { "fill-extrusion-color": ["get", "cor_hex"], "fill-extrusion-height": ["get", "altura"], "fill-extrusion-opacity": 0.9 },
            layout: { visibility: "visible" } 
        });
    }

    // --- NOVA CAMADA: ESTABELECIMENTOS (GPKG) ---
    if(data.estab && data.estab !== "null") {
        map.addSource("estab", { type: "geojson", data: data.estab });
        map.addLayer({
            id: "estab", type: "circle", source: "estab",
            paint: {
                "circle-color": "#1ABC9C", // Turquesa
                "circle-radius": 5,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff"
            },
            layout: { visibility: "none" }
        });
        // ATENÇÃO: Substitua 'nome_fantasia' pelo nome real da coluna no seu GPKG se for diferente
        addTooltip("estab", "nome_fantasia"); 
    }
    // ----------------------------------------------

    // --- CAMADAS DE TOMBAMENTO ---
    // A. Visão por STATUS
    if(data.tomb_status && data.tomb_status !== "null") {
        map.addSource("tomb_status", { type: "geojson", data: data.tomb_status });
        map.addLayer({
            id: "tomb_status", type: "fill", source: "tomb_status",
            paint: { "fill-color": ["get", "cor_hex"], "fill-opacity": 0.8 },
            layout: { visibility: "none" }
        });
        addTooltip("tomb_status", "bp_nome"); 
    }

    // B. Visão por ÓRGÃO (JURISDIÇÃO)
    if(data.tomb_orgao && data.tomb_orgao !== "null") {
        map.addSource("tomb_orgao", { type: "geojson", data: data.tomb_orgao });
        map.addLayer({
            id: "tomb_orgao", type: "fill", source: "tomb_orgao",
            paint: { "fill-color": ["get", "cor_hex"], "fill-opacity": 0.8 },
            layout: { visibility: "none" }
        });
        addTooltip("tomb_orgao", "bp_nome");
    }

    // 3. HABITAÇÃO
    if(data.fav && data.fav !== "null") {
        map.addSource("fav", { type: "geojson", data: data.fav });
        map.addLayer({ id: "fav", type: "fill", source: "fav", paint: { "fill-color": "#fd8d3c", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
        addTooltip("fav", "fv_nome");
    }
    if(data.cort && data.cort !== "null") {
        map.addSource("cort", { type: "geojson", data: data.cort });
        map.addLayer({ id: "cort", type: "fill", source: "cort", paint: { "fill-color": "#984ea3", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
        addTooltip("cort", "ct_nome");
    }
    if(data.lote && data.lote !== "null") {
        map.addSource("lote", { type: "geojson", data: data.lote });
        map.addLayer({ id: "lote", type: "fill", source: "lote", paint: { "fill-color": "#33a02c", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
        addTooltip("lote", "lm_nome");
    }

    // 4. REFERÊNCIAS
    if(data.piu && data.piu !== "null") {
        map.addSource("piu", { type: "geojson", data: data.piu });
        map.addLayer({ id: "piu", type: "line", source: "piu", paint: { "line-color": "#FF0000", "line-width": 3 }, layout: { visibility: "visible" } });
    }
    if(data.tri && data.tri !== "null") {
        map.addSource("tri", { type: "geojson", data: data.tri });
        map.addLayer({ id: "tri", type: "line", source: "tri", paint: { "line-color": "#000000", "line-width": 2 }, layout: { visibility: "none" } });
    }
    if(data.dist && data.dist !== "null") {
        map.addSource("dist", { type: "geojson", data: data.dist });
        map.addLayer({ id: "dist", type: "line", source: "dist", paint: { "line-color": "#7570b3", "line-width": 1.5, "line-dasharray": [4, 2] }, layout: { visibility: "none" } });
    }
}