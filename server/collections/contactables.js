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

// Employee resumes

ResumesFS = new FS.Collection("resumes", {
  stores: [new FS.Store.FileSystem("resumes", {path: "~/resumes"})]
});
Meteor.publish('resumes', function() {
  return ResumesFS.find({'metadata.owner': this.userId});
});
ResumesFS.allow({
  insert: function (userId, file) {
    return true;
  },
  update: function (userId, file, fields, modifier) {
    return true;
  },
  remove: function (userId, file) {
    return true;
  },
  download: function (userId, file) {
    return true;
  }
});

// Indexes

Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({objNameArray: 1});