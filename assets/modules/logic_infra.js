/* ARQUIVO: assets/modules/logic_infra.js */

function initInfra(map) {
    console.log(">>> Inicializando Módulo: Infraestrutura (Paletas Variadas + Labels Unificados)");

    // --- 1. CONFIGURAÇÃO DE CORES (CATEGORIA VS VARIAÇÕES) ---

    // EDUCAÇÃO (Tons de Azul)
    const HEAD_EDU = "#2980B9"; // Cor do Título do Label (Azul Forte)
    const PALETTE_EDU = {
        infantil: "#AED6F1", // Azul Bem Claro
        publica:  "#5DADE2", // Azul Claro
        tecnico:  "#3498DB", // Azul Médio
        sist_s:   "#2874A6", // Azul Escuro
        outros:   "#1B4F72", // Azul Muito Escuro
        privada:  "#85C1E9"  // Azul Lavanda
    };

    // SAÚDE (Tons de Rosa/Vermelho)
    const HEAD_SAU = "#C0392B"; // Vermelho Forte
    const PALETTE_SAU = {
        ubs:        "#F5B7B1", // Rosa Claro
        ambul:      "#F1948A", // Salmão
        mental:     "#EC7063", // Vermelho Suave
        dst:        "#E74C3C", // Vermelho
        urgencia:   "#CB4335", // Vermelho Tijolo
        hospital:   "#943126", // Vinho
        outros:     "#641E16"  // Marrom Avermelhado
    };

    // CULTURA (Tons de Roxo)
    const HEAD_CULT = "#8E44AD"; // Roxo Forte
    const PALETTE_CULT = {
        biblio: "#D2B4DE", // Lilás
        espaco: "#AF7AC5", // Roxo Médio
        museu:  "#9B59B6", // Ametista
        teatro: "#76448A"  // Roxo Escuro
    };

    // ESPORTE (Tons de Laranja)
    const HEAD_ESP = "#D35400"; // Laranja Abóbora
    const PALETTE_ESP = {
        centro:  "#FAD7A0", // Creme
        clube:   "#F5CBA7", // Pêssego
        cdc:     "#E67E22", // Cenoura
        estadio: "#A04000"  // Ferrugem
    };

    // ABASTECIMENTO (Tons de Verde)
    const HEAD_ABS = "#27AE60"; // Verde Esmeralda
    const PALETTE_ABS = {
        bomprato: "#ABEBC6", // Verde Água
        feira:    "#58D68D", // Verde Claro
        mercado:  "#2ECC71", // Verde Médio
        sacolao:  "#1D8348"  // Verde Bandeira
    };

    // SOCIAL (Tons de Amarelo/Terra)
    const HEAD_SOC = "#D4AC0D"; // Dourado
    const PALETTE_SOC = {
        assist: "#F9E79F", // Amarelo Claro
        parc:   "#F4D03F", // Amarelo
        wifi:   "#B7950B"  // Ouro
    };

    // SEGURANÇA (Tons de Cinza/Chumbo)
    const HEAD_SEG = "#7F8C8D"; 
    const PALETTE_SEG = {
        bombeiro: "#E6B0AA", // (Exceção: Bombeiro levemente avermelhado mas desaturado)
        gcm:      "#BDC3C7", // Prata
        civil:    "#7F8C8D", // Cinza
        militar:  "#2C3E50"  // Chumbo
    };

    // SERVIÇOS (Tons Variados/Neutros)
    const HEAD_SERV = "#F39C12"; 
    const PALETTE_SERV = {
        poup:   "#FCF3CF",
        desc:   "#F9E79F",
        corr:   "#F7DC6F",
        cons:   "#F4D03F",
        rec:    "#F1C40F",
        sab:    "#3498DB" // Azul Sabesp
    };


    // --- FUNÇÃO DE LIMPEZA DE NOMES ---
    function cleanName(name) {
        if (!name || typeof name !== 'string') return name;
        let n = name.trim(); 

        // Mojibake fixes
        n = n.replace(/Ã\?/g, "Ç"); n = n.replace(/Ã\s/g, "Ã"); n = n.replace(/BÃ\S+/g, "BÁSICA");
        n = n.replace(/Ã©/g, "é"); n = n.replace(/Ã£/g, "ã"); n = n.replace(/Ã¡/g, "á"); n = n.replace(/Ã\*/g, "Í");

        // Remove prefixos
        const prefixes = [
            "Bibliotecas Públicas \\(inclui Bosques e Pontos de Leitura\\) - ", "Biblioteca - ",
            "Centros Culturais, Casas de Cultura, Espaços Culturais - ", "Centro Cultural - ", "Espaço Cultural - ",
            "Salas de Cinema - ", "Teatro - ", "Museu - ",
            "EMEI - ", "EMEF - ", "CEI - ", "EMEBS - ", "CIEJA - ", "CCI - ",
            "Unidade Básica de Saúde - ", "UBS - ", "Assistência Médica Ambulatorial - ", "AMA - ",
            "Hospital Municipal - ", "Hospital - ", "Pronto Socorro Municipal - "
        ];

        for (let prefix of prefixes) {
            let re = new RegExp("^" + prefix, "i");
            n = n.replace(re, "");
        }
        return n;
    }

    // --- FUNÇÃO PARA ACHAR NOMES ---
    function findBestName(props) {
        let nome = null;
        let endereco = props["tx_enderec"] ? " (" + props["tx_enderec"] + ")" : "";

        // Transporte
        if (props["nm_linha_m"]) return "Linha " + props["nm_linha_m"];
        if (props["nm_linha"]) return "Linha " + props["nm_linha"];

        // Cultura
        if (props["nm_tipo_eq"] && props["nm_equipam"]) {
             let nomeLimpo = cleanName(props["nm_equipam"]);
             nome = props["nm_tipo_eq"] + " - " + nomeLimpo;
        } 
        // Geral
        else {
            const candidates = ["nm_equipam", "nm_estacao", "nm_ponto_o", "nm_termina", "nm_trecho_", "nm_equip", "eq_nome", "nome", "nm_local", "equipament", "nm_estab", "no_entidade", "no_fantasia", "ds_equip", "nome_equip", "equipamento", "nome_local", "nm_unidade", "nm_linha", "ds_nome", "nm_ponto"];
            for (let key of candidates) { if (props[key]) { nome = props[key]; break; } }
            if (!nome) {
                for (let key in props) {
                    let val = props[key];
                    if (typeof val === 'string' && val.length > 3) {
                        let k = key.toLowerCase();
                        if (k.includes("nome") || k.includes("nm_") || k.includes("desc") || k.includes("fantasia")) {
                            nome = val; break;
                        }
                    }
                }
            }
        }
        if (nome) return cleanName(nome) + endereco;
        return "Infraestrutura";
    }

    // --- FUNÇÕES DE DESENHO (Atualizadas para 2 cores: Marker & Header) ---

    // addPt(id, geojson, COR_BOLINHA, Titulo, Coluna, COR_LABEL)
    function addPt(id, geojson, markerColor, categoryTitle, colunaNome = null, headerColor = null) {
        if(!geojson || geojson === "null") return;
        if(map.getSource(id)) return;
        map.addSource(id, { type: "geojson", data: geojson });
        map.addLayer({ 
            id: id, type: "circle", source: id, 
            paint: { 
                "circle-color": markerColor, 
                "circle-radius": 5, 
                "circle-stroke-width": 1.5, 
                "circle-stroke-color": "#ffffff", 
                "circle-opacity": 1 
            }, 
            layout: { visibility: "none" } 
        });
        // Usa headerColor se existir, senão usa a cor da bolinha
        setupInfraTooltip(id, categoryTitle, headerColor || markerColor, colunaNome);
    }
    
    function addPoly(id, geojson, color, categoryTitle, colunaNome = null, headerColor = null) {
        if(!geojson || geojson === "null") return;
        if(map.getSource(id)) return;
        map.addSource(id, { type: "geojson", data: geojson });
        map.addLayer({ id: id, type: "fill", source: id, paint: { "fill-color": color, "fill-opacity": 0.7 }, layout: { visibility: "none" } });
        map.addLayer({ id: id + "_l", type: "line", source: id, paint: { "line-color": "#fff", "line-width": 2 }, layout: { visibility: "none" } });
        setupInfraTooltip(id, categoryTitle, headerColor || color, colunaNome);
    }

    function addLine(id, geojson, color, categoryTitle, colunaNome = null) {
        if(!geojson || geojson === "null") return;
        if(map.getSource(id)) return;
        map.addSource(id, { type: "geojson", data: geojson });
        map.addLayer({ 
            id: id, type: "line", source: id, 
            paint: { "line-color": color, "line-width": 5, "line-opacity": 1 }, 
            layout: { visibility: "none", "line-join": "round", "line-cap": "round" } 
        });
        setupInfraTooltip(id, categoryTitle, color, colunaNome);
    }

    // --- TOOLTIP ---
    function setupInfraTooltip(layerId, title, colorHex, propKey) {
        map.on('mouseenter', layerId, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            let p = e.features[0].properties;
            
            let finalName;
            if (propKey && p[propKey]) {
                let raw = p[propKey];
                let addr = p["tx_enderec"] ? " (" + p["tx_enderec"] + ")" : "";
                finalName = cleanName(raw) + addr;
            } else {
                finalName = findBestName(p);
            }
            
            let uiColor = Array.isArray(colorHex) ? "#FFD700" : colorHex;

            let html = `
                <div style="border-bottom: 2px solid ${uiColor}; margin-bottom: 5px; padding-bottom: 3px;">
                    <strong style="color: ${uiColor}; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                        ${title}
                    </strong>
                </div>
                <div style="font-size: 14px; font-weight: 500; color: #FFFFFF; line-height: 1.3;">
                    ${finalName}
                </div>
            `;
            hoverPopup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });
        map.on('mousemove', layerId, (e) => { if (hoverPopup.isOpen()) hoverPopup.setLngLat(e.lngLat); });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; hoverPopup.remove(); });
    }

    // --- TRANSPORTE (Cores Fixas Oficiais) ---
    const metroColors = [
        "match", ["to-string", ["get", "nm_linha_m"]],
        "AZUL", "#00539F", "1 - AZUL", "#00539F", "VERDE", "#008056", "2 - VERDE", "#008056",
        "VERMELHA", "#EE3E34", "3 - VERMELHA", "#EE3E34", "AMARELA", "#FDBF28", "4 - AMARELA", "#FDBF28",
        "LILAS", "#A569BD", "5 - LILAS", "#A569BD", "PRATA", "#C0C0C0", "15 - PRATA", "#C0C0C0", "#6E2C00"
    ];
    const trainColors = [
        "match", ["to-string", ["get", "nm_linha_m"]],
        "RUBI", "#A01866", "7", "#A01866", "7 - RUBI", "#A01866", "DIAMANTE", "#9E9F95", "8", "#9E9F95", "8 - DIAMANTE", "#9E9F95",
        "ESMERALDA", "#00A88E", "9", "#00A88E", "9 - ESMERALDA", "#00A88E", "TURQUESA", "#007C91", "10", "#007C91", "10 - TURQUESA", "#007C91",
        "CORAL", "#F04E22", "11", "#F04E22", "11 - CORAL", "#F04E22", "SAFIRA", "#033F88", "12", "#033F88", "12 - SAFIRA", "#033F88",
        "JADE", "#00AC5B", "13", "#00AC5B", "13 - JADE", "#00AC5B", "#873600"
    ];

    // --- EXECUÇÃO DAS CAMADAS ---

    // 1. EDUCAÇÃO (HEADER AZUL + BOLINHAS DEGRADÊ)
    addPt("infra_edu_infantil", data.infra_edu_infantil, PALETTE_EDU.infantil, "Educação Infantil (Pública)", null, HEAD_EDU); 
    addPt("infra_edu_publica",  data.infra_edu_publica,  PALETTE_EDU.publica,  "Ensino Fund./Médio (Público)", null, HEAD_EDU); 
    addPt("infra_edu_tecnico",  data.infra_edu_tecnico,  PALETTE_EDU.tecnico,  "Ensino Técnico (Público)", null, HEAD_EDU); 
    addPt("infra_edu_sist_s",   data.infra_edu_sist_s,   PALETTE_EDU.sist_s,   "Sistema S (SESI/SENAI/SENAC)", null, HEAD_EDU); 
    addPt("infra_edu_outros",   data.infra_edu_outros,   PALETTE_EDU.outros,   "Outros Equipamentos de Educação", null, HEAD_EDU); 
    addPt("infra_edu_privada",  data.infra_edu_privada,  PALETTE_EDU.privada,  "Rede Privada de Ensino", null, HEAD_EDU); 

    // 2. SAÚDE (HEADER VERMELHO + BOLINHAS DEGRADÊ)
    addPt("infra_sau_ubs",      data.infra_sau_ubs,      PALETTE_SAU.ubs,      "UBS", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_ambul",    data.infra_sau_ambul,    PALETTE_SAU.ambul,    "Ambulatório", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_mental",   data.infra_sau_mental,   PALETTE_SAU.mental,   "Saúde Mental (CAPS)", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_dst",      data.infra_sau_dst,      PALETTE_SAU.dst,      "Centro DST/Aids", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_urgencia", data.infra_sau_urgencia, PALETTE_SAU.urgencia, "Urgência / Emergência", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_hosp",     data.infra_sau_hosp,     PALETTE_SAU.hospital, "Hospital", "nm_equipam", HEAD_SAU); 
    addPt("infra_sau_outros",   data.infra_sau_outros,   PALETTE_SAU.outros,   "Saúde (Outros)", "nm_equipam", HEAD_SAU); 

    // 3. CULTURA (HEADER ROXO + BOLINHAS DEGRADÊ)
    addPt("infra_cult_biblio",  data.infra_cult_biblio,  PALETTE_CULT.biblio, "Biblioteca", null, HEAD_CULT); 
    addPt("infra_cult_espaco",  data.infra_cult_espaco,  PALETTE_CULT.espaco, "Espaço Cultural", null, HEAD_CULT); 
    addPt("infra_cult_museu",   data.infra_cult_museu,   PALETTE_CULT.museu,  "Museu", null, HEAD_CULT); 
    addPt("infra_cult_teatro",  data.infra_cult_teatro,  PALETTE_CULT.teatro, "Teatro / Cinema", null, HEAD_CULT); 

    // 4. ESPORTE (HEADER LARANJA + BOLINHAS DEGRADÊ)
    addPt("infra_esp_centro",   data.infra_esp_centro,   PALETTE_ESP.centro,  "Centro Esportivo", null, HEAD_ESP); 
    addPt("infra_esp_clube",    data.infra_esp_clube,    PALETTE_ESP.clube,   "Clube Esportivo", null, HEAD_ESP); 
    addPt("infra_esp_cdc",      data.infra_esp_cdc,      PALETTE_ESP.cdc,     "Clube da Comunidade (CDC)", null, HEAD_ESP); 
    addPt("infra_esp_estadio",  data.infra_esp_estadio,  PALETTE_ESP.estadio, "Estádio", null, HEAD_ESP); 

    // 5. ABASTECIMENTO (HEADER VERDE + BOLINHAS DEGRADÊ)
    addPt("infra_abs_bomprato", data.infra_abs_bomprato, PALETTE_ABS.bomprato, "Bom Prato", null, HEAD_ABS); 
    addPt("infra_abs_feira",    data.infra_abs_feira,    PALETTE_ABS.feira,    "Feira Livre", null, HEAD_ABS); 
    addPt("infra_abs_mercado",  data.infra_abs_mercado,  PALETTE_ABS.mercado,  "Mercado Municipal", "nm_equipam", HEAD_ABS); 
    addPt("infra_abs_sacolao",  data.infra_abs_sacolao,  PALETTE_ABS.sacolao,  "Sacolão", "nm_equipam", HEAD_ABS); 

    // 6. SOCIAL (HEADER DOURADO + BOLINHAS DEGRADÊ)
    addPt("infra_soc_equip",    data.infra_soc_equip,    PALETTE_SOC.assist, "Assistência Social", null, HEAD_SOC); 
    addPoly("infra_conc_parc",  data.infra_conc_parc,    PALETTE_SOC.parc,   "Concessão / Parceria", null, HEAD_SOC); 
    addPt("infra_wifi",         data.infra_wifi,         PALETTE_SOC.wifi,   "WiFi Livre", "tx_enderec", HEAD_SOC);

    // 7. SEGURANÇA (HEADER CINZA + BOLINHAS DEGRADÊ)
    addPt("infra_seg_bombeiro", data.infra_seg_bombeiro, PALETTE_SEG.bombeiro, "Bombeiros", null, HEAD_SEG); 
    addPt("infra_seg_gcm",      data.infra_seg_gcm,      PALETTE_SEG.gcm,      "Guarda Civil (GCM)", null, HEAD_SEG); 
    addPt("infra_seg_civil",    data.infra_seg_civil,    PALETTE_SEG.civil,    "Polícia Civil", null, HEAD_SEG); 
    addPt("infra_seg_militar",  data.infra_seg_militar,  PALETTE_SEG.militar,  "Polícia Militar", null, HEAD_SEG); 

    // 8. SERVIÇOS (HEADER AMARELO + BOLINHAS DEGRADÊ)
    addPt("infra_serv_poupatempo",  data.infra_serv_poupatempo,  PALETTE_SERV.poup, "Poupatempo", null, HEAD_SERV); 
    addPt("infra_serv_descomplica", data.infra_serv_descomplica, PALETTE_SERV.desc, "Descomplica SP", null, HEAD_SERV); 
    addPt("infra_serv_correios",    data.infra_serv_correios,    PALETTE_SERV.corr, "Correios", null, HEAD_SERV); 
    addPt("infra_serv_consulado",   data.infra_serv_consulado,   PALETTE_SERV.cons, "Consulado", null, HEAD_SERV); 
    addPt("infra_serv_receita",     data.infra_serv_receita,     PALETTE_SERV.rec,  "Receita Federal", null, HEAD_SERV); 
    addPt("infra_serv_sabesp",      data.infra_serv_sabesp,      PALETTE_SERV.sab,  "Sabesp", null, HEAD_SERV); 
    addPoly("infra_serv_shopping",  data.infra_serv_shopping,    "#7D6608",         "Shopping Center", null, HEAD_SERV); 

    // 9. TRANSPORTE
    addLine("trans_metro_lin", data.trans_metro_lin, metroColors, "Linha de Metrô", "nm_linha_m"); 
    addLine("trans_trem_lin",  data.trans_trem_lin,  trainColors, "Linha de Trem", "nm_linha_m");
    addLine("trans_bike",      data.trans_bike,      "#D35400",   "Ciclovia", "nm_trecho_");
    addPt("trans_bus_pt",      data.trans_bus_pt,    "#E59866",   "Ponto de Ônibus", "nm_ponto_o");
    addPt("trans_bus_term",    data.trans_bus_term,  "#CA6F1E",   "Terminal de Ônibus", "nm_termina");
    addPt("trans_metro_est",   data.trans_metro_est, "#00539F",   "Estação de Metrô", "nm_estacao");
    addPt("trans_trem_est",    data.trans_trem_est,  "#BA4A00",   "Estação de Trem",  "nm_estacao");

    // --- HOOK DE TOGGLE ---
    const originalToggle = window.toggleL;
    window.toggleL = function(id) {
        if (typeof originalToggle === 'function') originalToggle(id);
        const chk = document.getElementById("chk-" + id);
        if(!chk) return;
        const vis = chk.checked ? "visible" : "none";
        if (map.getLayer(id + "_l")) map.setLayoutProperty(id + "_l", "visibility", vis);
    }
}