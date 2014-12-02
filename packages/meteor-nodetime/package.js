Package.describe({
  summary: "Performance profiler and monitor"
});

Npm.depends({nodetime: "0.8.15"});

Package.onUse(function (api, where) {

  api.addFiles(['main.js'], 'server');
  api.export('Nodetime');
});

