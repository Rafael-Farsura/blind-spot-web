window.BlindSpot = window.BlindSpot || {};

BlindSpot.inconsistenciasApi = {
  listar: function (filtros) {
    filtros = filtros || {};
    var parts = [];
    if (filtros.status) parts.push("status=" + encodeURIComponent(filtros.status));
    if (filtros.job_id) parts.push("job_id=" + encodeURIComponent(filtros.job_id));
    var qs = parts.length ? "?" + parts.join("&") : "";
    return BlindSpot.api.get("/api/inconsistencias" + qs);
  },
  obter: function (id) {
    return BlindSpot.api.get("/api/inconsistencias/" + id);
  },
  criar: function (payload) {
    return BlindSpot.api.post("/api/inconsistencias", payload);
  },
  atualizar: function (id, payload) {
    return BlindSpot.api.patch("/api/inconsistencias/" + id, payload);
  },
  comentar: function (id, payload) {
    return BlindSpot.api.post("/api/inconsistencias/" + id + "/comentarios", payload);
  },
  excluir: function (id) {
    return BlindSpot.api.del("/api/inconsistencias/" + id);
  },
};
