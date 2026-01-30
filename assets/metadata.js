/* ARQUIVO: assets/metadata.js */

const LAYER_DATA = {
    // --- SOCIODEMOGRÁFICO ---
    "socio_dens": {
        title: "Densidade Demográfica",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censitários | Resultados do universo – Censo Demográfico IBGE 2022"
    },
    "socio_pop": {
        title: "População Absoluta",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censitários | Resultados do universo – Censo Demográfico IBGE 2022"
    },
    "socio_dom": {
        title: "Total de Domicílios",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censitários | Resultados do universo – Censo Demográfico IBGE 2022"
    },

    // --- USO DO SOLO E PATRIMÔNIO ---
    "uso": {
        title: "Uso do Solo",
        source: "GeoSampa",
        year: "2021",
        desc: "Classificação predominante do uso do solo por quadra fiscal."
    },
    
    // --- NOVAS CAMADAS DE TOMBAMENTO ---
    "tomb_status": {
        title: "Bens Tombados (Por Status)",
        source: "GeoSampa",
        year: "2019 - Data de Revisão (12/09/2025)",
        desc: "Perímetros dos imóveis/áreas tombadas como patrimônio histórico e cultural do município, bens esses protegidos por legislação específica. A camada contempla os bens tombados pela União (IPHAN), pelo Governo Estadual (Condephaat) ou pelo Conselho Municipal (Conpresp). Classificação pelo estágio do processo legal."
    },
    "tomb_orgao": {
        title: "Bens Tombados (Por Jurisdição)",
        source: "GeoSampa",
        year: "2019 - Data de Revisão (12/09/2025)",
        desc: "Perímetros dos imóveis/áreas tombadas como patrimônio histórico e cultural do município. Indica qual esfera de governo protege o imóvel (Municipal, Estadual ou Federal)."
    },

    // --- HABITAÇÃO PRECÁRIA ---
    "fav": {
        title: "Favelas",
        source: "GeoSampa",
        year: "2016 - Data de Revisão (Há 2 anos)",
        desc: "Polígonos que delimitam as áreas das favelas no Município de São Paulo."
    },
    "cort": {
        title: "Cortiços",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (Há 1 ano)",
        desc: "Lotes identificados como cortiço segundo um levantamento realizado pela Secretaria Municipal de Habitação - SEHAB em parceria com as Subprefeituras da Sé e Moóca."
    },
    "lote": {
        title: "Loteamentos Irregulares",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (Há 2 anos)",
        desc: "Esta base cartográfica é a representação vetorial dos processos de loteamentos irregulares (lotes que não foram regularizados por não atender à legislação de parcelamento e uso do solo) cadastrados pela CRF/SEHAB."
    },

    // --- AMBIENTAL ---
    "parques": {
        title: "Parques Municipais",
        source: "GeoSampa",
        year: "2024",
        desc: "Estão inclusos nesta camada todos os parques e Unidades de Conservação (UC) do Município de São Paulo, tanto os de gestão municipal como de gestão estadual e federal."
    },
    "pracas": {
        title: "Praças e Largos",
        source: "GeoSampa",
        year: "2024",
        desc: "O Cadastro Georreferenciado de Praças e Largos do Município de São Paulo (CADPRAÇAS) compõe um dos instrumentos da gestão participativa de praças do município."
    },
    "arvores": {
        title: "Árvores (Viário)",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (Há 1 ano)",
        desc: "Indivíduos arbóreos localizados no sistema viário do Município de São Paulo. Compreende árvores em calçadas e canteiros centrais (exclui áreas internas de parques)."
    },

    // --- INFRAESTRUTURA ---
    "trans_metro_est": {
        title: "Metrô (Estação)",
        source: "GeoSampa",
        year: "2014 - Última atualização (06/12/2024)",
        desc: "Estações em operação da Companhia do Metropolitano de São Paulo - Metrô e empresas concessionárias."
    },
    "trans_trem_est": {
        title: "Trem (Estação)",
        source: "GeoSampa",
        year: "2014 - Data de Atualização (15/01/2026)",
        desc: "Estações de trem da Companhia Paulista de Trens Metropolitanos (CPTM) e das empresas concessionárias."
    },
    "trans_metro_lin": {
        title: "Metrô (Linha)",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (18/09/2023)",
        desc: "Linhas em operação da Companhia do Metropolitano de São Paulo - Metrô e empresas concessionárias. Inclui o monotrilho (linha 15 - Prata)."
    },
    "trans_trem_lin": {
        title: "Trem (Linha)",
        source: "GeoSampa",
        year: "2014 - Data de Atualização (15/01/2026)",
        desc: "Linhas de trem da Companhia Paulista de Trens Metropolitanos (CPTM) e empresas concessionárias."
    },
    "trans_bus_pt": {
        title: "Pontos de Ônibus",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (Há 1 ano)",
        desc: "Posição Geográfica das paradas de ônibus gerenciados pela SPTrans."
    },
    "trans_bus_term": {
        title: "Terminais de Ônibus",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (10/10/2025)",
        desc: "Terminais de ônibus são áreas onde as linhas de ônibus têm seu ponto de chegada ou de partida."
    },
    "trans_bike": {
        title: "Ciclovias",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (22/02/2021)",
        desc: "Rede cicloviária municipal constituída pelas intervenções viárias dedicadas à circulação exclusiva ou não de bicicletas."
    },
    "infra_abs_bomprato": {
        title: "Bom Prato",
        source: "GeoSampa",
        year: "2019 - Data de Atualização (19/01/2026)",
        desc: "Localização dos restaurantes da rede estadual Bom Prato."
    },
    "infra_abs_feira": {
        title: "Feiras Livres",
        source: "GeoSampa",
        year: "2016 - Data de Atualização (19/01/2026)",
        desc: "Pontos de localização das feiras livres."
    },
    "infra_abs_mercado": {
        title: "Mercados Municipais",
        source: "GeoSampa",
        year: "2016 - Data de Atualização (19/01/2026)",
        desc: "Identificação dos pontos georreferenciados de Mercados Municipais."
    },
    "infra_abs_sacolao": {
        title: "Sacolões",
        source: "GeoSampa",
        year: "2016 - Data de Atualização (19/01/2026)",
        desc: "Identificação dos pontos georreferenciados de Sacolões Municipais."
    },
    "infra_soc_equip": {
        title: "Equipamentos de Assist. Soc.",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (28/01/2026)",
        desc: "Cadastro de Equipamentos da SMADS a partir das informações fornecidas pelos equipamentos sociais."
    },
    "infra_conc_parc": {
        title: "Parcerias e Concessões",
        source: "GeoSampa",
        year: "2024 - Data de Atualização (19/01/2026)",
        desc: "Equipamentos vinculados ao Plano Municipal de Desestatizações (PMD) em modalidades de Concessão, PPP e Termo de Permissão de Uso."
    },
    "infra_wifi": {
        title: "WiFi Livre SP",
        source: "GeoSampa",
        year: "2016 - Data de Revisão (08/07/2025)",
        desc: "Localização dos pontos de serviço Wi-fi para acesso a internet gratuita do programa WiFi Livre SP."
    },
    "infra_cult_biblio": {
        title: "Bibliotecas",
        source: "GeoSampa",
        year: "2018 - Data de Atualização (outubro/2025)",
        desc: "Identificação dos pontos georreferenciados dos serviços de leitura presentes no Município de São Paulo."
    },
    "infra_cult_espaco": {
        title: "Espaços Culturais",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (16/05/2025)",
        desc: "Identificação dos pontos georreferenciados dos Espaços Culturais que compreendem os Centros Culturais, Casas de Cultura, Fábricas de Cultura e Oficinas Culturais."
    },
    "infra_cult_museu": {
        title: "Museus",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (16/05/2025)",
        desc: "Identificação dos pontos georreferenciados dos Museus."
    },
    "infra_cult_teatro": {
        title: "Teatros e Cinemas",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (16/05/2025)",
        desc: "Identificação dos pontos georreferenciados dos Teatro/cinema/shows."
    },
    "infra_edu_infantil": {
        title: "Educação Infantil",
        source: "GeoSampa",
        year: "2024",
        desc: "Identificação dos pontos georreferenciados de estabelecimentos de Ensino de Educação Infantil da rede pública no Município de São Paulo.A camada contempla as seguintes categorias de estabelecimentos que compõem a rede municipal, com exceção daquelas localizadas dentro dos Centros Educacionais Unificados (CEUs):• Centro de Educação Infantil Municipal (CEI DIRET - creche da administração direta)• Centro de Educação Infantil (CEI INDIR - creche conveniada da administração indireta)• Centro de Convivência Infantil/ Centro Infantil de Proteção à Saúde (CCI/CIPS)• Creche Particular Conveniada (administrada por organização social via repasse de verbas pela PMSP)• Centro Municipal de Educação Infantil (CEMEI)• Escola Municipal de Educação Infantil (EMEI)"
    },
    "infra_edu_publica": {
        title: "Ensino Fundamental/Médio",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (24/06/2025)",
        desc: "Identificação dos pontos georreferenciados de estabelecimentos de Ensino Fundamental e Médio da rede pública no Município de São Paulo.A camada contempla as escolas municipais e estaduais de ensino fundamental e médio (EMEF, EMEFM e EE), com exceção daquelas localizadas dentro dos Centros Educacionais Unificados (CEUs)."
    },
    "infra_edu_tecnico": {
        title: "Ensino Técnico",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (24/06/2025)",
        desc: "Identificação dos pontos georreferenciados de estabelecimentos de Ensino Técnico Público no Município de São Paulo."
    },
    "infra_edu_privada": {
        title: "Rede Privada",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (24/06/2025)",
        desc: "Identificação dos pontos georreferenciados de estabelecimentos de Ensino da rede privada no Município de São Paulo."
    },
    "infra_edu_sist_s": {
        title: "Sistema S",
        source: "GeoSampa",
        year: "2014 - Data de Revisão (24/06/2025)",
        desc: "Identificação dos pontos georreferenciados de estabelecimentos como SENAI, SESI e SENAC no Município de São Paulo."
    },
    "infra_edu_outros": {
        title: "Outros Equip. Educação",
        source: "GeoSampa",
        year: "2024",
        desc: "CEUs e outros equipamentos educacionais complementares."
    },
    "infra_esp_centro": {
        title: "Centros Esportivos",
        source: "GeoSampa",
        year: "2025",
        desc: "Identificação dos pontos georreferenciados de Centros Esportivos públicos municipais."
    },
    "infra_esp_clube": {
        title: "Clubes",
        source: "GeoSampa",
        year: "2025",
        desc: "Identificação dos pontos georreferenciados de Clubes."
    },
    "infra_esp_cdc": {
        title: "Clubes da Comunidade",
        source: "GeoSampa",
        year: "2024",
        desc: "Clubes da Comunidade."
    },
    "infra_esp_estadio": {
        title: "Estádios",
        source: "GeoSampa",
        year: "2025",
        desc: "Os Clubes da Comunidade (CDCs) são unidades esportivas em áreas municipais, com administração indireta. A gestão do espaço é feita por entidades da comunidade local com reconhecida vocação no trabalho esportivo, legalmente constituído em forma de associação comunitária."
    },
    "infra_sau_ubs": {
        title: "UBS",
        source: "GeoSampa",
        year: "2018 - Data de Atualização (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo."
    },
    "infra_sau_hosp": {
        title: "Hospitais",
        source: "GeoSampa",
        year: "2018 - Data de Atualização (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende as Unidades hospitalares."
    },
    "infra_sau_ambul": {
        title: "Ambulatórios",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende os Ambulatórios especializados."
    },
    "infra_sau_mental": {
        title: "Saúde Mental",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende as unidades de atendimento e atenção à portadores de algum tipo de transtorno mental."
    },
    "infra_sau_dst": {
        title: "DST/Aids",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende as unidades de prevenção, diagnóstico e tratamento de pessoas com DST/HIV/AIDS."
    },
    "infra_sau_urgencia": {
        title: "Urgência/Emergência",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende as Unidades de atendimento de casos de urgência/emergência."
    },
    "infra_sau_outros": {
        title: "Outros Equip. Saúde",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (18/06/2025)",
        desc: "Estabelecimentos de saúde municipais, estaduais, federais e privados da Cidade de São Paulo. Compreende Unidades de apoio, diagnóstico e terapia e outros."
    },
    "infra_seg_bombeiro": {
        title: "Bombeiros",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (23/08/2025)",
        desc: "Localização dos Grupamentos de Bombeiros."
    },
    "infra_seg_gcm": {
        title: "GCM",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (23/09/2025)",
        desc: "Localização dos comandos e inspetorias da Guarda Civil Metropolitana."
    },
    "infra_seg_civil": {
        title: "Polícia Civil",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (23/09/2025)",
        desc: "Dados de unidades da Polícia Civil, fornecidas pela Secretaria Estadual de Segurança Pública."
    },
    "infra_seg_militar": {
        title: "Polícia Militar",
        source: "GeoSampa",
        year: "2015 - Data de Revisão (23/09/2025)",
        desc: "Dados de unidades da Polícia Militar, fornecidos pela Secretaria Estadual de Segurança Pública."
    },
    "infra_serv_consulado": {
        title: "Consulados",
        source: "GeoSampa",
        year: "2024",
        desc: "Representações diplomáticas estrangeiras."
    },
    "infra_serv_correios": {
        title: "Correios",
        source: "GeoSampa",
        year: "2018 - Data de Revisão (25/05/2020)",
        desc: "Identificação da localização dos Consulados."
    },
    "infra_serv_poupatempo": {
        title: "Poupatempo",
        source: "GeoSampa",
        year: "2018",
        desc: "Identificação dos pontos georreferenciados de Unidades de Atendimento do Poupatempo."
    },
    "infra_serv_shopping": {
        title: "Shoppings",
        source: "GeoSampa",
        year: "2017 - Data de Revisão (07/07/2025)",
        desc: "Localização e perímetros dos shopping centers em nível de lote no Município de São Paulo. Os dados provêm da Abrasce - Associação Brasileira de Shopping Centers."
    },
    "estab": {
        title: "Estabelecimentos",
        source: "RAIS",
        year: "2024",
        desc: "Localização de estabelecimentos comerciais e de serviços."
    }
};