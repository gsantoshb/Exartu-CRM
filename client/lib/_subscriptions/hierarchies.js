Hierarchies = new Meteor.Collection("hierarchies");
HierarchiesHandler = Meteor.subscribe('hierarchies');

HierarchiesFS = new Document.Collection({
  collection: Hierarchies
});
Meteor.subscribe(HierarchiesFS.collectionName);
