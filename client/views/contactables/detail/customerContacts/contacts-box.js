Template.contactableContactsBox.created = function () {
 ContactablesHandler.setFilter({ 'Contact.customer': this.data._id  });
}
Template.contactableContactsBox.hasContacts = function() {
  return _.isObject(this.Customer);
};

Template.contactableContactsBox.contacts = function() {
  return Contactables.find();
};

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    Session.set('options', {Contact: {customer: Session.get('entityId')}});
    Router.go('addContactablePage', {objType: 'Contact'});
  }
};