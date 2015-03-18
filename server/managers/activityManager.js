ActivityManager = {
  searchActivities: function (searchString, hier) {

    var hierarchiesQuery = { $or: Utils.filterByHiers(hier) };

    var regexObject = {
      $regex: searchString,
      $options: 'i'
    };

    // Contactables
    var contQuery = {$or: []};
    var aux = {};
    _.each(['person.firstName', 'person.lastName', 'person.jobTitle', 'organization.organizationName', 'organization.department'], function (name) {
      aux = {};
      aux[name] = regexObject;
      contQuery.$or.push(aux);
    });
    var contactables = _.pluck(Contactables.find({$and: [hierarchiesQuery, contQuery]}, {fields: {_id: 1}}).fetch(), '_id');

    // Jobs
    var jobQuery = {$or: []};
    _.each(['publicJobTitle'], function (name) {
      aux = {};
      aux[name] = regexObject;
      jobQuery.$or.push(aux);
    });
    var jobs = _.pluck(Jobs.find({$and: [hierarchiesQuery, jobQuery]}, {fields: {_id: 1}}).fetch(), '_id');

    // Tasks
    var taskQuery = {$or: []};
    _.each(['msg'], function (name) {
      aux = {};
      aux[name] = regexObject;
      taskQuery.$or.push(aux);
    });
    var task = _.pluck(Tasks.find({$and: [hierarchiesQuery, taskQuery]}, {fields: {_id: 1}}).fetch(), '_id');

    return contactables.concat(jobs).concat(task);
  }
};