# Blind Spot Web

SPA do **Blind Spot** (HTML / CSS / JS + Bootstrap + CSS próprio).

Sem React, Vue ou Angular. Abra o `index.html` direto no navegador.

Docs: https://github.com/Rafael-Farsura/blind-spot  
API: https://github.com/Rafael-Farsura/blind-spot-api

## Como rodar

1. Suba a API em `http://127.0.0.1:5000` (repo `blind-spot-api`).
2. Abra `index.html` no Chrome/Edge/Firefox (duplo clique ou “Open with Live Server” — **não é obrigatório**).
3. Se a API estiver em outra URL/porta, edite `js/config.js` (`BASE_URL`).

## Estrutura

```
index.html
css/tokens.css      # design tokens
css/base.css
css/components.css
js/config.js
js/app.js            # hash router mínimo
```

## Observação CORS

A API libera origem `*` / `null` para funcionar com `file://`. Sem isso o browser bloqueia o `fetch`.
