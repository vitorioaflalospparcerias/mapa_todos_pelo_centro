# ==============================================================================
# ARQUIVO: 03_build.R (Final: Empilhamento Visual Espaçado Corretamente)
# ==============================================================================
library(sf)
library(geojsonsf)
library(dplyr)
library(htmltools)
library(stringr)
library(tools) 

source("scripts/02_functions.R") 

print(">>> Preparando GeoJSONs (Modo Otimizado)...")

# Variáveis globais para legendas
legenda_uso_html <- ""; legenda_tomb_status_html <- ""; legenda_tomb_orgao_html <- "";  
legenda_socio_html <- ""; legenda_socio_pop_html <- ""; legenda_socio_dom_html <- "" 

prep_data <- function(path, tipo) {
  if (!file.exists(path)) { print(paste("⚠️ AVISO: Arquivo não encontrado:", path)); return("null") }
  is_gpkg <- grepl("\\.gpkg$", path, ignore.case = TRUE)
  
  df <- tryCatch({
    if (is_gpkg) { st_read(path, quiet = TRUE) %>% st_transform(4326) } else { readRDS(path) %>% st_transform(4326) }
  }, error = function(e) { return(NULL) })
  
  if(is.null(df) || nrow(df) == 0) return("null")
  
  df <- df[!st_is_empty(df), ]
  if (!tipo %in% c("edificacao", "iptu_points", "estab", "arvores")) {
    try({ df <- st_simplify(df, dTolerance = 0.00005, preserveTopology = TRUE) }, silent=TRUE)
  }
  
  if (tipo == "uso_solo") {
    coluna_alvo <- "tx_uso_h_p"
    if(!"area_m2" %in% names(df)) df$area_m2 <- as.numeric(st_area(df))
    df <- df %>% filter(area_m2 > 5)
    df[[coluna_alvo]] <- fix_encoding_uso(df[[coluna_alvo]])
    stats <- calcular_ranking_uso(df, coluna_alvo)
    df$cor_hex <- aplicar_cores(df, coluna_alvo, stats$top_nomes)
    legenda_uso_html <<- gerar_legenda_html_pastel(stats$top_dados, coluna_alvo)
    df <- df %>% select(tx_uso_h_p, area_m2, cor_hex, geometry)
    
  } else if (tipo == "estabelecimentos") {
    path_piu <- "data/processed/layer_piu.rds"
    if (file.exists(path_piu)) {
      piu_filter <- readRDS(path_piu) %>% st_transform(4326) %>% st_make_valid()
      df <- st_filter(df, piu_filter)
    }
    data_cols <- setdiff(names(df), attr(df, "sf_column"))
    for(col in data_cols) { df[[col]] <- as.character(df[[col]]); df[[col]] <- fix_utf8(df[[col]]) }
    
  } else if (tipo == "iptu_points") {
    if("logradouro" %in% names(df)) df$logradouro <- fix_utf8(df$logradouro)
    if("numero" %in% names(df)) df$numero <- fix_utf8(as.character(df$numero))
    if("precisao" %in% names(df)) df$precisao <- as.character(df$precisao)
    
  } else if (tipo == "tomb_status") {
    df$bp_status <- fix_encoding_uso(df$bp_status)
    cats <- unique(df$bp_status); cats <- cats[!is.na(cats) & cats != "NA" & cats != ""]
    paleta <- c("#8c510a", "#f6e8c3", "#fc8961") 
    cores_map <- setNames(rep(paleta, length.out=length(cats)), cats)
    df$cor_hex <- cores_map[df$bp_status]; df$cor_hex[is.na(df$cor_hex)] <- "#00000000"
    legenda_tomb_status_html <<- ""
    for(cat in names(cores_map)) { 
      if(cat %in% df$bp_status) {
        display_name <- cat
        if(cat == "APT") display_name <- "APT (Bem em Processo de Tombamento)"
        if(cat == "APT / ESTUDO") display_name <- "APT / ESTUDO (Área em Processo de Tombamento)"
        legenda_tomb_status_html <<- paste0(legenda_tomb_status_html, sprintf('<div class="leg-item"><span style="background:%s;"></span>%s</div>', cores_map[cat], display_name)) 
      }
    }
    cols <- names(df)[sapply(df, is.character)]; for(c in cols) df[[c]] <- fix_utf8(df[[c]])
    
  } else if (tipo == "tomb_orgao") {
    has_protection <- function(col) { t <- toupper(as.character(col)); return(!is.na(t) & !str_detect(t, "NÃO CONSTA") & !str_detect(t, "NAO CONSTA") & str_length(t) > 2) }
    df <- df %>% mutate( is_mun = has_protection(bp_compres), is_est = has_protection(bp_condeph), is_fed = has_protection(bp_iphan) ) %>% mutate( jurisdicao = case_when( is_mun & is_est & is_fed ~ "Três Esferas (Mun/Est/Fed)", is_mun & is_est ~ "Municipal + Estadual", is_mun & is_fed ~ "Municipal + Federal", is_est & is_fed ~ "Estadual + Federal", is_mun ~ "Apenas Municipal (Conpresp)", is_est ~ "Apenas Estadual (Condephaat)", is_fed ~ "Apenas Federal (IPHAN)", TRUE ~ "Outros / Em Análise" ) )
    
    # NOVA PALETA: Mais neutra, escura e com cores bem distinguíveis
    cores_org <- c("Três Esferas (Mun/Est/Fed)" = "#111111", 
                   "Municipal + Estadual" = "#5B2C6F", 
                   "Municipal + Federal" = "#7B241C", 
                   "Estadual + Federal" = "#1E8449", 
                   "Apenas Municipal (Conpresp)" = "#2874A6", 
                   "Apenas Estadual (Condephaat)" = "#AF601A", 
                   "Apenas Federal (IPHAN)" = "#B7950B", 
                   "Outros / Em Análise" = "#707B7C")
    
    df$cor_hex <- cores_org[df$jurisdicao]; df$cor_hex[is.na(df$cor_hex)] <- "#707B7C"
    legenda_tomb_orgao_html <<- ""; for(cat in names(cores_org)) { if(cat %in% unique(df$jurisdicao)) legenda_tomb_orgao_html <<- paste0(legenda_tomb_orgao_html, sprintf('<div class="leg-item"><span style="background:%s;"></span>%s</div>', cores_org[cat], cat)) }
    cols <- names(df)[sapply(df, is.character)]; for(c in cols) df[[c]] <- fix_utf8(df[[c]])
    
  } else if (tipo == "tomb_geral") {
    df$cor_hex <- "#8E44AD" 
    cols <- names(df)[sapply(df, is.character)]; for(c in cols) df[[c]] <- fix_utf8(df[[c]])
    
  } else if (tipo == "socio_densidade") {
    paleta <- c("#FFFFB2", "#FECC5C", "#FD8D3C", "#F03B20", "#BD0026"); quebras <- quantile(df$densidade, probs = seq(0, 1, 0.2), na.rm = TRUE)
    if(length(unique(quebras)) < 5) df$cor_hex <- paleta[1] else df <- df %>% mutate(faixa = cut(densidade, breaks = c(-Inf, quebras[-1]), labels = FALSE, include.lowest = TRUE), cor_hex = paleta[faixa])
    legenda_socio_html <<- ""; labels_leg <- round(quebras); for(i in 1:5) if(i < length(labels_leg)) legenda_socio_html <<- paste0(legenda_socio_html, sprintf('<div class="leg-item"><span style="background:%s;"></span>%s a %s hab/km²</div>', paleta[i], labels_leg[i], labels_leg[i+1]))
    df$txt_tooltip <- paste0("Setor: ", df$CD_SETOR, "<br>População: ", format(df$populacao, big.mark="."), " hab<br>Densidade: ", format(round(df$densidade, 1), big.mark=".", decimal.mark=","), " hab/km²")
    
  } else if (tipo == "socio_populacao") {
    paleta <- c("#EFF3FF", "#BDD7E7", "#6BAED6", "#3182BD", "#08519C"); quebras <- quantile(df$populacao, probs = seq(0, 1, 0.2), na.rm = TRUE)
    if(length(unique(quebras)) < 5) df$cor_hex <- paleta[1] else df <- df %>% mutate(faixa = cut(populacao, breaks = c(-Inf, quebras[-1]), labels = FALSE, include.lowest = TRUE), cor_hex = paleta[faixa])
    legenda_socio_pop_html <<- ""; labels_leg <- round(quebras); for(i in 1:5) if(i < length(labels_leg)) legenda_socio_pop_html <<- paste0(legenda_socio_pop_html, sprintf('<div class="leg-item"><span style="background:%s;"></span>%s a %s hab</div>', paleta[i], labels_leg[i], labels_leg[i+1]))
    df$txt_tooltip <- paste0("Setor: ", df$CD_SETOR, "<br><strong>População: ", format(df$populacao, big.mark="."), " hab</strong>")
    
  } else if (tipo == "socio_domicilios") {
    paleta <- c("#F2F0F7", "#CBC9E2", "#9E9AC8", "#756BB1", "#54278F"); quebras <- quantile(df$domicilios, probs = seq(0, 1, 0.2), na.rm = TRUE)
    if(length(unique(quebras)) < 5) df$cor_hex <- paleta[1] else df <- df %>% mutate(faixa = cut(domicilios, breaks = c(-Inf, quebras[-1]), labels = FALSE, include.lowest = TRUE), cor_hex = paleta[faixa])
    legenda_socio_dom_html <<- ""; labels_leg <- round(quebras); for(i in 1:5) if(i < length(labels_leg)) legenda_socio_dom_html <<- paste0(legenda_socio_dom_html, sprintf('<div class="leg-item"><span style="background:%s;"></span>%s a %s dom.</div>', paleta[i], labels_leg[i], labels_leg[i+1]))
    df$txt_tooltip <- paste0("Setor: ", df$CD_SETOR, "<br><strong>Domicílios: ", format(df$domicilios, big.mark="."), "</strong>")
    
  } else if (tipo == "edificacao") {
    df <- df %>% mutate(altura = ifelse(is.na(ed_altura) | as.numeric(ed_altura) < 2, 3, as.numeric(ed_altura))) %>% filter(as.numeric(st_area(.)) > 15) %>% mutate(cor_hex = case_when(altura < 10 ~ "#fcfdbf", altura < 25 ~ "#fc8961", altura < 50 ~ "#b73779", TRUE ~ "#51127c")) %>% select(ed_id, altura, cor_hex, geometry)
  } else if (tipo == "infra" || tipo == "ambiental") {
    cols <- names(df)[sapply(df, is.character)]; for(c in cols) df[[c]] <- fix_encoding_uso(df[[c]])
    df$cor_hex <- if(tipo=="ambiental") "#27AE60" else "#999999"
  } else {
    cores <- list(piu="#FF0000", triangulo="#000000", distrito="#7570b3", favela="#fd8d3c", cortico="#984ea3", loteamento="#33a02c")
    df$cor_hex <- if(!is.null(cores[[tipo]])) cores[[tipo]] else "#999999"
    cols <- names(df)[sapply(df, is.character)]; for(c in cols) df[[c]] <- fix_utf8(df[[c]])
  }
  return(sf_geojson(df, digits = 6))
}

