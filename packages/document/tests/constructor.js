Tinytest.add("Constructor - Create Document.Collection and publish it", function (test, next) {
  var collection = new Meteor.Collection("test");

  var documents = new Document.Collection({
    collection: collection
  });

  var file = new FS.File('Hello World', "text/plain");
  var documentId = documents.insert(file);

  var document = documents.find({_id: documentId});

  test.isNotNull(document, 'Document not inserted correctly');
});