# Notas de atualização do TestZone

As notas públicas são lidas de `atualizacoes.json` pelo `index.html`.

## Publicar uma nota

1. Entre no TestZone com a conta `admin`.
2. Na página inicial, clique em **Nova nota**.
3. Informe o título e adicione pelo menos um tópico (Adições ou Bugs). Imagens são opcionais (máximo de 1,2 MB por imagem).
4. Clique em **Confirmar e preparar publicação**. O navegador baixa um novo `atualizacoes.json`.
5. Abra o link do GitHub mostrado no formulário, edite `atualizacoes.json`, substitua o conteúdo pelo arquivo baixado e faça commit na branch `main`.
6. Após a atualização do GitHub Pages, a nota ficará visível para todos os usuários.

## Segurança / limitação do GitHub Pages

O site estático não deve conter um Personal Access Token do GitHub no JavaScript. Por isso, a publicação é preparada no navegador e o commit é confirmado no GitHub pelo admin autenticado. Isso evita expor uma credencial com permissão de escrita a todos os visitantes.

A versão é incrementada automaticamente: 1.0 → 1.1 → ... → 1.9 → 2.0.
