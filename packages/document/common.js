Document = Document || {};

Document.Collection = function(options) {
  var self = this;

  handleOptions(options);

  self.collectionName = options.collectionName;
  self.documents = new FS.Collection(self.collectionName , {
    stores: options.store
  });
  self.publishName = options.publishName;
  self.storeNames = options.storeNames;
};

Document.Collection.prototype.insert = function(file, cb) {
  var self = this;
  self.documents.insert(file, cb);
}

Document.Collection.prototype.update = function(file, cb) {
  var self = this;
  self.documents.update({_id: file._id}, {$set: { metadata: file.metadata }}, cb);
}

Document.Collection.prototype.find = function(filters) {
  return this.documents.find(filters);
};

Document.Collection.prototype.getCollection = function() {
  return this.documents;
};

Document.Collection.prototype.findOne = function(filters) {
  return this.documents.findOne(filters);
};

Document.Collection.prototype.getUrl = function(fileId, storeName) {
  var self = this;

  if (!storeName)
    storeName = storeNames[0];
  var document = self.documents.findOne({_id: fileId});
  if (!document)
    throw new Error('[Document] ERROR: Document does not exists!');

  return document.url({store: storeName});
};

var handleOptions = function(options) {
  if (!options.collection)
    throw new Error('[Document] ERROR: Collection not defined!');

  if (!options.store)
    options.store = [new FS.Store.GridFS(options.collection._name + 'GridFS', {})];

  options.storeNames = [];
  _.forEach(options.store, function(store) {
    options.storeNames.push(store.name)
  });

  if (!options.publishName)
    options.publishName = options.collection._name + 'Documents';
};