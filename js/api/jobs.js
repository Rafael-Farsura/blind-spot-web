window.BlindSpot = window.BlindSpot || {};

BlindSpot.jobsApi = {
  listar: function (status) {
    var qs = status ? "?status=" + encodeURIComponent(status) : "";
    
    return BlindSpot.api.get("/api/jobs" + qs);
  },

  obter: function (id) {
    return BlindSpot.api.get("/api/jobs/" + id);
  },

  criar: function (payload) {
    return BlindSpot.api.post("/api/jobs", payload);
  },

  executar: function (id, quantidade) {
    var body = {};
    if (quantidade) body.quantidade = quantidade;

    return BlindSpot.api.post("/api/jobs/" + id + "/executar", body);
  },

  excluir: function (id) {
    return BlindSpot.api.del("/api/jobs/" + id);
  },
};
