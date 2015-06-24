
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
var disable = 0;
var uploadingResumes = new ReactiveVar([]);

var uploadFile = function (file) {
  var extension;
  var splitName = file.name.split('.');
  if (splitName.length > 1)
    extension = splitName[splitName.length - 1];

  var uploadProgress = new progress();

  var data = {
    name: file.name,
    type: file.type,
    extension: extension,
    uploadProgress: uploadProgress
  };
  uploadingResumes.push(data);

  FileUploader.postProgress('uploadResume', file, uploadProgress, {name: file.name, type: file.type, extension: extension}, function (err, result) {
    uploadingResumes.pop(data);

    if (err) {
      $('#add-file').replaceWith($('#add-file').clone());
    }
    else {
      $('#add-file').replaceWith($('#add-file').clone());
    }
  });

};

Template.resumeAdd.events = {
  'click .add-trigger': function () {
    $('#add-file').trigger('click');
  },
  'change #add-file': function (e) {
    _.each(e.target.files, function (f) {
      uploadFile(f);
    });


  }
};
Template.resumeAdd.helpers({
  uploadFile: function () {
    return function (f) {
      uploadFile(f);
    };
  }
});

uploadingResumes.push = function (v) {
  uploadingResumes.curValue.push(v);
  uploadingResumes.dep.changed();
};

uploadingResumes.pop = function (v) {
  uploadingResumes.curValue.splice(uploadingResumes.curValue.indexOf(v), 1);
  uploadingResumes.dep.changed();
};

// List resumes
Template.resumesList.onCreated(function () {
  this.subscribe('fileProgress');
});

Template.resumesList.helpers({
  inProgressResumes: function () {
    return FileProgress.find();
  },
  uploadingResumes: function () {
    return uploadingResumes.get();
  },
  resumes: function () {
    return Resumes.find({}, {sort: {dateCreated: -1}});
  },
  completedInfo: function () {
    Meteor.subscribe('singleContactable', this.employeeId);
    return Contactables.findOne({_id: this.employeeId});
  }
});

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
