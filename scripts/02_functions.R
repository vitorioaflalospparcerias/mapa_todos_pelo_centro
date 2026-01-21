# ==============================================================================
# ARQUIVO: 02_functions.R
# DESCRIÇÃO: Funções Auxiliares (Com Correção de Acentuação)
# ==============================================================================
library(dplyr)
library(sf)

# --- 1. CONFIGURAÇÕES VISUAIS ---
CORES_TOP <- c(
  "#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", 
  "#FDB462", "#B3DE69", "#FCCDE5", "#BC80BD", "#CCEBC5"
)
COR_OUTROS <- '#d9d9d9'

# --- 2. FUNÇÃO DE CORREÇÃO DE TEXTO ---
fix_utf8 <- function(x) {
  if(is.null(x)) return(x)
  x <- as.character(x)
  
  # Tenta converter de LATIN1 para UTF-8
  x_convertido <- iconv(x, from = "LATIN1", to = "UTF-8")
  
  # Se falhar (NA), mantém o original
  x_final <- ifelse(is.na(x_convertido), x, x_convertido)
  
  return(x_final)
}

# --- 3. RANKING DE USO DO SOLO ---
calcular_ranking_uso <- function(df, col_uso, col_area = "area_m2") {
  ranking <- df %>%
    st_drop_geometry() %>% 
    group_by(!!sym(col_uso)) %>%
    summarise(area_total = sum(!!sym(col_area), na.rm = TRUE)) %>%
    arrange(desc(area_total))
  
  top_n <- 10
  n_existente <- min(top_n, nrow(ranking))
  
  list(
    top_nomes = ranking[[col_uso]][1:n_existente],
    top_dados = ranking[1:n_existente, ]
  )
}

# --- 4. APLICAR CORES ---
aplicar_cores <- function(df, col_uso, top_nomes) {
  sapply(df[[col_uso]], function(uso) {
    idx <- match(uso, top_nomes)
    if (!is.na(idx)) {
      return(CORES_TOP[idx]) 
    } else {
      return(COR_OUTROS)
    }
  })
}

# --- 5. GERAR HTML DA LEGENDA ---
gerar_legenda_html_pastel <- function(top_dados, col_uso) {
  html_linhas <- ""
  for(i in 1:nrow(top_dados)) {
    nome <- top_dados[[col_uso]][i]
    cor  <- CORES_TOP[(i - 1) %% length(CORES_TOP) + 1]
    
    html_linhas <- paste0(html_linhas, sprintf(
      '<div class="leg-item"><span style="background:%s;"></span>%s</div>', 
      cor, nome
    ))
  }
  return(paste0(html_linhas, sprintf('<div class="leg-item"><span style="background:%s;"></span>Outros Usos</div>', COR_OUTROS)))
}