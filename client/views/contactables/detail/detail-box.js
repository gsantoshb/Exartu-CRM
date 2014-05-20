EditMode = {
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

Object.defineProperty(EditMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function(newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var contactable = {};

var generateReactiveObject = function(contactable) {
  var definition = {
    _id: contactable._id,
    reactiveProps: {}
  };

  // Person
  if (contactable.person) {
    _.extend(definition.reactiveProps, {
      person: {
        default: true
      },
      firstName: {
        default: contactable.person.firstName,
        validator: Utils.Validators.stringNotEmpty,
        update: 'person.firstName'
      },
      lastName: {
        default: contactable.person.lastName,
        validator: Utils.Validators.stringNotEmpty,
        update: 'person.lastName'
      },
      middleName: {
        default: contactable.person.middleName,
        update: 'person.middleName'
      },
      jobTitle: {
        default: contactable.person.jobTitle,
//        validator: Utils.Validators.stringNotEmpty,
        update: 'person.jobTitle'
      }
    });
  }
  // Organization
  else if (contactable.organization) {
    _.extend(definition.reactiveProps, {
      organization: {
        default: true
      },
      organizationName: {
        default: contactable.organization.organizationName,
        validator: Utils.Validators.stringNotEmpty,
        update: 'organization.organizationName'
      }
    });
  }

  var updateBase = '';
  // Customer
  if (contactable.Customer){
    updateBase = 'Customer.';
    var customer = contactable.Customer;
    _.extend(definition.reactiveProps, {
      customer: {
        default: true
      },
      department: {
        default: customer.department,
        validator: Utils.Validators.stringNotEmpty,
        update: updateBase + 'department'
      },
      description: {
        default: customer.description,
        validator: Utils.Validators.stringNotEmpty,
        update: updateBase + 'description'
      }
    });
  }
  // Employee
  else if (contactable.Employee) {
    updateBase = 'Employee.';
    var employee = contactable.Employee;
    _.extend(definition.reactiveProps, {
      employee: {
        default: true
      },
      description: {
        default: employee.description,
//        validator: Utils.Validators.stringNotEmpty,
        update: updateBase + 'description'
      }
    });
  }
  // Contact
  else if (contactable.Contact) {
    updateBase = 'Contact.';
    var contact = contactable.Contact;
    _.extend(definition.reactiveProps, {
      contact: {
        default: true
      },
      description: {
        default: contact.description,
        validator: Utils.Validators.stringNotEmpty,
        update: updateBase + 'description'
      }
    });
  }

  return Utils.ObjectDefinition(definition);
};

Template.contactableDetailBox.created = function() {
  contactable = generateReactiveObject(this.data);
};

Template.contactableDetailBox.contactable = function() {
  return contactable;
};

Template.contactableDetailBox.editMode = function() {
  return EditMode.value;
}

Template.contactableDetailBox.editModeColor = function() {
  return EditMode.value? '#008DFC' : '';
}

Template.contactableDetailBox.events = {
  'click #edit-mode': function() {
    if (EditMode.value) {
      EditMode.hide();
      contactable.reset();
    }
    else
      EditMode.show();
  },
  'click #save-details': function() {
    if (!contactable.isValid()) {
      contactable.showErrors();
      return;
    }

    Contactables.update({_id: contactable._id}, contactable.generateUpdate(), function(err, result) {
      if (!err) {
        EditMode.hide();
        contactable.updateDefaults();
      }
    });
  },
  'click #cancel-details': function() {
    EditMode.hide();
    contactable.reset();
  }
}


