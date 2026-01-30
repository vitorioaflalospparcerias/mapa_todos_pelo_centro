/* ARQUIVO: assets/modules/logic_socio.js */

function initSocio(map) {
    console.log(">>> Inicializando Módulo: Sociodemográfico");

    // 1. Tenta pegar a camada 'edif' para inserir as manchas por baixo
    var beforeId = map.getLayer('edif') ? 'edif' : null;

    // Função auxiliar para evitar repetição
    function addSocioLayer(id, geojson, colorExpr) {
        if(!geojson || geojson === "null") return;
        
        map.addSource(id, { type: "geojson", data: geojson });
        
        // Camada de Preenchimento (Cores)
        map.addLayer({
            id: id, type: "fill", source: id, 
            paint: { "fill-color": ["get", "cor_hex"], "fill-opacity": 0.7 },
            layout: { visibility: "none" }
        }, beforeId);

        // Camada de Linha (Contorno)
        map.addLayer({
            id: id+"_l", type: "line", source: id, 
            paint: { "line-color": "#ffffff", "line-width": 0.5, "line-opacity": 0.3 },
            layout: { visibility: "none" }
        }, beforeId);
        
        // Ativa o Tooltip (propriedade 'txt_tooltip' vem formatada do R)
        addTooltip(id, "txt_tooltip");
    }

    // Adiciona as 3 camadas
    addSocioLayer("socio_dens", data.socio_dens);
    addSocioLayer("socio_pop", data.socio_pop);
    addSocioLayer("socio_dom", data.socio_dom);
}