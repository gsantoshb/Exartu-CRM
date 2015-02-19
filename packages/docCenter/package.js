Package.describe({
  summary: "DocCenter API",
  name: 'doccenter'
});



Package.on_use(function (api, where) {
  api.use('underscore', 'server');
  api.add_files('common.js', ['client','server']);
  api.add_files('client.js', 'client');
  api.add_files('server.js', 'server');
  api.export("DocCenter");

});