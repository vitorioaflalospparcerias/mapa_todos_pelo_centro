# ==============================================================================
# ARQUIVO: 01_etl_layers.R (Versão Atualizada: Novo Perímetro AIU e Quadrilátero)
# ==============================================================================
library(sf)
library(dplyr)
library(readxl)
library(stringr)
library(tidyr)

# 1. Configurações
if (!dir.exists("data/processed")) dir.create("data/processed", recursive = TRUE)
crs_calculo <- 31983; crs_web <- 4326
base_raw <- "data/raw"

# --- MAPA DE ARQUIVOS DE INFRAESTRUTURA ---
infra_map <- list(
  infra_abs_bomprato    = "equipamentos/abastecimento/equipamento_bom_prato.shp",
  infra_abs_feira       = "equipamentos/abastecimento/equipamento_feira_livre_v2.shp",
  infra_abs_mercado     = "equipamentos/abastecimento/equipamento_mercados_municipais_v2.shp",
  infra_abs_sacolao     = "equipamentos/abastecimento/equipamento_sacoloes_v2.shp",
  infra_soc_equip       = "equipamentos/assistencia_social/equipamento_assistencia_social_v2.shp",
  infra_wifi            = "equipamentos/conectividade/equipamento_praca_wifi.shp",
  infra_cult_biblio     = "equipamentos/cultura/equipamento_cultura_bibliotecas_v3.shp",
  infra_cult_espaco     = "equipamentos/cultura/equipamento_cultura_espacos_culturais_v3.shp",
  infra_cult_museu      = "equipamentos/cultura/equipamento_cultura_museus_v3.shp",
  infra_cult_teatro     = "equipamentos/cultura/equipamento_cultura_teatro_cinema_show_v3.shp",
  infra_edu_tecnico     = "equipamentos/educacao/equipamento_educacao_ensino_tecnico_rede_publica_v2.shp",
  infra_edu_infantil    = "equipamentos/educacao/equipamento_educacao_infantil_rede_publica_v2.shp",
  infra_edu_outros      = "equipamentos/educacao/equipamento_educacao_outros_v2.shp",
  infra_edu_privada     = "equipamentos/educacao/equipamento_educacao_rede_privada_v2.shp",
  infra_edu_publica     = "equipamentos/educacao/equipamento_educacao_rede_publica_v2.shp",
  infra_edu_sist_s      = "equipamentos/educacao/equipamento_educacao_senai_sesi_senac_v2.shp",
  infra_esp_centro      = "equipamentos/esporte/equipamento_esporte_centro_esportivo_v2.shp",
  infra_esp_clube       = "equipamentos/esporte/equipamento_esporte_clubes_v2.shp",
  infra_esp_cdc         = "equipamentos/esporte/equipamento_esporte_clubesdacomunidade.shp",
  infra_esp_estadio     = "equipamentos/esporte/equipamento_esporte_estadios.shp",
  infra_sau_ambul       = "equipamentos/saude/equipamento_saude_ambulatorios_especializados_v2.shp",
  infra_sau_hosp        = "equipamentos/saude/equipamento_saude_hospital_v2.shp",
  infra_sau_outros      = "equipamentos/saude/equipamento_saude_outros_v2.shp",
  infra_sau_mental      = "equipamentos/saude/equipamento_saude_saude_mental_v2.shp",
  infra_sau_ubs         = "equipamentos/saude/equipamento_saude_ubs_posto_centro_v2.shp",
  infra_sau_dst         = "equipamentos/saude/equipamento_saude_unidades_dst-aids_v2.shp",
  infra_sau_urgencia    = "equipamentos/saude/equipamento_saude_urgencia_emergencia_v2.shp",
  infra_seg_bombeiro    = "equipamentos/seguranca/equipamento_bombeiros_v2.shp",
  infra_seg_gcm         = "equipamentos/seguranca/equipamento_guarda_civil_metropolitana_v2.shp",
  infra_seg_civil       = "equipamentos/seguranca/equipamento_policia_civil_v2.shp",
  infra_seg_militar     = "equipamentos/seguranca/equipamento_policia_militar_v2.shp",
  infra_serv_descomplica= "equipamentos/servicos/descomplica.shp",
  infra_serv_consulado  = "equipamentos/servicos/equipamento_consulados_v2.shp",
  infra_serv_correios   = "equipamentos/servicos/equipamento_correios_v2.shp",
  infra_serv_poupatempo = "equipamentos/servicos/equipamento_poupatempo_v2.shp",
  infra_serv_receita    = "equipamentos/servicos/equipamento_receita_federal_v2.shp",
  infra_serv_sabesp     = "equipamentos/servicos/equipamento_sabesp_v2.shp",
  infra_serv_shopping   = "equipamentos/servicos/equipamento_shopping_center.shp",
  trans_metro_est       = "transporte/estacao_metro_v2.shp",
  trans_trem_est        = "transporte/estacao_trem_v2.shp",
  trans_metro_lin       = "transporte/linha_metro_v4.shp",
  trans_trem_lin        = "transporte/linha_trem_v2.shp",
  trans_bus_pt          = "transporte/ponto_onibus.shp",
  trans_bus_term        = "transporte/terminal_onibus_v2.shp",
  trans_bike            = "transporte/via_bicicleta.shp"
)

