TaskManager = {
    apiAddTask: function (task) {
        // Validation
        if (!task.msg) {
            throw new Error('Message is required');
        }
        if (!task.link) {
            throw new Error('Link is required');
        }

        var contactable = Contactables.findOne(task.link);
        if (!contactable)
            throw new Error('Contactable with id ' + task.link + 'not found');

        // Replace link for corresponding links
        task.links = [{id: task.link, type: Enums.linkTypes.contactable.value}];
        delete task.link;

        return Tasks.insert(task);
    },

    apiGetTasks: function (entityId) {
        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()},
            Tasks.find({'links.id': entityId}, {sort: {'dateCreated': -1}})).fetch();
    },
    apiGetTasksBetween: function (start, end) {

        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Tasks.find({assign: Meteor.userId(),$and: [{$or: [{end: {$gte: start}}, {begin: {$lte: end}}]}, {inactive: {$ne: true}}]})).fetch();
    },
    updateTask: function(task){
      Tasks.update({
        _id: task._id
      }, {
        $set: {
          begin: task.begin ? new Date(task.begin): task.begin,
          end: task.end ? new Date(task.end): task.end,
          assign: task.assign,
          msg: task.msg,
          completed: task.completed,
          links: task.links,
          inactive: task.inactive
        }
      });
    }
};

