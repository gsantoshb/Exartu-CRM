
var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false);

// Main template
Template.employeeEducation.helpers({
  items: function() {
    if (this.education && this.education.length > 1)
      return this.education.sort(function(d1, d2) { return d1.start - d2.start; });
    return this.education;
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  }
});


// Education Item template
Template.employeeEducationItem.helpers({
  getCtx: function () {
    this.isEditing = new ReactiveVar(false);
    this.isSubmitting = new ReactiveVar(false);
    this.error = new ReactiveVar('');
    return this;
  },
  isEditing: function () {
    return this.isEditing.get();
  }
});

Template.employeeEducationItem.events({
  'click .deleteEducationRecord': function () {
    var self = this;

    // Get contactableId
    var contactableId = Session.get('entityId');

    Utils.showModal('basicModal', {
      title: 'Delete education record',
      message: '<p>Are you sure you want to delete this education record?</p>' +
      '<p>' + self.institution + ' - ' + self.description + '</p>',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Delete', classes: 'btn-danger', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('deleteEducationRecord', contactableId, self.id);
        }
      }
    });
  },
  'click .editEducationRecord': function () {
    // Open edit mode
    this.isEditing.set(true);
  }
});


// Edit record template
Template.employeeEducationEditItem.rendered = function () {
  // Generate an AutoForm ID and create a hook for each record form using the record ID
  var formId = 'editEducation_' + this.data.id;
  addAutoFormEditHook(formId);
};

Template.employeeEducationEditItem.helpers({
  formId: function () {
    return 'editEducation_' + this.id;
  },
  education: function () {
    return this;
  },
  isSubmitting: function () {
    return this.isSubmitting.get();
  },
  error: function () {
    return this.error.get();
  }
});

Template.employeeEducationEditItem.events({
  'click .cancel': function () {
    // Close edit mode
    this.isEditing.set(false);
  }
});


AutoForm.hooks({
  addEducationForm: {
    onSubmit: function(insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      EducationSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Get contactableId
      var contactableId = Session.get('entityId');

      // Insert education
      isSubmitting.set(true);
      Meteor.call('addEducationRecord', contactableId, insertDoc, function (err) {
        isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          self.done();
        }
      });

      return false;
    }
  }
});

var addAutoFormEditHook = function (formId) {
  AutoForm.addHooks(formId, {
    onSubmit: function(insertDoc, updateDoc, oldDoc) {
      var self = this;
      // Obtain the education record context
      var ctx = Template.parentData(2);

      // Clean schema for auto and default values
      EducationSchema.clean(insertDoc);

      // Clear error message
      ctx.error.set('');

      // Get contactableId
      var contactableId = Session.get('entityId');

      // Update education
      ctx.isSubmitting.set(true);
      Meteor.call('editEducationRecord', contactableId, oldDoc.id, insertDoc, function (err) {
        ctx.isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          ctx.error.set('Server error. ' + msg);
        } else {
          // Mark as done in try catch block since we are removing the template from the view
          try { self.done(); } catch (err) {}
          ctx.isEditing.set(false);
        }
      });

      return false;
    }
  }, true); //third argument to replace existing hooks and avoid multiples onSubmit hooks per form
};