# LEITURA DE ARQUIVOS
json_socio_dens <- prep_data("data/processed/layer_socio_densidade.rds", "socio_densidade")
json_socio_pop  <- prep_data("data/processed/layer_socio_densidade.rds", "socio_populacao")
json_socio_dom  <- prep_data("data/processed/layer_socio_densidade.rds", "socio_domicilios")
json_uso  <- prep_data("data/processed/layer_uso_solo.rds", "uso_solo")
json_edif <- prep_data("data/processed/layer_edificacoes.rds", "edificacao")
json_piu  <- prep_data("data/processed/layer_piu.rds", "piu")
json_tri  <- prep_data("data/processed/layer_triangulo.rds", "triangulo")
json_dist <- prep_data("data/processed/layer_distritos.rds", "distrito")
json_estab <- prep_data("data/processed/estabelecimentos_enriquecido.gpkg", "estabelecimentos")
json_iptu  <- prep_data("data/processed/layer_iptu.rds", "iptu_points")
json_tomb_geral <- prep_data("data/processed/layer_tombados.rds", "tomb_geral") 
json_tomb_status <- prep_data("data/processed/layer_tombados.rds", "tomb_status")
json_tomb_orgao  <- prep_data("data/processed/layer_tombados.rds", "tomb_orgao")
json_fav  <- prep_data("data/processed/layer_favela.rds", "favela")
json_cort <- prep_data("data/processed/layer_cortico.rds", "cortico")
json_lote <- prep_data("data/processed/layer_loteamento.rds", "loteamento")
json_parques <- prep_data("data/processed/layer_amb_parques.rds", "ambiental")
json_pracas  <- prep_data("data/processed/layer_amb_pracas.rds", "ambiental")
json_arvores <- prep_data("data/processed/layer_amb_arvores.rds", "ambiental")

