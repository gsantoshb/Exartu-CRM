Meteor.methods({
    addUserToTenant: function(id,hierId) {
        TenantManager.addUserToTenant(id,hierId);
    },
    removeUserFromTenant: function(id,hierId) {
        TenantManager.removeUserFromTenant(id,hierId);
    },
});
