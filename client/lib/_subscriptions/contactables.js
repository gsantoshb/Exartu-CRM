Contactables = new Meteor.Collection("contactables", {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);

    if (contactable.Contact && contactable.Contact.client) {
      var client = Contactables.findOne({_id: contactable.Contact.client });
      contactable.Contact.clientName = client && client.displayName;
    }

    return contactable;
  }
});

AuxContactables = new Meteor.Collection("auxContactables", {
  transform: function (contactable) {
    Utils.extendContactableDisplayName(contactable);

    if (contactable.Contact && contactable.Contact.client) {
      var client = Contactables.findOne({_id: contactable.Contact.client });
      contactable.Contact.clientName = client && client.displayName;
    }

    if (contactable.location)
      contactable.location.displayName = Utils.getLocationDisplayName(contactable.location);

    return contactable;
  }
});

AllClients  = new Meteor.Collection('allClients', {
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