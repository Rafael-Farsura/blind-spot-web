window.BlindSpot = window.BlindSpot || {};

BlindSpot.api = (function () {
  function url(path) {
    var base = BlindSpot.config.BASE_URL.replace(/\/$/, "");
    return base + path;
  }

  function request(method, path, body) {
    var options = {
      method: method,
      headers: {
        Accept: "application/json",
      },
    };

    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    return fetch(url(path), options).then(function (response) {
      if (response.status === 204) {
        return null;
      }

      return response.text().then(function (raw) {
        var data = null;
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch (err) {
            data = { erro: "Resposta inválida da API." };
          }
        }

        if (!response.ok) {
          var message =
            (data && data.erro) ||
            "Falha na requisição (" + response.status + ").";
          var error = new Error(message);
          error.status = response.status;
          error.payload = data;
          throw error;
        }

        return data;
      });
    });
  }

  return {
    get: function (path) {
      return request("GET", path);
    },
    post: function (path, body) {
      return request("POST", path, body || {});
    },
    patch: function (path, body) {
      return request("PATCH", path, body || {});
    },
    del: function (path) {
      return request("DELETE", path);
    },
  };
})();
