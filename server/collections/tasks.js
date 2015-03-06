TaskView = new View('tasks', {
    collection: Tasks,
    cursors: function (task) {

        // Contactables
        this.publish({
            cursor: function (task) {
                var contactablesIds = _.pluck(_.where(task.links, {type: Enums.linkTypes.contactable.value}), 'id');
                return Contactables.find({_id: {$in: contactablesIds}});
            },
            to: 'contactables',
            observedProperties: ['links'],
            onChange: function (changedProps, oldSelector) {
                var contactablesIds = _.pluck(_.where(changedProps.links, {type: Enums.linkTypes.contactable.value}), 'id');
                return Contactables.find({_id: {$in: contactablesIds}});
            }
        });

        // Jobs
        this.publish({
            cursor: function (task) {
                var jobsIds = _.pluck(_.where(task.links, {type: Enums.linkTypes.job.value}), 'id');
                return Jobs.find({_id: {$in: jobsIds}});
            },
            to: 'jobs',
            observedProperties: ['links'],
            onChange: function (changedProps, oldSelector) {
                var jobsIds = _.pluck(_.where(changedProps.links, {type: Enums.linkTypes.job.value}), 'id');
                return Jobs.find({_id: {$in: jobsIds}});
            }
        });


        // Placements
        this.publish({
            cursor: function (task) {
                var hotListsIds = _.pluck(_.filter(task.links, function (link) {
                    return link.type == Enums.linkTypes.hotList.value;
                }), 'id');
                return Placements.find({_id: {$in: hotListsIds}});
            },
            to: 'placements',
            observedProperties: ['links'],
            onChange: function (changedProps, oldSelector) {
                var hotListsIds = _.pluck(_.filter(changedProps.links, function (link) {
                    return link.type == Enums.linkTypes.hotList.value;
                }), 'id');
                return Placements.find({_id: {$in: hotListsIds}});
            }
        });
        // HotLists
        this.publish({
            cursor: function (task) {
                var hotListsIds = _.pluck(_.filter(task.links, function (link) {
                    return link.type == Enums.linkTypes.hotList.value;
                }), 'id');
                return HotLists.find({_id: {$in: hotListsIds}});
            },
            to: 'hotLists',
            observedProperties: ['links'],
            onChange: function (changedProps, oldSelector) {
                var hotListsIds = _.pluck(_.filter(changedProps.links, function (link) {
                    return link.type == Enums.linkTypes.hotList.value;
                }), 'id');
                return HotLists.find({_id: {$in: hotListsIds}});
            }
        });


    }
});

Meteor.paginatedPublish(TaskView, function () {
    return Utils.filterCollectionByUserHier.call(this, TaskView.find({}, { sort: { dateCreated: -1 } }));
}, {
    pageSize: 50,
    publicationName: 'tasks'
});

Meteor.publish("tasks2",  function (start, end, mineOnly) {


  if(mineOnly) {
    console.log("mineOnly", this.userId);
    var prueba = Tasks.find({$and: [{userId: this.userId}, {$and: [{end: {$gte: start}}, {begin: {$lte: end}}]}, {inactive: {$ne: true}}]});
  }
  else{
    console.log("Todos");
    var prueba = Utils.filterCollectionByUserHier.call({userId: this.userId}, Tasks.find({$and: [{$and: [{end: {$gte: start}}, {begin: {$lte: end}}]}, {inactive: {$ne: true}}]}))

  }
    return prueba;
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
    doc.dateCreated = doc.dateCreated || Date.now();
    doc.task = true
});

// Indexes

Tasks._ensureIndex({hierId: 1});
Tasks._ensureIndex({assign: 1});
Tasks._ensureIndex({userId: 1});
Tasks._ensureIndex({"links.id": 1});
Tasks._ensureIndex({"dateCreated": 1});