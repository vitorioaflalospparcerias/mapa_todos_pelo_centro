# ==============================================================================
# ARQUIVO: 01_etl_layers.R (Completo)
# ==============================================================================
library(sf)
library(dplyr)

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
  infra_conc_parc       = "equipamentos/concessoes_parcerias/concessao_parceria.shp",
  infra_wifi            = "equipamentos/conectividade/equipamento_praca_wifi.shp",
  infra_cult_biblio     = "equipamentos/cultura/equipamento_cultura_bibliotecas_v3.shp",
  infra_cult_espaco     = "equipamentos/cultura/equipamento_cultura_espacos_culturais_v3.shp",
  infra_cult_museu      = "equipamentos/cultura/equipamento_cultura_museus_v3.shp",
  infra_cult_teatro     = "equipamentos/cultura/equipamento_cultura_teatro_cinema_show_v3.shp",
  
  # --- EDUCAÇÃO ---
  infra_edu_tecnico     = "equipamentos/educacao/equipamento_educacao_ensino_tecnico_rede_publica_v2.shp",
  infra_edu_infantil    = "equipamentos/educacao/equipamento_educacao_infantil_rede_publica_v2.shp",
  infra_edu_outros      = "equipamentos/educacao/equipamento_educacao_outros_v2.shp",
  infra_edu_privada     = "equipamentos/educacao/equipamento_educacao_rede_privada_v2.shp",
  infra_edu_publica     = "equipamentos/educacao/equipamento_educacao_rede_publica_v2.shp",
  infra_edu_sist_s      = "equipamentos/educacao/equipamento_educacao_senai_sesi_senac_v2.shp",
  
  # --- ESPORTE / SAÚDE / SEGURANÇA / SERVIÇOS ---
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
  
  # --- TRANSPORTE ---
  trans_metro_est       = "transporte/estacao_metro_v2.shp",
  trans_trem_est        = "transporte/estacao_trem_v2.shp",
  trans_metro_lin       = "transporte/linha_metro_v4.shp",
  trans_trem_lin        = "transporte/linha_trem_v2.shp",
  trans_bus_pt          = "transporte/ponto_onibus.shp",
  trans_bus_term        = "transporte/terminal_onibus_v2.shp",
  trans_bike            = "transporte/via_bicicleta.shp"
)

# --- OUTROS CAMINHOS ---
paths_edificacoes <- list.files(base_raw, pattern = "SAD69_SHP_edificacao_.*\\.shp$", full.names = TRUE, recursive = TRUE)
path_piu        <- file.path(base_raw, "PIU_SETOR_CENTRAL/11_AIU_Setor_Central.shp")
path_triangulo  <- "C:/Users/vitorio.aflalo/OneDrive - SP PARCERIAS/SPP DGE - Núcleo de Pesquisa/11 - Todos Pelo Centro/06 - QGIS/shapefile/Perímetro Triângulo SP.shp"
path_uso_solo   <- file.path(base_raw, "uso_solo/uso_predominante_solo_2021_simples.shp")
path_distritos  <- file.path(base_raw, "distritos/distrito_municipal_v2.shp")
path_tombados   <- file.path(base_raw, "bens_tombados/SIRGAS_SHP_benstombados.shp")
path_favela     <- file.path(base_raw, "favela/SIRGAS_SHP_favela.shp")
path_cortico    <- file.path(base_raw, "cortico/SIRGAS_SHP_cortico.shp")
path_loteamento <- file.path(base_raw, "loteamentos_irregulares/SIRGAS_SHP_loteamento.shp")
path_parques    <- file.path(base_raw, "parques_conservacao/cadparcs_parque_unidade_conservacao.shp")
path_arvores    <- file.path(base_raw, "SIRGAS_SHP_arvore_/SIRGAS_SHP_arvore_.shp")
path_pracas     <- file.path(base_raw, "praca_largo/SIRGAS_SHP_PRACA_LARGO.shp")

# --- LEITURA ---
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

# --- PROCESSAMENTO ---
print(">>> 1. Recortes Base...")
piu       <- ler_transformar(path_piu) %>% filter(Identif == "Perimetro Adesao")
triangulo <- ler_transformar(path_triangulo)

proc_save <- function(obj, name) {
  if(!is.null(obj) && nrow(obj) > 0) {
    saveRDS(st_transform(obj, crs_web), paste0("data/processed/", name, ".rds"))
  }
}

print(">>> 2. Processando Edificações...")
lista_edif <- lapply(paths_edificacoes, ler_transformar)
lista_edif <- lista_edif[!sapply(lista_edif, is.null)]
if(length(lista_edif) > 0) {
  edificacoes_total <- do.call(rbind, lista_edif)
  edif_recorte <- unique(st_filter(edificacoes_total, piu))
  proc_save(edif_recorte, "layer_edificacoes")
}

print(">>> 3. Processando Uso e Habitação...")
print("    > Uso do Solo (Recorte: PIU Total)")
uso_piu <- unique(st_filter(ler_transformar(path_uso_solo), piu))
uso_piu$area_m2 <- as.numeric(st_area(uso_piu))
proc_save(uso_piu, "layer_uso_solo")

proc_save(st_filter(ler_transformar(path_distritos), piu), "layer_distritos")
proc_save(unique(st_filter(ler_transformar(path_tombados), piu)), "layer_tombados")
proc_save(unique(st_filter(ler_transformar(path_favela), piu)), "layer_favela")
proc_save(unique(st_filter(ler_transformar(path_cortico), piu)), "layer_cortico")
proc_save(unique(st_filter(ler_transformar(path_loteamento), piu)), "layer_loteamento")

print(">>> 4. Processando Ambiental...")
proc_save(unique(st_filter(ler_transformar(path_parques), piu)), "layer_amb_parques")
proc_save(unique(st_filter(ler_transformar(path_pracas), piu)), "layer_amb_pracas")
proc_save(unique(st_filter(ler_transformar(path_arvores), piu)), "layer_amb_arvores")
proc_save(piu, "layer_piu")
proc_save(triangulo, "layer_triangulo")

print(">>> 5. Processando INFRAESTRUTURA...")
for (name in names(infra_map)) {
  path_rel <- infra_map[[name]]
  full_path <- file.path(base_raw, path_rel)
  cat(paste("    >", name, "...\n"))
  shp <- ler_transformar(full_path)
  if(!is.null(shp)) {
    recorte <- unique(st_filter(shp, piu))
    proc_save(recorte, name)
  }
}

print(">>> 6. Processando Sociodemográfico (Censo 2022)...")
path_censo <- file.path(base_raw, "perfil_sociodemografico/SP_setores_CD2022.shp")

# Ler e Transformar
censo <- ler_transformar(path_censo)

if(!is.null(censo)) {
  # 1. Filtra pelo PIU
  censo_piu <- st_filter(censo, piu)
  
  # 2. Tratamento de Dados
  censo_piu <- censo_piu %>%
    mutate(
      populacao  = as.numeric(v0001),
      domicilios = as.numeric(v0003), # <--- COLUNA NOVA (Total Domicílios)
      area_km2   = as.numeric(AREA_KM2),
      densidade  = ifelse(area_km2 > 0, populacao / area_km2, 0)
    ) %>%
    select(CD_SETOR, populacao, domicilios, area_km2, densidade, geometry)
  
  # 3. Salva (Mantemos o mesmo arquivo, agora com mais colunas)
  proc_save(censo_piu, "layer_socio_densidade")
}

print(">>> ETL CONCLUÍDO!")