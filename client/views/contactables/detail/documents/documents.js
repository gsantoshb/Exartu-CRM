// Add document form

var document = new Utils.ObjectDefinition({
    reactiveProps: {
        name: {
            validator: function () {
                return this.value != '';
            }
        },
        description: {},
        tags: {
            type: Utils.ReactivePropertyTypes.array
        }
    },
    originalFileName: {},
    file: {}
});
var downloading = new ReactiveVar(false);
var addDisabled = new ReactiveVar(false);
var isAddFormVisible = new ReactiveVar(false);
var isLoading = new ReactiveVar(false);

var showAddForm = function (file) {
    document.file = file;
    document.originalFileName = document.file.name;
    document.name.value = document.file.name;
    isAddFormVisible.set(true);
};
var hideAddForm = function (file) {
    isAddFormVisible.set(false);
};

var startParsing = function () {
    isLoading.set(true);
};

var endParsing = function () {
    isLoading.set(false);
};

var uploader = new Slingshot.Upload("contactDocuments");

// Add document panel
Template.contactableDocumentsAdd.helpers({
    addForm: function () {
        return isAddFormVisible.get();
    },
    showAddForm: function () {
        return showAddForm;
    },
    isLoading: function () {
        return isLoading.get();
    },
    getProgress: function () {
      return Math.round(uploader.progress() * 100);
    }
});

Template.contactableDocumentsAdd.events = {
    'click .add-trigger': function () {
        $('#add-file').trigger('click');
    },
    'change #add-file': function (e) {
        showAddForm(e.target.files[0]);
    }
};

Template.addDocumentForm.helpers({
    newDocument: function () {
        return document;
    },
    addDisabled: function () {
        return addDisabled.get() ? 'disabled' : '';
    }
});

Template.addDocumentForm.events = {
    'click #add-tag': function (e) {
        var inputTag = $('#new-tag')[0];
        if (!inputTag.value || _.indexOf(document.tags.value, inputTag.value) != -1)
            return;

        document.tags.insert(inputTag.value);
        inputTag.value = '';
        inputTag.focus();
    },
    'click #remove-tag': function () {
        console.log('remove tag: ' + this.value);
        document.tags.remove(this.value);
    },
    'click #save-document': function () {
      addDisabled.set(true);
      if (!document.isValid()) {
        document.showErrors();
        addDisabled.set(false);
        return;
      }

      var newDocument = document.getObject();

      // Get extension
      var extension;
      var splitName = document.file.name.split('.');
      if (splitName.length > 1)
        extension = splitName[splitName.length - 1];

      var metadata = {
        entityId: Session.get('entityId'),
        name: newDocument.name,
        type: newDocument.file.type,
        extension: extension,
        description: newDocument.description,
        tags: newDocument.tags
      };

      startParsing();

      uploader.send(newDocument.file, function (error, downloadUrl) {
        if (error) {
          // Log service detailed response.
          alert('File upload error:' + err);
          addDisabled.set(false);
        }
        else {
          console.log('download url:', downloadUrl);
          Meteor.call('addContactableDocumentInfo', metadata, downloadUrl, function (err, result) {
            if (!err) {
              endParsing();
              hideAddForm();
              document.reset();
              addDisabled.set(false);
            }
            else {
              alert('File upload error:' + err);
              console.log('File upload error');
              addDisabled.set(false);
            }
          });
        }
      });
    },
    'click #cancel-document': function () {
        AddForm.hide();
        document.reset();
    }
};

// List documents
var documentsDep = new Deps.Dependency;
var documentsCount = 0;

var DocumentsHandler;
var queryDep = new Deps.Dependency;

var query = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
    }
});

Template.contactableDocumentsList.created = function() {
    Meteor.autorun(function() {

        queryDep.depend();
        if(DocumentsHandler) {
            DocumentsHandler.setFilter({
                name: {
                    $regex: query.searchString.value,
                    $options: 'i'
                }
            });
        } else {
            SubscriptionHandlers.DocumentsHandler = DocumentsHandler = Meteor.paginatedSubscribe('contactablesDocs', {
                pubArguments: Session.get('entityId'),
                filter: {
                    name: {
                        $regex: query.searchString.value,
                        $options: 'i'
                    }
                }
            });
        }
    });
}

