TenantManager = {
    addUserToTenant: function(id,hierId) {
        Meteor.users.update({_id: id}, { $addToSet: { hierarchies: hierId } });
        var x=Meteor.users.findOne({_id:id});

    },
    removeUserFromTenant: function(id,hierId) {
        Meteor.users.update({_id: id}, { $pull: { hierarchies: hierId } });
    }
};
