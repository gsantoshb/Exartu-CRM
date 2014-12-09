Tenants = new Meteor.Collection("tenants");
TenantsHandler = Meteor.subscribe('tenants');

TenantsFS = new Document.Collection({
  collection: Tenants
});
Meteor.subscribe(TenantsFS.collectionName);
