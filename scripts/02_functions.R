# ==============================================================================
# ARQUIVO: 02_functions.R
# DESCRIÇÃO: Funções Auxiliares (Com Correção Inteligente de Encoding)
# ==============================================================================
library(dplyr)
library(sf)

# --- 1. CONFIGURAÇÕES VISUAIS ---
CORES_TOP <- c(
  "#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", 
  "#FDB462", "#B3DE69", "#FCCDE5", "#BC80BD", "#CCEBC5"
)
COR_OUTROS <- '#d9d9d9'

# --- 2. FUNÇÃO DE CORREÇÃO DE TEXTO (INTELIGENTE) ---
fix_utf8 <- function(x) {
  if(is.null(x)) return(x)
  x <- as.character(x)
  
  # Passo 1: Garante que tudo esteja declarado como UTF-8
  x_final <- enc2utf8(x)
  
  # Passo 2: Verifica se ocorreu "Double Encoding" (Mojibake)
  # Procura por padrões típicos de erro: Ã£ (ã), Ã© (é), Ã³ (ó), Ã§ (ç)
  # Se encontrar muitos desses casos, tenta reverter a conversão excessiva
  if (any(grepl("Ã£|Ã©|Ã³|Ãª|Ã§|Ã¡|Ãº|Ã\u0081", x_final))) {
    x_try <- tryCatch(
      iconv(x_final, from = "UTF-8", to = "LATIN1"),
      error = function(e) return(x_final)
    )
    
    # Só aplica a reversão se não gerou NAs (ou seja, se a reversão funcionou)
    if (!any(is.na(x_try))) {
      x_final <- x_try
    }
  }
  
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

# --- 5. GERAR HTML DA LEGENDA --
gerar_legenda_html_pastel <- function(top_dados, col_uso) {
  html_linhas <- ""
  if(nrow(top_dados) > 0) {
    for(i in 1:nrow(top_dados)) {
      nome <- top_dados[[col_uso]][i]
      cor  <- CORES_TOP[(i - 1) %% length(CORES_TOP) + 1]
      
      html_linhas <- paste0(html_linhas, sprintf(
        '<div class="leg-item"><span style="background:%s;"></span>%s</div>', 
        cor, nome
      ))
    }
  }
  return(paste0(html_linhas, sprintf('<div class="leg-item"><span style="background:%s;"></span>Outros Usos</div>', COR_OUTROS)))
}

fix_encoding_uso <- function(x) {
  if(is.null(x)) return(x)
  x <- as.character(x)
  
  # Força bruta: Diz para o R que o texto VEM do Windows-1252 (padrão comum em SP)
  # e deve ir para UTF-8. O 'sub' remove caracteres impossíveis de converter.
  x_convertido <- iconv(x, from = "WINDOWS-1252", to = "UTF-8", sub="")
  
  return(x_convertido)
}