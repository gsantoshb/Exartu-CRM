ContactablesFS = new Document.Collection({
  collection: Contactables
});
Meteor.subscribe(ContactablesFS.collectionName);

ResumesFS = new FS.Collection("resumes", {
  stores: [new FS.Store.FileSystem("resumes", {path: "~/resumes"})]
});

Meteor.subscribe('resumes');

UsersFS = new Document.Collection({
  collection: Meteor.users
});
Meteor.subscribe(UsersFS.collectionName);