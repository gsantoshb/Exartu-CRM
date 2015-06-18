
JobsView = new Mongo.Collection("jobsView");

Meteor.paginatedPublish(JobsView, function () {
  if (!this.userId) return [];

  return Utils.filterCollectionByUserHier.call(this, JobsView.find({}, {sort: {dateCreated: -1}}));
}, {
  pageSize: 20,
  publicationName: 'jobsView'
});


// Indexes
JobsView._ensureIndex({jobId: 1});
JobsView._ensureIndex({hierId: 1});
JobsView._ensureIndex({userId: 1});
JobsView._ensureIndex({clientId: 1});
JobsView._ensureIndex({dateCreated: 1});
