Document.collections = {};

Document.Collection.prototype.publish = function(publishFN, allowOptions) {
  var self = this;

  Meteor.publish(self.collectionName,
    function() { return self.documents.find(); }
  );

  var allow = allowOptions || {
    insert: function (userId, file) {
      return true;
    },
    update: function (userId, file, fields, modifier) {
      return true;
    },
    remove: function (userId, file) {
      return true;
    },
    download: function (userId, file) {
      return true;
    }
  };

  self.documents.allow(allow);

  Document.collections[self.collectionName] = self;
}