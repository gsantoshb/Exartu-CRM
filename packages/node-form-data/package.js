Package.describe({
  summary: 'Modified node-form-data',
  version: '1.0.0',
  name: 'node-form-data'
});

Npm.depends({
  'combined-stream': "0.0.4",
  'util': "0.10.3",
  //'path'
  //'http'
  //'https'
  'url': "0.7.9",
  //'fs'
  'mime': "1.2.11",
  'async': "0.6.2"
});

Package.onUse(function(api) {
  api.addFiles('lib/form_data.js', 'server');
  api.export('FormData', 'server');
});