Template.contactableDocumentsList.helpers({
    documents: function () {
        if (!this.entity)
            return;

        documents = ContactablesFiles.find({
            entityId: this.entity._id,
            name: {
                $regex: query.searchString.value,
                $options: 'i'
            }
        }, {
            sort: {
                'dateCreated': -1
            }
        });

        documentsCount = documents.count();
        documentsCount += Resumes.find({employeeId: this.entity._id}).count();
        documentsDep.changed();
        documents = documents.fetch();

        return _.map(documents,function(doc){
          var downloading = new ReactiveVar(false);
          return _.extend(doc, {downloading: downloading})
        });
    },

    isEmpty: function () {
        documentsDep.depend();
        return documentsCount == 0;
    },

    resumes: function () {
        var resumes = Resumes.find({employeeId: this.entity._id});
        var fetchedResumes = resumes.fetch();
        var toReturn = _.map(fetchedResumes, function(res) {
          var downloading = new ReactiveVar(false);
           return _.extend(res, {downloading:downloading})
        })
        return resumes && resumes.count() > 0 ? toReturn : undefined;
    },

    url: function () {
        return FileUploader.getUrl('uploadContactablesFiles', this.fileId);
    },

    resumeUrl: function () {
        return FileUploader.getUrl('uploadResume', this.resumeId);
    },

    documentIcon: function (type) {
        switch (true) {
            case /application\/zip/.test(type):
                return 'fa fa-file-archive-o';
            case /image\//.test(type):
                return 'icon-file-image-1';
            case /text\/css/.test(type):
                return 'icon-file-code';
            case /application\/pdf/.test(type):
                return 'fa fa-file-pdf-o';
            case /application\/msword/.test(type):
                return 'fa fa-file-word-o';
            case /application\/msexcel/.test(type) || /application\/vnd.ms-excel/.test(type) || /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/.test(type):
                return 'fa fa-file-excel-o';
            default:
                return 'fa fa-file-o';
        }
    },

    documentIconBackground: function(type) {
        switch (true) {
            case /application\/pdf/.test(type):
                return 'item-icon-pdf';
            case /application\/msword/.test(type):
                return 'item-icon-word';
            case /application\/msexcel/.test(type) || /application\/vnd.ms-excel/.test(type) || /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/.test(type):
                return 'item-icon-excel';
            default:
                return 'item-icon-file';
        }
    },
    query: function () {
        return query;
    },
    disabledClass: function () {
        return this.fileId ? '' : 'disabled';
    },
    downloading: function(){
      return this.downloading ? this.downloading.get() : false;
    }
});

Template.contactableDocumentsList.events = {
    'click .delete': function (e) {
        var file = this;
        if (Utils.bUserIsAdmin()) {
            if (confirm('Delete file' + this.name + '?')) {
                ContactablesFiles.remove({_id: file._id});
            }
        }
    },
    'click .delete-resume': function (e) {
        var file = this;
        if (Utils.bUserIsAdmin()) {
            if (confirm('Delete file' + this.name + '?')) {
                Resumes.remove({_id: file._id});
            }
        }
    },
    'click .resume': function (e) {
        var file = this;
        FS.HTTP.uploadQueue.resumeUploadingFile(file);
    },
    'click .cancel': function (e) {
        var file = this;
        ContactablesFiles.remove({_id: file._id});
    },
    'click .add-document-trigger': function () {
        $('#add-file').trigger('click');
    },
    'keyup #searchString': _.debounce(function(e){
        query.searchString.value = e.target.value;
    }),
    'click .item-icon': function(){
      var self = this;
      this.downloading.set(true);
      setTimeout(function(){
        self.downloading.set(false);
      },1500);
    },
    'click .tittle-document': function(){
       var self = this;
      this.downloading.set(true);
      setTimeout(function(){
        self.downloading.set(false);
        self.downloading.set(false);
      },1500);
    }

};

Template.contactableDocumentsList.onDestroyed(function () {
  SubscriptionHandlers.DocumentsHandler.stop();
  DocumentsHandler = undefined;
});
