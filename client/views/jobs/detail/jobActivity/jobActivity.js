Template.jobActivity.helpers({
  isAny: function(){
    return true
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: [Enums.activitiesType.assignmentEdit, Enums.activitiesType.assignmentAdd]}
      },{sort: {
        'data.createdAt': -1
      }})
  }
});
Template.jobActivityAssignmentAdd.helpers({
  userName: function(userId){
    var user= Meteor.users.findOne({_id: userId});
    return user && user.username;
  },
  employeeName: function(employeeId){
    var emp= Contactables.findOne({_id: employeeId});
    return emp && emp.displayName;
  }
})
UI.registerHelper('activityType', function(){
  switch (this.type){
    case Enums.activitiesType.assignmentEdit:
      return Template.jobActivityAssignmentEdit;
    case Enums.activitiesType.assignmentAdd:
      return Template.jobActivityAssignmentAdd;
  }
})