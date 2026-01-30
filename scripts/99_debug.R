# ==============================================================================
# ARQUIVO: 04_check_columns.R
# DESCRIÇÃO: Diagnóstico rápido para descobrir nomes de colunas
# ==============================================================================

library(sf)
library(dplyr)

# Caminho do arquivo de edificações (Confirme se é este mesmo)
path_edif <- "data/processed/layer_edificacoes.rds"

print(paste(">>> Lendo arquivo:", path_edif))

if (!file.exists(path_edif)) {
  stop("❌ ARQUIVO NÃO ENCONTRADO! Verifique se o caminho está correto.")
}

# Lê o arquivo
edif <- readRDS(path_edif)

print(">>> ARQUIVO CARREGADO COM SUCESSO!")
print("---------------------------------------------------")

# 1. Mostra todas as colunas
print(">>> LISTA DE COLUNAS DISPONÍVEIS:")
print(names(edif))

print("---------------------------------------------------")

# 2. Procura colunas que tenham 'area' no nome (pra facilitar)
cols_area <- grep("area", names(edif), ignore.case = TRUE, value = TRUE)

if (length(cols_area) > 0) {
  print(">>> CANDIDATAS A ÁREA ENCONTRADAS:")
  print(cols_area)
  
  # Mostra uma amostra dos dados dessas colunas pra ver se tem números
  print(">>> AMOSTRA DE DADOS (Primeiras 5 linhas):")
  print(edif %>% st_drop_geometry() %>% select(all_of(cols_area)) %>% head(5))
} else {
  print("⚠️ Nenhuma coluna com a palavra 'area' foi encontrada.")
}

print("---------------------------------------------------")
print(">>> Verifique qual desses nomes é o correto e me avise!")