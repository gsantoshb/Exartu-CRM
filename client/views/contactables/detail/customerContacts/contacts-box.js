
var ContactablesHandler;
Template.contactableContactsBox.created = function () {
  if (!SubscriptionHandlers.ContactablesHandler){
    SubscriptionHandlers.ContactablesHandler = Meteor.paginatedSubscribe('contactables');
  }
  ContactablesHandler = SubscriptionHandlers.ContactablesHandler;
  ContactablesHandler.setFilter({ 'Contact.customer': this.data._id  });
};
Template.contactableContactsBox.hasContacts = function() {
  return _.isObject(this.Customer);
};

Template.contactableContactsBox.contacts = function() {
  return Contactables.find({Contact: {$exists: true}});
};

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    Session.set('options', {Contact: {customer: Session.get('entityId')}});
    Router.go('addContactablePage', {objType: 'Contact'});
  }
};