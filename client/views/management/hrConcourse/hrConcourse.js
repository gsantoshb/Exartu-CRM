hrConcourseManagementController = RouteController.extend({
  waitOn: function () {
    return Meteor.subscribe('hierarchies');
  },
  action: function () {
    if (this.ready())
      this.render('hrConcourse');
    else
      this.render('loading');
  }
});

HRCouncoureConfigurationSchema = new SimpleSchema({
  webName: {
    type: String
  },
  title: {
    type: String
  },
  background: {
    type: String,
    defaultValue: '#f3f3f4'
  }
});

AutoForm.hooks({
  SetHRConcourseConfiguration: {
    onSubmit: function (configuration) {
      var self = this;

      // Validate web name
      Meteor.call("isWebNameAvailable", configuration.webName, function (error, result) {
        if (! result) {
          var errorMessage = 'Web name already in use';
          HRCouncoureConfigurationSchema.namedContext("SetHRConcourseConfiguration").addInvalidKeys([{name: "webName", type: "notUnique", message: errorMessage}]);
          self.done(new Error(errorMessage));
        } else {
          if (fsFile) {
            // upload logo
            var file = HierarchiesFS.insert(fsFile);
            // set logo file id to hier configuration
            configuration.logo = file._id;
            // reset file
            fsFile = null;
          }

          Meteor.call('saveConfiguration', configuration, function () {
            self.done();
          });
        }
      });

      return false;
    }
  }
});

var fsFile = undefined;

Template.hrConcourse.helpers({
  configuration: function () {
    var currentHier = Hierarchies.findOne(Meteor.user().currentHierId);
    return currentHier && currentHier.configuration ? currentHier.configuration : {};
  },
  logo: function() {
    var hier = Hierarchies.findOne();
    var config = (hier && hier.configuration) ? hier.configuration : {};
    if (config && config.logo){
      return  HierarchiesFS.getUrlForBlaze(config.logo);
    }
  }
});

Template.hrConcourse.events({
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    var logo = e.target.files[0];

    // Generate CollectionFS file object
    fsFile = new FS.File(logo);
    fsFile.metadata = {
      owner: Meteor.user().currentHierId,
      uploadedBy: Meteor.userId()
    };

    // Render temporal logo file
    var reader = new FileReader();
    reader.onload = (function(logo) {
      return function(e) {
        $('#logo-img').attr('src', e.target.result);
      };
    })(logo);

    reader.readAsDataURL(logo);
  }
});

