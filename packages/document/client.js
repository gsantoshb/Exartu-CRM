Document.Collection.prototype.getThumbnailUrl = function(fileId, data) {
  var data = data || ko.observable({
    ready: ko.observable(false),
    picture: ko.observable()
  });

  getUrlAsync(this, fileId, this.collectionName + "Thumbs", function (url) {
    data().picture(url);
    data().ready(true);
  });

  return data;
};

Document.Collection.prototype.getThumbnailUrlForBlaze = function(fileId) {
  var file= this.findOne({
    _id: fileId
  });
  if (!file)
        return null;

  return file.url({store: this.collectionName + "Thumbs"})
};

Document.Collection.prototype.getUrlForBlaze = function(fileId) {
  var file= this.findOne({
    _id: fileId
  });
  if (!file)
    return null;

  return file.url({store: this.collectionName})
};

Document.Collection.prototype.getUrl = function(fileId, data) {
  var data = data || ko.observable({
    ready: ko.observable(false),
    picture: ko.observable()
  });

  getUrlAsync(this, fileId, this.collectionName, function (url) {
    data().picture(url);
    data().ready(true);
  });

  return data;
};

getUrlAsync = function (collection, id, storeName, cb, maxCallStack) {
  var defaultPicture = '/assets/user-photo-placeholder.jpg';

  if (!maxCallStack) {
    maxCallStack = 20;
  }
  var file = collection.findOne({
    _id: id
  });

  if (!file)
    return cb(defaultPicture);

  var checkFileHandler = function (callStackSize) {
    if (!callStackSize)
      callStackSize = 0;

    if (callStackSize > maxCallStack )
      return cb(defaultPicture);

    var url = file.url({store: storeName});

    if (url)
      return cb(url);

    setTimeout(function () {
      checkFileHandler(callStackSize + 1);
    }, 200 + callStackSize * 200)
  }
  checkFileHandler ();
};

Document.Collection.prototype.getFileInformation = function(fileId) {
  var data = data || ko.observable({
    file: ko.observable(),
    ready: ko.observable(false)
  });

  getInfoAsync(this, fileId, function (file) {
    data().file(file);
    data().ready(true);
  });

  return data;
}

getInfoAsync = function(self, id, cb) {
  if (!maxCallStack) {
    maxCallStack = 20;
  }
  var file = self.findOne({
    _id: id
  });

  if (!file)
    return cb(undefined);

  var checkFileHandler = function (callStackSize) {
    if (!callStackSize)
      callStackSize = 0;

    if (callStackSize > maxCallStack )
      return cb('');

    if (file.isUploaded())
    {
      file.fileUrl = ko.observable();

      getUrlAsync(self, file._id, this.collectionName, function (url) {
        file.fileUrl(url);
      });

      file.thumbUrl = ko.observable();
      if (file.isImage())
        getUrlAsync(self, file._id, self.collectionName + "Thumbs", function (url) {
          file.thumbUrl(url);
        });

      return cb(file);
    }

    setTimeout(function () {
      checkFileHandler(callStackSize + 1);
    }, 200 + callStackSize * 200)
  }
  checkFileHandler ();
}

