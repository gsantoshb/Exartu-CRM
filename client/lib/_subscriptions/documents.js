ContactablesFS = new Document.Collection({
  collection: Contactables
});
Meteor.subscribe(ContactablesFS.collectionName);

Resumes = new Mongo.Collection('resumes');
Meteor.subscribe('resumes');

ContactablesFiles = new Mongo.Collection('contactablesFiles');
Meteor.subscribe('contactablesFiles');

UsersFS = new Document.Collection({
  collection: Meteor.users
});
Meteor.subscribe(UsersFS.collectionName);
