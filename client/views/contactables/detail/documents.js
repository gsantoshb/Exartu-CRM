AddForm = {
  val: false,
  dep: new Deps.Dependency,
  show: function (file) {
    document.file = new FS.File(file);
    document.originalFileName = document.file.original.name;
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(AddForm, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  }
});

// Add document panel

Template.contactableDocumentsAdd.addForm = function() {
  return AddForm.value;
};

Template.contactableDocumentsAdd.events = {
  'click .add-trigger': function() {
    $('#add-file').trigger('click');
  },
  'change #add-file': function(e) {
    AddForm.show(e.target.files[0]);
  }
};

Template.contactableDocumentsAdd.showAddForm = function() {
  return function(file) {
    AddForm.show(file);
  };
};

// Add document form

var document = new Utils.ObjectDefinition({
  reactiveProps: {
    name: {
      validator: function() {
        return this.value != '';
      }
    },
    description: {
    },
    tags: {
      type: Utils.ReactivePropertyTypes.array
    }
  },
  originalFileName: {},
  file: {}
});

Template.addDocumentForm.newDocument = function() {
  return document;
};

Template.addDocumentForm.events = {
  'click #add-tag': function(e) {
    var inputTag = $('#new-tag')[0];
    if (_.indexOf(document.tags.value, inputTag.value) != -1)
      return;

    document.tags.insert(inputTag.value);
    inputTag.value = '';
    inputTag.focus();
  },
  'click #remove-tag': function() {
    document.tags.remove(this.value);
  },
  'click #save-document': function() {
    if(!document.isValid()) {
      document.showErrors();
      return;
    }

    var newDocument = document.getObject();
    newDocument.file.metadata = {
      entityId: Session.get('entityId'),
      name: newDocument.name,
      description: newDocument.description,
      tags: newDocument.tags,
      owner: Meteor.userId()
    };

    ContactablesFS.insert(newDocument.file, function (err) {
      if (!err){
        AddForm.hide();
        document.reset();
        GAnalytics.event("/contactable", "Add document", newDocument.file.type());
      }
      else
        console.log('File upload error');
    });
  },
  'click #cancel-document': function() {
    AddForm.hide();
    document.reset();
  }
};

// List documents

var fileCollection = {};

Template.contactableDocumentsList.created = function() {
  fileCollection = window[this.data.collection];
}

Template.contactableDocumentsList.documents = function() {
  if (!this.entity)
    return;
  return fileCollection.find(
    {
      'metadata.entityId':
        this.entity._id,
      uploadedAt: {
        $exists: true
      },
      'metadata.name': {
        $regex: query.searchString.value,
        $options: 'i'
      }
    },
    {
      sort: {
        uploadedAt: -1
      }
    }
  );
};

var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {}
  }
});

Template.contactableDocumentsList.documentsUploading = function() {
  if (!this.entity)
    return;

  return fileCollection.find(
    {
      'metadata.entityId': this.entity._id,
      uploadedAt: {
        $exists: false
      }
    }
  );
}

Template.contactableDocumentsList.query = function() {
  return query;
}

Template.contactableDocumentsList.documentIcon = function(type) {
  switch(true) {
    case /application\/zip/.test(type): return 'icon-file-zip';
    case /image\//.test(type): return 'icon-file-image-1';
    case /text\/css/.test(type): return 'icon-file-code';
    case /application\/pdf/.test(type)
      || /application\/msword/.test(type)
      : return 'icon-file-1';
    default: return 'icon-file-1';
  };
};

Template.contactableDocumentsList.events = {
  'click .delete': function(e) {
    var file = this;
    fileCollection.remove({_id: file._id});
  },
  'click .resume': function(e) {
    var file = this;
    FS.HTTP.uploadQueue.resumeUploadingFile(file);
  },
  'click .cancel': function(e) {
    var file = this;
    FS.HTTP.uploadQueue.cancel(file);
    fileCollection.remove({_id: file._id});
  },
  'click .add-document-trigger': function() {
    $('#add-file').trigger('click');
  }
};
