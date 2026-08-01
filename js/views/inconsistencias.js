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
          '<p class="field-hint">Regra: ao escolher <strong>resolvida</strong> ou <strong>descartada</strong>, o parecer precisa ter no mínimo <strong>10 caracteres</strong>. Em “em analise” o parecer é opcional.</p>' +
          '<form id="form-fechar" class="row g-2">' +
          '<div class="col-md-3"><label class="form-label">Novo status</label>' +
          '<select class="form-select" name="status" id="select-status" required>' +
          '<option value="em_analise">em analise</option>' +
          '<option value="resolvida">resolvida</option>' +
          '<option value="descartada">descartada</option>' +
          "</select></div>" +
          '<div class="col-md-7"><label class="form-label">Parecer</label>' +
          '<input class="form-control" name="parecer" id="input-parecer" maxlength="2000" ' +
          'placeholder="Mín. 10 caracteres se resolver/descartar" /></div>' +
          '<div class="col-md-2 d-flex align-items-end"><button class="btn-accent w-100" type="submit">Salvar</button></div>' +
          "</form>" +
          '<p class="field-hint" id="parecer-contador"></p>' +
          '<button type="button" class="btn-danger-ghost mt-2" id="btn-excluir">Excluir inconsistência</button>' +
          "</section>"
        : "");

    var formComentario = document.getElementById("form-comentario");

    if (formComentario) {
      formComentario.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(ev.target);
        var errMsg = BlindSpot.rules.validarComentario(
          fd.get("autor"),
          fd.get("texto")
        );
        if (errMsg) {
          BlindSpot.ui.showToast(errMsg, true);
          return;
        }

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
    var selectStatus = document.getElementById("select-status");
    var inputParecer = document.getElementById("input-parecer");
    var contador = document.getElementById("parecer-contador");

    function atualizarDicaParecer() {
      if (!selectStatus || !inputParecer || !contador) return;
      var status = selectStatus.value;
      var len = String(inputParecer.value || "").trim().length;
      var precisa = status === "resolvida" || status === "descartada";
      if (precisa) {
        contador.textContent =
          "Parecer: " + len + "/" + BlindSpot.rules.PARECER_MIN + " caracteres mínimos.";
        contador.classList.toggle("is-warn", len < BlindSpot.rules.PARECER_MIN);
      } else {
        contador.textContent = "Parecer opcional para “em analise”.";
        contador.classList.remove("is-warn");
      }
    }

    if (selectStatus) {
      selectStatus.addEventListener("change", function () {
        atualizarDicaParecer();
        if (
          selectStatus.value === "resolvida" ||
          selectStatus.value === "descartada"
        ) {
          BlindSpot.ui.showToast(
            "Lembrete: parecer com pelo menos 10 caracteres é obrigatório para fechar."
          );
        }
      });
    }
    if (inputParecer) {
      inputParecer.addEventListener("input", atualizarDicaParecer);
    }
    atualizarDicaParecer();

    if (formFechar) {
      formFechar.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(ev.target);
        var status = fd.get("status");
        var parecer = fd.get("parecer");
        var errMsg = BlindSpot.rules.validarEncerramento(status, parecer);
        if (errMsg) {
          BlindSpot.ui.showToast(errMsg, true);
          if (inputParecer) inputParecer.focus();
          return;
        }

        BlindSpot.inconsistenciasApi
          .atualizar(itemId, {
            status: status,
            parecer: parecer || null,
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
