/**
 * Created by aramg on 12/08/2015.
 */
//       conn.accept();

var connection;
var contactable;
var incomingNameDep = new Tracker.Dependency;
Template.incomingCallModal.created = function() {

    connection = _.first(this.data) ;

    connection.disconnect(function (conn) {

        Utils.dismissModal();
    });
    Meteor.call("getContactableFromPhoneNumber",connection.parameters.From,function(err,result){

        contactable = result;
        incomingNameDep.changed();
    });
};

Template.incomingCallModal.helpers({
    incomingName : function(){
        incomingNameDep.depend();
        if(contactable)
        return contactable.displayName;
        else
        return connection.parameters.From;
    }
});

Template.incomingCallModal.events({
    'click #answerCall': function () {
       connection.accept();
    },
    'click #declineCall': function () {
        connection.ignore();
        Utils.dismissModal();
    }
});