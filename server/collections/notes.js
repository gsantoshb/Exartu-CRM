NoteView = new View('notes', {
  collection: Notes,
  cursors: function (note) {

    // Contactables
    this.publish({
      cursor: function (note) {
        var contactablesIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.contactable.value }), 'id');
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
      cursor: function (note) {
        var jobsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.job.value }), 'id');
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
      cursor: function (note) {
        var dealsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.deal.value }), 'id');
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
      cursor: function (note) {
        var placementsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
        return PlacementView.find({ _id: { $in: placementsIds } });
      },
      to: 'placements',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var placementsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
        return PlacementView.find({ _id: { $in: placementsIds } });
      }
    });
  }
});

Meteor.paginatedPublish(NoteView, function () {
  return Utils.filterCollectionByUserHier.call(this, NoteView.find({}, { sort: { dateCreated: -1 } }));
},{
  pageSize: 15,
  publishName: 'notes'
});

Notes.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true; // TODO: Only allow to edit if note belongs to user's hierarchy
  },
  remove: function () {
    return true; // TODO: Only allow to edit if note belongs to user's hierarchy
  }
});

Notes.before.insert(function(userId, doc){
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
  return doc;
});

// Indexes

Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({assign: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links._id":1});