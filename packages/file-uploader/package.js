Package.describe({
  summary: "File upload"
});

Npm.depends({
  "idgen": "2.0.2"
});

Package.onUse(function(api){
  api.use([
    'underscore',
  ], ["server", "client"]);
  api.use(["http"], "client");
  api.use(["iron:router", "json"], "server");

  api.addFiles("common.js", ["server", "client"]);
  api.addFiles("client.js", "client");
  api.addFiles("server.js", "server");

  api.export("FileUploader", ["server", "client"]);
});