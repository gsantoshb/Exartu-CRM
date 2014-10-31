Contactables = new Meteor.Collection("contactables", {
  transform: function (contactable) {
    addDisplayName(contactable);

    if (contactable.contactMethods) {
      _.each(contactable.contactMethods, function (cm) {
        var type = ContactMethods.findOne({_id: cm.type});
        if (type) {
          cm.typeName = type.displayName;
          cm.typeEnum = type.type;
        } else {
          cm.typeName = 'Unknown';
          cm.typeEnum = -1;
        }

      })
    }

    if (contactable.Contact && contactable.Contact.customer) {
      var customer = Contactables.findOne({_id: contactable.Contact.customer });
      contactable.Contact.customerName = customer && customer.displayName;
    }

    extendObject(contactable);
    return contactable;
  }
});
var addDisplayName = function (contactable) {
  if (contactable.person)
    contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
  if (contactable.organization)
    contactable.displayName = contactable.organization.organizationName;
}

AuxContactables = new Meteor.Collection("auxContactables", {
  transform: function (contactable) {
    addDisplayName(contactable);


    if (contactable.contactMethods) {
      _.each(contactable.contactMethods, function (cm) {
        var type = ContactMethods.findOne({_id: cm.type});
        if (type) {
          cm.typeName = type.displayName;
          cm.typeEnum = type.type;
        } else {
          cm.typeName = 'Unknown';
          cm.typeEnum = -1;
        }

      })
    }

    if (contactable.Contact && contactable.Contact.customer) {
      var customer = Contactables.findOne({_id: contactable.Contact.customer });
      contactable.Contact.customerName = customer && customer.displayName;
    }

    if (contactable.location)
      contactable.location.displayName = Utils.getLocationDisplayName(contactable.location);

    extendObject(contactable);
    return contactable;
  }
});

AllCustomers  = new Meteor.Collection('allCustomers', {
  transform: function (contactable) {
    addDisplayName(contactable);
    return contactable;
  }
});
AllEmployees  = new Meteor.Collection('allEmployees', {
  transform: function (contactable) {
    addDisplayName(contactable);
    return contactable;
  }
});
AllContactables  = new Meteor.Collection('allContactables', {
  transform: function (contactable) {
    addDisplayName(contactable);
    return contactable;
  }
});