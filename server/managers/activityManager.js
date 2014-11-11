ActivityManager = {
  searchActivities: function (searchString) {
    var userHiers = Utils.getUserHierId(Meteor.userId());

    var hierarchiesQuery = {
      $or: Utils.filterByHiers(userHiers)
    };

    var regexObject = {
      $regex: searchString,
      $options : 'i'
    };

    // Contactables
    var contQuery = { $or: [] };
    var aux = {};
    _.each(['person.firstName', 'person.lastName', 'person.jobTitle', 'organization.organizationName', 'organization.department'],function(name){
      aux = {};
      aux[name]=regexObject;
      contQuery.$or.push(aux);
    });
    var contactables = _.map(Contactables.find({$and: [hierarchiesQuery, contQuery]}).fetch(), function(doc){ return doc._id});

    // Jobs
    var jobQuery={ $or: [] };
    _.each(['publicJobTitle'],function(name){
      aux = {};
      aux[name]=regexObject;
      jobQuery.$or.push(aux);
    });
    var jobs = _.map(Jobs.find({$and: [hierarchiesQuery, jobQuery]}).fetch(), function(doc){ return doc._id});

    // Tasks
    var taskQuery={ $or: [] };
    _.each(['msg'],function(name){
      aux = {};
      aux[name]=regexObject;
      taskQuery.$or.push(aux);
    });
    var task = _.map(Tasks.find({$and: [hierarchiesQuery, taskQuery]}).fetch(), function(doc){ return doc._id});

    return contactables.concat(jobs).concat(task);
  }
};