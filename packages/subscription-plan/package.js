Package.describe({
  summary: "Exartu's plan subscription system"
});

var both = ["client", "server"];

Package.on_use(function(api){
  api.use(['deps','check','livedata','mongo-livedata', 'underscore', 'session'], both);
  api.use(['document'], 'server');
  api.use(['ui', 'templating', 'iron-router'], 'client');

  api.add_files("common.js", both);
  api.add_files("server.js", "server");
  api.add_files("client.html", "client");
  api.add_files("client.js", "client");

  api.export("SubscriptionPlan");
});