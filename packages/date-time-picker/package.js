Package.describe({
  summary: "Bootstrap 3 DateTime picker from @smalot, packaged for Meteor.js"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@0.9.0');

  api.use('jquery', 'client');
  api.use('mrt:moment@2.8.1', 'client');

  api.add_files([
    'lib/css/bootstrap3-datetimepicker.css', // Add Date Time Picker CSS and JS files
    'lib/js/bootstrap3-datetimepicker.js',
  ], 'client');
});