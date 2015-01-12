
/*
The new version of Iron Router is not parsing POST arguments such as files and parameters
This fix uses busboy (https://github.com/mscdex/busboy) for parsing the data
*/

if (Meteor.isServer) {
  var fs = Npm.require("fs"),
    os = Npm.require("os"),
    path = Npm.require("path");

  Router.onBeforeAction(function(req, res, next) {
    var fileData = {}; // Store a file and then pass it to the request.
    var body = {}; // Store body fields and then pass it to the request.

    if (req.method === "POST") {
      var busboy = new Busboy({
        headers: req.headers
      });
      busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join(os.tmpDir(), filename);
        var fileSizeBytes = 0;
        file.pipe(fs.createWriteStream(saveTo));

        file.on("data", function(data) {
          fileSizeBytes = fileSizeBytes + data.length;
        });

        file.on('end', function() {
          fileData = {
            originalFilename: filename,
            path: saveTo,
            size: fileSizeBytes
          };
        });
      });
      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        body[fieldname] = val;
      });
      busboy.on("finish", function() {
        // Pass the file on to the request
        req.file = fileData;
        req.bodyFields = body;
        next();
      });
      // Pass request to busboy
      req.pipe(busboy);
    } else {
      next();
    }
  });
}
