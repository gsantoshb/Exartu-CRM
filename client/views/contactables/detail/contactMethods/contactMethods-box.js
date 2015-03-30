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

Template.contactableContactMethodsBox.helpers({
  editMode: function () {
    return EditContactMethodsMode.value;
  },

  editModeColor: function () {
    return EditContactMethodsMode.value ? '#008DFC' : '';
  },

  contactMethods: function () {
    var result = [];
    var contactMethods = this.contactMethods;

    _.forEach(contactMethods, function (cm) {
      var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
      if (type) {
        cm.displayName = type.displayName;
      }
      result.push(cm);
    });

    return result;
  }
});

var addNewContactMethod = function() {
  var newContactMethodValue = $('#new-contact-method-value');
  var value = newContactMethodValue.val();
  $('#new-contact-method-value').val = null;
  if (_.isEmpty(value) || _.isEmpty(selectedType))
    return;

  // Check email regex
  if (selectedType.lookUpActions) {
    if (_.contains(selectedType.lookUpActions, Enums.lookUpAction.ContactMethod_Email) && !helper.emailRE.test(value)) {
      $('#add-contact-method-error').text('Invalid email format');
      return;
    }

  }

  // Format phone number
  if (selectedType.lookUpActions && _.contains(selectedType.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
    value = value.replace(/(\(|\)|-| )/g, '');
    // Test phone number format
    var regex = /^[\+]?[\d]+$/;
    if (!regex.test(value)) {
      $('#add-contact-method-error').text('Invalid phone number format');
      return;
    }
  }

  Meteor.call('addContactMethod', Session.get('entityId'), selectedType._id, value, function(err) {
    if (err) {
      if(err.error === "Error, Contact email must be unique"){
        $('#add-contact-method-error').text(err.error);
      }
      else {
        $('#add-contact-method-error').text('There was an error inserting the contact method. Please try again.');
      }
    } else {
      newContactMethodValue.val('');
    }
  });
};

// Item
Template.contactMethodItem.rendered = function () {
  var contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();
  var type = _.findWhere(contactMethodsTypes, { _id: this.data.type });

  // Format contact method value according with its type
  var value = this.$('.contact-method-value');
  if (type && type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
//    value.mask('+1 (000) 000-0000');
  }
};

Template.contactMethodItem.helpers({
  editMode: function () {
    return EditContactMethodsMode.value;
  }
});

// Add
var loadInputMask = function (selectedType) {
  if (selectedType) {
    var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
    var type = _.find(contactMethodsTypes,  function(cm){ return cm._id === selectedType._id; });
    // Update input mask according with type selected
    var input = $('#new-contact-method-value');
    if (type && type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
//      input.mask('+1 (000) 000-0000');
    }
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
  loadInputMask(selectedType);
};

Template.addContactMethod.helpers({
  contactMethodsTypes: function () {
    return contactMethodsTypes;
  },
  selectedType: function () {
    dep.depend();
    return selectedType ? selectedType.displayName : 'Select';
  }
});

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

    loadInputMask(selectedType);

    dep.changed();
  },
  'click .addContactMethod': function () {
    EditContactMethodsMode.show();
  }
});