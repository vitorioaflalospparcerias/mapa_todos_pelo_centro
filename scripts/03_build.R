# ==============================================================================
# ARQUIVO: 03_build.R (Final)
# ==============================================================================
library(sf)
library(geojsonsf)
library(dplyr)
library(htmltools)

# 1. Helpers
source("scripts/02_functions.R")

# 2. Prep
print(">>> Preparando GeoJSONs...")

prep_data <- function(path, tipo) {
  if (!file.exists(path)) return("null")
  df <- readRDS(path) %>% st_transform(4326)
  if(nrow(df) == 0) return("null")
  
  if (tipo == "uso_solo") {
    coluna_alvo <- "tx_uso_h_p"
    if(!"area_m2" %in% names(df)) df$area_m2 <- as.numeric(st_area(df))
    df[[coluna_alvo]] <- fix_utf8(df[[coluna_alvo]])
    stats <- calcular_ranking_uso(df, coluna_alvo)
    df$cor_hex <- aplicar_cores(df, coluna_alvo, stats$top_nomes)
    legenda_html <<- gerar_legenda_html_pastel(stats$top_dados, coluna_alvo)
    df <- df %>% select(tx_uso_h_p, area_m2, cor_hex, geometry)
    
  } else if (tipo == "edificacao") {
    df <- df %>% mutate(
      altura = ifelse(is.na(ed_altura) | as.numeric(ed_altura) < 2, 3, as.numeric(ed_altura)),
      cor_hex = case_when(altura < 10 ~ "#fcfdbf", altura < 25 ~ "#fc8961", altura < 50 ~ "#b73779", TRUE ~ "#51127c")
    ) %>% select(ed_id, altura, cor_hex, geometry)
    
  } else {
    cores <- list(piu="#FF0000", triangulo="#000000", distrito="#7570b3", tombado="#8B4513", favela="#fd8d3c", cortico="#984ea3", loteamento="#33a02c", ambiental="#27AE60")
    df$cor_hex <- if(!is.null(cores[[tipo]])) cores[[tipo]] else "#999999"
    cols <- names(df)[sapply(df, is.character)]
    for(c in cols) df[[c]] <- fix_utf8(df[[c]])
  }
  return(sf_geojson(df))
}

legenda_html <- ""

# LEITURA
json_uso  <- prep_data("data/processed/layer_uso_solo.rds", "uso_solo")
json_edif <- prep_data("data/processed/layer_edificacoes.rds", "edificacao")
json_piu  <- prep_data("data/processed/layer_piu.rds", "piu")
json_tri  <- prep_data("data/processed/layer_triangulo.rds", "triangulo")
json_dist <- prep_data("data/processed/layer_distritos.rds", "distrito")
json_tomb <- prep_data("data/processed/layer_tombados.rds", "tombado")
json_fav  <- prep_data("data/processed/layer_favela.rds", "favela")
json_cort <- prep_data("data/processed/layer_cortico.rds", "cortico")
json_lote <- prep_data("data/processed/layer_loteamento.rds", "loteamento")
json_parques <- prep_data("data/processed/layer_amb_parques.rds", "ambiental")
json_pracas  <- prep_data("data/processed/layer_amb_pracas.rds", "ambiental")
json_arvores <- prep_data("data/processed/layer_amb_arvores.rds", "ambiental")

# INFRAESTRUTURA
infra_structure <- list(
  "Transporte" = list(
    "Metrô (Estação)" = "trans_metro_est", "Trem (Estação)" = "trans_trem_est",
    "Metrô (Linha)" = "trans_metro_lin", "Trem (Linha)" = "trans_trem_lin",
    "Ônibus (Terminal)" = "trans_bus_term", "Ônibus (Ponto)" = "trans_bus_pt",
    "Ciclovias" = "trans_bike"
  ),
  "Abastecimento" = list("Bom Prato" = "infra_abs_bomprato", "Feiras Livres" = "infra_abs_feira", "Mercados Mun." = "infra_abs_mercado", "Sacolões" = "infra_abs_sacolao"),
  "Assistência Social" = list("Equipamentos" = "infra_soc_equip"),
  "Concessões" = list("Parcerias" = "infra_conc_parc"),
  "Conectividade" = list("WiFi Livre" = "infra_wifi"),
  "Cultura" = list("Bibliotecas" = "infra_cult_biblio", "Espaços Culturais" = "infra_cult_espaco", "Museus" = "infra_cult_museu", "Teatros/Cinemas" = "infra_cult_teatro"),
  
  "Educação" = list(
    "Educ. Infantil (Pública)" = "infra_edu_infantil", 
    "Ens. Fund./Médio (Público)" = "infra_edu_publica", 
    "Ensino Técnico (Público)" = "infra_edu_tecnico", 
    "Rede Privada" = "infra_edu_privada", 
    "Sistema S (SENAI/SESI/SENAC)" = "infra_edu_sist_s", 
    "Outros" = "infra_edu_outros"
  ),
  
  "Esporte" = list("Centros Esp." = "infra_esp_centro", "Clubes" = "infra_esp_clube", "CDCs" = "infra_esp_cdc", "Estádios" = "infra_esp_estadio"),
  "Saúde" = list("UBS" = "infra_sau_ubs", "Hospitais" = "infra_sau_hosp", "Ambulatórios" = "infra_sau_ambul", "Saúde Mental" = "infra_sau_mental", "DST/Aids" = "infra_sau_dst", "Urgência" = "infra_sau_urgencia", "Outros" = "infra_sau_outros"),
  "Segurança" = list("Bombeiros" = "infra_seg_bombeiro", "GCM" = "infra_seg_gcm", "Polícia Civil" = "infra_seg_civil", "Polícia Militar" = "infra_seg_militar"),
  "Serviços" = list("Descomplica" = "infra_serv_descomplica", "Consulados" = "infra_serv_consulado", "Correios" = "infra_serv_correios", "Poupatempo" = "infra_serv_poupatempo", "Receita Fed." = "infra_serv_receita", "Sabesp" = "infra_serv_sabesp", "Shoppings" = "infra_serv_shopping")
)

