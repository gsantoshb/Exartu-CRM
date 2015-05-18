var disable = 0;
ResumeParserController = RouteController.extend({
    template: 'resumeParser',
    layoutTemplate: 'mainLayout',
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('resumeParser');
    },
    onAfterAction: function () {
        var title = 'Parser',
            description = '';
        SEO.set({
            title: title,
            meta: {
                'description': description
            },
            og: {
                'title': title,
                'description': description
            }
        });
    }
});

// Add resume panel
var fileList = [];
var uploadFile = function (file) {
    // Get extension
    if (_.contains(fileList, file.name)) {
        alert("You have already parsed file " + file.name + " during this browser session");
        return;
    }
    var extension;
    var splitName = file.name.split('.');
    if (splitName.length > 1)
        extension = splitName[splitName.length - 1];

    startParsing();

    FileUploader.post('uploadResume', file, {
        name: file.name,
        type: file.type,
        extension: extension
    }, function (err, result) {
      if(err){
        $('#add-file').replaceWith($('#add-file').clone());
      }
      else {
        $('#add-file').replaceWith($('#add-file').clone());
        fileList.push(file.name);
      }
      endParsing();


    });

};

Template.resumeAdd.events = {
    'click .add-trigger': function () {
        $('#add-file').trigger('click');
    },
    'change #add-file': function (e) {
      _.each(e.target.files, function(f){
        uploadFile(f);
      });


    }
};

Template.resumeAdd.uploadFile = function () {
    return function (f) {
       uploadFile(f);
    };
};

// List resumes

Template.resumesList.resumes = function () {
    return Resumes.find({}, {sort: {dateCreated: -1}});
};

Template.resumesList.completedInfo = function () {
    Meteor.subscribe('singleContactable', this.employeeId);
    return Contactables.findOne({_id: this.employeeId});
};

var startParsing = function () {
    $('#parsing')[0].style.display = 'block';
    $('#resume-parser')[0].style['pointer-events'] = 'none';
    $('#resume-parser')[0].style.opacity = '0.5';
    disable = disable + 1;
};

var endParsing = function () {
    disable = disable -1;
    if(disable<=0) {
      $('#parsing')[0].style.display = 'none';
      $('#resume-parser')[0].style['pointer-events'] = 'auto';
      $('#resume-parser')[0].style.opacity = '1';
    }
};

Template.resumesList.events = {
    'click .delete': function (e) {
        var file = this;
        ResumesFS.remove({_id: file._id});
    },
    'click .resume': function (e) {
        var file = this;
        FS.HTTP.uploadQueue.resumeUploadingFile(file);
    },
    'click .cancel': function (e) {
        var file = this;
        FS.HTTP.uploadQueue.cancel(file);
        ResumesFS.remove({_id: file._id});
    },
    'click .add-resume-trigger': function () {
        $('#add-file').trigger('click');
    }
};