infra_structure <- list(
  "Transporte" = list("Metrô (Estação)" = "trans_metro_est", "Trem (Estação)" = "trans_trem_est", "Metrô (Linha)" = "trans_metro_lin", "Trem (Linha)" = "trans_trem_lin", "Ônibus (Terminal)" = "trans_bus_term", "Ônibus (Ponto)" = "trans_bus_pt", "Ciclovias" = "trans_bike"),
  "Abastecimento" = list("Bom Prato" = "infra_abs_bomprato", "Feiras Livres" = "infra_abs_feira", "Mercados Mun." = "infra_abs_mercado", "Sacolões" = "infra_abs_sacolao"),
  "Assistência Social" = list("Equipamentos de Assist. Soc." = "infra_soc_equip"),
  "Concessões e Parcerias" = list("Parcerias" = "infra_conc_parc"),
  "Conectividade" = list("WiFi Livre" = "infra_wifi"),
  "Cultura" = list("Bibliotecas" = "infra_cult_biblio", "Espaços Culturais" = "infra_cult_espaco", "Museus" = "infra_cult_museu", "Teatros/Cinemas" = "infra_cult_teatro"),
  "Educação" = list("Educ. Infantil (Pública)" = "infra_edu_infantil", "Ens. Fund./Médio (Público)" = "infra_edu_publica", "Ensino Técnico (Público)" = "infra_edu_tecnico", "Rede Privada" = "infra_edu_privada", "Sistema S" = "infra_edu_sist_s", "Outros" = "infra_edu_outros"),
  "Esporte" = list("Centros Esp." = "infra_esp_centro", "Clubes" = "infra_esp_clube", "CDCs" = "infra_esp_cdc", "Estádios" = "infra_esp_estadio"),
  "Saúde" = list("UBS" = "infra_sau_ubs", "Hospitais" = "infra_sau_hosp", "Ambulatórios" = "infra_sau_ambul", "Saúde Mental" = "infra_sau_mental", "DST/Aids" = "infra_sau_dst", "Urgência" = "infra_sau_urgencia", "Outros" = "infra_sau_outros"),
  "Segurança" = list("Bombeiros" = "infra_seg_bombeiro", "GCM" = "infra_seg_gcm", "Polícia Civil" = "infra_seg_civil", "Polícia Militar" = "infra_seg_militar"),
  "Serviços" = list("Consulados" = "infra_serv_consulado", "Correios" = "infra_serv_correios", "Poupatempo" = "infra_serv_poupatempo", "Shoppings" = "infra_serv_shopping")
)

