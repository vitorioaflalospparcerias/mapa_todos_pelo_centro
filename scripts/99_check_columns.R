library(sf)
library(dplyr)

verificar_shp <- function(arquivo) {
  # Tenta montar o caminho base
  caminho <- file.path("data/raw", arquivo)
  
  # Se não achar direto, tenta procurar recursivamente pelo nome do arquivo
  if (!file.exists(caminho)) {
    busca <- list.files("data/raw", pattern = basename(arquivo), recursive = TRUE, full.names = TRUE)
    if (length(busca) > 0) {
      caminho <- busca[1]
    } else {
      stop(paste("❌ Arquivo não encontrado:", arquivo))
    }
  }
  
  # Lê o arquivo
  cat(paste0("\n📂 LENDO: ", basename(caminho), "\n"))
  shp <- st_read(caminho, quiet = TRUE)
  
  # 1. Mostra Colunas
  cat("\n📌 COLUNAS DISPONÍVEIS:\n")
  print(colnames(shp))
  
  # 2. Mostra o Head (sem geometria para facilitar a leitura)
  cat("\n👀 AMOSTRA DE DADOS (2 linhas):\n")
  print(head(st_drop_geometry(shp), 10))
  cat("\n--------------------------------------------------\n")
}

# COMO USAR
verificar_shp("SAD69_SHP_edificacao_BELEM/SAD69_SHP_edificacao_BELEM.shp")

