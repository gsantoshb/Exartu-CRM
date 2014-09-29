Package.describe({
  summary: "Exartu's documents system",
  version: '0.0.1',
  name: "document"
});

var both = ["client", "server"];

Package.onUse(function(api){
  api.use(['cfs:standard-packages', 'cfs:gridfs'], both);
  api.versionsFrom('0.9.0')
  api.addFiles("common.js", both);
  api.addFiles("server.js", "server");
  api.addFiles(["client.js", "templates.html"], "client");

  api.export("Document");
});

Package.onTest(function(api) {
  api.use([
    "document",
    "underscore",
    "tinytest",
    "test-helpers",
    "cfs-file"
  ], both);

  api.addFiles(["tests/constructor.js"], "server");
})