print(">>> Processando Infra...")
infra_js_data <- ""; infra_html_menu <- ""; label_map_list <- c()

for(cat_name in names(infra_structure)) {
  cat_id <- paste0("cat-", gsub(" ", "", tolower(cat_name)))
  cat_id <- stringi::stri_trans_general(cat_id, "Latin-ASCII") 
  infra_html_menu <- paste0(infra_html_menu, sprintf('<div class="accordion-header" onclick="toggleCat(\'%s\')">%s</div><div id="%s" class="accordion-content">', cat_id, cat_name, cat_id))
  items <- infra_structure[[cat_name]]
  for(label in names(items)) {
    layer_id <- items[[label]]
    json_val <- prep_data(paste0("data/processed/", layer_id, ".rds"), "infra")
    infra_js_data <- paste0(infra_js_data, layer_id, ": ", json_val, ",\n")
    infra_html_menu <- paste0(infra_html_menu, sprintf('<div class="layer-item"><span class="info-icon" onclick="showInfo(\'%s\')">!</span> <label for="chk-%s">%s</label> <input type="checkbox" id="chk-%s" onchange="toggleL(\'%s\')"></div>', layer_id, layer_id, label, layer_id, layer_id))
    full_label <- paste0(cat_name, " - ", label)
    label_map_list <- c(label_map_list, paste0("'", layer_id, "': '", full_label, "'"))
  }
  infra_html_menu <- paste0(infra_html_menu, '</div>')
}

