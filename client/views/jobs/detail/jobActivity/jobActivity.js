var jobActivities=[Enums.activitiesType.placementEdit, Enums.activitiesType.placementAdd,
  Enums.activitiesType.jobAdd, Enums.activitiesType.placementAdd, Enums.activitiesType.candidateAdd];

  Template.jobActivity.helpers({
  activities: function(){
      return Activities.find({
        $or:[
          {
            'data.job': Session.get('entityId')
          },{
            entityId: Session.get('entityId')
          }],
        type: {$in: jobActivities}
      },{sort: {
        'data.dateCreated': -1
      }})
  }
});


UI.registerHelper('userName',function(userId){
  var user= Meteor.users.findOne({_id: userId});
  return user && user.username;
});
UI.registerHelper('employeeName',function(employeeId){
  var emp= Contactables.findOne({_id: employeeId});
  return emp && emp.displayName;
});

Template.jobActivityPlacementsEdit.helpers({
  employeeChanged:function(){
    return this.data.employee != this.data.oldEmployee;
  }
});
UI.registerHelper('jobActivityType', function(){
  switch (this.type){
    case Enums.activitiesType.placementEdit:
      return Template.jobActivityPlacementsEdit;
    case Enums.activitiesType.placementAdd:
      return Template.jobActivityPlacementsAdd;
    case Enums.activitiesType.jobAdd:
      return Template.jobActivityJobAdd;
    case Enums.activitiesType.placementAdd:
      return Template.jobActivityAssignmentAdd;
    case Enums.activitiesType.candidateAdd:
      return Template.jobActivityCandidateAdd;
  }

});