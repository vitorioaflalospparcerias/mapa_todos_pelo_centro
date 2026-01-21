/* ARQUIVO: assets/modules/logic_amb.js */

function initAmb(map) {
    console.log(">>> Inicializando Módulo: Ambiental (Padrão)");

    if(data.parques && data.parques !== "null") {
        map.addSource("parques", { type: "geojson", data: data.parques });
        map.addLayer({
            id: "parques", type: "fill", source: "parques",
            paint: { "fill-color": "#27AE60", "fill-opacity": 0.6 },
            layout: { visibility: "none" }
        });
    }

    if(data.pracas && data.pracas !== "null") {
        map.addSource("pracas", { type: "geojson", data: data.pracas });
        map.addLayer({
            id: "pracas", type: "fill", source: "pracas",
            paint: { "fill-color": "#52BE80", "fill-opacity": 0.6 },
            layout: { visibility: "none" }
        });
    }

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
    }
}