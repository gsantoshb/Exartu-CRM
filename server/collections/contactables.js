Meteor.publish('singleContactable', function (id) {
  return Utils.filterCollectionByUserHier.call(this, Contactables.find(id));
});

Meteor.paginatedPublish(Contactables, function () {
  if (!this.userId)
    return false;

  return Utils.filterCollectionByUserHier.call(this, Contactables.find({
      userId: this.userId
    },
    {
      fields: {
        // Only fields displayed on list
      }
    }));
},{
  pageSize: 5,
  publicationName: 'contactablesList'
});

Contactables.allow({
  insert: function () {
    return false;
  },
  update: function (userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  },
  remove: function () {
    return false;
  }
});

// Hooks

Contactables.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  }catch (e) {
    var user= { }
  }

  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
});

// Contactables documents

ContactablesFS = new Document.Collection({
  collection: Contactables
});
ContactablesFS.publish();

ContactablesFiles = new Mongo.Collection('contactablesFiles');
Meteor.publish('contactablesFiles', function () {
  return ContactablesFiles.find();
});

// Employee resumes
Resumes = new Mongo.Collection('resumes');

//S3Store = new FS.Store.S3("resumes",{
//  region: "sa-east-1",
//  accessKeyId: "AKIAIB76L4YEQOBMNNBA",
//  secretAccessKey: "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",
//  bucket: "exartu-bucket-0001"
//});
//
//ResumesFS = new FS.Collection("resumes", {
//  stores: [S3Store]
//});
//FS.debug = true;
//ResumesFS.on('stored', Meteor.bindEnvironment(function(fileObj){
//  console.dir(fileObj)
//  ContactableManager.createFromResume("resumes", fileObj);
//}));

Meteor.publish('resumes', function() {
  return Resumes.find({userId: this.userId});
});

Resumes.allow({
  insert: function (userId, file) {
    return false;
  },
  update: function (userId, file, fields, modifier) {
    return false;
  },
  remove: function (userId, file) {
    return false;
  }
});

// Indexes

Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({objNameArray: 1});