# --- FUNÇÃO DE LEITURA ---
ler_transformar <- function(path) {
  if (!file.exists(path)) { 
    fname <- basename(path)
    found <- list.files(base_raw, pattern = fname, recursive = TRUE, full.names = TRUE)
    if(length(found) > 0) path <- found[1] else { message(paste("PULANDO:", fname)); return(NULL) }
  }
  shp <- st_read(path, quiet = TRUE)
  if (is.na(st_crs(shp))) { st_crs(shp) <- 31983 }
  shp <- st_transform(shp, crs_calculo)
  if (any(!st_is_valid(shp))) { shp <- st_make_valid(shp) }
  return(shp)
}

# --- PROCESSAMENTO BASE ---
print(">>> 1. Recortes Base...")
path_piu        <- file.path(base_raw, "PIU_SETOR_CENTRAL/perimetro_aiu.shp")
path_triangulo  <- "C:/Users/vitorio.aflalo/OneDrive - SP PARCERIAS/SPP DGE - Núcleo de Pesquisa/11 - Todos Pelo Centro/06 - QGIS/shapefile/Perímetro Triângulo SP.shp"
path_quadrilatero <- file.path(base_raw, "Quadrilatero/Quadrilátero.shp")

# Unifica geometrias
piu <- ler_transformar(path_piu) %>%
  st_union() %>%
  st_sf()

triangulo <- ler_transformar(path_triangulo)
quadrilatero <- ler_transformar(path_quadrilatero)

proc_save <- function(obj, name) {
  if(!is.null(obj) && nrow(obj) > 0) {
    saveRDS(st_transform(obj, crs_web), paste0("data/processed/", name, ".rds"))
  }
}

# --- IPTU 2025 (COM LIMPEZA E LÓGICA DE PRECISÃO) ---
print(">>> 3.1. Processando IPTU 2025 (Limpeza Numérica)...")
path_iptu_csv <- file.path(base_raw, "IPTU_2025_geocodificado_FINALcomareas.csv")

if(file.exists(path_iptu_csv)) {
  df_iptu <- read.csv(path_iptu_csv, sep = ";", colClasses = "character", encoding = "UTF-8")
  
  limpar_numero <- function(x) {
    x <- gsub("\\.", "", x) 
    x <- gsub(",", ".", x)  
    as.numeric(x)
  }
  
  df_iptu$longitude <- limpar_numero(df_iptu$longitude)
  df_iptu$latitude  <- limpar_numero(df_iptu$latitude)
  df_iptu$area_terreno <- limpar_numero(df_iptu$area_terreno)
  df_iptu$area_construida <- limpar_numero(df_iptu$area_construida)
  df_iptu$num_pavimentos <- limpar_numero(df_iptu$num_pavimentos)
  
  if("result_type" %in% names(df_iptu)) {
    df_iptu$precisao <- df_iptu$result_type 
  } else if ("loctype" %in% names(df_iptu)) {
    df_iptu$precisao <- df_iptu$loctype
  } else {
    df_iptu$precisao <- ifelse(df_iptu$numero != "" & !is.na(df_iptu$numero) & df_iptu$numero != "0", "high_confidence", "approximate")
  }
  
  df_iptu <- df_iptu %>% filter(!is.na(longitude), !is.na(latitude), longitude != 0, latitude != 0)
  
  if(nrow(df_iptu) > 0) {
    sf_iptu <- st_as_sf(df_iptu, coords = c("longitude", "latitude"), crs = 4326)
    sf_iptu_calc <- st_transform(sf_iptu, crs_calculo)
    sf_iptu_piu <- st_filter(sf_iptu_calc, piu)
    
    sf_iptu_final <- sf_iptu_piu %>%
      select(area_terreno, area_construida, num_pavimentos, logradouro, numero, precisao)
    
    proc_save(sf_iptu_final, "layer_iptu")
    print(paste("    > IPTU Processado (Individual):", nrow(sf_iptu_final), "unidades."))
  }
} else {
  print("    > AVISO: Arquivo IPTU CSV não encontrado.")
}

