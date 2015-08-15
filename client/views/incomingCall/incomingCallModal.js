/**
 * Created by aramg on 12/08/2015.
 */
//       conn.accept();

var connection;
var contactable = new ReactiveVar();
var connectionStatusDep = new Tracker.Dependency;

Template.incomingCallModal.created = function() {

    connection = _.first(this.data) ;
    //This is triggered when an incoming connection is canceled by the caller before it is accepted by the Twilio Client device.
    //
    Twilio.Device.cancel(function (conn){
        connectionStatusDep.changed();
    });
    //Register a handler function to be called when this connection object has finished connecting and changes its state to open.
    connection.accept(function (conn) {
        connectionStatusDep.changed();
    });

    //Register a handler function to be called when this connection is closed.
    connection.disconnect(function (conn) {
        Utils.dismissModal();
    });

    Meteor.call("getContactableFromPhoneNumber",connection.parameters.From,function(err,result){
        contactable.set(result);

    });
};

Template.incomingCallModal.helpers({
    incomingName : function(){
        if(contactable.get())
            return contactable.get().displayName;
        else
            return connection.parameters.From;
    },
    contactable: function () {
        return contactable.get();
    },
    answerCallDisabled : function (){
        connectionStatusDep.depend();
        if(connection.status() != "pending")
         return 'disabled';
    }
});

Template.incomingCallModal.events({
    'click #answerCall': function () {
        connection.accept();
    },
    'click #declineCall': function () {
        currentTwilioConnection.get().reject();
        currentTwilioConnection.get().disconnect();
        currentTwilioConnection.set(undefined);
        Utils.dismissModal();
    }
});