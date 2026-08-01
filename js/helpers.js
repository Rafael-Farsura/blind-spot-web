window.BlindSpot = window.BlindSpot || {};

BlindSpot.helpers = {
  escapeHtml: function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
  badgeJob: function (status) {
    var map = {
      pendente: "badge-pendente",
      em_execucao: "badge-run",
      concluido: "badge-ok",
      falha: "badge-fail",
      cancelado: "badge-pendente",
    };
    return map[status] || "badge-pendente";
  },
  badgeInconsistencia: function (status) {
    var map = {
      aberta: "badge-aberta",
      em_analise: "badge-analise",
      resolvida: "badge-resolvida",
      descartada: "badge-descartada",
    };
    return map[status] || "badge-aberta";
  },
  labelStatus: function (status) {
    return String(status || "").replace(/_/g, " ");
  },
};

BlindSpot.rules = {
  PARECER_MIN: 10,
  COMPETENCIA_RE: /^\d{4}-\d{2}$/,

  validarCompetencia: function (valor) {
    var v = String(valor || "").trim();
    if (!v) {
      return "Informe a competência (ex.: 2026-07).";
    }
    if (!this.COMPETENCIA_RE.test(v)) {
      return "Competência no formato AAAA-MM (ex.: 2026-07).";
    }
    return null;
  },

  validarComentario: function (autor, texto) {
    if (!String(autor || "").trim()) {
      return "Informe o autor do comentário.";
    }
    if (!String(texto || "").trim()) {
      return "O texto do comentário é obrigatório.";
    }
    if (String(texto).trim().length > 2000) {
      return "Comentário pode ter no máximo 2000 caracteres.";
    }
    return null;
  },

  validarEncerramento: function (status, parecer) {
    var fecha = status === "resolvida" || status === "descartada";
    if (!fecha) {
      return null;
    }
    var texto = String(parecer || "").trim();
    if (texto.length < this.PARECER_MIN) {
      return (
        "Para " +
        status.replace("_", " ") +
        ", o parecer precisa ter pelo menos " +
        this.PARECER_MIN +
        " caracteres (hoje: " +
        texto.length +
        ")."
      );
    }
    return null;
  },
};
