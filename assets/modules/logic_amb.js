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

    // 4. BOSQUES URBANOS
    if(data.bosques && data.bosques !== "null") {
        map.addSource("bosques", { type: "geojson", data: data.bosques });
        map.addLayer({
            id: "bosques", type: "circle", source: "bosques",
            paint: { 
                "circle-color": "#117A65", 
                "circle-radius": 5,
                "circle-opacity": 0.9,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#FFFFFF"
            },
            layout: { visibility: "none" }
        });

        map.on('mousemove', 'bosques', (e) => {
            if (typeof isSelecting !== 'undefined' && isSelecting) return;
            map.getCanvas().style.cursor = 'pointer';
            
            let htmlContent = `<div style="border-bottom: 2px solid #117A65; margin-bottom: 6px; font-weight:bold; font-size:11px; color:#ffffff; text-transform:uppercase;">BOSQUE URBANO</div><ul style="margin:0; padding-left:15px; list-style-type: disc;">`;
            let processedNames = new Set();
            
            const features = map.queryRenderedFeatures(e.point, { layers: ['bosques'] });
            
            features.forEach(f => {
                const p = f.properties;
                let n = p['Bosque Urbano'] || p['Bosque.Urbano'] || "Bosque";
                let end = p['Endereço'] || p['Endereco'] || "";
                try { n = decodeURIComponent(escape(n)); } catch(err) {}
                try { end = decodeURIComponent(escape(end)); } catch(err) {}
                
                let combined = n + "|" + end;
                if (!processedNames.has(combined)) {
                    processedNames.add(combined);
                    htmlContent += `<li style="margin-bottom:3px; color:#fff;">${n}<br><span style='font-size:10px; color:#aaa;'>${end}</span></li>`;
                }
            });
            htmlContent += `</ul>`;
            
            if (typeof hoverPopup !== 'undefined') {
                hoverPopup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
            }
        });

        map.on('mouseleave', 'bosques', () => { 
            if (typeof isSelecting !== 'undefined' && !isSelecting) map.getCanvas().style.cursor = ''; 
            if (typeof hoverPopup !== 'undefined') hoverPopup.remove(); 
        });
    }

    // 5. GESTÃO DE RESÍDUOS
    function addResiduoLayer(layerId, color, dataObj, title, propName) {
        if(dataObj && dataObj !== "null") {
            map.addSource(layerId, { type: "geojson", data: dataObj });
            map.addLayer({
                id: layerId, type: "circle", source: layerId,
                paint: { 
                    "circle-color": color, 
                    "circle-radius": 5,
                    "circle-opacity": 0.9,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#FFFFFF"
                },
                layout: { visibility: "none" }
            });

            map.on('mousemove', layerId, (e) => {
                if (typeof isSelecting !== 'undefined' && isSelecting) return;
                map.getCanvas().style.cursor = 'pointer';
                let htmlContent = `<div style="border-bottom: 2px solid ${color}; margin-bottom: 6px; font-weight:bold; font-size:11px; color:#ffffff; text-transform:uppercase;">${title}</div><ul style="margin:0; padding-left:15px; list-style-type: disc;">`;
                let processedNames = new Set();
                const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
                
                features.forEach(f => {
                    let n = f.properties[propName] || "Desconhecido";
                    try { n = decodeURIComponent(escape(n)); } catch(err) {}
                    if (!processedNames.has(n)) {
                        processedNames.add(n);
                        htmlContent += `<li style="margin-bottom:3px; color:#fff;">${n}</li>`;
                    }
                });
                htmlContent += `</ul>`;
                if (typeof hoverPopup !== 'undefined') hoverPopup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
            });
            map.on('mouseleave', layerId, () => { 
                if (typeof isSelecting !== 'undefined' && !isSelecting) map.getCanvas().style.cursor = ''; 
                if (typeof hoverPopup !== 'undefined') hoverPopup.remove(); 
            });
        }
    }

    addResiduoLayer("ecoponto", "#2980B9", data.ecoponto, "Ecoponto", "nm_ecopont");
    addResiduoLayer("pev", "#E67E22", data.pev, "Ponto de Entrega Voluntária", "nm_local");
    addResiduoLayer("compostagem", "#8E44AD", data.compostagem, "Pátio de Compostagem", "nm_patio_c");
}