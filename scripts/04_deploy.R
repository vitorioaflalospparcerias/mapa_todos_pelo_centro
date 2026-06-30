



# ==============================================================================
# ARQUIVO: 04_deploy.R
# ==============================================================================

# 1. Carregar bibliotecas necessárias
if (!require("rsconnect")) install.packages("rsconnect")
library(rsconnect)
library(shiny)

# ------------------------------------------------------------------------------
# PASSO 1: Configurar a Conta
# ------------------------------------------------------------------------------


rsconnect::setAccountInfo(
  name = 'saopaulo-parcerias', 
  token = 'B66524391A6CF83E581118BD57F8574D', 
  secret = 'mwn5xGcZmW+OPxUhdcPtPzkPryfgBRUTScb4f52/'
)


# ------------------------------------------------------------------------------
# PASSO 2: Preparar a pasta 'www'
# ------------------------------------------------------------------------------
if (!dir.exists("www")) dir.create("www")

# Verifica se o mapa foi gerado
if (!file.exists("outputs/mapa.html")) {
  stop("❌ ERRO CRÍTICO: 'outputs/mapa.html' não encontrado. Rode o script 03_build.R antes de fazer o deploy.")
}

# Copia o mapa pesado para a pasta pública
file.copy(from = "outputs/mapa.html", to = "www/index_mapa.html", overwrite = TRUE)
print("    > Arquivo de mapa movido para pasta 'www/' com sucesso.")

# ------------------------------------------------------------------------------
# PASSO 3: Criar o 'app.R' envelope
# ------------------------------------------------------------------------------

app_content <- "
library(shiny)

ui <- fluidPage(
  tags$head(
    tags$style(HTML('
      body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      .container-fluid { padding: 0; margin: 0; }
    ')),
    
    tags$script(HTML('
      setInterval(function(){
        Shiny.setInputValue(\"keep_alive\", Math.random());
      }, 10000); 
    '))
  ),
  tags$iframe(
    src = 'index_mapa.html', 
    style = 'width:100%; height:100vh; border:none; display:block;'
  )
)

server <- function(input, output, session) {
  # O servidor recebe o sinal a cada 10 segundos e mantém a sessão aberta
  observeEvent(input$keep_alive, {
    # Ignora silenciosamente
  })
}

shinyApp(ui = ui, server = server)
"

writeLines(app_content, "app.R")
# ------------------------------------------------------------------------------
# PASSO 4: Enviar para o Servidor
# ------------------------------------------------------------------------------

rsconnect::deployApp(
  appDir = getwd(),
  appName = "mapa-tpc-sp", 
  appFiles = c(
    "app.R",       
    "www"         
  ),
  account = "saopaulo-parcerias",
  forceUpdate = TRUE,
  launch.browser = TRUE
)