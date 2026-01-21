/* ARQUIVO: assets/modules/logic_amb.js */

function initAmb(map) {
    console.log(">>> Inicializando Módulo: Ambiental (Com Labels)");

    // 1. PARQUES E ÁREAS DE CONSERVAÇÃO
    if(data.parques && data.parques !== "null") {
        map.addSource("parques", { type: "geojson", data: data.parques });
        map.addLayer({
            id: "parques", type: "fill", source: "parques",
            paint: { "fill-color": "#27AE60", "fill-opacity": 0.6 },
            layout: { visibility: "none" }
        });
        // Label solicitado: nm_area
        addTooltip("parques", "nm_area");
    }

    // 2. PRAÇAS E LARGOS
    if(data.pracas && data.pracas !== "null") {
        map.addSource("pracas", { type: "geojson", data: data.pracas });
        map.addLayer({
            id: "pracas", type: "fill", source: "pracas",
            paint: { "fill-color": "#52BE80", "fill-opacity": 0.6 },
            layout: { visibility: "none" }
        });
        // Label solicitado: plg_nome
        addTooltip("pracas", "plg_nome");
    }

    // 3. ÁRVORES
    if(data.arvores && data.arvores !== "null") {
        map.addSource("arvores", { type: "geojson", data: data.arvores });
        map.addLayer({
            id: "arvores", type: "circle", source: "arvores",
            paint: { 
                "circle-color": "#229954", 
                "circle-radius": 3,
                "circle-opacity": 0.8
            },
            layout: { visibility: "none" }
        });
        // Se quiser label para árvores no futuro, descomente abaixo:
        // addTooltip("arvores", "cd_arvore"); 
    }
}