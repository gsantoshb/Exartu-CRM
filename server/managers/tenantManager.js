TenantManager = {
    addUserToTenant: function(id,hierId) {
        Meteor.users.update({_id: id}, { $addToSet: { hierarchies: hierId } });
    },
    removeUserFromTenant: function(id,hierId) {
        Meteor.users.update({_id: id}, { $pull: { hierarchies: hierId } });
    }
};
