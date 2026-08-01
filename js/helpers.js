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
