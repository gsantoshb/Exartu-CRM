Package.describe({
  summary: "External Storage"
});

Npm.depends({
  "aws-sdk": "2.0.19",
  "s3": "4.3.1",
  "s3-streaming-upload": "0.1.15",
  "s3-download-stream": "0.0.4",
  "idgen": "2.0.2"
});

Package.onUse(function(api){
  api.use([
    'underscore'
  ], "server");

  api.addFiles("server.js", "server");

  api.export("ExternalStorage", "server");
});