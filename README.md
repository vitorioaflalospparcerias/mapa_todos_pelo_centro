# Mapa Centro SP (Todos Pelo Centro)

Bem-vindo ao repositório do **Mapa Centro SP**, uma plataforma interativa de geovisualização focada na região central de São Paulo (Projeto Todos Pelo Centro). 

Este projeto foi arquitetado em formato "Single Page Application" (SPA) estática. O motor em R agrupa e converte todos os dados e lógicas e compila a plataforma inteira em um único arquivo `outputs/mapa.html` autossuficiente e portátil, permitindo carregamento super veloz e interface livre de manutenções de servidores pesados de mapa.

---

## 📁 Estrutura do Projeto

### Pastas Principais

- **`data/`**: Repositório de dados geográficos.
  - **`raw/`**: Arquivos brutos (Shapefiles, planilhas Excel, base de dados da prefeitura, GeoSampa). 
  - **`processed/`**: Arquivos em formato nativo R (`.rds`) padronizados, otimizados e recortados espacialmente apenas para a área do Centro, gerados pela etapa de ETL.
  
- **`scripts/`**: Códigos motores do projeto em linguagem R.
  - **`01_etl_master.R`**: Script de Extração, Transformação e Carga (ETL). O responsável pelo "Data Prep". Ele lê, padroniza projeções (SIRGAS 2000 > WGS84) e recorta geometricamente os dados de `raw/` salvando-os compactados em `processed/`.
  - **`03_build.R`**: O Construtor (Builder). Pega todos os `.rds`, minifica, transforma em dicionários GeoJSON e injeta de forma embutida, conectando o painel em HTML aos módulos `.js`, montando finalmente o site em si (`outputs/mapa.html`).

- **`assets/`**: Códigos front-end, lógica e design do mapa.
  - **`app.js`**: O "Maestro". Inicia a renderização do mapa 3D com o *MapLibre*, gerencia o painel de menus, botões, a barra de pesquisa, as legendas e regras transversais de interação (ex: regra de "Blur"/transparência dos edifícios 3D via `checkTransparency`).
  - **`styles.css`**: Todo o design, animações, ícones em CSS puro para padronização da UI/UX.
  - **`modules/`**: Lógicas de dados fragmentadas e tematizadas (ex: `logic_socio.js`, `logic_infra.js`, `logic_amb.js`). Controlam a sintaxe visual (Paint properties de tamanho, círculos e paletas de cores) que o mapa usa pra desenhar os objetos e como os balões (tooltips de Hover/Click) reagem na tela para as camadas específicas de sua aba.

### Arquivo Final
- **`outputs/mapa.html`**: O produto gerado pelo R. Você abre no navegador e já visualiza o portal completo do mapa com os dados injetados dentro de si, perfeito para hospedar de forma simples e barata no GitHub Pages, Amazon S3 ou RStudio Connect sem depender de GeoServers/API's externas.

---

## 🛠️ Como Adicionar e Atualizar Informações

O processo de atualização é padronizado e focado na consistência de dados da prefeitura. Siga este fluxo:

### Passo 1: Atualizar Dados Brutos (ETL)
Se você tem um novo dado, um shapefile ou planilha Excel atualizada:
1. Salve o arquivo na pasta `data/raw/` (de preferência criando uma subpasta para ele).
2. Abra o arquivo `scripts/01_etl_master.R` no RStudio.
3. Adicione o seu processamento chamando as funções internas, como `ler_transformar()` para shapefiles ou `processar_excel_georreferenciado()` para planilhas. Exemplo:
   ```R
   shp_nova_camada <- ler_transformar(file.path(base_raw, "sua_pasta/arquivo.shp"))
   if(!is.null(shp_nova_camada)) proc_save(unique(st_filter(shp_nova_camada, piu)), "layer_nova")
   ```
4. Execute o arquivo (`Run`). Isso garantirá que o mapa não carrege polígonos que caiam fora da zona da república e sé. Seu dado será exportado para `data/processed/layer_nova.rds`.

### Passo 2: Cadastrar e Injetar na Interface (Builder)
1. Abra o arquivo `scripts/03_build.R`.
2. Logo no topo (seção "Carregar Dados Processados"), acople o seu arquivo novo `.rds`:
   ```R
   json_novo <- prep_data("data/processed/layer_nova.rds", "tematica")
   ```
3. Role para a seção da variável R `LAYER_DATA` e crie a identificação do seu dado. Isso é o que alimenta o botão de informação (`!`) nos menus:
   ```R
   "id_da_camada": { title: "Minha Camada", source: "GeoSampa", year: "2024", desc: "Descrição." }
   ```
4. Construa a interface. Localize o bloco de HTML da aba escolhida (ex: `tab-amb` dentro de `html_content`) e insira a caixa de checagem:
   ```html
   <div class="layer-item"><span class="info-icon" onclick="showInfo('id_da_camada')">!</span><label>📍 Nome Visual</label> <input type="checkbox" id="chk-id_da_camada" onchange="toggleL('id_da_camada')"></div>
   ```
5. No final do script R, ao montar os módulos e o objeto global `data`, assegure a injeção da sua variável JSON recém-criada:
   ```R
   id_da_camada: ', json_novo, ',
   ```

### Passo 3: Registrar Lógicas Front-end (Módulos JS)
1. **Configurar o Menu:** Em `assets/app.js`, você encontrará um objeto chamado `layersByTab`. Adicione o seu `id_da_camada` na lista da respectiva aba. Se não fizer isso, quando o usuário trocar de menu o mapa esquecerá de desmarcar a sua camada.
2. **Configurar a Transparência do Centro 3D:** Ainda em `assets/app.js`, se a sua camada de informações precisar de visibilidade térrea (ex: Lotes, Zoneamento, Pontos na calçada), adicione o `id_da_camada` ao Array `groundLayers` na função `checkTransparency()`. Isso faz os prédios ficarem com efeito vidro ("Blur" automático).
3. **Pintar a Camada:** Vá para `assets/modules/logic_XXX.js` correspondente a sua aba temática. Utilize o `map.addLayer` apontando os dados originados (`data.id_da_camada`). Escreva também ali, seguindo as estruturas prontas dos módulos, os eventos do mouse (`mousemove` ou `click`) para puxar o conteúdo de nome, endereço e demais propriedades personalizadas que você quer que apareçam nas janelinhas do painel ou nos Tooltips de _Hover_.

### Passo 4: Compilar o Mapa
- Com tudo salvo e as rotinas prontas, execute todo o script `scripts/03_build.R`.
- O Builder varrerá seus códigos JavaScript estáticos da pasta de `assets`, seus dados compactados de `data`, encapsulará tudo, minificará o código desnecessário e sobreescreverá o `outputs/mapa.html` magistralmente.
- Abra o `outputs/mapa.html` em qualquer navegador (frequentemente usando **Ctrl+F5** caso haja cache de javascript anterior) e maravilhe-se com a sua nova camada em ação!
