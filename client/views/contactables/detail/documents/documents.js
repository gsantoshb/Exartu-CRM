AddForm = {
  val: false,
  dep: new Deps.Dependency,
  show: function (file) {
    document.file = file;
    document.originalFileName = document.file.name;
    document.name.value = document.file.name;
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

var startParsing = function() {
  $('#parsing')[0].style.display = 'block';
  $('.add-box')[0].style['pointer-events'] = 'none';
  $('.add-box')[0].style.opacity = '0.5';
};

var endParsing = function() {
  $('#parsing')[0].style.display = 'none';
  $('.add-box')[0].style['pointer-events'] = 'auto';
  $('.add-box')[0].style.opacity = '1';
};


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
    if (!inputTag.value || _.indexOf(document.tags.value, inputTag.value) != -1)
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

    // Get extension
    var extension;
    var splittedName = document.file.name.split('.');
    if (splittedName.length > 1)
      extension = splittedName[splittedName.length - 1];

    var metadata = {
      entityId: Session.get('entityId'),
      name: newDocument.name,
      type: newDocument.file.type,
      extension: extension,
      description: newDocument.description,
      tags: newDocument.tags,
      owner: Meteor.userId()
    };

    startParsing();
    FileUploader.post('uploadContactablesFiles', newDocument.file, metadata, function(err, result) {
        if (!err){
          endParsing();
          AddForm.hide();
          document.reset();
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

Template.contactableDocumentsList.documents = function() {
  if (!this.entity)
    return;

  documents = ContactablesFiles.find({
      entityId: this.entity._id,
      name: {
        $regex: query.searchString.value,
        $options: 'i'
      }
    }
  );

  documentsCount = documents.count();
  documentsCount += Resumes.find({employeeId: this.entity._id}).count();
  documentsDep.changed();

  return documents;
};

var documentsDep = new Deps.Dependency;
var documentsCount = 0;
Template.contactableDocumentsList.isEmpty = function() {
  documentsDep.depend();
  return documentsCount == 0;
};

Template.contactableDocumentsList.resumes = function() {
  var resumes = Resumes.find({employeeId: this.entity._id});
  return resumes && resumes.count() > 0? resumes : undefined;
};

var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {}
  }
});

Template.contactableDocumentsAdd.query = function() {
  return query;
};

Template.contactableDocumentsList.url = function() {
  return FileUploader.getUrl('uploadContactablesFiles', this.fileId);
};

Template.contactableDocumentsList.resumeUrl = function() {
  return FileUploader.getUrl('uploadResume', this.resumeId);
};

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
    ContactablesFiles.remove({_id: file._id});
  },
  'click .resume': function(e) {
    var file = this;
    FS.HTTP.uploadQueue.resumeUploadingFile(file);
  },
  'click .cancel': function(e) {
    var file = this;
    ContactablesFiles.remove({_id: file._id});
  },
  'click .add-document-trigger': function() {
    $('#add-file').trigger('click');
  }
};
