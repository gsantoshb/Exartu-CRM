EditContactMethodsMode = {
  val: false,
  dep: new Tracker.Dependency,
  show: function () {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(EditContactMethodsMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var dep = new Tracker.Dependency;
var selectedType;
var contactableId;

var contactMethodsTypes;
Template.contactableContactMethodsBox.created = function () {
  contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();
  selectedType = contactMethodsTypes[0];
  contactableId = this.data._id;
  EditContactMethodsMode.value = false;
};

Template.contactableContactMethodsBox.editMode = function () {
  return EditContactMethodsMode.value;
};

Template.contactableContactMethodsBox.editModeColor = function () {
  return EditContactMethodsMode.value ? '#008DFC' : '';
};

Template.contactableContactMethodsBox.contactMethods = function() {
  var result = [];
  var contactMethods = this.contactMethods;

  _.forEach(contactMethods, function (cm) {
    var type = _.findWhere(contactMethodsTypes, { _id: cm.type });
    if (type) {
      cm.displayName = type.displayName;
    }
    result.push(cm);
  });

  return result;
};

var addNewContactMethod = function() {
  var newContactMethodValue = $('#new-contact-method-value');
  $('#new-contact-method-value').val = null;
  if (_.isEmpty(newContactMethodValue.val()) || _.isEmpty(selectedType))
    return;

  // Check email regex
  if (selectedType.lookUpActions) {
    if (_.contains(selectedType.lookUpActions, Enums.lookUpAction.ContactMethod_Email) && !helper.emailRE.test(newContactMethodValue.val())) {
      $('#add-contact-method-error').text('Invalid email format');
      return;
    }
  }

  // TODO: user lookups actions
  if (selectedType.type == Enums.contactMethodTypes.phone) {
    // Format phone number
    var value = newContactMethodValue.val().replace(/(\(|\)|-| )/g, '');
  }

  if (selectedType.type == Enums.contactMethodTypes.email) {
    // Format phone number
    var value = newContactMethodValue.val();
  }

  Meteor.call('addContactMethod', Session.get('entityId'), selectedType._id, value, function(err) {
    if (err) {
      $('#add-contact-method-error').text('There was an error inserting the contact method. Please try again.');
    } else {
      newContactMethodValue.val('');
      GAnalytics.event("/contactable", "Add contact method");
    }
  });
};

// Item
Template.contactMethodItem.rendered = function () {
  // Format contact method value according with its type
  var value = this.$('.contact-method-value');
  // TODO: use contact method lookup actions
  switch (this.data.typeEnum) {
    case Enums.contactMethodTypes.email: break;
    case Enums.contactMethodTypes.phone: value.mask('+1 (000) 000-0000'); break;
  }
};

Template.contactMethodItem.editMode = function () {
  return EditContactMethodsMode.value;
};

// Add
var loadInputMask = function () {
  // Update input mask according with type selected
  var input = $('#new-contact-method-value');
  // TODO: use contact method lookup actions
  switch (selectedType.type) {
    case Enums.contactMethodTypes.email: break;
    case Enums.contactMethodTypes.phone: input.mask('+1 (000) 000-0000'); break;
  }
};

Template.contactableContactMethodsBox.events = {
  'click .delete': function () {
    Contactables.update({_id: contactableId},
      {
        $pull: {
          contactMethods: {
            type: this.type,
            value: this.value
          }
        }
      }
    );
  },
  'click #edit-contact-method-mode': function() {
    if (EditContactMethodsMode.value) {
      EditContactMethodsMode.hide();
    }
    else{
      EditContactMethodsMode.show();
    }
  }
};

Template.addContactMethod.rendered = function () {
  loadInputMask();
};

Template.addContactMethod.contactMethodsTypes = function() {
  return contactMethodsTypes;
};

Template.addContactMethod.selectedType = function() {
  dep.depend();
  return selectedType? selectedType.displayName: 'Select';
};

Template.addContactMethod.events({
  'click #add-contact-method': function() {
    addNewContactMethod();
  },

  'keyup #new-contact-method-value': function (e) {
    $('#add-contact-method-error').text('');

    // Detect Enter
    if (e.keyCode === 13) {
      addNewContactMethod();
    }
  },
  'click #cancel-contact-method': function () {
    EditContactMethodsMode.hide();
  },
  'click .contact-method-type': function() {
    selectedType = this;

    loadInputMask();

    dep.changed();
  },
  'click .addContactMethod': function () {
    EditContactMethodsMode.show();
  }
});