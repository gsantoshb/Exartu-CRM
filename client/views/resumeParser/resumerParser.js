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
  ResumesFS.insert(fsFile, function (err) {
    if (!err){
    }
    else
      console.log('File upload error');
  });
}

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
      'metadata.completed': true
    }
  );
};

Template.resumesList.completedInfo = function() {
  return Contactables.findOne({_id: this.metadata.employeeId});
};

Template.resumesList.events = {
  'click .delete': function(e) {
    var file = this;
    ResumesFS.remove({_id: file._id});
  },
  'click .parser': function(e) {
    e.currentTarget.parentNode.style.display = 'none';
    e.currentTarget.parentNode.nextElementSibling.style.display = '';
    Meteor.call('createEmployeeFromResume', this._id, function(err, result) {
      if (err)
        console.log(err.reason);
      else {
        e.currentTarget.parentNode.style.display = 'none';
        e.currentTarget.parentNode.nextElementSibling.style.display = 'none';
      }
    });
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
