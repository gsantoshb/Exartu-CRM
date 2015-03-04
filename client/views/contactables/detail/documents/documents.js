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

var startParsing = function () {
    $('#parsing')[0].style.display = 'block';
    $('.add-box')[0].style['pointer-events'] = 'none';
    $('.add-box')[0].style.opacity = '0.5';
};

var endParsing = function () {
    $('#parsing')[0].style.display = 'none';
    $('.add-box')[0].style['pointer-events'] = 'auto';
    $('.add-box')[0].style.opacity = '1';
};


// Add document panel
Template.contactableDocumentsAdd.helpers({
    addForm: function () {
        return AddForm.value;
    },

    showAddForm: function () {
        return function (file) {
            AddForm.show(file);
        };
    },

    query: function () {
        return query;
    }
});

Template.contactableDocumentsAdd.events = {
    'click .add-trigger': function () {
        $('#add-file').trigger('click');
    },
    'change #add-file': function (e) {
        AddForm.show(e.target.files[0]);
    }
};

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

Template.addDocumentForm.helpers({
    newDocument: function () {
        return document;
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
        document.tags.remove(this.value);
    },
    'click #save-document': function () {
        if (!document.isValid()) {
            document.showErrors();
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
            tags: newDocument.tags,
            owner: Meteor.userId()
        };

        startParsing();
        FileUploader.post('uploadContactablesFiles', newDocument.file, metadata, function (err, result) {
            if (!err) {
                endParsing();
                AddForm.hide();
                document.reset();
            }
            else {
                alert('File upload error:' + err)
                console.log('File upload error');
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
            }
        );

        documentsCount = documents.count();
        documentsCount += Resumes.find({employeeId: this.entity._id}).count();
        documentsDep.changed();

        return documents;
    },

    isEmpty: function () {
        documentsDep.depend();
        return documentsCount == 0;
    },

    resumes: function () {
        var resumes = Resumes.find({employeeId: this.entity._id});
        return resumes && resumes.count() > 0 ? resumes : undefined;
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
                return 'icon-file-zip';
            case /image\//.test(type):
                return 'icon-file-image-1';
            case /text\/css/.test(type):
                return 'icon-file-code';
            case /application\/pdf/.test(type) || /application\/msword/.test(type) :
                return 'icon-file-1';
            default:
                return 'icon-file-1';
        }
    }
});


var query = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
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
    }
};
