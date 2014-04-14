Document.collections = {};

Document.Collection.prototype.publish = function(options) {
  var self = this;

  var fn = options.publishFN || function() { return null; };
  Meteor.publish(self.publishName, fn);

  var allow = options.allowOptions || {
    insert: function (userId, file) {
      return true;
    },
    update: function (userId, file, fields, modifier) {
      return true;
    },
    remove: function (userId, file) {
      return true;
    }
  };
  self.documents.allow(allow);

  Document.collections[self.collectionName] = self;
}