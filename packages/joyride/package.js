Package.describe({
  summary: "joyride"
});

Npm.depends({

});

Package.onUse(function(api){
  //api.use([
  //  'underscore',
  //], ["client"]);
  //api.use(["http"], "client");
  //api.use(["iron:router", "json"], "server");
  //
  api.addFiles("lib/joyride-2.1.css", ["client"]);
  api.addFiles("lib/jquery.joyride-2.1.js", "client");


  //api.export("FileUploader", ["server", "client"]);
});