infra_labels_js_obj <- paste0("{", paste(label_map_list, collapse = ", "), "}")

print(">>> Lendo Assets...")
style_css   <- paste(readLines("assets/style.css", warn=FALSE), collapse = "\n")
app_js      <- paste(readLines("assets/app.js", warn=FALSE), collapse = "\n")
logic_uso   <- ""; if(file.exists("assets/modules/logic_uso.js")) logic_uso <- paste(readLines("assets/modules/logic_uso.js", warn=FALSE), collapse = "\n")
logic_amb   <- ""; if(file.exists("assets/modules/logic_amb.js")) logic_amb <- paste(readLines("assets/modules/logic_amb.js", warn=FALSE), collapse = "\n")
logic_infra <- ""; if(file.exists("assets/modules/logic_infra.js")) logic_infra <- paste(readLines("assets/modules/logic_infra.js", warn=FALSE), collapse = "\n")
logic_socio <- ""; if(file.exists("assets/modules/logic_socio.js")) logic_socio <- paste(readLines("assets/modules/logic_socio.js", warn=FALSE), collapse = "\n")

metadata_js_content <- '
const LAYER_DATA = {
    "estab": {
        title: "Usos dos Estabelecimentos",
        source: "RAIS",
        year: "2024",
        desc: "Localização de estabelecimentos comerciais e de serviços."
    },
    "iptu": { 
        title: "Características dos Imóveis", 
        source: "IPTU", 
        year: "2025", 
        desc: "Pontos localizados com base na geocodificação do IPTU 2025." 
    },
    "socio_dens": { title: "Densidade Demográfica", source: "Censo IBGE", year: "2022", desc: "Habitantes por km²." },
    "socio_pop": { title: "População Absoluta", source: "Censo IBGE", year: "2022", desc: "Total de habitantes." },
    "socio_dom": { title: "Total de Domicílios", source: "Censo IBGE", year: "2022", desc: "Total de domicílios particulares." },
    "uso": { title: "Uso do Solo", source: "GeoSampa", year: "2021", desc: "Classificação do uso predominante do lote." },
    "tomb_geral": { title: "Bens Tombados (Geral)", source: "GeoSampa", year: "2024", desc: "Todos os imóveis com proteção de patrimônio." },
    "tomb_status": { title: "Bens Tombados (Status)", source: "GeoSampa", year: "2024", desc: "Imóveis classificados por estágio de tombamento." },
    "tomb_orgao": { title: "Bens Tombados (Jurisdição)", source: "GeoSampa", year: "2024", desc: "Órgão responsável pelo tombamento." },
    "fav": { title: "Favelas", source: "HabitaSampa", year: "2024", desc: "Perímetros de favelas." },
    "cort": { title: "Cortiços", source: "HabitaSampa", year: "2024", desc: "Locais identificados como cortiços." },
    "lote": { title: "Loteamentos Irregulares", source: "HabitaSampa", year: "2024", desc: "Loteamentos precários/irregulares." },
    "parques": { title: "Parques", source: "GeoSampa", year: "2024", desc: "Parques municipais e estaduais." },
    "pracas": { title: "Praças", source: "GeoSampa", year: "2024", desc: "Praças e áreas verdes públicas." },
    "arvores": { title: "Árvores", source: "GeoSampa", year: "2020", desc: "Mapeamento arbóreo viário." }
};
'

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

