Template.documents.waitOn = ['ContactablesFSHandler'];
Template.documents.viewModel = function() {
  var self = {},
      entityId = Session.get('entityId'),
      entityCollection = ContactablesFS; // TODO: Get it from Session

  self.searchString = ko.observable();
  var query = ko.computed(function() {
    var q = {
      'metadata.entityId': entityId
    };

    q.$or = [];
    if (self.searchString()) {
      q.$or.push(
        { 'metadata.name':
          {
            $regex: self.searchString(),
            $options: 'i'
          }
        }
      );
      var tagRegex =new RegExp(self.searchString(), 'i');
      q.$or.push(
        {
          'metadata.tags': {
            $in: [tagRegex]
          }
        }
      );
    }

    if (q.$or.length == 0)
      delete q.$or;

    return q;
  });

  self.listMode = ko.observable('thumbnail');
  self.documents = ko.meteor.find(entityCollection, query);

  self.addTrigger = function () {
    $('#add-file').trigger('click');
  }
  $('#add-file').change(function (e) {
    self.callAddDocumentModal(e.target.files[0]);
  });

  self.callAddDocumentModal = function(f) {
    Composer.showModal( 'addDocument', { entityId: entityId, file: f });
  };

  self.delete = function(document) {
    ContactablesFS.remove({_id: document._id()});
  };

  return self;
};
