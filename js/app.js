(function () {
  var root = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var navLinks = document.querySelectorAll("[data-nav]");

  function setActiveNav(route) {
    navLinks.forEach(function (link) {
      var target = link.getAttribute("href").replace("#", "");
      var active =
        route === target ||
        (target === "/jobs" && route.indexOf("/jobs") === 0) ||
        (target === "/inconsistencias" && route.indexOf("/inconsistencias") === 0);
      link.classList.toggle("is-active", active);
    });
  }

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

  function renderJobs() {
    root.innerHTML =
      '<section class="panel empty-state">' +
      "<h2>Jobs de checagem</h2>" +
      "<p>Ainda não há jobs. Quando a API estiver pronta, você cria uma checagem aqui e dispara a geração de inconsistências.</p>" +
      '<p class="api-hint">API esperada em <code>' +
      BlindSpot.config.BASE_URL +
      "</code></p>" +
      "</section>";
  }

  function renderInconsistencias() {
    root.innerHTML =
      '<section class="panel empty-state">' +
      "<h2>Inconsistências</h2>" +
      "<p>Os pontos cegos aparecem aqui depois de uma checagem. Por enquanto a tela é só o esqueleto da navegação.</p>" +
      "</section>";
  }

  function renderNotFound() {
    root.innerHTML =
      '<section class="panel empty-state">' +
      "<h2>Rota não encontrada</h2>" +
      '<p>Volte para <a href="#/jobs">Jobs</a>.</p>' +
      "</section>";
  }

  function route() {
    var hash = window.location.hash || "#/jobs";
    var path = hash.replace(/^#/, "") || "/jobs";
    setActiveNav(path);

    if (path === "/" || path === "/jobs") {
      renderJobs();
      return;
    }
    if (path === "/inconsistencias") {
      renderInconsistencias();
      return;
    }
    renderNotFound();
  }

  window.BlindSpot.ui = { showToast: showToast };
  window.addEventListener("hashchange", route);
  route();
})();
