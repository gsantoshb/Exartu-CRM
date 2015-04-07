
var createAccountSchema = new SimpleSchema({
  email: {
    type: String,
    label: "Email",
    regEx: SimpleSchema.RegEx.Email
  }
});

var isCreatingAccount = new ReactiveVar(false);

Template.docCenterTab.created = function () {
  isCreatingAccount.set(false);

  Meteor.subscribe('docCenterMergeFields');
};


Template.docCenterTab.helpers({
  hasAccount: function () {
    var contactable = Contactables.findOne(Session.get('entityId'));
    return contactable && contactable.docCenter;
  },
  createAccountSchema: function () {
    return createAccountSchema;
  },
  hasEmail: function () {
    var employee = Contactables.findOne(Session.get('entityId'));
    return  _.any(employee.contactMethods, function(cm){
      var cmType = LookUps.findOne(cm.type);
      return _.contains(cmType.lookUpActions, Enums.lookUpAction.ContactMethod_Email);
    });


  },
  isCreatingAccount: function () {
    return isCreatingAccount.get();
  }
});

Template.docCenterTab.events({
  'click #createAccount': function (e, ctx) {
    isCreatingAccount.set(true);
    Meteor.call('createDocCenterAccount', Session.get('entityId'), function () {
      isCreatingAccount.set(false);
    });
  }
});



Template.sendDocument.events({
  'click #selectDocuments': function (e, ctx) {
    Utils.showModal('sendDocumentsModal')

  }
});


// modal
var documents = new ReactiveVar([]),
  modalLoading = new ReactiveVar(),
  isSending = new ReactiveVar();

Template.sendDocumentsModal.created = function () {
  modalLoading.set(true);
  isSending.set(false);
  DocCenter.getDocuments(function (data) {
    modalLoading.set(false);
    documents.set(data)
  })
};

Template.sendDocumentsModal.helpers({
  documents: function () {
    return documents.get();
  },
  isLoading: function () {
    return modalLoading.get();
  },
  isSending: function () {
    return isSending.get();
  }
});

Template.sendDocumentsModal.events({
  'click .accept': function (e, ctx) {
    var contactable = Contactables.findOne(Session.get('entityId'));

    var checked = ctx.$('.docCheckbox:checked');
    checked = _.map(checked, function (checkbox) {
      return $(checkbox).data('docid');
    });
    if (!checked || !checked.length) return;

    isSending.set(true);

    Meteor.call('instantiateDocumentForContactable', checked, contactable.docCenter.docCenterId, Session.get('entityId'), function () {
      isSending.set(false);
      Utils.dismissModal();
      loadInstances();
    });
  }  
});

//instances list

var instances = new ReactiveVar([]),
  gettingInstances = new ReactiveVar(false);

var loadInstances = function () {
  var contactable = Contactables.findOne(Session.get('entityId'));

  gettingInstances.set(true);
  DocCenter.getDocumentInstances(contactable.docCenter.docCenterId, function (data) {
    console.log('data', data);
    instances.set(data);
    gettingInstances.set(false);
  })
};

Template.documentInstances.created = function () {
  loadInstances();
};

Template.documentInstances.helpers({
  instances: function () {
    return instances.get();
  },
  getStatus: function (status) {
    return documentStatusDictionary[status]
  },
  isLoading: function () {
    return gettingInstances.get();
  }
});

var documentStatus = {
  InActive: 0,
  Expired: 1,
  Denied: 2,
  PartiallyCompleted: 3,
  Sent: 4,
  ExternalSubmitted: 5,
  Submitted: 6,
  Approved: 7,
  ReadOnly: 8,
  PendingFile: 9
};

var documentStatusDictionary = _.invert(documentStatus);
