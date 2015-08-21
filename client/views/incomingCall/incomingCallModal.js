var contactable = new ReactiveVar();
var accepted = new ReactiveVar();

Template.incomingCallModal.created = function () {
  var currentConnection = currentTwilioConnection.get();
  if (currentConnection) {
    //Register a handler function to be called when this connection object has finished connecting and changes its state to open.
    currentConnection.accept(function () {
      accepted.set(true);
    });

    Meteor.call("getContactableFromPhoneNumber", currentConnection.parameters.From, function (err, result) {
      contactable.set(result);
    });
  }

  accepted.set(false);
};

Template.incomingCallModal.helpers({
  incomingName: function () {
    if (contactable.get())
      return contactable.get().displayName;
    else if (currentTwilioConnection.get())
      return currentTwilioConnection.get().parameters.From;
  },
  contactable: function () {
    return contactable.get();
  },

  accepted: function () {
    return accepted.get();
  },
  callEnded: function () {
    return !currentTwilioConnection.get();
  },
  answerCallDisabled: function () {
    if (currentTwilioConnection.get() == undefined)
      return 'disabled';
    if (currentTwilioConnection.get().status() != "pending")
      return 'disabled';
  }
});

Template.incomingCallModal.events({
  'click #answerCall': function () {
    currentTwilioConnection.get().accept();
  },
  'click #declineCall': function () {
    currentTwilioConnection.get().reject();
    Utils.dismissModal();
  },
  'click #hangupCall': function () {
    currentTwilioConnection.get().disconnect();
  }
});