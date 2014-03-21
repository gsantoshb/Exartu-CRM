Template.addDocument.viewModel = function (data) {
  var self = this;

  self.newDocument = ko.validatedObservable({
    name: ko.observable().extend({ required: true }),
    description: ko.observable(),
    tags: ko.observableArray()
  });

  self.newTag = ko.observable();
  self.addTag = function() {
    if (self.newTag()){
      self.newDocument().tags.push(self.newTag());
      self.newTag('');
    }
  };
  self.removeTag =  function(data) {
    self.newDocument().tags.remove(data);
  };

  self.add = function() {
    if (!self.newDocument.isValid()) {
      self.newDocument.errors.showAllMessages();
      return;
    }

    var fileId = ContactablesFS.storeFile(data.file, {
      entityId: data.entityId,
      name: self.newDocument().name(),
      description: self.newDocument().description(),
      tags: self.newDocument().tags()
    });
    if(fileId)
      $('#addDocument').modal('hide');
    else
      console.log('File upload error');
  };

  return self;
}