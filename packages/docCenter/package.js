Package.describe({
  summary: "DocCenter API",
  name: 'doccenter'
});

Npm.depends({
  "request": "2.53.0",
  "body-parser": "1.12.0"
});

Package.on_use(function (api, where) {
  api.use('underscore', 'server');
  api.add_files('common.js', ['client','server']);
  api.add_files('client.js', 'client');
  api.add_files('server.js', 'server');
  api.export("DocCenter");

});