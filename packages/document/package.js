Package.describe({
  summary: "Exartu's documents system"
});

var both = ["client", "server"];

Package.on_use(function(api){
  api.use(['collectionFS', 'cfs-gridfs'], both);

  api.add_files("common.js", both);
  api.add_files("server.js", "server");
  api.add_files(["client.js", "templates.html"], "client");

  api.export("Document");
});

Package.on_test(function(api) {
  api.use([
    "document",
    "underscore",
    "tinytest",
    "test-helpers",
    "cfs-file"
  ], both);

  api.add_files(["tests/constructor.js"], "server");
})