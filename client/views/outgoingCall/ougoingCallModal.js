var ended = new ReactiveVar(false);
var accepted = new ReactiveVar(false);

var connection = null;

Template.outgoingCall.created = function () {
  connection = this.data[0];

  connection.on('disconnect', function () {
    Utils.dismissModal();
  });

  ended.set(false);
  accepted.set(false);
};
Template.outgoingCall.events({
  'click #hangupCall': function () {
    connection.removeAllListeners();
    connection.disconnect();
    Utils.dismissModal();
  }
});