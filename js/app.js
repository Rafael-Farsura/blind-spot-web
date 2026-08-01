(function () {
  var root = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var titleEl = document.getElementById("view-title");
  var leadEl = document.getElementById("view-lead");
  var navLinks = document.querySelectorAll("[data-nav]");

  function showToast(message, isError) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.toggle("is-error", !!isError);
    toastEl.classList.add("is-visible");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  function setActiveNav(route) {
    navLinks.forEach(function (link) {
      var target = link.getAttribute("href").replace("#", "");
      var active =
        (target === "/jobs" && route.indexOf("/jobs") === 0) ||
        (target === "/inconsistencias" && route.indexOf("/inconsistencias") === 0);
      link.classList.toggle("is-active", !!active);
    });
  }

  function parseHash() {
    var raw = (window.location.hash || "#/jobs").replace(/^#/, "");
    var parts = raw.split("?");
    var path = parts[0] || "/jobs";
    var query = {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (kv[0]) query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
    }
    return { path: path, query: query };
  }

  function setHeader(title, lead) {
    if (titleEl) titleEl.textContent = title;
    if (leadEl) leadEl.textContent = lead;
  }

  function route() {
    var info = parseHash();
    var path = info.path;
    setActiveNav(path);

    var jobMatch = path.match(/^\/jobs\/(\d+)$/);
    var itemMatch = path.match(/^\/inconsistencias\/(\d+)$/);

    if (path === "/" || path === "/jobs") {
      setHeader("Jobs", "Crie e execute checagens para revelar inconsistências.");
      BlindSpot.views.jobsList(root);
      return;
    }
    if (jobMatch) {
      setHeader("Detalhe do job", "Eventos e resumo da execução.");
      BlindSpot.views.jobDetail(root, jobMatch[1]);
      return;
    }
    if (path === "/inconsistencias") {
      setHeader("Achados", "Filtre, comente e feche com parecer.");
      BlindSpot.views.inconsistenciasList(root, info.query);
      return;
    }
    if (itemMatch) {
      setHeader("Detalhe do achado", "Timeline de comentários e encerramento.");
      BlindSpot.views.inconsistenciaDetail(root, itemMatch[1]);
      return;
    }

    setHeader("Não encontrado", "");
    root.innerHTML =
      '<section class="panel empty-state"><h2>Rota inválida</h2>' +
      '<p><a href="#/jobs">Ir para Jobs</a></p></section>';
  }

  window.BlindSpot.ui = { showToast: showToast };
  window.addEventListener("hashchange", route);
  route();
})();
