



# ==============================================================================
# ARQUIVO: 04_deploy.R
# DESCRIÇÃO: Publicação para o ShinyApps.io com script Anti-Queda (Keep-Alive)
# ==============================================================================

# 1. Carregar bibliotecas necessárias
if (!require("rsconnect")) install.packages("rsconnect")
library(rsconnect)
library(shiny)

print(">>> PREPARANDO AMBIENTE PARA DEPLOY...")

# ------------------------------------------------------------------------------
# PASSO 1: Configurar a Conta
# ------------------------------------------------------------------------------

# (Tokens -> Show -> Copy to clipboard)



rsconnect::setAccountInfo(
  name = 'saopaulo-parcerias', 
  token = 'B66524391A6CF83E581118BD57F8574D', 
  secret = 'mwn5xGcZmW+OPxUhdcPtPzkPryfgBRUTScb4f52/'
)


# ------------------------------------------------------------------------------
# PASSO 2: Preparar a pasta 'www' (Estratégia de Arquivo Estático)
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
# PASSO 3: Criar o 'app.R' envelope (Leve e com Keep-Alive)
# ------------------------------------------------------------------------------
# O código Javascript no tags$script força uma comunicação a cada 10 segundos,
# impedindo que o ShinyApps derrube a conexão por inatividade.

app_content <- "
library(shiny)

ui <- fluidPage(
  # Remove margens para o mapa ocupar a tela toda
  tags$head(
    tags$style(HTML('
      body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      .container-fluid { padding: 0; margin: 0; }
    ')),
    
    # --- CÓDIGO ANTI-QUEDA (KEEP-ALIVE) ---
    tags$script(HTML('
      setInterval(function(){
        Shiny.setInputValue(\"keep_alive\", Math.random());
      }, 10000); 
    '))
  ),
  
  # Carrega o mapa estático sem processamento no servidor
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
print("    > Arquivo 'app.R' (envelope) criado com sucesso (Proteção Anti-Queda Ativa).")

# ------------------------------------------------------------------------------
# PASSO 4: Enviar para o Servidor
# ------------------------------------------------------------------------------
print(">>> INICIANDO UPLOAD PARA SHINYAPPS.IO...")

# A pasta www já deve conter o regua_logos.png, então ele será enviado junto
rsconnect::deployApp(
  appDir = getwd(),
  appName = "mapa-tpc-sp", 
  appFiles = c(
    "app.R",       # O script leve que criamos acima
    "www"          # A pasta contendo o mapa pesado e a imagem regua_logos.png
  ),
  account = "saopaulo-parcerias",
  forceUpdate = TRUE,
  launch.browser = TRUE
)

print(">>> PUBLICAÇÃO CONCLUÍDA! Verifique o navegador.")