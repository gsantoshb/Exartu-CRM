UI.registerHelper('userInfo', function() {
  if (!this.userId)
    return;
  var user = Meteor.users.findOne({_id: this.userId});

  UsersFS.getThumbnailUrlForBlaze(user.profilePictureId, user);

  this.info = {
    username: user.username,
    picture: user.picture
  };

  return Template.user_info_template;
});

UI.registerHelper('formattedDate', function() {
  this.date = moment(this.value).format(this.format || 'lll');
  return Template.formatted_date;
});

UI.registerHelper('objectProperty', function() {
  var self = this;
  var template = {};
  switch(self.type) {
    case 2:
      template = Template.object_property_multiple;
      template.data = function() {
        return self.value;
      };
      break;
    default:
      template = Template.object_property_single;
      template.error = function() {
        this.error.dep.depend();
        return this.error.hasError? this.error.message : '';
      };
  }

  return template;
});

Template.object_property_single.events = {
  'change .prop-input': function(e) {
    this.value = e.target.value;
  },
};

Template.fileProgress.progress = function() {
  if (!this)
    return;
  return this.uploadProgress();
};

Template.dropzone_template.events = {
  "dragenter": function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).addClass('drop-zone-hover');
  },

  "dragexit": function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).removeClass('drop-zone-hover');
  },
  "dragover": function (e) {
    e.stopPropagation();
    e.preventDefault();
  },
  "drop": function (e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;

//    for (var i = 0, f; f = files[i]; i++) {
//      console.log('file dropped!');
//      this.onDrop(f);
//    }
    // TODO: support drop multiple files
    if (files[0])
      this.onDrop(files[0]);
  }
};

UI.registerHelper('dragAndDrop', function() {
  return Template.dropzone_template;
});
