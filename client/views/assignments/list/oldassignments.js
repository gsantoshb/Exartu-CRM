//AssignmentsController = RouteController.extend({
//  template: 'assignments',
//  layoutTemplate: 'mainLayout',
//  waitOn: function() {
//    return [ Meteor.subscribe('jobs'), Meteor.subscribe('contactables')];
//  },
//  onAfterAction: function() {
//    var title = 'Assignments',
//    description = 'Manage your list here';
//    SEO.set({
//      title: title,
//      meta: {
//        'description': description
//      },
//      og: {
//        'title': title,
//        'description': description
//      }
//    });
//  }
//});
//
//
//Template.tasksBox.created=function(){
//var entityType=null;
//var isEntitySpecific=false;
//Template.tasksBox.created=function(){
//    entityType=Utils.getEntityTypeFromRouter();
//    isEntitySpecific=false;
//    if (entityType!=null) isEntitySpecific=true
//}
//
//
//var generateFieldsSearch = function(fields) {
//  var searchStringQuery = [];
//  _.each(fields, function (field) {
//    var aux = {};
//    aux[field] = {
//        $regex: searchString,
//        $options: 'i'
//    };
//    searchStringQuery.push(aux);
//  });
//  return searchStringQuery;
//}
//
//var searchString, searchDep = new Deps.Dependency;
//Template.assignments.assignments = function() {
//  searchDep.depend();
//  searchQuery = {};
//
//  if (!_.isEmpty(searchString)) {
//    searchQuery.$or = generateFieldsSearch(['content']);
//    var employeeIds = Contactables.find({
//      $or: generateFieldsSearch(['person.firstName', 'person.lastName']),
//      objNameArray: 'Employee'
//    }).fetch();
//    if (employeeIds.length > 0)
//      searchQuery.$or.push({
//        employee: {
//          $in: _.map(employeeIds, function(employee) { return employee._id })
//        }
//      })
//
//    var jobIds = Jobs.find({
//      $or: generateFieldsSearch(['publicJobTitle'])
//    }).fetch();
//    if (jobIds.length > 0)
//      searchQuery.$or.push({
//        job: {
//          $in: _.map(jobIds, function(job) { return job._id })
//        }
//      });
//  };
//
//  return Assignments.find(searchQuery, {
//      transform: function(assignment) {
//        assignment.job = Jobs.findOne(assignment.job);
//        assignment.employee = Contactables.findOne(assignment.employee);
//
//        return assignment;
//      }
//    }
//  );
//};
//
//Template.assignments.getCount = function(assignments) {
//  return assignments.count();
//}
//
//Template.assignments.events = {
//  'keyup #search-string': function(e) {
//    searchString = e.currentTarget.value;
//    searchDep.changed();
//  }
//};