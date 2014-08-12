EditContactMethodsMode = {
  val: false,
  dep: new Deps.Dependency,
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
  set: function(newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var dep = new Deps.Dependency;
var selectedType;
var contactableId;

var contactMethodsTypes;
Template.contactableContactMethodsBox.created = function() {
  contactMethodsTypes = ContactMethods.find({}).fetch();
  selectedType = contactMethodsTypes[0];
  contactableId = this.data._id;
  EditContactMethodsMode.value=false;
};

Template.contactableContactMethodsBox.editMode = function() {
  return EditContactMethodsMode.value;
};

Template.contactableContactMethodsBox.editModeColor = function() {
  return EditContactMethodsMode.value? '#008DFC' : '';
};

Template.contactableContactMethodsBox.contactMethodsTypes = function() {
  return contactMethodsTypes;
};

Template.contactableContactMethodsBox.contactMethodTypeIcon = function() {
  switch(this.typeCode) {
    case Enums.contactMethodTypes.phone:
      return 'icon-phone-3';
      break;
    case Enums.contactMethodTypes.email:
      return 'icon-address-1';
      break;
    case Enums.contactMethodTypes.other:
      return '';
      break;
  }
};

Template.contactableContactMethodsBox.selectedType = function() {
  dep.depend();
  return selectedType? selectedType.displayName: 'Select';
};
Template.contactableContactMethodsBox.typePrefix= function() {
  switch(this.typeCode) {
    case Enums.contactMethodTypes.phone:
      return 'callto:';

    case Enums.contactMethodTypes.email:
      return 'mailto:';

    case Enums.contactMethodTypes.other:
      return '';
  }
};

Template.contactableContactMethodsBox.contactMethods = function() {
  var result = [];
  var contactMethods = this.contactMethods;

  _.forEach(contactMethods, function(cm) {
    var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
    cm.displayName = type.displayName;
    cm.typeCode = type.type;
    result.push(cm);
  });

  return result;
};

Template.contactableContactMethodsBox.events = {
  'click #add-contact-method': function() {
    var newContactMethodValue = $('#new-contact-method-value')
    $('#new-contact-method-value').val=null;
    if (_.isEmpty(newContactMethodValue.val()) || _.isEmpty(selectedType))
      return;

    if ( selectedType.type == Enums.contactMethodTypes.email && !helper.emailRE.test(newContactMethodValue.val())) {
      $('#add-contact-method-error').text('Invalid email format');
      return;
    }

    var newContactMethod = {
      type: selectedType._id,
      value: newContactMethodValue.val()
    };

    Contactables.update({_id: Session.get('entityId')}, {$addToSet: {contactMethods: newContactMethod}}, function(err, result) {
      if (!err) {
        newContactMethodValue.val('');
        GAnalytics.event("/contactable", "Add contact method");
      }
    });
  },
  'keypress #new-contact-method-value': function() {
    $('#add-contact-method-error').text('');
  },
  'click #cancel-contact-method': function() {
    EditContactMethodsMode.hide();
  },
  'click #edit-contact-method-mode': function() {
    if (EditContactMethodsMode.value) {
      EditContactMethodsMode.hide();
    }
    else{
      EditContactMethodsMode.show();
    }
  },
  'click .contact-method-type': function() {
    selectedType = this;
    dep.changed();
  },
  'click .addContactMethod': function () {
    EditContactMethodsMode.show();
  },
  'click .delete': function() {
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
  }
};