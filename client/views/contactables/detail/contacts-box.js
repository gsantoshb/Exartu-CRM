
Template.contactableContactsBox.hasContacts = function() {
  return _.isObject(this.Customer);
};

Template.contactableContactsBox.contacts = function() {
  return Contactables.find({ _id: { $in: this.Customer.contacts } });
}

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    Session.set('options', {Contact: {customer: Session.get('entityId')}});
    Router.go('addContactablePage', {objType: 'Contact'});
  }
}