window.BlindSpot = window.BlindSpot || {};

BlindSpot.views = BlindSpot.views || {};

BlindSpot.views.jobsList = function (root) {
  var h = BlindSpot.helpers;

  root.innerHTML =
    '<div class="toolbar">' +
    "<div><h2 class=\"section-title\">Jobs de checagem</h2>" +
    '<p class="muted">Crie uma competência e execute para gerar inconsistências.</p></div>' +
    '<button type="button" class="btn-accent" id="btn-seed">Carregar seed</button>' +
    "</div>" +
    '<section class="panel form-panel mb-3">' +
    "<h3>Novo job</h3>" +
    '<form id="form-job" class="row g-2 align-items-end">' +
    '<div class="col-md-3"><label class="form-label">Competência</label>' +
    '<input class="form-control" name="competencia" placeholder="2026-07" required /></div>' +
    '<div class="col-md-4"><label class="form-label">Observação</label>' +
    '<input class="form-control" name="observacao" placeholder="Opcional" /></div>' +
    '<div class="col-md-3"><label class="form-label">Filtro status</label>' +
    '<select class="form-select" id="filtro-status">' +
    '<option value="">Todos</option>' +
    '<option value="pendente">pendente</option>' +
    '<option value="concluido">concluido</option>' +
    '<option value="falha">falha</option>' +
    "</select></div>" +
    '<div class="col-md-2"><button class="btn-accent w-100" type="submit">Criar</button></div>' +
    "</form></section>" +
    '<div id="jobs-grid" class="cards-grid"></div>' +
    '<p class="api-hint">API: <code>' +
    h.escapeHtml(BlindSpot.config.BASE_URL) +
    "</code></p>";

  var grid = document.getElementById("jobs-grid");
  var filtro = document.getElementById("filtro-status");

  function carregar() {
    grid.innerHTML = '<p class="muted">Carregando…</p>';
    BlindSpot.jobsApi
      .listar(filtro.value || null)
      .then(function (jobs) {
        if (!jobs.length) {
          grid.innerHTML =
            '<section class="panel empty-state"><h2>Nenhum job</h2>' +
            "<p>Crie o primeiro ou use o seed de demonstração.</p></section>";
          return;
        }
        grid.innerHTML = jobs
          .map(function (job) {
            var podeExecutar =
              job.status === "pendente" || job.status === "falha";
            var podeExcluir =
              (job.status === "pendente" || job.status === "cancelado") &&
              !(job.inconsistencias_count > 0);
            return (
              '<article class="card-item">' +
              '<div class="card-top">' +
              "<strong>#" +
              job.id +
              " · " +
              h.escapeHtml(job.competencia) +
              "</strong>" +
              '<span class="status-badge ' +
              h.badgeJob(job.status) +
              '">' +
              h.escapeHtml(h.labelStatus(job.status)) +
              "</span></div>" +
              '<p class="muted small mb-2">' +
              h.escapeHtml(job.tipo) +
              (job.observacao
                ? " — " + h.escapeHtml(job.observacao)
                : "") +
              "</p>" +
              '<p class="small mb-2">Achados: <strong>' +
              (job.inconsistencias_count || 0) +
              "</strong> · linhas: " +
              (job.linhas_processadas || 0) +
              "</p>" +
              '<div class="card-actions">' +
              '<a class="btn-link" href="#/jobs/' +
              job.id +
              '">Detalhe</a>' +
              (podeExecutar
                ? '<button type="button" class="btn-ghost" data-executar="' +
                  job.id +
                  '">Executar</button>'
                : "") +
              (podeExcluir
                ? '<button type="button" class="btn-danger-ghost" data-excluir="' +
                  job.id +
                  '">Excluir</button>'
                : "") +
              "</div></article>"
            );
          })
          .join("");
      })
      .catch(function (err) {
        grid.innerHTML =
          '<section class="panel empty-state"><h2>API indisponível</h2><p>' +
          h.escapeHtml(err.message) +
          "</p><p class=\"api-hint\">Confirme se a API está em <code>" +
          h.escapeHtml(BlindSpot.config.BASE_URL) +
          "</code></p></section>";
        BlindSpot.ui.showToast(err.message, true);
      });
  }

  document.getElementById("form-job").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var fd = new FormData(ev.target);
    BlindSpot.jobsApi
      .criar({
        competencia: fd.get("competencia"),
        observacao: fd.get("observacao") || null,
      })
      .then(function () {
        BlindSpot.ui.showToast("Job criado.");
        ev.target.reset();
        carregar();
      })
      .catch(function (err) {
        BlindSpot.ui.showToast(err.message, true);
      });
  });

  filtro.addEventListener("change", carregar);

  document.getElementById("btn-seed").addEventListener("click", function () {
    BlindSpot.api
      .post("/api/dev/seed")
      .then(function () {
        BlindSpot.ui.showToast("Seed carregado.");
        carregar();
      })
      .catch(function (err) {
        BlindSpot.ui.showToast(err.message, true);
      });
  });

  grid.addEventListener("click", function (ev) {
    var execId = ev.target.getAttribute("data-executar");
    var delId = ev.target.getAttribute("data-excluir");
    if (execId) {
      BlindSpot.jobsApi
        .executar(execId, 3)
        .then(function (job) {
          BlindSpot.ui.showToast(
            "Checagem concluída: " + job.linhas_processadas + " achado(s)."
          );
          carregar();
        })
        .catch(function (err) {
          BlindSpot.ui.showToast(err.message, true);
        });
    }
    if (delId) {
      BlindSpot.jobsApi
        .excluir(delId)
        .then(function () {
          BlindSpot.ui.showToast("Job excluído.");
          carregar();
        })
        .catch(function (err) {
          BlindSpot.ui.showToast(err.message, true);
        });
    }
  });

  carregar();
};

BlindSpot.views.jobDetail = function (root, jobId) {
  var h = BlindSpot.helpers;
  root.innerHTML = '<p class="muted">Carregando job…</p>';

  BlindSpot.jobsApi
    .obter(jobId)
    .then(function (job) {
      var eventos = (job.eventos || [])
        .map(function (e) {
          return (
            "<li><strong>" +
            h.escapeHtml(e.tipo) +
            "</strong> — " +
            h.escapeHtml(e.mensagem) +
            ' <span class="muted small">(' +
            h.escapeHtml(e.criado_em || "") +
            ")</span></li>"
          );
        })
        .join("");

      root.innerHTML =
        '<p><a href="#/jobs">← Voltar</a></p>' +
        '<section class="panel">' +
        '<div class="card-top"><h2 class="section-title mb-0">Job #' +
        job.id +
        "</h2>" +
        '<span class="status-badge ' +
        h.badgeJob(job.status) +
        '">' +
        h.escapeHtml(h.labelStatus(job.status)) +
        "</span></div>" +
        "<p>Competência: <strong>" +
        h.escapeHtml(job.competencia) +
        "</strong></p>" +
        "<p>Achados gerados: <strong>" +
        (job.inconsistencias_count || 0) +
        "</strong></p>" +
        '<p><a href="#/inconsistencias?job_id=' +
        job.id +
        '">Ver inconsistências deste job</a></p>' +
        "<h3>Eventos</h3><ul class=\"timeline\">" +
        (eventos || "<li class=\"muted\">Sem eventos</li>") +
        "</ul></section>";
    })
    .catch(function (err) {
      root.innerHTML =
        '<section class="panel empty-state"><h2>Não encontrado</h2><p>' +
        h.escapeHtml(err.message) +
        '</p><p><a href="#/jobs">Voltar</a></p></section>';
      BlindSpot.ui.showToast(err.message, true);
    });
};