<div id="results-card" class="results-card" style="display: none; position: absolute; top: 360px; right: 50px; z-index: 1000;">
    <div class="resizer resizer-t"></div>
    <div class="resizer resizer-r"></div>
    <div class="resizer resizer-b"></div>
    <div class="resizer resizer-l"></div>
    <div class="resizer resizer-tl"></div>
    <div class="resizer resizer-tr"></div>
    <div class="resizer resizer-bl"></div>
    <div class="resizer resizer-br"></div>

    <div class="results-header">
        <span style="font-weight:bold;">Itens na Área Selecionada</span>
        <span class="close-results" onclick="closeResults()">✕</span>
    </div>
    <div id="results-content" class="results-content" style="max-height: 50vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">
        <p style="color:#777; font-size:12px;">Clique na ferramenta de seleção e desenhe no mapa.</p>
    </div>
</div>

<div id="info-card" class="info-card">
    <div class="info-close" onclick="closeInfo()">✕</div>
    <h4 id="info-title">Título</h4>
    <div class="info-card-row"><span class="info-card-label">Fonte de Dados:</span><span id="info-source">-</span></div>
    <div class="info-card-row"><span class="info-card-label">Ano Base:</span><span id="info-year">-</span></div>
    <p id="info-desc" style="font-size:12px; color:#777; margin-top:10px; line-height:1.4;">-</p>
</div>

