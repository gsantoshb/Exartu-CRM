Meteor.publish('singleContactable', function (id) {
  return Utils.filterCollectionByUserHier.call(this, Contactables.find(id));
});

ContactablesList = new View('auxContactables',{
  collection: Contactables,
  cursors: function (contactable) {

    // Placements
    this.publish({
      cursor: function (contactable) {
        if (contactable.placement !== undefined) {
          return PlacementView.find({ _id: contactable.placement });
        }
      },
      to: 'placements',
      observedProperties: ['placement'],
      onChange: function (changedProps, oldSelector) {
        if (changedProps.placement !== undefined) {
          return PlacementView.find({ _id: changedProps.placement });
        }
      }
    });

    // Customers
    this.publish({
      cursor: function (contactable) {
        if (contactable.Contact && contactable.Contact.customer) {
          return Contactables.find(contactable.Contact.customer, { fields: { 'organization.organizationName': 1 } });
        }
      },
      to: 'contactables',
      observedProperties: ['Contact'],
      onChange: function (changedProps, oldSelector) {
        if (changedProps.Contact.customer) {
          return Contactables.find(changedProps.Contact.customer, { fields: { 'organization.organizationName': 1 } });
        }
      }
    });
  }
});

Meteor.paginatedPublish(ContactablesList, function () {
    if (!this.userId)
      return false;

    return Utils.filterCollectionByUserHier.call(this, ContactablesList.find({},
      {
        fields: {
          // Only fields displayed on list
        },
        sort: {
          dateCreated: -1
        }
      })
    );
  },
  {
    pageSize: 5,
    publicationName: 'auxContactables'
  }
);

Meteor.publish('allContactables', function (filter) {
  console.log('allContactables',filter);
  return Contactables.find(filter, {
    fields: {
      'organization.organizationName': 1,
      person: 1,
      houseAccount: 1
    }
  });
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