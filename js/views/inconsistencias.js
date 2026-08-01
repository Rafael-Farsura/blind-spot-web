window.BlindSpot = window.BlindSpot || {};
BlindSpot.views = BlindSpot.views || {};

BlindSpot.views.inconsistenciasList = function (root, query) {
  var h = BlindSpot.helpers;
  query = query || {};

  root.innerHTML =
    '<div class="toolbar">' +
    "<div><h2 class=\"section-title\">Inconsistências</h2>" +
    '<p class="muted">Triagem dos pontos cegos encontrados nas checagens.</p></div></div>' +
    '<section class="panel form-panel mb-3">' +
    '<div class="row g-2 align-items-end">' +
    '<div class="col-md-4"><label class="form-label">Status</label>' +
    '<select class="form-select" id="filtro-status">' +
    '<option value="">Todos</option>' +
    '<option value="aberta">aberta</option>' +
    '<option value="em_analise">em analise</option>' +
    '<option value="resolvida">resolvida</option>' +
    '<option value="descartada">descartada</option>' +
    "</select></div>" +
    '<div class="col-md-3"><label class="form-label">Job ID</label>' +
    '<input class="form-control" id="filtro-job" type="number" min="1" placeholder="opcional" /></div>' +
    '<div class="col-md-2"><button type="button" class="btn-accent w-100" id="btn-filtrar">Filtrar</button></div>' +
    "</div></section>" +
    '<div id="achados-grid" class="cards-grid"></div>';

  var grid = document.getElementById("achados-grid");
  var statusEl = document.getElementById("filtro-status");
  var jobEl = document.getElementById("filtro-job");

  if (query.status) statusEl.value = query.status;
  if (query.job_id) jobEl.value = query.job_id;

  function carregar() {
    grid.innerHTML = '<p class="muted">Carregando…</p>';
    BlindSpot.inconsistenciasApi
      .listar({
        status: statusEl.value || null,
        job_id: jobEl.value || null,
      })
      .then(function (itens) {
        if (!itens.length) {
          grid.innerHTML =
            '<section class="panel empty-state"><h2>Nenhum achado</h2>' +
            "<p>Execute um job ou carregue o seed na tela de Jobs.</p></section>";
          return;
        }
        grid.innerHTML = itens
          .map(function (item) {
            return (
              '<article class="card-item">' +
              '<div class="card-top">' +
              "<strong>" +
              h.escapeHtml(item.titulo) +
              "</strong>" +
              '<span class="status-badge ' +
              h.badgeInconsistencia(item.status) +
              '">' +
              h.escapeHtml(h.labelStatus(item.status)) +
              "</span></div>" +
              '<p class="small muted mb-1">' +
              h.escapeHtml(item.tipo) +
              " · " +
              h.escapeHtml(item.severidade) +
              (item.job_id ? " · job #" + item.job_id : " · manual") +
              "</p>" +
              '<p class="small mb-2">' +
              h.escapeHtml(item.descricao) +
              "</p>" +
              '<div class="card-actions">' +
              '<a class="btn-link" href="#/inconsistencias/' +
              item.id +
              '">Abrir</a>' +
              "</div></article>"
            );
          })
          .join("");
      })
      .catch(function (err) {
        grid.innerHTML =
          '<section class="panel empty-state"><h2>API indisponível</h2><p>' +
          h.escapeHtml(err.message) +
          "</p></section>";
        BlindSpot.ui.showToast(err.message, true);
      });
  }

  document.getElementById("btn-filtrar").addEventListener("click", carregar);
  carregar();
};

