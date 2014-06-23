Package.describe({
  summary: "Document center - Designer and filler"
});

var both = ["client", "server"];

Package.on_use(function(api){
//  api.use([], both);

  api.add_files("common.js", both);
  api.add_files("server.js", "server");
  api.add_files("client.js", "client");

  api.export("DocCenter");
});

Package.on_test(function(api) {
  api.use([
    "underscore",
    "tinytest",
  ], both);

  api.add_files(["tests/constructors.js"], "server");
})