<div id="sidebar" class="map-overlay">
    <button id="sidebar-toggle" title="Ocultar/Mostrar Painel">❮</button>

    <div class="search-container">
        <input type="text" id="search-input" class="search-input" placeholder="Buscar endereço..." autocomplete="off">
        <div class="icon-container"><span id="clear-btn" class="search-clear">✕</span><span class="search-icon">🔍</span></div>
        <div id="suggestions" class="suggestions-list"></div>
    </div>
    
    <div class="panel-section-header" onclick="toggleSection(\'pontos-interesse-body\', this)">
        <span style="flex-grow: 1;">PONTOS DE INTERESSE</span>
        <div class="scroll-buttons-container" style="display: flex; gap: 4px; margin-right: 10px;">
            <button class="header-scroll-btn" onclick="event.stopPropagation(); scrollShortcuts(-1)">‹</button>
            <button class="header-scroll-btn" onclick="event.stopPropagation(); scrollShortcuts(1)">›</button>
        </div>
        <span class="toggle-icon">▼</span>
    </div>
    
    <div id="pontos-interesse-body" class="panel-section-content" style="display: block;">
        <div class="shortcuts-container">
            <div class="shortcuts-wrapper">
                <div class="shortcuts-list" id="shortcuts-list">
                    <button class="chip-btn" onclick="flyToLocation(-23.546, -46.638, 17.5, 60, -20, \'Edifício Matarazzo\', this)">Edif. Matarazzo</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.547, -46.638, 17.5, 60, 45, \'Viaduto do Chá\', this)">Viaduto do Chá</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.551, -46.634, 17.5, 60, 0, \'Catedral da Sé\', this)">Catedral da Sé</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.536, -46.636, 17, 50, 0, \'Praça da Luz\', this)">Praça da Luz</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.543, -46.642, 17, 60, 45, \'Praça da República\', this)">Praça da República</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.540, -46.649, 17, 60, 0, \'Largo da Santa Cecília\', this)">Largo Santa Cecília</button>
                    <button class="chip-btn" onclick="flyToLocation(-23.5422, -46.6167, 17, 60, -20, \'Largo da Concórdia\', this)">Largo da Concórdia</button>
                </div>
            </div>
        </div>
    </div>

    <div class="tabs-header">
        <button class="tab-btn" onclick="switchTab(\'tab-socio\', this)">Sociodem.</button>
        <button class="tab-btn active" onclick="switchTab(\'tab-uso\', this)">Uso do Solo</button>
        <button class="tab-btn" onclick="switchTab(\'tab-infra\', this)">Infra.</button>
        <button class="tab-btn" onclick="switchTab(\'tab-amb\', this)">Ambiental</button>
    </div>

    <div class="tab-content">
        <div id="tab-socio" class="tab-pane">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            <span class="group-title">Censo 2022</span>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'socio_dens\')">!</span> <label>👥 Densidade Demográfica</label> <input type="checkbox" id="chk-socio_dens" onchange="toggleL(\'socio_dens\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'socio_pop\')">!</span> <label>👤 População Absoluta</label> <input type="checkbox" id="chk-socio_pop" onchange="toggleL(\'socio_pop\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'socio_dom\')">!</span> <label>🏠 Total de Domicílios</label> <input type="checkbox" id="chk-socio_dom" onchange="toggleL(\'socio_dom\')"></div>
        </div>

        <div id="tab-uso" class="tab-pane active">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            <span class="group-title">Ocupação do Solo</span>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'uso\')">!</span><label>🎨 Uso do Solo</label> <input type="checkbox" id="chk-uso" onchange="toggleL(\'uso\')"></div>
            
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'tomb_geral\')">!</span><label>🏛️ Bens Tombados (Área Geral)</label> <input type="checkbox" id="chk-tomb_geral" onchange="toggleL(\'tomb_geral\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'tomb_status\')">!</span><label>🏛️ Bens Tombados (Por Status)</label> <input type="checkbox" id="chk-tomb_status" onchange="toggleL(\'tomb_status\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'tomb_orgao\')">!</span><label>🏛️ Bens Tombados (Por Jurisdição)</label> <input type="checkbox" id="chk-tomb_orgao" onchange="toggleL(\'tomb_orgao\')"></div>
            
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'estab\')">!</span><label>🏪 Usos dos Estabelecimentos</label> <input type="checkbox" id="chk-estab" onchange="toggleL(\'estab\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'iptu\')">!</span><label>📍 Características dos Imóveis</label> <input type="checkbox" id="chk-iptu" onchange="toggleL(\'iptu\')"></div>
            
            <span class="group-title">Habitação Precária</span>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'fav\')">!</span><label>🟧 Favelas</label> <input type="checkbox" id="chk-fav" onchange="toggleL(\'fav\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'cort\')">!</span><label>🟪 Cortiços</label> <input type="checkbox" id="chk-cort" onchange="toggleL(\'cort\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'lote\')">!</span><label>🟩 Loteamentos Irreg.</label> <input type="checkbox" id="chk-lote" onchange="toggleL(\'lote\')"></div>
        </div>

        <div id="tab-infra" class="tab-pane">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            ', infra_html_menu, '
        </div>

        <div id="tab-amb" class="tab-pane">
            <button class="btn-clear" onclick="clearCurrentTab()">🗑️ Desmarcar todos</button>
            <span class="group-title">Áreas Verdes</span>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'parques\')">!</span><label>🌲 Parques e Áreas de Conservação</label> <input type="checkbox" id="chk-parques" onchange="toggleL(\'parques\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'pracas\')">!</span><label>🍃 Praças e Largos</label> <input type="checkbox" id="chk-pracas" onchange="toggleL(\'pracas\')"></div>
            <div class="layer-item"><span class="info-icon" onclick="showInfo(\'arvores\')">!</span><label>🌳 Árvores (Pontos)</label> <input type="checkbox" id="chk-arvores" onchange="toggleL(\'arvores\')"></div>
        </div>
    </div>

    <div class="panel-section-header" onclick="toggleSection(\'referencias-body\', this)" style="border-top: 1px solid #eee;">
        <span>VISUALIZAÇÃO E CAMADAS-BASE</span><span class="toggle-icon">▼</span>
    </div>
    <div id="referencias-body" class="panel-section-content" style="display: block;">
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
    
    <div class="logos-footer">
        <img src="regua_logos.png" alt="Logos Parceiros">
    </div>

</div>

<div id="legenda-altura" class="legend-container" style="position: absolute; top: 15px; right: 50px; z-index: 1000;">
    <div class="legend-title">Altura da Edificação (m)</div>
    <div style="background: linear-gradient(to right, #fcfdbf, #fc8961, #b73779, #51127c); height: 8px; width: 100%; margin:5px 0; border-radius:4px;"></div>
    <div style="display:flex; justify-content:space-between; font-size:9px; color:#666;"><span>Térreo</span><span>+50m</span></div>
