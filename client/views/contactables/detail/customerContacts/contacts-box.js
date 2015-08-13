
var ContactablesHandler;
Template.contactableContactsBox.created = function () {

  if (!SubscriptionHandlers.ContactablesHandler){
    SubscriptionHandlers.ContactablesHandler = Meteor.paginatedSubscribe('contactables',{ filter: { 'Contact.client': this.data._id  } });
  }else{
    SubscriptionHandlers.ContactablesHandler.setFilter({ filter: { 'Contact.client': this.data._id  } });
  }
  ContactablesHandler = SubscriptionHandlers.ContactablesHandler;
};

Template.contactableContactsBox.helpers({
  hasContacts: function () {
    return _.isObject(this.Client);
  },

  contacts: function () {
    return Contactables.find({'Contact.client': this._id});
  }
});

Template.contactableContactsBox.events = {
  'click .addContact': function () {
    console.log('click');
    //Session.set('options', {Contact: {client: Session.get('entityId')}});
    Router.go('/contactableAdd/Contact?client='+Session.get('entityId'));
  }
};