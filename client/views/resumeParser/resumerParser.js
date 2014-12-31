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
  onAfterAction: function() {
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

var uploadFile = function(file) {
  // Get extension
  var extension;
  var splittedName = file.name.split('.');
  if (splittedName.length > 1)
    extension = splittedName[splittedName.length - 1];

  startParsing();
  FileUploader.post('uploadResume', file, {name: file.name, type: file.type, extension: extension}, function(err, result) {
    endParsing();
    console.log(err, result);
  });
};

Template.resumeAdd.events = {
  'click .add-trigger': function() {
    $('#add-file').trigger('click');
  },
  'change #add-file': function(e) {
    uploadFile(e.target.files[0]);
  }
};

Template.resumeAdd.uploadFile = function() {
  return function(f) {uploadFile(f);};
};

// List resumes

Template.resumesList.resumes = function() {
  return Resumes.find();
};

Template.resumesList.completedInfo = function() {
  Meteor.subscribe('singleContactable', this.employeeId);
  return Contactables.findOne({_id: this.employeeId});
};

var startParsing = function() {
  $('#parsing')[0].style.display = 'block';
  $('#resume-parser')[0].style['pointer-events'] = 'none';
  $('#resume-parser')[0].style.opacity = '0.5';
};

var endParsing = function() {
  $('#parsing')[0].style.display = 'none';
  $('#resume-parser')[0].style['pointer-events'] = 'auto';
  $('#resume-parser')[0].style.opacity = '1';
};

Template.resumesList.events = {
  'click .delete': function(e) {
    var file = this;
    ResumesFS.remove({_id: file._id});
  },
  'click .resume': function(e) {
    var file = this;
    FS.HTTP.uploadQueue.resumeUploadingFile(file);
  },
  'click .cancel': function(e) {
    var file = this;
    FS.HTTP.uploadQueue.cancel(file);
    ResumesFS.remove({_id: file._id});
  },
  'click .add-resume-trigger': function() {
    $('#add-file').trigger('click');
  }
};
