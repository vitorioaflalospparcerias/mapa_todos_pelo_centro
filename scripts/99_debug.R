# ==============================================================================
# ARQUIVO: debug_cultura.R
# DESCRIÇÃO: Debug para extrair a lista exata de Bibliotecas e Museus no Mapa TPC
# ==============================================================================
library(sf)
library(dplyr)

# 1. Configurações de Caminho
path_biblio <- "data/processed/infra_cult_biblio.rds"
path_museu  <- "data/processed/infra_cult_museu.rds"
dir_out     <- "outputs"

if (!dir.exists(dir_out)) dir.create(dir_out, recursive = TRUE)

# Função auxiliar para tentar adivinhar a coluna de nome (padrões GeoSampa)
encontrar_coluna_nome <- function(df) {
  candidatas <- c("nm_equipam", "eq_nome", "nome", "nm_local", "equipament", 
                  "nm_estab", "ds_equip", "nome_equip", "equipamento", "ds_nome")
  
  colunas_existentes <- names(df)
  for (c in candidatas) {
    if (c %in% colunas_existentes) {
      return(c)
    }
  }
  # Retorna a primeira coluna de texto se não achar os nomes padrão
  return(colunas_existentes[1]) 
}

# ==============================================================================
# DEBUG: BIBLIOTECAS
# ==============================================================================
if (file.exists(path_biblio)) {
  cat("\n======================================================\n")
  cat("📚 BIBLIOTECAS DENTRO DO PERÍMETRO\n")
  cat("======================================================\n")
  
  biblio <- readRDS(path_biblio) %>% st_drop_geometry()
  col_nome <- encontrar_coluna_nome(biblio)
  
  if (nrow(biblio) > 0) {
    # Imprime a lista numerada no console
    for (i in 1:nrow(biblio)) {
      cat(sprintf("%02d. %s\n", i, biblio[[col_nome]][i]))
    }
    
    # Salva CSV
    write.csv(biblio, file.path(dir_out, "debug_bibliotecas.csv"), row.names = FALSE, fileEncoding = "UTF-8")
    cat(sprintf("\n✅ Tabela completa salva em: %s/debug_bibliotecas.csv\n", dir_out))
  } else {
    cat("⚠️ O arquivo existe, mas está VAZIO (Nenhuma biblioteca no perímetro).\n")
  }
} else {
  cat("\n[!] ARQUIVO NÃO ENCONTRADO: ", path_biblio, "\n")
}

# ==============================================================================
# DEBUG: MUSEUS
# ==============================================================================
if (file.exists(path_museu)) {
  cat("\n======================================================\n")
  cat("🏛️ MUSEUS DENTRO DO PERÍMETRO\n")
  cat("======================================================\n")
  
  museu <- readRDS(path_museu) %>% st_drop_geometry()
  col_nome <- encontrar_coluna_nome(museu)
  
  if (nrow(museu) > 0) {
    # Imprime a lista numerada no console
    for (i in 1:nrow(museu)) {
      cat(sprintf("%02d. %s\n", i, museu[[col_nome]][i]))
    }
    
    # Salva CSV
    write.csv(museu, file.path(dir_out, "debug_museus.csv"), row.names = FALSE, fileEncoding = "UTF-8")
    cat(sprintf("\n✅ Tabela completa salva em: %s/debug_museus.csv\n", dir_out))
  } else {
    cat("⚠️ O arquivo existe, mas está VAZIO (Nenhum museu no perímetro).\n")
  }
} else {
  cat("\n[!] ARQUIVO NÃO ENCONTRADO: ", path_museu, "\n")
}
cat("\n>>> Debug Finalizado.\n")