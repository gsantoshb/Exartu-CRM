Meteor.publish('singleContactable', function (id) {
  var sub = this;
  ContactablesList.publishCursor(Utils.filterCollectionByUserHier.call(this, ContactablesList.find({_id: id})), sub, 'contactables');
  sub.ready();
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

    // Publish contact's customer
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

    // Publish customer's contacts
    this.publish({
      cursor: function (contactable) {
        if (contactable.Customer) {
          return Contactables.find({'Contact.customer': contactable._id});
        }
      },
      to: 'contactables'
    });

    // Publish customer's jobs
    this.publish({
      cursor: function (contactable) {
        return Jobs.find({customer: contactable._id});
      },
      to: 'jobs'
    });

    // Last note
    this.publish({
      cursor: function (contactable) {
        return Notes.find({'links.id': contactable._id}, {limit: 1, sort: { dateCreated: -1}});
      },
      to: 'notes'
    });
  }
});

Meteor.paginatedPublish(ContactablesList, function () {
    if (!this.userId)
      return [];
    console.log('searchcalled')
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
    pageSize: 10,
    publicationName: 'auxContactables',
    updateSelector: function (oldSelector, clientParams) {
      console.log('searchcalled2',Date.now(),new Date());
      var newSelector = EJSON.clone(oldSelector);
      if (clientParams && clientParams.placementStatus) {
        // Get ids of employees that have placements with status equal to clientParams.placementStatus
        newSelector._id = {$in: Placements.find({candidateStatus: {$in: clientParams.placementStatus}}).map(function(placement){
          return placement.employee;
        })};
      }

      return newSelector;
    }
  }
);


Meteor.publish('auxContactableList', function () {
  var self = this;

  if (this.userId) {
    var currentHier = Utils.getUserHierId(this.userId);

    // Publication Handle
    var handle = Contactables.find({
      $or: Utils.filterByHiers(currentHier)
    }, {
      limit: 50,
      sort: {'dateCreated': -1},
      fields: {
        dateCreated: 1,
        userId: 1,
        hierId: 1,
        placement: 1,
        pictureFileId: 1,
        organization: 1,
        person: 1,
        Customer: 1,
        Employee: 1,
        Contact: 1,
        activeStatus: 1,
        contactMethods: 1,
        location: 1
      }
    });

    Mongo.Collection._publishCursor(handle, self, 'auxContactableList');
  }

  self.ready();
});

Meteor.publish('auxPlacementInfo', function(placementIds) {
  var self = this;
  var handles = { jobs: [], customers: [] };
  var placementHandle = null;

  // Send over the Job and Customer information for a single Placement
  function publishRelations(placement) {
    // Job
    var job = Jobs.findOne({_id: placement.job}, {fields: { customer: 1 }});
    var jobsCursor =  Jobs.find({_id: placement.job}, {fields: { publicJobTitle: 1, customer: 1 }});
    handles.jobs[placement._id] = Mongo.Collection._publishCursor(jobsCursor, self, 'jobs');

    // Customer
    var customerCursor = Contactables.find({_id: job.customer}, {fields: { organization: 1 }});
    handles.customers[placement._id] = Mongo.Collection._publishCursor(customerCursor, self, 'contactables');
  }

  // Publish the placement
  placementHandle = Placements.find({_id: {$in: placementIds}}, { fields: { job: 1 }}).observeChanges({
    added: function(id, doc) {
      publishRelations(doc);
      self.added('placements', id, doc);
    },
    changed: function(id, fields) {
      self.changed('placements', id, fields);
    },
    removed: function(id) {
      // stop observing changes on the jobs and customers for this placement
      handles.jobs[id] && handles.jobs[id].stop();
      handles.customers[id] && handles.customers[id].stop();

      // delete the post
      self.removed('placements', id);
    }
  });

  self.ready();
  self.onStop(function() { placementHandle.stop(); });
});

Meteor.publish('auxContactableListRelations', function (relations) {
  return [
    // Contact customers
    Contactables.find({_id: {$in: relations.customerIds}}, { fields: { person: 1, organization: 1 }}),

    // Notes
    Notes.find({links: {$elemMatch: {id: {$in: relations.contactableIds }}}}, {sort: { dateCreated: -1}})
  ]
});


Meteor.publish('allCustomers', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({ Customer: { $exists: true } }, {
    fields: {
      'organization.organizationName': 1,
      'Customer.department':1,
      houseAccount: 1
    }
  })), sub, 'allCustomers');
  sub.ready();
});
Meteor.publish('allEmployees', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({ Employee: { $exists: true } }, {
    fields: {
      'person.lastName': 1,
      'person.middleName': 1,
      'person.firstName': 1
    }
  })), sub, 'allEmployees');
  sub.ready();
});
Meteor.publish('allContactables', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({},{
    fields: {
      'person.lastName': 1,
      'person.middleName': 1,
      'person.firstName': 1,
      'organization.organizationName': 1,
      'Customer.department':1
    }
  })), sub, 'allContactables');
  sub.ready();
});

Contactables.allow({
  insert: function () {
    return false;
  },
  update: function (userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().currentHierId, doc.hierId) == -1;
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
  if (!doc.activeStatus) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();
  console.log('doc',doc.dateCreated,doc);
  if (doc.organization)
  {
    doc.displayName= doc.organization.organizationName;
  };
  if (doc.person)
  {
    doc.displayName= doc.person.lastName+', ' + doc.person.firstName;
  }

});

// Contactables documents

ContactablesFS = new Document.Collection({
  collection: Contactables
});
ContactablesFS.publish();

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
Contactables._ensureIndex({'dateCreated': 1});
Contactables._ensureIndex({objNameArray: 1});
Contactables._ensureIndex({'Employee.status': 1});
Contactables._ensureIndex({'Customer.status': 1});
Contactables._ensureIndex({'Contact.status': 1});
Contactables._ensureIndex({'activeStatus': 1});
