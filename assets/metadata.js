/* ARQUIVO: assets/metadata.js */

const LAYER_DATA = {
    // --- SOCIODEMOGR\u00c1FICO ---
    "socio_dens": {
        title: "Densidade Demogr\u00e1fica",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censit\u00e1rios | Resultados do universo \u2013 Censo Demogr\u00e1fico IBGE 2022"
    },
    "socio_pop": {
        title: "Popula\u00e7\u00e3o Absoluta",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censit\u00e1rios | Resultados do universo \u2013 Censo Demogr\u00e1fico IBGE 2022"
    },
    "socio_dom": {
        title: "Total de Domic\u00edlios",
        source: "IBGE (Censo)",
        year: "2022",
        desc: "Agregados por Setores Censit\u00e1rios | Resultados do universo \u2013 Censo Demogr\u00e1fico IBGE 2022"
    },

    // --- USO DO SOLO E PATRIM\u00d4NIO ---
    "uso": {
        title: "Uso do Solo",
        source: "GeoSampa",
        year: "2021",
        desc: "Classifica\u00e7\u00e3o predominante do uso do solo por quadra fiscal."
    },
    
    // --- NOVAS CAMADAS DE TOMBAMENTO ---
    "tomb_status": {
        title: "Bens Tombados (Por Status)",
        source: "GeoSampa",
        year: "2019 - Data de Revis\u00e3o (12/09/2025)",
        desc: "Per\u00edmetros dos im\u00f3veis/\u00e1reas tombadas como patrim\u00f4nio hist\u00f3rico e cultural do munic\u00edpio, bens esses protegidos por legisla\u00e7\u00e3o espec\u00edfica. A camada contempla os bens tombados pela Uni\u00e3o (IPHAN), pelo Governo Estadual (Condephaat) ou pelo Conselho Municipal (Conpresp). Classifica\u00e7\u00e3o pelo est\u00e1gio do processo legal."
    },
    "tomb_orgao": {
        title: "Bens Tombados (Por Jurisdi\u00e7\u00e3o)",
        source: "GeoSampa",
        year: "2019 - Data de Revis\u00e3o (12/09/2025)",
        desc: "Per\u00edmetros dos im\u00f3veis/\u00e1reas tombadas como patrim\u00f4nio hist\u00f3rico e cultural do munic\u00edpio. Indica qual esfera de governo protege o im\u00f3vel (Municipal, Estadual ou Federal)."
    },

    // --- HABITA\u00c7\u00c3O PREC\u00c1RIA ---
    "fav": {
        title: "Favelas",
        source: "GeoSampa",
        year: "2016 - Data de Revis\u00e3o (H\u00e1 2 anos)",
        desc: "Pol\u00edgonos que delimitam as \u00e1reas das favelas no Munic\u00edpio de S\u00e3o Paulo."
    },
    "cort": {
        title: "Corti\u00e7os",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (H\u00e1 1 ano)",
        desc: "Lotes identificados como corti\u00e7o segundo um levantamento realizado pela Secretaria Municipal de Habita\u00e7\u00e3o - SEHAB em parceria com as Subprefeituras da S\u00e9 e Mo\u00f3ca."
    },
    "lote": {
        title: "Loteamentos Irregulares",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (H\u00e1 2 anos)",
        desc: "Esta base cartogr\u00e1fica \u00e9 a representa\u00e7\u00e3o vetorial dos processos de loteamentos irregulares (lotes que n\u00e3o foram regularizados por n\u00e3o atender \u00e0 legisla\u00e7\u00e3o de parcelamento e uso do solo) cadastrados pela CRF/SEHAB."
    },

    // --- AMBIENTAL ---
    "parques": {
        title: "Parques Municipais",
        source: "GeoSampa",
        year: "2024",
        desc: "Est\u00e3o inclusos nesta camada todos os parques e Unidades de Conserva\u00e7\u00e3o (UC) do Munic\u00edpio de S\u00e3o Paulo, tanto os de gest\u00e3o municipal como de gest\u00e3o estadual e federal."
    },
    "pracas": {
        title: "Pra\u00e7as e Largos",
        source: "GeoSampa",
        year: "2024",
        desc: "O Cadastro Georreferenciado de Pra\u00e7as e Largos do Munic\u00edpio de S\u00e3o Paulo (CADPRA\u00c7AS) comp\u00f5e um dos instrumentos da gest\u00e3o participativa de pra\u00e7as do munic\u00edpio."
    },
    "arvores": {
        title: "\u00c1rvores (Vi\u00e1rio)",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (H\u00e1 1 ano)",
        desc: "Indiv\u00edduos arb\u00f3reos localizados no sistema vi\u00e1rio do Munic\u00edpio de S\u00e3o Paulo. Compreende \u00e1rvores em cal\u00e7adas e canteiros centrais (exclui \u00e1reas internas de parques)."
    },

    // --- INFRAESTRUTURA ---
    "trans_metro_est": {
        title: "Metr\u00f4 (Esta\u00e7\u00e3o)",
        source: "GeoSampa",
        year: "2014 - \u00daltima atualiza\u00e7\u00e3o (06/12/2024)",
        desc: "Esta\u00e7\u00f5es em opera\u00e7\u00e3o da Companhia do Metropolitano de S\u00e3o Paulo - Metr\u00f4 e empresas concession\u00e1rias."
    },
    "trans_trem_est": {
        title: "Trem (Esta\u00e7\u00e3o)",
        source: "GeoSampa",
        year: "2014 - Data de Atualiza\u00e7\u00e3o (15/01/2026)",
        desc: "Esta\u00e7\u00f5es de trem da Companhia Paulista de Trens Metropolitanos (CPTM) e das empresas concession\u00e1rias."
    },
    "trans_metro_lin": {
        title: "Metr\u00f4 (Linha)",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (18/09/2023)",
        desc: "Linhas em opera\u00e7\u00e3o da Companhia do Metropolitano de S\u00e3o Paulo - Metr\u00f4 e empresas concession\u00e1rias. Inclui o monotrilho (linha 15 - Prata)."
    },
    "trans_trem_lin": {
        title: "Trem (Linha)",
        source: "GeoSampa",
        year: "2014 - Data de Atualiza\u00e7\u00e3o (15/01/2026)",
        desc: "Linhas de trem da Companhia Paulista de Trens Metropolitanos (CPTM) e empresas concession\u00e1rias."
    },
    "trans_bus_pt": {
        title: "Pontos de \u00d4nibus",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (H\u00e1 1 ano)",
        desc: "Posi\u00e7\u00e3o Geogr\u00e1fica das paradas de \u00f4nibus gerenciados pela SPTrans."
    },
    "trans_bus_term": {
        title: "Terminais de \u00d4nibus",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (10/10/2025)",
        desc: "Terminais de \u00f4nibus s\u00e3o \u00e1reas onde as linhas de \u00f4nibus t\u00eam seu ponto de chegada ou de partida."
    },
    "trans_bike": {
        title: "Ciclovias",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (22/02/2021)",
        desc: "Rede ciclovi\u00e1ria municipal constitu\u00edda pelas interven\u00e7\u00f5es vi\u00e1rias dedicadas \u00e0 circula\u00e7\u00e3o exclusiva ou n\u00e3o de bicicletas."
    },
    "infra_abs_bomprato": {
        title: "Bom Prato",
        source: "GeoSampa",
        year: "2019 - Data de Atualiza\u00e7\u00e3o (19/01/2026)",
        desc: "Localiza\u00e7\u00e3o dos restaurantes da rede estadual Bom Prato."
    },
    "infra_abs_feira": {
        title: "Feiras Livres",
        source: "GeoSampa",
        year: "2016 - Data de Atualiza\u00e7\u00e3o (19/01/2026)",
        desc: "Pontos de localiza\u00e7\u00e3o das feiras livres."
    },
    "infra_abs_mercado": {
        title: "Mercados Municipais",
        source: "GeoSampa",
        year: "2016 - Data de Atualiza\u00e7\u00e3o (19/01/2026)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de Mercados Municipais."
    },
    "infra_abs_sacolao": {
        title: "Sacol\u00f5es",
        source: "GeoSampa",
        year: "2016 - Data de Atualiza\u00e7\u00e3o (19/01/2026)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de Sacol\u00f5es Municipais."
    },
    "infra_soc_equip": {
        title: "Equipamentos de Assist. Soc.",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (28/01/2026)",
        desc: "Cadastro de Equipamentos da SMADS a partir das informa\u00e7\u00f5es fornecidas pelos equipamentos sociais."
    },
    "infra_conc_parc": {
        title: "Parcerias e Concess\u00f5es",
        source: "GeoSampa",
        year: "2024 - Data de Atualiza\u00e7\u00e3o (19/01/2026)",
        desc: "Equipamentos vinculados ao Plano Municipal de Desestatiza\u00e7\u00f5es (PMD) em modalidades de Concess\u00e3o, PPP e Termo de Permiss\u00e3o de Uso."
    },
    "infra_wifi": {
        title: "WiFi Livre SP",
        source: "GeoSampa",
        year: "2016 - Data de Revis\u00e3o (08/07/2025)",
        desc: "Localiza\u00e7\u00e3o dos pontos de servi\u00e7o Wi-fi para acesso a internet gratuita do programa WiFi Livre SP."
    },
    "infra_cult_biblio": {
        title: "Bibliotecas",
        source: "GeoSampa",
        year: "2018 - Data de Atualiza\u00e7\u00e3o (outubro/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados dos servi\u00e7os de leitura presentes no Munic\u00edpio de S\u00e3o Paulo."
    },
    "infra_cult_espaco": {
        title: "Espa\u00e7os Culturais",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (16/05/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados dos Espa\u00e7os Culturais que compreendem os Centros Culturais, Casas de Cultura, F\u00e1bricas de Cultura e Oficinas Culturais."
    },
    "infra_cult_museu": {
        title: "Museus",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (16/05/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados dos Museus."
    },
    "infra_cult_teatro": {
        title: "Teatros e Cinemas",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (16/05/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados dos Teatro/cinema/shows."
    },
    "infra_edu_infantil": {
        title: "Educa\u00e7\u00e3o Infantil",
        source: "GeoSampa",
        year: "2024",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de estabelecimentos de Ensino de Educa\u00e7\u00e3o Infantil da rede p\u00fablica no Munic\u00edpio de S\u00e3o Paulo.A camada contempla as seguintes categorias de estabelecimentos que comp\u00f5em a rede municipal, com exce\u00e7\u00e3o daquelas localizadas dentro dos Centros Educacionais Unificados (CEUs):\u2022 Centro de Educa\u00e7\u00e3o Infantil Municipal (CEI DIRET - creche da administra\u00e7\u00e3o direta)\u2022 Centro de Educa\u00e7\u00e3o Infantil (CEI INDIR - creche conveniada da administra\u00e7\u00e3o indireta)\u2022 Centro de Conviv\u00eancia Infantil/ Centro Infantil de Prote\u00e7\u00e3o \u00e0 Sa\u00fade (CCI/CIPS)\u2022 Creche Particular Conveniada (administrada por organiza\u00e7\u00e3o social via repasse de verbas pela PMSP)\u2022 Centro Municipal de Educa\u00e7\u00e3o Infantil (CEMEI)\u2022 Escola Municipal de Educa\u00e7\u00e3o Infantil (EMEI)"
    },
    "infra_edu_publica": {
        title: "Ensino Fundamental/M\u00e9dio",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (24/06/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de estabelecimentos de Ensino Fundamental e M\u00e9dio da rede p\u00fablica no Munic\u00edpio de S\u00e3o Paulo.A camada contempla as escolas municipais e estaduais de ensino fundamental e m\u00e9dio (EMEF, EMEFM e EE), com exce\u00e7\u00e3o daquelas localizadas dentro dos Centros Educacionais Unificados (CEUs)."
    },
    "infra_edu_tecnico": {
        title: "Ensino T\u00e9cnico",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (24/06/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de estabelecimentos de Ensino T\u00e9cnico P\u00fablico no Munic\u00edpio de S\u00e3o Paulo."
    },
    "infra_edu_privada": {
        title: "Rede Privada",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (24/06/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de estabelecimentos de Ensino da rede privada no Munic\u00edpio de S\u00e3o Paulo."
    },
    "infra_edu_sist_s": {
        title: "Sistema S",
        source: "GeoSampa",
        year: "2014 - Data de Revis\u00e3o (24/06/2025)",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de estabelecimentos como SENAI, SESI e SENAC no Munic\u00edpio de S\u00e3o Paulo."
    },
    "infra_edu_outros": {
        title: "Outros Equip. Educa\u00e7\u00e3o",
        source: "GeoSampa",
        year: "2024",
        desc: "CEUs e outros equipamentos educacionais complementares."
    },
    "infra_esp_centro": {
        title: "Centros Esportivos",
        source: "GeoSampa",
        year: "2025",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de Centros Esportivos p\u00fablicos municipais."
    },
    "infra_esp_clube": {
        title: "Clubes",
        source: "GeoSampa",
        year: "2025",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de Clubes."
    },
    "infra_esp_cdc": {
        title: "Clubes da Comunidade",
        source: "GeoSampa",
        year: "2024",
        desc: "Clubes da Comunidade."
    },
    "infra_esp_estadio": {
        title: "Est\u00e1dios",
        source: "GeoSampa",
        year: "2025",
        desc: "Os Clubes da Comunidade (CDCs) s\u00e3o unidades esportivas em \u00e1reas municipais, com administra\u00e7\u00e3o indireta. A gest\u00e3o do espa\u00e7o \u00e9 feita por entidades da comunidade local com reconhecida voca\u00e7\u00e3o no trabalho esportivo, legalmente constitu\u00eddo em forma de associa\u00e7\u00e3o comunit\u00e1ria."
    },
    "infra_sau_ubs": {
        title: "UBS",
        source: "GeoSampa",
        year: "2018 - Data de Atualiza\u00e7\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo."
    },
    "infra_sau_hosp": {
        title: "Hospitais",
        source: "GeoSampa",
        year: "2018 - Data de Atualiza\u00e7\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende as Unidades hospitalares."
    },
    "infra_sau_ambul": {
        title: "Ambulat\u00f3rios",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende os Ambulat\u00f3rios especializados."
    },
    "infra_sau_mental": {
        title: "Sa\u00fade Mental",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende as unidades de atendimento e aten\u00e7\u00e3o \u00e0 portadores de algum tipo de transtorno mental."
    },
    "infra_sau_dst": {
        title: "DST/Aids",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende as unidades de preven\u00e7\u00e3o, diagn\u00f3stico e tratamento de pessoas com DST/HIV/AIDS."
    },
    "infra_sau_urgencia": {
        title: "Urg\u00eancia/Emerg\u00eancia",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende as Unidades de atendimento de casos de urg\u00eancia/emerg\u00eancia."
    },
    "infra_sau_outros": {
        title: "Outros Equip. Sa\u00fade",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (18/06/2025)",
        desc: "Estabelecimentos de sa\u00fade municipais, estaduais, federais e privados da Cidade de S\u00e3o Paulo. Compreende Unidades de apoio, diagn\u00f3stico e terapia e outros."
    },
    "infra_seg_bombeiro": {
        title: "Bombeiros",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (23/08/2025)",
        desc: "Localiza\u00e7\u00e3o dos Grupamentos de Bombeiros."
    },
    "infra_seg_gcm": {
        title: "GCM",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (23/09/2025)",
        desc: "Localiza\u00e7\u00e3o dos comandos e inspetorias da Guarda Civil Metropolitana."
    },
    "infra_seg_civil": {
        title: "Pol\u00edcia Civil",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (23/09/2025)",
        desc: "Dados de unidades da Pol\u00edcia Civil, fornecidas pela Secretaria Estadual de Seguran\u00e7a P\u00fablica."
    },
    "infra_seg_militar": {
        title: "Pol\u00edcia Militar",
        source: "GeoSampa",
        year: "2015 - Data de Revis\u00e3o (23/09/2025)",
        desc: "Dados de unidades da Pol\u00edcia Militar, fornecidos pela Secretaria Estadual de Seguran\u00e7a P\u00fablica."
    },
    "infra_serv_consulado": {
        title: "Consulados",
        source: "GeoSampa",
        year: "2024",
        desc: "Representa\u00e7\u00f5es diplom\u00e1ticas estrangeiras."
    },
    "infra_serv_correios": {
        title: "Correios",
        source: "GeoSampa",
        year: "2018 - Data de Revis\u00e3o (25/05/2020)",
        desc: "Identifica\u00e7\u00e3o da localiza\u00e7\u00e3o dos Consulados."
    },
    "infra_serv_poupatempo": {
        title: "Poupatempo",
        source: "GeoSampa",
        year: "2018",
        desc: "Identifica\u00e7\u00e3o dos pontos georreferenciados de Unidades de Atendimento do Poupatempo."
    },
    "infra_serv_shopping": {
        title: "Shoppings",
        source: "GeoSampa",
        year: "2017 - Data de Revis\u00e3o (07/07/2025)",
        desc: "Localiza\u00e7\u00e3o e per\u00edmetros dos shopping centers em n\u00edvel de lote no Munic\u00edpio de S\u00e3o Paulo. Os dados prov\u00eam da Abrasce - Associa\u00e7\u00e3o Brasileira de Shopping Centers."
    },
    "estab": {
        title: "Estabelecimentos",
        source: "RAIS",
        year: "2024",
        desc: "Localiza\u00e7\u00e3o de estabelecimentos comerciais e de servi\u00e7os."
    }
};