BlindSpot.views.inconsistenciaDetail = function (root, itemId) {
  var h = BlindSpot.helpers;
  root.innerHTML = '<p class="muted">Carregando…</p>';

  function render(item) {
    var comentarios = (item.comentarios || [])
      .map(function (c) {
        return (
          "<li><strong>" +
          h.escapeHtml(c.autor) +
          "</strong>: " +
          h.escapeHtml(c.texto) +
          ' <span class="muted small">(' +
          h.escapeHtml(c.criado_em || "") +
          ")</span></li>"
        );
      })
      .join("");

    var fechada =
      item.status === "resolvida" || item.status === "descartada";

    root.innerHTML =
      '<p><a href="#/inconsistencias">← Voltar</a></p>' +
      '<section class="panel mb-3">' +
      '<div class="card-top"><h2 class="section-title mb-0">' +
      h.escapeHtml(item.titulo) +
      "</h2>" +
      '<span class="status-badge ' +
      h.badgeInconsistencia(item.status) +
      '">' +
      h.escapeHtml(h.labelStatus(item.status)) +
      "</span></div>" +
      "<p>" +
      h.escapeHtml(item.descricao) +
      "</p>" +
      '<p class="small muted">Tipo: ' +
      h.escapeHtml(item.tipo) +
      " · Severidade: " +
      h.escapeHtml(item.severidade) +
      (item.referencia
        ? " · Ref: " + h.escapeHtml(item.referencia)
        : "") +
      "</p>" +
      (item.parecer
        ? "<p><strong>Parecer:</strong> " + h.escapeHtml(item.parecer) + "</p>"
        : "") +
      "</section>" +
      '<section class="panel mb-3">' +
      "<h3>Comentários</h3>" +
      '<ul class="timeline">' +
      (comentarios || '<li class="muted">Nenhum comentário ainda.</li>') +
      "</ul>" +
      (!fechada
        ? '<form id="form-comentario" class="row g-2 mt-2">' +
          '<div class="col-md-3"><input class="form-control" name="autor" placeholder="Autor" required /></div>' +
          '<div class="col-md-7"><input class="form-control" name="texto" placeholder="Comentário" required /></div>' +
          '<div class="col-md-2"><button class="btn-accent w-100" type="submit">Enviar</button></div>' +
          "</form>"
        : "") +
      "</section>" +
      (!fechada
        ? '<section class="panel">' +
          "<h3>Encerrar</h3>" +
          '<form id="form-fechar" class="row g-2">' +
          '<div class="col-md-3"><select class="form-select" name="status" required>' +
          '<option value="em_analise">em analise</option>' +
          '<option value="resolvida">resolvida</option>' +
          '<option value="descartada">descartada</option>' +
          "</select></div>" +
          '<div class="col-md-7"><input class="form-control" name="parecer" placeholder="Parecer (obrigatório ao resolver/descartar)" /></div>' +
          '<div class="col-md-2"><button class="btn-accent w-100" type="submit">Salvar</button></div>' +
          "</form>" +
          '<button type="button" class="btn-danger-ghost mt-3" id="btn-excluir">Excluir inconsistência</button>' +
          "</section>"
        : "");

    var formComentario = document.getElementById("form-comentario");
    if (formComentario) {
      formComentario.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(ev.target);
        BlindSpot.inconsistenciasApi
          .comentar(itemId, {
            autor: fd.get("autor"),
            texto: fd.get("texto"),
          })
          .then(function () {
            BlindSpot.ui.showToast("Comentário salvo.");
            reload();
          })
          .catch(function (err) {
            BlindSpot.ui.showToast(err.message, true);
          });
      });
    }

    var formFechar = document.getElementById("form-fechar");
    if (formFechar) {
      formFechar.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(ev.target);
        BlindSpot.inconsistenciasApi
          .atualizar(itemId, {
            status: fd.get("status"),
            parecer: fd.get("parecer") || null,
          })
          .then(function () {
            BlindSpot.ui.showToast("Status atualizado.");
            reload();
          })
          .catch(function (err) {
            BlindSpot.ui.showToast(err.message, true);
          });
      });
    }

    var btnExcluir = document.getElementById("btn-excluir");
    if (btnExcluir) {
      btnExcluir.addEventListener("click", function () {
        BlindSpot.inconsistenciasApi
          .excluir(itemId)
          .then(function () {
            BlindSpot.ui.showToast("Inconsistência removida.");
            window.location.hash = "#/inconsistencias";
          })
          .catch(function (err) {
            BlindSpot.ui.showToast(err.message, true);
          });
      });
    }
  }

  function reload() {
    BlindSpot.inconsistenciasApi
      .obter(itemId)
      .then(render)
      .catch(function (err) {
        BlindSpot.ui.showToast(err.message, true);
      });
  }

  BlindSpot.inconsistenciasApi
    .obter(itemId)
    .then(render)
    .catch(function (err) {
      root.innerHTML =
        '<section class="panel empty-state"><h2>Não encontrada</h2><p>' +
        h.escapeHtml(err.message) +
        '</p><p><a href="#/inconsistencias">Voltar</a></p></section>';
      BlindSpot.ui.showToast(err.message, true);
    });
};
