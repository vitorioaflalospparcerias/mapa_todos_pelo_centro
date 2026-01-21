/* ARQUIVO: assets/modules/logic_uso.js */

function initUso(map) {
    console.log(">>> Inicializando Módulo: Uso do Solo (Padrão)");

    // USO DO SOLO
    if(data.uso && data.uso !== "null") {
        map.addSource("uso", { type: "geojson", data: data.uso });
        map.addLayer({
            id: "uso", type: "fill-extrusion", source: "uso",
            paint: {
                "fill-extrusion-color": ["get", "cor_hex"],
                "fill-extrusion-height": 2, 
                "fill-extrusion-opacity": 0.8
            },
            layout: { visibility: "none" }
        });
    }

    // EDIFICAÇÕES
    if(data.edif && data.edif !== "null") {
        map.addSource("edif", { type: "geojson", data: data.edif });
        map.addLayer({
            id: "edif", type: "fill-extrusion", source: "edif",
            paint: {
                "fill-extrusion-color": ["get", "cor_hex"],
                "fill-extrusion-height": ["get", "altura"],
                "fill-extrusion-opacity": 0.9
            },
            layout: { visibility: "visible" } 
        });
    }

    // HABITAÇÃO
    if(data.fav && data.fav !== "null") {
        map.addSource("fav", { type: "geojson", data: data.fav });
        map.addLayer({ id: "fav", type: "fill", source: "fav", paint: { "fill-color": "#fd8d3c", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
    }
    if(data.cort && data.cort !== "null") {
        map.addSource("cort", { type: "geojson", data: data.cort });
        map.addLayer({ id: "cort", type: "fill", source: "cort", paint: { "fill-color": "#984ea3", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
    }
    if(data.lote && data.lote !== "null") {
        map.addSource("lote", { type: "geojson", data: data.lote });
        map.addLayer({ id: "lote", type: "fill", source: "lote", paint: { "fill-color": "#33a02c", "fill-opacity": 0.7 }, layout: { visibility: "none" } });
    }

    // REFERÊNCIAS
    if(data.piu && data.piu !== "null") {
        map.addSource("piu", { type: "geojson", data: data.piu });
        map.addLayer({ id: "piu", type: "line", source: "piu", paint: { "line-color": "#FF0000", "line-width": 3 }, layout: { visibility: "visible" } });
    }
    if(data.tri && data.tri !== "null") {
        map.addSource("tri", { type: "geojson", data: data.tri });
        map.addLayer({ id: "tri", type: "line", source: "tri", paint: { "line-color": "#000000", "line-width": 2, "line-dasharray": [2, 2] }, layout: { visibility: "none" } });
    }
    if(data.dist && data.dist !== "null") {
        map.addSource("dist", { type: "geojson", data: data.dist });
        map.addLayer({ id: "dist", type: "line", source: "dist", paint: { "line-color": "#7570b3", "line-width": 1.5, "line-dasharray": [4, 2] }, layout: { visibility: "none" } });
    }
    if(data.tomb && data.tomb !== "null") {
        map.addSource("tomb", { type: "geojson", data: data.tomb });
        map.addLayer({ id: "tomb", type: "fill", source: "tomb", paint: { "fill-color": "#8B4513", "fill-opacity": 0.6 }, layout: { visibility: "none" } });
    }
}