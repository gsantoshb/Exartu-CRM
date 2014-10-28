TaskView = new View('tasks', {
  collection: Tasks,
  cursors: function (task) {

    // Contactables
    this.publish({
      cursor: function (task) {
        var contactablesIds = _.pluck(_.where(task.links, { type: Enums.linkTypes.contactable.value }), 'id');
        return Contactables.find({ _id: { $in: contactablesIds } });
      },
      to: 'contactables',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var contactablesIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.contactable.value }), 'id');
        return Contactables.find({ _id: { $in: contactablesIds } });
      }
    });

    // Jobs
    this.publish({
      cursor: function (task) {
        var jobsIds = _.pluck(_.where(task.links, { type: Enums.linkTypes.job.value }), 'id');
        return Jobs.find({ _id: { $in: jobsIds } });
      },
      to: 'jobs',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var jobsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.job.value }), 'id');
        return Jobs.find({ _id: { $in: jobsIds } });
      }
    });

    // Deals
    this.publish({
      cursor: function (task) {
        var dealsIds = _.pluck(_.where(task.links, { type: Enums.linkTypes.deal.value }), 'id');
        return Deals.find({ _id: { $in: dealsIds } });
      },
      to: 'jobs',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var dealsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.deal.value }), 'id');
        return Deals.find({ _id: { $in: dealsIds } });
      }
    });

    // Placements
    this.publish({
      cursor: function (task) {
        var placementsIds = _.pluck(_.filter(task.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
        return Placements.find({ _id: { $in: placementsIds } });
      },
      to: 'jobs',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var placementsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
        return Placements.find({ _id: { $in: placementsIds } });
      }
    });
  }
});

Meteor.paginatedPublish(TaskView, function () {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (!user)
    return false;

  return Utils.filterCollectionByUserHier.call(this, TaskView.find({}, { sort: { dateCreated: -1 } }));
},{
  pageSize: 5,
  publicationName: 'tasks'
});

Tasks.allow({
  update: function () {
    return true;
  },
  insert: function () {
    return true;
  }
});

Tasks.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
});

// Indexes

Tasks._ensureIndex({hierId: 1});
Tasks._ensureIndex({assign: 1});
Tasks._ensureIndex({userId: 1});