# --- CONCESSÕES E PARCERIAS EXCEL ---
print(">>> Processando Concessoes e Parcerias (Excel)...")
path_parcerias <- file.path(base_raw, "equipamentos/concessoes_parcerias/parcerias_lat_long.xlsx")

if (file.exists(path_parcerias)) {
  df_parc <- readxl::read_excel(path_parcerias)
  
  df_parc <- df_parc %>%
    mutate(coords = str_extract_all(geometry, "-?\\d+\\.\\d+")) %>%
    rowwise() %>%
    mutate(
      val1 = as.numeric(coords[1]),
      val2 = as.numeric(coords[2])
    ) %>%
    ungroup() %>%
    mutate(
      lon = ifelse(val1 > -30 & val1 < -20, val2, val1),
      lat = ifelse(val1 > -30 & val1 < -20, val1, val2)
    ) %>%
    filter(!is.na(lon) & !is.na(lat))
  
  sf_parc <- st_as_sf(df_parc, coords = c("lon", "lat"), crs = 4326) %>%
    st_transform(crs_calculo) %>%
    select(ppp, ppp_conced, ppp_modali) # Remove colunas de processamento
  
  sf_parc_piu <- st_filter(sf_parc, piu)
  proc_save(sf_parc_piu, "infra_conc_parc")
} else {
  print("    > AVISO: Arquivo parcerias_lat_long.xlsx não encontrado.")
}

# --- SUBVENÇÃO E REQUALIFICA ---
print(">>> Processando Subvencao e Requalifica...")
path_subv <- file.path(base_raw, "subvencao/imoveis_subvencao.xlsx")

if (file.exists(path_subv)) {
  df_subv <- readxl::read_excel(path_subv) %>%
    rename(
      edital = Edital,
      empreendimento = Empreendimento,
      endereco = Endereço,
      classificacao = Classificação,
      secretarias = `Secretarias Responsáveis`,
      valor_subvencao = `Valor da Subvenção`,
      categoria = Categoria
    )
  
  # Tratamento do Georreferenciamento (Lat, Lon separados por vírgula ou espaço)
  df_subv <- df_subv %>%
    mutate(
      parte1 = str_trim(str_split_fixed(georreferenciamento, ",", 2)[,1]),
      parte2 = str_trim(str_split_fixed(georreferenciamento, ",", 2)[,2]),
      parte1 = ifelse(parte2 == "", str_trim(str_split_fixed(georreferenciamento, " ", 2)[,1]), parte1),
      parte2 = ifelse(parte2 == "", str_trim(str_split_fixed(georreferenciamento, " ", 2)[,2]), parte2),
      lat_raw = as.numeric(gsub(",", ".", parte1)),
      lon_raw = as.numeric(gsub(",", ".", parte2))
    ) %>%
    mutate(
      lat = ifelse(lat_raw > -30 & lat_raw < -20, lat_raw, lon_raw),
      lon = ifelse(lat_raw > -30 & lat_raw < -20, lon_raw, lat_raw)
    ) %>%
    filter(!is.na(lat) & !is.na(lon))
  
  sf_subv <- st_as_sf(df_subv, coords = c("lon", "lat"), crs = 4326) %>%
    st_transform(crs_calculo) %>%
    select(edital, empreendimento, endereco, classificacao, secretarias, valor_subvencao, categoria)
  
  sf_subv_piu <- st_filter(sf_subv, piu)
  proc_save(sf_subv_piu, "infra_subv_requalifica")
} else {
  print("    > AVISO: Arquivo imoveis_subvencao.xlsx não encontrado.")
}

# --- RESTO DO PROCESSAMENTO ---
print(">>> Processando Camadas Restantes...")
paths_edificacoes <- list.files(base_raw, pattern = "SAD69_SHP_edificacao_.*\\.shp$", full.names = TRUE, recursive = TRUE)
lista_edif <- lapply(paths_edificacoes, ler_transformar)
lista_edif <- lista_edif[!sapply(lista_edif, is.null)]
if(length(lista_edif) > 0) {
  edificacoes_total <- do.call(rbind, lista_edif)
  proc_save(unique(st_filter(edificacoes_total, piu)), "layer_edificacoes")
}

