//NoteView = new View('notes', {
//  collection: Notes,
//  cursors: function (note) {
//
//    // Contactables
//    this.publish({
//      cursor: function (note) {
//        var contactablesIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.contactable.value }), 'id');
//        return Contactables.find({ _id: { $in: contactablesIds } });
//      },
//      to: 'contactables',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var contactablesIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.contactable.value }), 'id');
//        return Contactables.find({ _id: { $in: contactablesIds } });
//      }
//    });
//
//    // Jobs
//    this.publish({
//      cursor: function (note) {
//        var jobsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.job.value }), 'id');
//        return Jobs.find({ _id: { $in: jobsIds } });
//      },
//      to: 'jobs',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var jobsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.job.value }), 'id');
//        return Jobs.find({ _id: { $in: jobsIds } });
//      }
//    });
//
//    // Deals
//    //this.publish({
//    //  cursor: function (note) {
//    //    var dealsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.deal.value }), 'id');
//    //    return Deals.find({ _id: { $in: dealsIds } });
//    //  },
//    //  to: 'jobs',
//    //  observedProperties: ['links'],
//    //  onChange: function (changedProps, oldSelector) {
//    //    var dealsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.deal.value }), 'id');
//    //    return Deals.find({ _id: { $in: dealsIds } });
//    //  }
//    //});
//
//      // Placements
//      this.publish({
//          cursor: function (note) {
//              var placementsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.placement.value}), 'id');
//              return PlacementView.find({ _id: { $in: placementsIds } });
//          },
//          to: 'placements',
//          observedProperties: ['links'],
//          onChange: function (changedProps, oldSelector) {
//              var placementsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
//              return PlacementView.find({ _id: { $in: placementsIds } });
//          }
//      });
//    // HotLists
//    this.publish({
//      cursor: function (note) {
//        var hotListsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
//        return HotLists.find({ _id: { $in: hotListsIds } });
//      },
//      to: 'hotLists',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var hotListsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
//        return HotLists.find({ _id: { $in: hotListsIds } });
//      }
//    });
//  }
//});
//
//NoteListView = new View('noteList', {
//  collection: Notes,
//  cursors: function (note) {
//
//    // Contactables
//    this.publish({
//      cursor: function (note) {
//        var contactablesIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.contactable.value }), 'id');
//        return Contactables.find({ _id: { $in: contactablesIds } });
//      },
//      to: 'contactables',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var contactablesIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.contactable.value }), 'id');
//        return Contactables.find({ _id: { $in: contactablesIds } });
//      }
//    });
//
//    // Jobs
//    this.publish({
//      cursor: function (note) {
//        var jobsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.job.value }), 'id');
//        return Jobs.find({ _id: { $in: jobsIds } });
//      },
//      to: 'jobs',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var jobsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.job.value }), 'id');
//        return Jobs.find({ _id: { $in: jobsIds } });
//      }
//    });
//
//    // Deals
//    this.publish({
//      cursor: function (note) {
//        var dealsIds = _.pluck(_.where(note.links, { type: Enums.linkTypes.deal.value }), 'id');
//        return Deals.find({ _id: { $in: dealsIds } });
//      },
//      to: 'jobs',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var dealsIds = _.pluck(_.where(changedProps.links, { type: Enums.linkTypes.deal.value }), 'id');
//        return Deals.find({ _id: { $in: dealsIds } });
//      }
//    });
//
//    // Placements
//    this.publish({
//      cursor: function (note) {
//        var placementsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.placement.value}), 'id');
//        return PlacementView.find({ _id: { $in: placementsIds } });
//      },
//      to: 'placements',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var placementsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.placement.value || link.type == Enums.linkTypes.candidate.value; }), 'id');
//        return PlacementView.find({ _id: { $in: placementsIds } });
//      }
//    });
//    // HotLists
//    this.publish({
//      cursor: function (note) {
//        var hotListsIds = _.pluck(_.filter(note.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
//        return HotLists.find({ _id: { $in: hotListsIds } });
//      },
//      to: 'hotLists',
//      observedProperties: ['links'],
//      onChange: function (changedProps, oldSelector) {
//        var hotListsIds = _.pluck(_.filter(changedProps.links, function (link) { return link.type == Enums.linkTypes.hotList.value ; }), 'id');
//        return HotLists.find({ _id: { $in: hotListsIds } });
//      }
//    });
//  }
//});
//
//Meteor.paginatedPublish(NoteView, function () {
//  return Utils.filterCollectionByUserHier.call(this, NoteView.find({}, { sort: { dateCreated: -1 } }));
//},{
//  pageSize: 10,
//  publishName: 'notes'
//  //updateSelector: function (oldSelector, clientParams) {
//  //  var newSelector = EJSON.clone(oldSelector);
//  //  delete newSelector['links.id'];
//  //  if (clientParams && clientParams.hotlist) {
//  //    var hotlistMembers = clientParams.hotlist.members;
//  //    var validMembers = [];
//  //    _.forEach(hotlistMembers, function(m){
//  //      var result = HotLists.findOne({_id:{$ne: clientParams.hotlist._id},dateCreated:{$gte:  clientParams.hotlist.dateCreated}, members:{$in: [m]}  })
//  //      if(!result){
//  //        validMembers.push(m);
//  //      }
//  //    })
//  //    newSelector['links.id']= {
//  //        $in: validMembers
//  //    }
//  //    };
//  //   return newSelector;
//  //}
//
//});
//
//Meteor.paginatedPublish(NoteListView, function () {
//  //var self = this;
//  return Utils.filterCollectionByUserHier.call(this, NoteListView.find({}, { sort: { dateCreated: -1 } }));
//
//
//  //Mongo.Collection._publishCursor(cursor, self, 'noteList');
//  //self.ready();
//},{
//  pageSize: 50,
//  publishName: 'noteList'
//});
//
//Notes.allow({
//  insert: function () {
//    return true;
//  },
//  update: function () {
//    return true;
//  },
//  remove: function () {
//    return true;
//  }
//});


