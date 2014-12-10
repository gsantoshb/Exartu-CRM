UI.registerHelper('inputLocation', function() {
  Template.inputLocationTemplate.rendered=function(){
    var placeSearch, autocomplete, element=this.$('.location')[0];
    var getLocation = _.bind(function() {
      var place = autocomplete.getPlace();
      this.value = Utils.getLocation(place)
    },this.data);

    autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      getLocation();
    });
  };

  // Avoid navegation when press enter key
  Template.inputLocationTemplate.events = {
    'keypress .location': function(e){
      if (e.which == 13) {
        e.preventDefault();
      }
    }
  };

  return Template.inputLocationTemplate;
});

UI.registerHelper('infinityScroll', function() {
  var height = $(window).height();
  var scrollTop = $(window).scrollTop();
  var cb = this.cb;

  if(height==scrollTop){
    cb();
  }
  var windowElement=$(window);
  windowElement.bind("scroll", _.debounce(function(){
    if(windowElement.scrollTop() + windowElement.height() > $(document).height() - 50){
      cb();
    }
  },300));

  return null;
});

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

Template.fileProgress.progress = function() {
  if (!this)
    return;
  return this.uploadProgress();
};

UI.registerHelper('dragAndDrop', function() {
  return Template.dropzone_template;
});

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

    //for (var i = 0, f; f = files[i]; i++) {
    //  console.log('file dropped!');
    //  this.onDrop(f);
    //}
    // TODO: support drop multiple files
    if (files[0])
      this.onDrop(files[0]);
  }
};

// Return current git tag
UI.registerHelper('ExartuVersion', function() {
  return __meteor_runtime_config__.git_branch == 'release'? __meteor_runtime_config__.git_tag : __meteor_runtime_config__.git_branch + ' - ' + __meteor_runtime_config__.git_tag;
});


// returns Display name of any lookup
UI.registerHelper('lookUpName', function(id) {
  var lu = LookUps.findOne(id);
  return lu && lu.displayName;
});


// CONTACT METHODS
UI.registerHelper('contactMethodTypeIcon', function(type) {
  return Utils.contactMethodTypeIcon(type);
});
UI.registerHelper('contactMethodTypePrefix', function(type) {
  return Utils.contactMethodTypePrefix(type);
});

// Custom AutoForm dateTimePicker
AutoForm.inputValueHandlers({
  '#date-value': function () {
    var key = this.data().schemaKey;
    var formId = UI.currentView.parentView.dataVar.curValue.id;
    return $('#' + formId + ' .' + key + ' .date').data('datetimepicker').date;
  },

  '.afDateTimePicker': function () {
    if (this.val()) {
      return $(this).parent().datepicker('getDate');
    }
  }
});

// User name display
UI.registerHelper('displayUserName', function (id) {
  var user = Meteor.users.findOne({ _id: id });
  if (!user) return '';

  if (user.userName){
    return user.userName
  }

  var localPart = user.emails[0].address.split('@')[0];

  //if the localPart is unique return it, else include the domain
  var isUnique = Meteor.users.find({emails: {$elemMatch: {address : {$regex: '^' + localPart + '@.*'} } } }).count() <= 1;
  return isUnique ? localPart : user.emails[0].address;
});

// Multiline text format helper
Template.registerHelper('multilineText', function (text) {
  return text.replace(/\r?\n/g,'<br/>');
});