print(">>> Processando Infra...")
infra_js_data <- ""
infra_html_menu <- ""

for(cat_name in names(infra_structure)) {
  cat_id <- paste0("cat-", gsub(" ", "", tolower(cat_name)))
  infra_html_menu <- paste0(infra_html_menu, sprintf('<div class="accordion-header" onclick="toggleCat(\'%s\')">%s</div><div id="%s" class="accordion-content">', cat_id, cat_name, cat_id))
  
  items <- infra_structure[[cat_name]]
  for(label in names(items)) {
    layer_id <- items[[label]]
    json_val <- prep_data(paste0("data/processed/", layer_id, ".rds"), "infra")
    infra_js_data <- paste0(infra_js_data, layer_id, ": ", json_val, ",\n")
    infra_html_menu <- paste0(infra_html_menu, sprintf('<div class="layer-item"><label for="chk-%s">%s</label> <input type="checkbox" id="chk-%s" onchange="toggleL(\'%s\')"></div>', layer_id, label, layer_id, layer_id))
  }
  infra_html_menu <- paste0(infra_html_menu, '</div>')
}

# Assets
print(">>> Lendo Assets...")
style_css <- paste(readLines("assets/style.css", warn=FALSE), collapse = "\n")
app_js    <- paste(readLines("assets/app.js", warn=FALSE), collapse = "\n")
logic_uso <- ""; if(file.exists("assets/modules/logic_uso.js")) logic_uso <- paste(readLines("assets/modules/logic_uso.js", warn=FALSE), collapse = "\n")
logic_amb <- ""; if(file.exists("assets/modules/logic_amb.js")) logic_amb <- paste(readLines("assets/modules/logic_amb.js", warn=FALSE), collapse = "\n")
logic_infra <- ""; if(file.exists("assets/modules/logic_infra.js")) logic_infra <- paste(readLines("assets/modules/logic_infra.js", warn=FALSE), collapse = "\n")