Meteor.publish('editNote', function(id) {
  var self = this;
  var notesCursor = Utils.filterCollectionByUserHier.call({userId: this.userId}, Notes.find({_id:id}));
  Mongo.Collection._publishCursor(notesCursor, self, 'editNote');
// _publishCursor doesn't call this for us in case we do this more than once.
  self.ready();
});


Meteor.publish(null, function () {
  var self = this;
  if (!self.userId){
    self.ready();
  } else {
    var connectedAt = new Date().getTime();
    Utils.filterCollectionByUserHier2(self.userId, Notes.find({isReply: true, dateCreated: {$gt: connectedAt}})).observeChanges({
      added: function (id, fields) {
        var link = _.findWhere(fields.links, {type: Enums.linkTypes.contactable.value});
        if (link){
          var contactable = Contactables.findOne(link.id);
          if (contactable){
            fields.contactableName = contactable.person.lastName + ', ' + contactable.person.firstName + (contactable.person.middleName ? ' ' + contactable.person.middleName: '');
          }
        }
        self.added('smsReceived', id, fields)
      }
    });
    self.ready();
  }
});

Meteor.publish('calendarNotes', function(start, end, mineOnly) {
  var self = this;
  var noteCursor;
  //var Auxend = new Date(end.setDate(end.getDate()+1));
  if(mineOnly) {
    noteCursor = Notes.find({$and: [{userId: this.userId}, {$and: [{remindDate:{$exists:true}},{remindDate: {$gte: start}}, {remindDate: {$lte: end}}]}, {inactive: {$ne: true}}]});
  }
  else{
    noteCursor = Utils.filterCollectionByUserHier.call({userId: this.userId}, Notes.find({$and: [{$and: [{remindDate:{$exists:true}},{remindDate: {$gte: start}}, {remindDate: {$lte: end}}]}, {inactive: {$ne: true}}]}))

  }
  Mongo.Collection._publishCursor(noteCursor, self, 'calendarNotes');
// _publishCursor doesn't call this for us in case we do this more than once.
  self.ready();
});


// Indexes
Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links.id":1});
Notes._ensureIndex({"dateCreated":1});

