Document = Document || {};

Document.collections = {};

Document.Collection = function(options) {
  var self = this;

  handleOptions(self, options);
  self.documents = new FS.Collection(self.collectionName, {
    stores: options.store
  });

  Document.collections[self.collectionName] = self;
};

Document.Collection.prototype.insert = function(file, cb) {
  file.metadata.hierId = Meteor.user().hierId;
  return this.documents.insert(file, cb);
}

Document.Collection.prototype.remove = function(filter, cb) {
  if (cb)
    this.documents.remove(filter || {}, cb);
  else
    this.documents.remove(filter || {});
}

Document.Collection.prototype.update = function(file, cb) {
  this.documents.update({_id: file._id}, {$set: { metadata: file.metadata }}, cb);
}

Document.Collection.prototype.find = function(filters, options) {
  return this.documents.find(filters || {}, options || {});
};

Document.Collection.prototype.getCollection = function() {
  return this.documents.files;
};

Document.Collection.prototype.findOne = function(filters) {
  return this.documents.findOne(filters || {});
};

var handleOptions = function(self, options) {
  if (!options.collection)
    throw new Error('[Document] ERROR: Collection not defined!');

  self.collectionName = options.collection._name + 'FS';

  if (!options.store) {
    options.store = [
      new FS.Store.GridFS(self.collectionName, {}),
      new FS.Store.GridFS(self.collectionName + "Thumbs", {
          transformWrite: function(fileObj, readStream, writeStream) {
            if (fileObj.isImage())
              gm(readStream).resize(100).stream('PNG').pipe(writeStream);
          }
        }
      )
    ];
  }

  self.storeNames = [];
  _.forEach(options.store, function(store) {
    self.storeNames.push(store.name)
  });
};

Document.Collection.prototype.getCollectionSize = function() {
  var fields = {};
  var storeNames = this.storeNames;

  _.forEach(storeNames, function(storeName) {
    fields['copies.' + storeName +'.size'] = 1;
  });

  var documentSizes = this.documents.find({'metadata.hierId': Meteor.user().hierId}, { fields: fields}).fetch();

  var totalSize = 0;
  _.forEach(documentSizes, function(size) {
    _.forEach(storeNames, function(storeName) {
      if (size.copies[storeName])
        totalSize += size.copies[storeName].size;
    });
  });

  return totalSize;
};