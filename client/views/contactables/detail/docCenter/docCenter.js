
var createAccountSchema = new SimpleSchema({
  email: {
    type: String,
    label: "Email",
    regEx: SimpleSchema.RegEx.Email
  }
});

Template.docCenterTab.helpers({
  hasAccount: function () {
    var contactable = Contactables.findOne(Session.get('entityId'));
    return contactable && contactable.docCenter;
  },
  createAccountSchema: function () {
    return createAccountSchema;
  }
});

Template.docCenterTab.events({
  'click #createAccount': function (e, ctx) {

    Meteor.call('createDocCenterAccount', Session.get('entityId'), function () {

    });
  }
});


var documents = new ReactiveVar([]);

Template.sendDocument.created = function () {
  DocCenter.getDocuments(function (data) {
    documents.set(data)
  })
};

Template.sendDocument.helpers({
  documents: function () {
    return documents.get();
  }
});
var getMergeFieldsValues = function () {
  var contactable = Contactables.findOne(Session.get('entityId'));

  return [{
    key: 'firstName',
    value: contactable.person.firstName
  },{
    key: 'lastName',
    value: contactable.person.lastName
  }];
};

Template.sendDocument.events({
  'click #send': function (e, ctx) {
    var selectedId = ctx.$('#documentSelect').val();
    var contactable = Contactables.findOne(Session.get('entityId'));

    if (!selectedId){
      return;
    }
    DocCenter.instantiateDocument(selectedId, contactable.docCenter.docCenterId, getMergeFieldsValues(), function () { });

  }
});


//instances list

var instances = new ReactiveVar([]);
var gettingInstances = new ReactiveVar(false);

Template.documentInstances.created = function () {
  var contactable = Contactables.findOne(Session.get('entityId'));

  gettingInstances.set(true);
  DocCenter.getDocumentInstances(contactable.docCenter.docCenterId, function (data) {
    instances.set(data);
    gettingInstances.set(false);
  })
};

Template.documentInstances.helpers({
  instances: function () {
    return instances.get();
  },
  getStatus: function (status) {
    return 'sent'
  },
  isLoading: function () {
    return gettingInstances.get();
  }
});
