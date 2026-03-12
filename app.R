
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
        Shiny.setInputValue("keep_alive", Math.random());
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

