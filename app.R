
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

