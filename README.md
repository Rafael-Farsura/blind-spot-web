# Blind Spot Web

SPA do **Blind Spot** (HTML / CSS / JS + Bootstrap + CSS próprio).

Sem React, Vue ou Angular. Abra o `index.html` direto no navegador.

Docs: https://github.com/Rafael-Farsura/blind-spot  
API: https://github.com/Rafael-Farsura/blind-spot-api

## Como rodar

1. Suba a API:

```bash
cd blind-spot-api
source .venv/Scripts/activate   # Git Bash no Windows
python run.py
```

2. (Opcional) carregue o seed:

```bash
curl -X POST http://127.0.0.1:5000/api/dev/seed
```

3. Abra `index.html` no Chrome/Edge/Firefox (duplo clique).  
   Live Server **não** é obrigatório.

4. Se a API estiver em outra URL/porta, edite `js/config.js` (`BASE_URL`).

## Fluxo na tela

- **Jobs:** criar, filtrar, executar, excluir, seed, detalhe com eventos
- **Achados:** listar/filtrar, abrir, comentar, mudar status/parecer, excluir

## Estrutura

```
index.html
css/
js/config.js
js/helpers.js
js/api/          # client + endpoints
js/views/        # jobs e inconsistencias
js/app.js        # hash router
```
