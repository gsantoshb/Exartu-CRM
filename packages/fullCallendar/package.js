Package.describe({
  name: 'fullcalendar',
  summary: "My package",
  version: "0.0.1"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2.2');
  api.use([
    'momentjs:moment@2.8.4',
    'templating'
  ], 'client');
  api.addFiles([
    'dist/fullcalendar.js',
    'dist/fullcalendar.css',
    'dist/lang-all.js',
    'dist/gcal.js',
    'template.html',
    'template.js'
  ], 'client');
});