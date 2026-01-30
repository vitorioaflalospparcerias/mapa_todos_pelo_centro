# ==============================================================================
# ARQUIVO: 04_deploy.R
# DESCRIÇÃO: Publicação OTIMIZADA para o ShinyApps.io (Evita erro de memória)
# ==============================================================================

# 1. Carregar bibliotecas necessárias
if (!require("rsconnect")) install.packages("rsconnect")
library(rsconnect)
library(shiny)

print(">>> PREPARANDO AMBIENTE PARA DEPLOY...")

# ------------------------------------------------------------------------------
# PASSO 1: Configurar a Conta
# ------------------------------------------------------------------------------
# Substitua os 'blabla' abaixo pelos códigos que você pega no painel do shinyapps.io
# (Tokens -> Show -> Copy to clipboard)

rsconnect::setAccountInfo(
  name = 'saopaulo-parcerias', 
  token = 'B66524391A6CF83E581118BD57F8574D', 
  secret = 'mwn5xGcZmW+OPxUhdcPtPzkPryfgBRUTScb4f52/'
)

# ------------------------------------------------------------------------------
# PASSO 2: Preparar a pasta 'www' (Estratégia de Arquivo Estático)
# ------------------------------------------------------------------------------
# O Shiny serve arquivos da pasta 'www' sem carregar na memória RAM.
# Isso evita o erro "Signal: killed".

if (!dir.exists("www")) dir.create("www")

# Verifica se o mapa foi gerado
if (!file.exists("outputs/mapa.html")) {
  stop("❌ ERRO CRÍTICO: 'outputs/mapa.html' não encontrado. Rode o script 03_build.R antes de fazer o deploy.")
}

# Copia o mapa pesado para a pasta pública
file.copy(from = "outputs/mapa.html", to = "www/index_mapa.html", overwrite = TRUE)
print("    > Arquivo de mapa movido para pasta 'www/' com sucesso.")

# ------------------------------------------------------------------------------
# PASSO 3: Criar o 'app.R' envelope (Leve)
# ------------------------------------------------------------------------------
# Criamos um app minúsculo que apenas abre um iframe para o mapa.

app_content <- '
library(shiny)

ui <- fluidPage(
  # Remove margens para o mapa ocupar a tela toda
  tags$head(
    tags$style(HTML("
      body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      .container-fluid { padding: 0; margin: 0; }
    "))
  ),
  
  # Carrega o mapa estático sem processamento no servidor
  tags$iframe(
    src = "index_mapa.html", 
    style = "width:100%; height:100vh; border:none; display:block;"
  )
)

server <- function(input, output, session) {}

shinyApp(ui = ui, server = server)
'

writeLines(app_content, "app.R")
print("    > Arquivo 'app.R' (envelope) criado.")

# ------------------------------------------------------------------------------
# PASSO 4: Enviar para o Servidor
# ------------------------------------------------------------------------------
print(">>> INICIANDO UPLOAD PARA SHINYAPPS.IO...")

rsconnect::deployApp(
  appDir = getwd(),
  appName = "mapa-tpc-sp", 
  appFiles = c(
    "app.R",       # O script leve que criamos acima
    "www"          # A pasta contendo o mapa pesado (index_mapa.html)
  ),
  account = "saopaulo-parcerias",
  forceUpdate = TRUE,
  launch.browser = TRUE
)

print(">>> PUBLICAÇÃO CONCLUÍDA! Verifique o navegador.")