</div>

<div id="legenda-iptu-explica" class="legend-container" style="position: absolute; top: 90px; right: 50px; width: 300px; display: none; z-index: 1000; padding: 15px;">
    <div class="legend-title" style="font-size: 14px; margin-bottom: 10px;">Metodologia de Agrupamento</div>
    <div style="font-size:12px; color:#555; line-height:1.5;">
        <div style="margin-bottom:8px;">
            <strong style="font-size:13px; color:#333;">Cálculo dos Indicadores:</strong>
            <ul style="margin: 6px 0 0 18px; padding:0;">
                <li style="margin-bottom: 4px;">🏢 <b>Unidades:</b> Contagem total de registros.</li>
                <li style="margin-bottom: 4px;">🏗️ <b>Área Constr.:</b> Soma total das unidades.</li>
                <li style="margin-bottom: 4px;">📐 <b>Terreno:</b> Média das áreas dos lotes.</li>
                <li style="margin-bottom: 4px;">⬆️ <b>Pavimentos:</b> Valor máximo (altura).</li>
            </ul>
        </div>
    </div>
</div>

<div id="legenda-tomb-geral" class="legend-container" style="display: none;">
    <div class="legend-title">Bens Tombados</div>
    <div class="leg-item"><span style="background:#8E44AD;"></span>Área Protegida / Tombada</div>
</div>
<div id="legenda-uso" class="legend-container"><div class="legend-title">Uso Predominante (Top 10)</div>', legenda_uso_html, '</div>
<div id="legenda-tomb-status" class="legend-container"><div class="legend-title">Tombamento (Status)</div>', legenda_tomb_status_html, '</div>
<div id="legenda-tomb-orgao" class="legend-container"><div class="legend-title">Tombamento (Jurisdição)</div>', legenda_tomb_orgao_html, '</div>
<div id="legenda-socio" class="legend-container"><div class="legend-title">Densidade Demográfica</div>', legenda_socio_html, '</div>
<div id="legenda-socio-pop" class="legend-container"><div class="legend-title">População Absoluta</div>', legenda_socio_pop_html, '</div>
<div id="legenda-socio-dom" class="legend-container"><div class="legend-title">Total de Domicílios</div>', legenda_socio_dom_html, '</div> 
<div id="legenda-hab" class="legend-container"><div class="legend-title">Habitação Precária</div>
    <div class="leg-item"><span style="background:#fd8d3c;"></span>Favelas</div>
    <div class="leg-item"><span style="background:#984ea3;"></span>Cortiços</div>
    <div class="leg-item"><span style="background:#33a02c;"></span>Loteamentos</div>
</div>

<script>
    ', metadata_js_content, '
    var infraLabels = ', infra_labels_js_obj, ';
    var data = {
        socio_dens: ', json_socio_dens, ', socio_pop: ', json_socio_pop, ', socio_dom: ', json_socio_dom, ',
        piu: ', json_piu, ', tri: ', json_tri, ', dist: ', json_dist, ', edif: ', json_edif, ', 
        tomb_geral: ', json_tomb_geral, ', tomb_status: ', json_tomb_status, ', tomb_orgao: ', json_tomb_orgao, ', 
        uso: ', json_uso, ', estab: ', json_estab, ', iptu: ', json_iptu, ',
        fav: ', json_fav, ', cort: ', json_cort, ', lote: ', json_lote, ',
        parques: ', json_parques, ', pracas: ', json_pracas, ', arvores: ', json_arvores, ',
        ', infra_js_data, '
    };
    ', logic_uso, '
    ', logic_amb, '
    ', logic_infra, '
    ', logic_socio, '
    ', app_js, '
</script>
</body>
</html>
')

write(html_content, "outputs/mapa.html")

# Copia para outputs para funcionar localmente no seu computador
if (file.exists("www/regua_logos.png")) {
  file.copy("www/regua_logos.png", "outputs/regua_logos.png", overwrite=TRUE)
}

print(">>> MAPA TPC GERADO COM SUCESSO: outputs/mapa.html")