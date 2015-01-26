Meteor.methods({
    addUserToTenant: function(id,hierId) {
        console.log('autt',id,hierId);
        TenantManager.addUserToTenant(id,hierId);
    },
    removeUserFromTenant: function(id,hierId) {
        TenantManager.removeUserFromTenant(id,hierId);
    },
});
