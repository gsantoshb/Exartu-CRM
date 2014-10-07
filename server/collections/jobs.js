JobView = new View('jobsView', {
  collection: Jobs,
  mapping: {
    customerInfo: {
      find: function(job) {
        return Contactables.find(job.customer,{fields: {
          'organization.organizationName': 1
        }});
      },
      map: function (doc) {
        if (! doc) return null;

        return {
          id: doc._id,
          displayName: doc.organization.organizationName
        };
      }
    }
  }

});

Meteor.paginatedPublish(JobView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;
  var cursor =Utils.filterCollectionByUserHier.call(this, JobView.find());
  //console.log('cursor',cursor);
  return cursor
}, {
  pageSize: 10,
  publicationName: 'jobsView'
});
Jobs.allow({
  update: function () {
    return true;
  }
});

Jobs.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    var user = {}
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

// Indexes

Jobs._ensureIndex({hierId: 1});
Jobs._ensureIndex({objNameArray: 1});
