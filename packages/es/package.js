Package.describe({
  summary: "ES"
});

var both = ["client", "server"];

Npm.depends({
  "elastical": "0.0.13",
});

Package.on_use(function(api){
	api.use([
    	"collection-hooks",
    	"underscore",
    ], "server");

  api.add_files("server.js", "server");
  api.add_files("client.js", "client");

  api.export("ES");
});