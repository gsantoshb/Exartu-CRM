var fs = Npm.require('fs');
var Uploader = Npm.require('s3-streaming-upload').Uploader;
var Downloader = Npm.require('s3-download-stream');
var aws = Npm.require('aws-sdk');
var idgen = Npm.require('idgen');

ExternalStorage = {};

ExternalStorage.debug = false;

console.debug = function(msgs) {
  ExternalStorage.debug && console.log.apply({}, arguments);
};

// Storage

ExternalStorage.Storage = function(config) {
  var self = this;

  // TODO: validate config
  _.extend(self, config);

  if (self.accessKeyId
    && self.secretAccessKey
    && self.region
    && self.bucket
  ) {
    self.client = new aws.S3({
      secretAccessKey: self.secretAccessKey,
      accessKeyId: self.accessKeyId
    });

    _.extend(self, {
      upload: _.bind(_upload, self),
      download: _.bind(_download, self)
    })
  } else {
    var err = 'ExternalStorage - There is not client connection, set accessKeyId and secretAccessKey first';
    console.error(err);
    var errFn = function () {
      console.error(err);
    };
    _.extend(self, {
      upload: errFn,
      download: errFn
    })
  }
};

var _upload = function (stream) {
  var self = this;

  var fileId = idgen(16);

  var uploader = new Uploader({
    accessKey: self.accessKeyId,
    secretKey: self.secretAccessKey,
    bucket: self.bucket,
    objectName: fileId,
    stream: stream
  });

  var res = Meteor.wrapAsync(uploader.on, uploader)('completed');

  return fileId;
};

var _download = function (id, cb) {
  var self = this;

  var downloader = Downloader({
    client: self.client,
    params: {
      Key: id,
      Bucket: self.bucket
    }
  });

  downloader.on('end', function() {
    cb && cb.call(downloader);
  });

  return downloader;
};