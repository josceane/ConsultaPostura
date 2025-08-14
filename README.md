# Consulta de Artigos — Código de Posturas (Marabá)

App estático (HTML/CSS/JS) com o texto pré-carregado da **Lei 17.333/2008** (Código de Posturas de Marabá).

## Como publicar (GitHub Pages)
1. Crie um repositório no GitHub chamado `lei-posturas` (ou outro nome).
2. Envie estes arquivos para o repositório (raiz).
3. No GitHub, abra **Settings → Pages** e selecione **Deploy from a branch**, **Branch: main / root**. Salve.
4. O link será algo como: `https://SEU_USUARIO.github.io/lei-posturas/`

## Como publicar (Vercel)
1. Crie uma conta em https://vercel.com.
2. Clique em **New Project**, importe seu repositório e **Deploy**.
3. O Vercel gerará um domínio do tipo `https://lei-posturas.vercel.app`.

## URL com parâmetros
- `?art=11` abre diretamente o Art. 11. Ex.: `.../index.html?art=11`
- `?q=ruído` pesquisa por palavra. Ex.: `.../index.html?q=ruído`
