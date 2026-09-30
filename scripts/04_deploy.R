# ==============================================================================
# ARQUIVO: 04_deploy.R
# ==============================================================================
options(repos = c(CRAN = "https://cloud.r-project.org"))
if (!require("rsconnect")) install.packages("rsconnect")
library(rsconnect)
library(shiny)

options(rsconnect.http.timeout = 60)
rsconnect::setAccountInfo(
  name = 'SEU_NOME', 
  token = 'SEU_TOKEN', 
  secret = 'SEU_SEGREDO'
)

if (!file.exists("public/index.html")) stop("? ERRO : 'public/index.html' não encontrado. Rode o script 03_build.R antes de fazer o deploy.")

if (dir.exists("deploy_tmp")) unlink("deploy_tmp", recursive = TRUE)
dir.create("deploy_tmp/www", recursive = TRUE)

file.copy("public/index.html", "deploy_tmp/www/index_mapa.html", overwrite = TRUE)
if (dir.exists("public/data")) {
  dir.create("deploy_tmp/www/data")
  file.copy(list.files("public/data", full.names = TRUE), "deploy_tmp/www/data/", overwrite = TRUE)
}

app_content <- "library(shiny)
ui <- fluidPage(
  tags$head(
    tags$style(HTML('body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; } .container-fluid { padding: 0; margin: 0; }')),
    tags$script(HTML('setInterval(function(){ Shiny.setInputValue(\"keep_alive\", Math.random()); }, 10000);'))
  ),
  tags$iframe(src = 'index_mapa.html', style = 'width:100%; height:100vh; border:none; display:block;')
)
server <- function(input, output, session) { observeEvent(input$keep_alive, { }) }
shinyApp(ui = ui, server = server)
"

writeLines(app_content, "deploy_tmp/app.R")

rsconnect::deployApp(
  appDir = "deploy_tmp",
  appName = "mapa-sp-tpc", 
  account = "saopaulo-parcerias",
  forceUpdate = TRUE,
  launch.browser = TRUE
)
unlink("deploy_tmp", recursive = TRUE)
