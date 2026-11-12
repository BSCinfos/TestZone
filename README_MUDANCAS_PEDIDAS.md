# Atualizações aplicadas — BSCinfos

## Implementado neste pacote
- Footer social fixado no limite inferior da viewport, ocupando a largura disponível.
- Ícone do sistema (`element/bscinfos-logo.png`) definido como favicon nas páginas HTML.
- Ícone de torneio nas partidas usa `element/tournament.png`.
- Normalização do rótulo de adversários gerados para `unknow`.
- Nova entrada BSCdraft com seleção de Scrim/Treino ou Torneio, formato MD3/MD5/MD7 e região (SA, NA, EMEA, EA, CN, ALL) antes do modo/mapa.
- Botão de insights abaixo do mapa e remoção desse botão da prévia/download final.
- Campo de placar e salvamento local do histórico de drafts com placar, região, tipo, MD, bans e picks.
- Contador na página inicial para a próxima janela de execução de 30 minutos.
- Gerador deixa de declarar gadget/star power nas colunas principais e alterna as chaves configuradas em cada consulta de battlelog.

## Configuração do bot
Configure `BRAWL_STARS_API_KEY_1` e `BRAWL_STARS_API_KEY_2` em Settings > Secrets and variables > Actions. A chave antiga `BRAWL_STARS_API_KEY` continua como fallback. O workflow permanece agendado a cada 30 minutos.

## Limitações que exigem backend adicional
- Histórico salvo pelo BSCdraft fica no `localStorage` do navegador atual; sincronização entre usuários exige API/servidor ou commit autenticado.
- A análise L.I.B desta versão ainda não é um modelo de IA conectado a um serviço externo; a análise atual permanece heurística/local.
- O botão de insights apresenta a lista Top 15 disponível no conjunto de dados local; não calcula ainda um ranking estatístico dedicado de first/last pick por mapa.
- Não foi implementado um painel universal de filtros para META/BRAWLERS/MAPAS/TIMES/SCRIMS, seletor multilíngue completo, classificação/armazenamento específico de builds Matcherino Gold/Prata ou agregação dos três mapas mais jogados por categoria. Esses recursos dependem de padronização adicional dos dados e persistência no backend, e não devem ser simulados como concluídos.