path_uso_solo   <- file.path(base_raw, "uso_solo/uso_predominante_solo_2021_simples.shp")
path_distritos  <- file.path(base_raw, "distritos/distrito_municipal_v2.shp")
path_tombados   <- file.path(base_raw, "bens_tombados/SIRGAS_SHP_benstombados.shp")
path_favela     <- file.path(base_raw, "favela/SIRGAS_SHP_favela.shp")
path_cortico    <- file.path(base_raw, "cortico/SIRGAS_SHP_cortico.shp")
path_loteamento <- file.path(base_raw, "loteamentos_irregulares/SIRGAS_SHP_loteamento.shp")
path_parques    <- file.path(base_raw, "parques_conservacao/cadparcs_parque_unidade_conservacao.shp")
path_arvores    <- file.path(base_raw, "SIRGAS_SHP_arvore_/SIRGAS_SHP_arvore_.shp")
path_pracas     <- file.path(base_raw, "praca_largo/SIRGAS_SHP_PRACA_LARGO.shp")

uso_piu <- unique(st_filter(ler_transformar(path_uso_solo), piu))
uso_piu$area_m2 <- as.numeric(st_area(uso_piu))
proc_save(uso_piu, "layer_uso_solo")
proc_save(st_filter(ler_transformar(path_distritos), piu), "layer_distritos")
proc_save(unique(st_filter(ler_transformar(path_tombados), piu)), "layer_tombados")
proc_save(unique(st_filter(ler_transformar(path_favela), piu)), "layer_favela")
proc_save(unique(st_filter(ler_transformar(path_cortico), piu)), "layer_cortico")
proc_save(unique(st_filter(ler_transformar(path_loteamento), piu)), "layer_loteamento")
proc_save(unique(st_filter(ler_transformar(path_parques), piu)), "layer_amb_parques")
proc_save(unique(st_filter(ler_transformar(path_pracas), piu)), "layer_amb_pracas")
proc_save(unique(st_filter(ler_transformar(path_arvores), piu)), "layer_amb_arvores")
proc_save(piu, "layer_piu")
proc_save(triangulo, "layer_triangulo")
proc_save(quadrilatero, "layer_quadrilatero")

for (name in names(infra_map)) {
  shp <- ler_transformar(file.path(base_raw, infra_map[[name]]))
  if(!is.null(shp)) proc_save(unique(st_filter(shp, piu)), name)
}

path_censo <- file.path(base_raw, "perfil_sociodemografico/SP_setores_CD2022.shp")
censo <- ler_transformar(path_censo)
if(!is.null(censo)) {
  censo_piu <- st_filter(censo, piu) %>%
    mutate(populacao=as.numeric(v0001), domicilios=as.numeric(v0003), area_km2=as.numeric(AREA_KM2), densidade=ifelse(area_km2>0, populacao/area_km2, 0)) %>%
    select(CD_SETOR, populacao, domicilios, area_km2, densidade, geometry)
  proc_save(censo_piu, "layer_socio_densidade")
}

# --- NOVAS CAMADAS (MEIO AMBIENTE E RUAS TEMÁTICAS) ---
print(">>> Processando Novas Camadas...")

shp_ecoponto <- ler_transformar(file.path(base_raw, "ecoponto/ecoponto.shp"))
if(!is.null(shp_ecoponto)) proc_save(unique(st_filter(shp_ecoponto, piu)), "layer_amb_ecoponto")

shp_pev <- ler_transformar(file.path(base_raw, "ponto_entrega_voluntaria/ponto_entrega_voluntaria.shp"))
if(!is.null(shp_pev)) proc_save(unique(st_filter(shp_pev, piu)), "layer_amb_pev")

shp_compostagem <- ler_transformar(file.path(base_raw, "patio_compostagem/patio_compostagem.shp"))
if(!is.null(shp_compostagem)) proc_save(unique(st_filter(shp_compostagem, piu)), "layer_amb_compostagem")

processar_excel_georreferenciado <- function(path, out_name) {
  if(file.exists(path)) {
    df <- readxl::read_excel(path)
    df <- df %>%
      mutate(
        parte1 = str_trim(str_split_fixed(Georreferenciamento, ",", 2)[,1]),
        parte2 = str_trim(str_split_fixed(Georreferenciamento, ",", 2)[,2]),
        lat_raw = as.numeric(gsub(",", ".", parte1)),
        lon_raw = as.numeric(gsub(",", ".", parte2))
      ) %>%
      mutate(
        lat = ifelse(lat_raw > -30 & lat_raw < -20, lat_raw, lon_raw),
        lon = ifelse(lat_raw > -30 & lat_raw < -20, lon_raw, lat_raw)
      ) %>%
      filter(!is.na(lat) & !is.na(lon))
    
    sf_obj <- st_as_sf(df, coords = c("lon", "lat"), crs = 4326) %>%
      st_transform(crs_calculo)
      
    sf_piu <- st_filter(sf_obj, piu)
    proc_save(sf_piu, out_name)
  } else {
    print(paste("    > AVISO: Arquivo não encontrado:", path))
  }
}

