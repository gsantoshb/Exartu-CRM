/**
 * Created by aramg on 12/08/2015.
 */

var contactable = new ReactiveVar();

Template.incomingCallModal.created = function() {

    var currentConnection = currentTwilioConnection.get();
    if(currentConnection != undefined){
        //Register a handler function to be called when this connection object has finished connecting and changes its state to open.
        currentTwilioConnection.get().accept(function (conn) {
            connectionStatusDep.changed();
        });

        //Register a handler function to be called when this connection is closed.
        currentTwilioConnection.get().disconnect(function (conn) {
            Utils.dismissModal();
        });


        Meteor.call("getContactableFromPhoneNumber",currentConnection.parameters.From,function(err,result){
            contactable.set(result);

        });
    }

};

Template.incomingCallModal.helpers({
    incomingName : function(){
        debugger;
        if(contactable.get())
            return contactable.get().displayName;
        else
            return currentTwilioConnection.get().parameters.From;
    },
    contactable: function () {
        return contactable.get();
    },
    answerCallDisabled : function (){
        if(currentTwilioConnection.get() == undefined)
        return 'disabled';
        if(currentTwilioConnection.get().status() != "pending")
         return 'disabled';
    }
});

Template.incomingCallModal.events({
    'click #answerCall': function () {
        currentTwilioConnection.get().accept();
    },
    'click #declineCall': function () {
        currentTwilioConnection.get().reject();
        currentTwilioConnection.get().disconnect();
        Utils.dismissModal();
    }
});