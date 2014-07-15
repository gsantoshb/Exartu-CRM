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
        update: updateBase + 'department'
      },
      description: {
        default: customer.description,
        update: updateBase + 'description'
      }
    });
  }
  // Employee
  else if (contactable.Employee) {
    updateBase = 'Employee.';
    var employee = contactable.Employee;
    var status=LookUps.findOne({_id: employee.recruiterStatus});
    _.extend(definition.reactiveProps, {
      employee: {
        default: true
      },
      description: {
        default: employee.description,
        update: updateBase + 'description'
      },
      status: {
        default: employee.recruiterStatus,
        update: updateBase + 'recruiterStatus',
        type: Utils.ReactivePropertyTypes.lookUp,
        displayName: status ? status.displayName : '',
        options: LookUps.find({codeType: Enums.lookUpTypes.employee.recruiterStatus.code})
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
        update: updateBase + 'description'
      }
    });
  }

  return new Utils.ObjectDefinition(definition);
};

Template.contactableDetailBox.created=function(){
  EditMode.hide();
}
Template.contactableDetailBox.isSelected=function(value1, value2){
  return value1==value2
}

Template.contactableDetailBox.contactable = function() {
  contactable = generateReactiveObject(this);
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
    console.dir(contactable.generateUpdate());
    Contactables.update({_id: contactable._id}, contactable.generateUpdate(), function(err, result) {
      if (!err) {
        EditMode.hide();
        contactable.updateDefaults();
        GAnalytics.event("/contactable", "Edit contactable details", contactable.generateUpdate() != {}? 'With changes' : 'Without changes');
      }
    });
  },
  'click #cancel-details': function() {
    EditMode.hide();
    contactable.reset();
  }
}


