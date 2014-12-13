TenantUsers = new Meteor.Collection('tenantUsers', {
});
TenantUsersHandler = Meteor.subscribe('tenantUsers');

AllTenantUsers = new Meteor.Collection('allTenantUsers', {
});
