var contactable = new ReactiveVar();
var number = new ReactiveVar();
var accepted = new ReactiveVar();
var callNote = new ReactiveVar('');

Template.incomingCallModal.created = function () {
  var currentConnection = currentTwilioConnection.get();
  if (currentConnection) {
    //Register a handler function to be called when this connection object has finished connecting and changes its state to open.
    currentConnection.accept(function () {
      accepted.set(true);
    });

    number.set(currentConnection.parameters.From);
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
  callNote: function () {
    return callNote.get();
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
  },
  number: function () {
    return number.get();
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
  },
  'keyup #incomingCallNote': _.debounce(function (e) {
    callNote.set(e.target.value);
  }, 300),
  'click .saveAndClose': function () {
    // Check if the user wrote a note
    if (callNote.get()) {
      var note = {
        msg: callNote.get()
      };

      // Link the note to the contactable when available
      if (contactable.get()) {
        note.links = [{ id: contactable.get()._id, type: Enums.linkTypes.contactable.value }]
      }

      Meteor.call('addNote', note, function(err, res) {
        if (!err) {
          $.gritter.add({
            title:	'Note saved',
            text:	'The note was successfully saved',
            image: 	'/img/logo.png',
            sticky: false,
            time: 2000
          });
        }
      });
    }

    Utils.dismissModal();
  },
  'click .close-modal': Utils.dismissModal
});