processar_excel_georreferenciado(file.path(base_raw, "bosques_urbanos/bosques_urbanos.xlsx"), "layer_amb_bosques")

# Processamento Customizado para Ruas Tematicas (A partir do GeoSampa)
print(">>> Processando Ruas Temáticas (GeoSampa)...")
path_logradouros <- file.path(base_raw, "logradouro/SIRGAS_SHP_logradouronbl.shp")
if (file.exists(path_logradouros)) {
  sf_log <- st_read(path_logradouros, quiet = TRUE)
  
  # Adiciona CRS se estiver faltando (GeoSampa geralmente usa 31983)
  if (is.na(st_crs(sf_log))) {
    sf_log <- st_set_crs(sf_log, 31983)
  }
  
  # Filtrar as 6 ruas temáticas
  sf_rt <- sf_log %>%
    filter(
      (lg_tipo == "R" & lg_titulo == "GAL" & lg_nome == "OSORIO") |
      (lg_tipo == "R" & lg_titulo == "STA" & lg_nome == "IFIGENIA") |
      (lg_tipo == "R" & (is.na(lg_titulo) | lg_titulo == "") & lg_nome == "FLORENCIO DE ABREU") |
      (lg_tipo == "R" & (is.na(lg_titulo) | lg_titulo == "") & lg_nome == "PAULA SOUSA") |
      (lg_tipo == "R" & lg_titulo == "S" & lg_nome == "CAETANO") |
      (lg_tipo == "R" & (is.na(lg_titulo) | lg_titulo == "") & lg_nome == "ORIENTE")
    )
  
  # Mapear os nomes temáticos
  sf_rt <- sf_rt %>%
    mutate(
      `Nome da Rua` = case_when(
        lg_nome == "OSORIO" ~ "Rua das Motos",
        lg_nome == "IFIGENIA" ~ "Rua dos Eletrônicos",
        lg_nome == "FLORENCIO DE ABREU" ~ "Rua das Ferramentas",
        lg_nome == "PAULA SOUSA" ~ "Rua das Cozinhas",
        lg_nome == "CAETANO" ~ "Rua das Noivas",
        lg_nome == "ORIENTE" ~ "Rua Oriente"
      ),
      Endereço = case_when(
        lg_nome == "OSORIO" ~ "Rua General Osório - República",
        lg_nome == "IFIGENIA" ~ "Rua Santa Ifigênia - República",
        lg_nome == "FLORENCIO DE ABREU" ~ "Rua Florêncio de Abreu - Sé",
        lg_nome == "PAULA SOUSA" ~ "Rua Paula Sousa - Sé",
        lg_nome == "CAETANO" ~ "Rua São Caetano - Bom Retiro",
        lg_nome == "ORIENTE" ~ "Rua Oriente - Brás"
      )
    ) %>%
    select(`Nome da Rua`, Endereço, geometry) %>%
    st_transform(crs_calculo)
  
  sf_rt_piu <- st_filter(sf_rt, piu)
  proc_save(sf_rt_piu, "infra_ruas_tematicas")
} else {
  print("    > AVISO: Arquivo SIRGAS_SHP_logradouronbl.shp nao encontrado")
}

# Processamento Subvenção e Requalifica
print(">>> Processando Projetos Urbanos (Subvenção e Requalifica)...")
path_subv <- file.path(base_raw, "subvencao/imoveis_subvencao.xlsx")
if (file.exists(path_subv)) {
  df_subv <- readxl::read_excel(path_subv)
  df_subv <- df_subv %>%
    mutate(
      lat = as.numeric(stringr::str_trim(sapply(stringr::str_split(georreferenciamento, ","), `[`, 1))),
      lon = as.numeric(stringr::str_trim(sapply(stringr::str_split(georreferenciamento, ","), `[`, 2)))
    ) %>%
    filter(!is.na(lat) & !is.na(lon))
  
  sf_subv <- st_as_sf(df_subv, coords = c("lon", "lat"), crs = 4326)
  saveRDS(sf_subv, "data/processed/infra_subv_requalifica.rds")
} else {
  print("    > AVISO: Arquivo imoveis_subvencao.xlsx nao encontrado")
}

print(">>> ETL CONCLUÍDO!")