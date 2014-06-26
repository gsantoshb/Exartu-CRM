Package.describe({
  summary: "dateTime picker using bootstrap"
});


Package.on_use(function (api) {
  api.use(['jquery','moment'], 'client');
  api.use('templating', 'client');

  api.add_files(['lib/bootstrap-datetimepicker.js','lib/bootstrap-datetimepicker.css'], 'client');
  api.add_files(['client.html', 'client.js'], 'client');
});