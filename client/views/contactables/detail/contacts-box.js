var contacts = {};
var hasContacts = true;

Template.contactableContactsBox.created = function() {
  if (!this.data.Customer) {
    hasContacts = false;
  }
};

Template.contactableContactsBox.hasContacts = function() {
  return hasContacts;
};

Template.contactableContactsBox.contacts = function() {
  debugger;
  return Contactables.find({ _id: { $in: this.Customer.contacts } });
}

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    Session.set('options', {Contact: {customer: Session.get('entityId')}});
    Router.go('addContactablePage', {objType: 'Contact'});
  }
}