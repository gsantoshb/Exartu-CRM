Package.describe({
  name: 'aida:es',
  summary: "ES",
  version: '0.1.4',
  git: 'https://github.com/Exartu/Exartu-Elasticsearch.git'
});

var both = ["client", "server"];

Npm.depends({
  "elastical": "0.0.13",
});

Package.onUse(function(api){
   api.versionsFrom('METEOR@0.9.2');
   api.use([
    	"matb33:collection-hooks@0.7.7",
    	"underscore",
    ], "server");

  api.addFiles("server.js", "server");
  api.addFiles("client.js", "client");

  api.export("ES", both);
});
