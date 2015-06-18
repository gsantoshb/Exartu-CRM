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

  addTask: function (task) {
    // Validations
    if (!task) throw new Error('Task information is required.');
    if (!task.msg) throw new Error('Task message is required.');
    if (!task.begin) throw new Error('Begin date is required.');

    // Validate assigned
    if (task.assign) {
      var contactable = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Meteor.users.find({_id: task.assign})).fetch()[0];
      if (!contactable) throw new Error('Contactable with id ' + task.assign + 'not found');

      // Replace assign value for corresponding assign array
      task.assign = [task.assign];
    }

    // Validate link
    if (task.link) {
      switch (task.link.type) {
        case Enums.linkTypes.contactable:{
          var contactable = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({_id: task.link})).fetch()[0];
          if (!contactable) throw new Error('Contactable with id ' + task.link + 'not found');
          break;
        }
        case Enums.linkTypes.job:{
        var job = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Jobs.find({_id: task.link})).fetch()[0];
        if (!job) throw new Error('Job with id ' + task.link + 'not found');
        break;
        }case Enums.linkTypes.placement:{
        var placement = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Placements.find({_id: task.link})).fetch()[0];
        if (!placement) throw new Error('Placement with id ' + task.link + 'not found');
        }


      }
      // Replace linkv value for corresponding links array
      task.links = [{id: task.link.id, type: task.link.type}];
      delete task.link;
    } else {
      task.links = [];
    }

    return Tasks.insert(task);
  },

  updateTask: function(taskId, taskInfo){
    // Validations
    if (!taskId) throw new Error('Task ID is required.');
    if (!taskInfo) throw new Error('Task information is required.');
    if (!taskInfo.msg) throw new Error('Task message is required.');
    if (!taskInfo.begin) throw new Error('Begin date is required.');

    // Validate task
    var task = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Tasks.find({_id: taskId})).fetch()[0];
    if (!task) throw new Error('Task with id ' + taskId + 'not found');

    // Validate assigned
    if (taskInfo.assign) {
      var contactable = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Meteor.users.find({_id: taskInfo.assign})).fetch()[0];
      if (!contactable) throw new Error('Contactable with id ' + taskInfo.assign + 'not found');

      // Replace assign value for corresponding assign array
      taskInfo.assign = [taskInfo.assign];
    }

    // Validate link
    if (taskInfo.link) {
      switch (taskInfo.link.type) {
        case Enums.linkTypes.contactable:
        {
          var contactable = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({_id: taskInfo.link})).fetch()[0];
          if (!contactable) throw new Error('Contactable with id ' + taskInfo.link + 'not found');
          break;
        }
        case Enums.linkTypes.job:
        {
          var job = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Jobs.find({_id: taskInfo.link})).fetch()[0];
          if (!job) throw new Error('Job with id ' + taskInfo.link + 'not found');
          break;
        }
        case Enums.linkTypes.placement:
        {
          var placement = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Placements.find({_id: taskInfo.link})).fetch()[0];
          if (!placement) throw new Error('Placement with id ' + taskInfo.link + 'not found');
        }


      }
    }


    Tasks.update({_id: taskId}, {
      $set: {
        msg: taskInfo.msg,
        begin: taskInfo.begin,
        end: taskInfo.end,
        assign: taskInfo.assign,
        completed: taskInfo.completed,
        links: taskInfo.links
      }
    });
  },
  archiveTask: function (taskId) {
    // Validations
    if (!taskId) throw new Error('Task ID is required.');

    // Validate task
    var task = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Tasks.find({_id: taskId})).fetch()[0];
    if (!task) throw new Error('Task with id ' + taskId + 'not found');

    Tasks.update({_id: taskId}, {$set: {inactive: true}});
  },
  recoverTask: function (taskId) {
    // Validations
    if (!taskId) throw new Error('Task ID is required.');

    // Validate task
    var task = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Tasks.find({_id: taskId})).fetch()[0];
    if (!task) throw new Error('Task with id ' + taskId + 'not found');

    Tasks.update({_id: taskId}, {$set: {inactive: false}});
  },
  getTaskPreview: function(taskId){
    var task = Tasks.findOne({_id:taskId});
    var linksInfo = [];
    _.forEach(task.links, function(l){
      switch(l.type){
        case Enums.linkTypes.contactable.value:{
          var c = Contactables.findOne({_id: l.id});
          var lInfo = {_id: c._id, displayName: c.displayName, objNameArray: c.objNameArray,type:Enums.linkTypes.contactable.value};
          if(c.contactMethods){
            _.extend(lInfo, {contactMethods: c.contactMethods});
          }
          linksInfo.push(lInfo);
          break;
        }
        case Enums.linkTypes.job.value:{
          var lInfo = Jobs.findOne({_id: l.id},{fields:{_id:1,displayName:1}})
          _.extend(lInfo, {type:Enums.linkTypes.job.value});
          linksInfo.push(lInfo);
          break;
        }
        case Enums.linkTypes.placement.value:{
          var lInfo = Placements.findOne({_id: l.id},{fields:{_id:1,displayName:1}})
          _.extend(lInfo, {type:Enums.linkTypes.placement.value});
          linksInfo.push(lInfo);
          break;
        }
        case Enums.linkTypes.hotList.value:{
          var lInfo = HotLists.findOne({_id: l.id},{fields:{_id:1,displayName:1}})
          _.extend(lInfo, {type:Enums.linkTypes.hotList.value});
          linksInfo.push(lInfo);
        }
      }
    })
    return({_id: task._id, msg: task.msg, dateCreated: task.dateCreated, links: linksInfo});
  }
  //pushTask: function (taskId, days) {
  //  // Validations
  //  if (!taskId) throw new Error('Task ID is required.');
  //  if (!days) throw new Error('Number of days is required.');
  //
  //  // Validate task
  //  var task = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Tasks.find({_id: taskId})).fetch()[0];
  //  if (!task) throw new Error('Task with id ' + taskId + 'not found');
  //
  //  var endDate = new Date(task.end);
  //  endDate.setDate(endDate.getDate()+ days);
  //  Tasks.update({_id: taskId}, {$set: {end: endDate}});
  //}
};