# HTML
print(">>> Gerando HTML Final...")
html_content <- paste0('
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Mapa TPC</title>
<script src="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css" rel="stylesheet" />
<style>
', style_css, '
</style>
</head>
<body>

<div id="map"></div>
<div id="loader"><div class="spinner"></div> Carregando dados...</div>

<div id="sidebar" class="map-overlay">
    <div id="sidebar-toggle">«</div>
    
    <div class="shortcuts-container">
        <div class="shortcut-title">Locais Estratégicos</div>
        <div class="shortcut-chips">
            <button class="chip-btn" onclick="flyToLocation(-23.548, -46.633, 16, 60, -20)">Sé</button>
            <button class="chip-btn" onclick="flyToLocation(-23.544, -46.642, 16.5, 60, 45)">República</button>
            <button class="chip-btn" onclick="flyToLocation(-23.541, -46.629, 17, 60, -10)">Mercadão</button>
            <button class="chip-btn" onclick="flyToLocation(-23.535, -46.636, 16, 50, 0)">Luz</button>
        </div>
    </div>

    <div class="search-container">
        <input type="text" id="search-input" class="search-input" placeholder="Buscar endereço..." autocomplete="off">
        <div class="icon-container"><span id="clear-btn" class="search-clear">✕</span><span class="search-icon">🔍</span></div>
        <div id="suggestions" class="suggestions-list"></div>
    </div>

    <div class="tabs-header">
        <button class="tab-btn" onclick="switchTab(\'tab-socio\', this)">Sociodem.</button>
        <button class="tab-btn active" onclick="switchTab(\'tab-uso\', this)">Uso/Solo</button>
        <button class="tab-btn" onclick="switchTab(\'tab-infra\', this)">Infra</button>
        <button class="tab-btn" onclick="switchTab(\'tab-amb\', this)">Ambiental</button>
    </div>

    <div class="tab-content">
        <div id="tab-socio" class="tab-pane">
            <span class="group-title">População</span>
            <div class="layer-item"><label>Densidade Demográfica</label> <input type="checkbox" disabled></div>
        </div>

        <div id="tab-uso" class="tab-pane active">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            <span class="group-title">Ocupação Formal</span>
            <div class="layer-item"><label>🎨 Uso do Solo (Quadra)</label> <input type="checkbox" id="chk-uso" onchange="toggleL(\'uso\')"></div>
            <div class="layer-item"><label>🏛️ Bens Tombados</label> <input type="checkbox" id="chk-tomb" onchange="toggleL(\'tomb\')"></div>
            
            <span class="group-title">Habitação Precária</span>
            <div class="layer-item"><label>🟧 Favelas</label> <input type="checkbox" id="chk-fav" onchange="toggleL(\'fav\')"></div>
            <div class="layer-item"><label>🟪 Cortiços</label> <input type="checkbox" id="chk-cort" onchange="toggleL(\'cort\')"></div>
            <div class="layer-item"><label>🟩 Loteamentos Irreg.</label> <input type="checkbox" id="chk-lote" onchange="toggleL(\'lote\')"></div>
        </div>

        <div id="tab-infra" class="tab-pane">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            ', infra_html_menu, '
        </div>

        <div id="tab-amb" class="tab-pane">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            <span class="group-title">Áreas Verdes</span>
            <div class="layer-item"><label>🌲 Parques e Áreas de Conservação</label> <input type="checkbox" id="chk-parques" onchange="toggleL(\'parques\')"></div>
            <div class="layer-item"><label>🍃 Praças e Largos</label> <input type="checkbox" id="chk-pracas" onchange="toggleL(\'pracas\')"></div>
            <div class="layer-item"><label>🌳 Árvores (Pontos)</label> <input type="checkbox" id="chk-arvores" onchange="toggleL(\'arvores\')"></div>
        </div>
    </div>

    <div class="fixed-layers">
        <span class="group-title" style="margin-top:0; margin-bottom:10px;">Camadas de Referência</span>
        <div class="layer-item"><label>🏢 Edificações 3D</label> <input type="checkbox" checked id="chk-edif" onchange="toggleL(\'edif\')"></div>
        <div class="layer-item"><label>🔴 Perímetro PIU</label> <input type="checkbox" checked id="chk-piu" onchange="toggleL(\'piu\')"></div>
        <div class="layer-item"><label>⚫ Triângulo Histórico</label> <input type="checkbox" id="chk-tri" onchange="toggleL(\'tri\')"></div>
        <div class="layer-item"><label>🟣 Distritos</label> <input type="checkbox" id="chk-dist" onchange="toggleL(\'dist\')"></div>
        
        <hr style="border:0; border-top:1px solid #eee; margin: 12px 0;">
        <span class="control-label">Perspectiva</span>
        <div class="btn-group">
            <button class="view-btn" onclick="map.easeTo({pitch: 0})">2D</button>
            <button class="view-btn" onclick="map.easeTo({pitch: 60})">3D</button>
        </div>
        <span class="control-label">Base do Mapa</span>
        <div class="btn-group">
            <button id="btn-mapa" class="view-btn active" onclick="setStyle(\'default\')">Mapa</button>
            <button id="btn-satelite" class="view-btn" onclick="setStyle(\'satellite\')">Satélite</button>
        </div>
    </div>
</div>

<div id="legenda-uso" class="legend-container"><div class="legend-title">Uso Predominante (Top 10)</div>', legenda_html, '</div>

<div id="legenda-hab" class="legend-container"><div class="legend-title">Habitação Precária</div>
    <div class="leg-item"><span style="background:#fd8d3c;"></span>Favelas</div>
    <div class="leg-item"><span style="background:#984ea3;"></span>Cortiços</div>
    <div class="leg-item"><span style="background:#33a02c;"></span>Loteamentos</div>
</div>

<div id="legenda-altura" class="legend-container"><div class="legend-title">Altura da Edificação (m)</div>
    <div style="background: linear-gradient(to right, #fcfdbf, #fc8961, #b73779, #51127c); height: 8px; width: 100%; margin:5px 0; border-radius:4px;"></div>
    <div style="display:flex; justify-content:space-between; font-size:9px; color:#666;"><span>Térreo</span><span>+50m</span></div>
</div>

<script>
    var data = {
        piu: ', json_piu, ', tri: ', json_tri, ', dist: ', json_dist, ',
        edif: ', json_edif, ', tomb: ', json_tomb, ', uso: ', json_uso, ',
        fav: ', json_fav, ', cort: ', json_cort, ', lote: ', json_lote, ',
        parques: ', json_parques, ', pracas: ', json_pracas, ', arvores: ', json_arvores, ',
        ', infra_js_data, '
    };

    ', logic_uso, '
    ', logic_amb, '
    ', logic_infra, '
    ', app_js, '
</script>
</body>
</html>
')

write(html_content, "outputs/mapa.html")
print(">>> MAPA TPC GERADO COM SUCESSO: outputs/mapa.html")