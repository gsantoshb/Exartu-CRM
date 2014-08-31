
Template.contactableContactsBox.hasContacts = function() {

  return _.isObject(this.Customer);
};

Template.contactableContactsBox.contacts = function() {
  console.log('ccont',this);
  return Contactables.find({ 'Contact.customer': this._id  });
}

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    Session.set('options', {Contact: {customer: Session.get('entityId')}});
    Router.go('addContactablePage', {objType: 'Contact'});
  }
}