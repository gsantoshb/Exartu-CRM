Package.describe({
  summary: "Exartu's plan subscription system",
  name: 'subscription-plan'
});

var both = ["client", "server"];

Package.onUse(function(api){
  api.use(['deps','check','livedata','mongo-livedata', 'underscore', 'session'], both);
  api.use(['document'], 'server');
  api.use(['ui', 'templating', 'iron:router'], 'client');

  api.addFiles("common.js", both);
  api.addFiles("server.js", "server");
  api.addFiles("client.html", "client");
  api.addFiles("client.js", "client");

  api.export("SubscriptionPlan", both);
});