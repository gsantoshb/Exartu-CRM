EducationSchema = new SimpleSchema({
  institution: {
    type: String,
    label: 'Institution name'
  },
  description: {
    type: String,
    label: 'Description'
  },
  degreeAwarded: {
    type: String,
    label: 'Degree Awarded',
    optional: true
  },
  start: {
    type: Date,
    label: 'Start date'
  },
  end: {
    type: Date,
    label: 'End date',
    optional: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        if (toPresent.get()) {
          return true;
        }

        if (!this.value) {
          return "Required"; //"End date not set";
        } else if (this.field('start').value > this.value){
          //EducationSchema.namedContext('AddEducationRecord').addInvalidKeys([{name: 'end', type: 'minDate', value: 'End date should be grater than start date'}]);
          return "End date should be greater than start date";
        }
      }

      return true;
    }
  }
});

var toPresent = ReactiveVar(false);

AutoForm.hooks({
  AddEducationRecord: {
    onSubmit: function(educationRecord) {
      var self = this;
      var id = Template.parentData(1)._id;

      if (toPresent.get())
        educationRecord.end = undefined;

      Meteor.call('addEducationRecord', id, educationRecord, function () {
        toPresent.set(false);
        self.done();
        self.resetForm();
      });

      return false;
    }
  }
});

// Add

Template.employeeEducationAdd.helpers({
  endDateClass: function() {
    return toPresent.get()? 'disabled' : '';
  }
});

Template.employeeEducationAdd.events({
  'change #to-present': function() {
    toPresent.set(!toPresent.get());
  }
});

// List

Template.employeeEducationList.helpers({
  items: function() {
    if (this.education && this.education.length > 1)
      return this.education.sort(function(d1, d2) {
        return d1.start - d2.start;
      });

    return this.education;
  }
});

// Record

Template.employeeEducationItem.helpers({
  getCtx: function () {
    var self = this;
    return {
      educationRecord: self,
      isEditing: new ReactiveVar(false),
      toPresent: new ReactiveVar(!self.end)
    };
  },
  isEditing: function () {
    return this.isEditing.get();
  }
});

Template.employeeEducationItem.events({
  'click .deleteEducationRecord': function () {
    var id = Template.parentData(1)._id;
    var educationRecord = this.educationRecord;

    Utils.showModal('basicModal', {
      title: 'Delete education record',
      message: 'Are you sure you want to delete this education record?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Delete', classes: 'btn-danger', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('deleteEducationRecord', id, educationRecord);
        }
      }
    });
  },
  'click .editEducationRecord': function () {
    // Open edit mode
    this.isEditing.set(!this.isEditing.get());
  }
});

// Edit record

Template.employeeEducationEditItem.helpers({
  created: function () {
    var self = this;

    // Get contactableId
    var contactableId = Session.get('entityId');

    self.data.formId = Random.hexString(10);

    // Create a AutoForm hook for each record form
    AutoForm.addHooks(self.data.formId, {
      onSubmit: function(educationRecord, setSelector, oldRecord) {
        var self = this;
        var ctx = Template.parentData(2);
        educationRecord.end = ctx.toPresent.get() ? undefined: educationRecord.end;

        Meteor.call('editEducationRecord', contactableId, oldRecord, educationRecord, function (err) {
          if (!err) {
            // Close edit mode
            ctx.isEditing.set(!ctx.isEditing.get());
            self.done();
          }
        });

        return false;
      }
    });
  },
  endDateClass: function() {
    var ctx = Template.parentData(2);
    return ctx.toPresent.get()? 'disabled' : '';
  },
  checked: function() {
    var ctx = Template.parentData(2);
    return ctx.toPresent.get()? 'checked' : undefined;
  }
});

Template.employeeEducationEditItem.events({
  'change #to-present': function() {
    var ctx = Template.parentData(1);
    ctx.toPresent.set(!ctx.toPresent.get());
  },
  'click .cancelEducationRecordChanges': function () {
    // Close edit mode
    var ctx = Template.parentData(1);
    ctx.isEditing.set(!ctx.isEditing.get());
  }
});