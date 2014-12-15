Contactables = new Meteor.Collection("contactables", {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);

    if (contactable.Contact && contactable.Contact.customer) {
      var customer = Contactables.findOne({_id: contactable.Contact.customer });
      contactable.Contact.customerName = customer && customer.displayName;
    }

    return contactable;
  }
});

AuxContactables = new Meteor.Collection("auxContactables", {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);

    if (contactable.Contact && contactable.Contact.customer) {
      var customer = Contactables.findOne({_id: contactable.Contact.customer });
      contactable.Contact.customerName = customer && customer.displayName;
    }

    if (contactable.location)
      contactable.location.displayName = Utils.getLocationDisplayName(contactable.location);

    return contactable;
  }
});

AllCustomers  = new Meteor.Collection('allCustomers', {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);
    return contactable;
  }
});
AllEmployees  = new Meteor.Collection('allEmployees', {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);
    return contactable;
  }
});
AllContactables  = new Meteor.Collection('allContactables', {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);
    return contactable;
  }
});