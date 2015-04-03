
var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false);

// Main template
Template.employeePastJobs.helpers({
  items: function() {
    if (this.pastJobs && this.pastJobs.length > 1)
      return this.pastJobs.sort(function(d1, d2) { return d1.start - d2.start; });
    return this.pastJobs;
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  }
});


// Past Job Item template
Template.employeePastJobItem.helpers({
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

Template.employeePastJobItem.events({
  'click .deletePastJobRecord': function () {
    var self = this;

    // Get contactableId
    var contactableId = Session.get('entityId');

    Utils.showModal('basicModal', {
      title: 'Delete past job record',
      message: '<p>Are you sure you want to delete this past job record?</p>' +
      '<p>' + self.company + ' - ' + self.position + '</p>',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Delete', classes: 'btn-danger', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('deletePastJobRecord', contactableId, self.id);
        }
      }
    });
  },
  'click .editPastJobRecord': function () {
    // Open edit mode
    this.isEditing.set(true);
  }
});


// Edit record template
Template.employeePastJobEditItem.rendered = function () {
  // Generate an AutoForm ID and create a hook for each record form using the record ID
  var formId = 'editPastJob_' + this.data.id;
  addAutoFormEditHook(formId);
};

Template.employeePastJobEditItem.helpers({
  formId: function () {
    return 'editPastJob_' + this.id;
  },
  pastJob: function () {
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
  addPastJobForm: {
    onSubmit: function(insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      PastJobSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Get contactableId
      var contactableId = Session.get('entityId');

      // Insert past job
      isSubmitting.set(true);
      Meteor.call('addPastJobRecord', contactableId, insertDoc, function (err) {
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
      // Obtain the past job record context
      var ctx = Template.parentData(2);

      // Clean schema for auto and default values
      PastJobSchema.clean(insertDoc);

      // Clear error message
      ctx.error.set('');

      // Get contactableId
      var contactableId = Session.get('entityId');

      // Update past job
      ctx.isSubmitting.set(true);
      Meteor.call('editPastJobRecord', contactableId, oldDoc.id, insertDoc, function (err) {
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