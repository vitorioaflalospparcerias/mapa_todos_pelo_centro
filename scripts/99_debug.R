# ==============================================================================
# ARQUIVO: scripts/99_debug_rds.R
# DESCRIÇÃO: Verifica o dado PROCESSADO (que vai pro HTML)
# ==============================================================================
library(sf)
library(dplyr)

cat("\n🕵️  INVESTIGAÇÃO DO ARQUIVO PROCESSADO (METRÔ)\n")
path <- "data/processed/trans_metro_lin.rds"

if (!file.exists(path)) {
  stop("❌ O arquivo processado não existe. Rode o 01_etl.R primeiro.")
}

dados <- readRDS(path)

cat(">>> Nomes das Colunas no RDS (Isso vai pro GeoJSON):\n")
print(colnames(dados))

# Tenta achar a coluna de nome/cor
col_candidata <- grep("linha", colnames(dados), value = TRUE, ignore.case = TRUE)
cat("\n>>> Colunas parecidas com 'linha':\n")
print(col_candidata)

if(length(col_candidata) > 0) {
  col <- col_candidata[1] # Pega a primeira que achar
  cat(paste0("\n>>> Valores únicos na coluna '", col, "':\n"))
  
  vals <- unique(st_drop_geometry(dados)[[col]])
  # Dput mostra se tem espaço escondido (ex: "AZUL ")
  dput(vals) 
} else {
  cat("\n⚠️ ALERTA: Nenhuma coluna de 'linha' encontrada! Verifique o ETL.\n")
}