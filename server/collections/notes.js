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
              var placementsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.placement.value}), 'id');
              return PlacementView.find({ _id: { $in: placementsIds } });
          },
          to: 'placements',
          observedProperties: ['links'],
          onChange: function (changedProps, oldSelector) {
              var placementsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
              return PlacementView.find({ _id: { $in: placementsIds } });
          }
      });
    // HotLists
    this.publish({
      cursor: function (note) {
        var hotListsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
        return HotListView.find({ _id: { $in: hotListsIds } });
      },
      to: 'hotLists',
      observedProperties: ['links'],
      onChange: function (changedProps, oldSelector) {
        var hotListsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
        return HotListView.find({ _id: { $in: hotListsIds } });
      }
    });
  }
});

Meteor.paginatedPublish(NoteView, function () {
  return Utils.filterCollectionByUserHier.call(this, NoteView.find({}, { sort: { dateCreated: -1 } }));
},{
  pageSize: 50,
  publishName: 'notes'
});

Notes.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});
Notes.after.insert(function(userId,doc){
    if (!doc.links) return;
    _.forEach(doc.links, function(link) {
        if (link.type==Enums.linkTypes.contactable.value)
        {
            Contactables.update({_id:link.id},{$set: {lastNote: doc}});
        }
    });

});
Notes.before.insert(function(userId, doc){
  doc.dateCreated = doc.dateCreated || Date.now();
  if (doc.hierId)
    return doc; // It was created by the system, e.g.: from a SMS sent by a contactable

  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;

  return doc;
});

Meteor.publish('editNote', function(id) {
  var self = this;
  var notesCursor = Utils.filterCollectionByUserHier.call({userId: this.userId}, Notes.find({_id:id}));
  Mongo.Collection._publishCursor(notesCursor, self, 'editNote');
// _publishCursor doesn't call this for us in case we do this more than once.
  self.ready();
});
// Indexes

Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links.id":1});
Notes._ensureIndex({"dateCreated":1});

