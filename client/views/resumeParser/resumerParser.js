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
    var title = 'Resume parser',
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

var uploadFile = function(f) {
  var fsFile = new FS.File(f);

  fsFile.metadata = {
    completed: false,
    owner: Meteor.userId()
  };
  var file = ResumesFS.insert(fsFile, function (err) {
    if (err) {
      console.log('File upload error');
    } else {
      startParsing();
      console.log(file._id);
      Meteor.call('createEmployeeFromResume', file._id, function(err, result) {
        if (err) {
          console.log(err.reason);
        }
        endParsing();
      });
    }
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
  return ResumesFS.find();
};

Template.resumesList.resumes = function() {
  return ResumesFS.find(
    {
      uploadedAt: {
        $exists: true
      },
      'metadata.completed': false
    },
    {
      sort: {
        uploadedAt: -1
      }
    }
  );
};

Template.resumesList.resumesUploading = function() {
  return ResumesFS.find(
    {
      uploadedAt: {
        $exists: false
      }
    }
  );
};

Template.resumesList.resumesCompleted = function() {
  return ResumesFS.find(
    {
      uploadedAt: { $exists: true },
      'metadata.completed': true
    },
    {
      sort: { uploadedAt: -1 },
      limit: 5
    }
  );
};

Template.resumesList.completedInfo = function() {
  return Contactables.findOne({_id: this.metadata.employeeId});
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
  //'click .parser': function(e) {
  //  startParsing();
  //  Meteor.call('createEmployeeFromResume', this._id, function(err, result) {
  //    if (err) {
  //      console.log(err.reason);
  //    }
  //    endParsing();
  //  });
  //},
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
