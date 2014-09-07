var jobActivities=[Enums.activitiesType.placementEdit, Enums.activitiesType.placementAdd,Enums.activitiesType.jobAdd];

  Template.jobActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: jobActivities}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: jobActivities}
      },{sort: {
        'data.dateCreated': -1
      }})
  }
});


var  userName= function(userId){
  var user= Meteor.users.findOne({_id: userId});
  return user && user.username;
};
var employeeName= function(employeeId){
  var emp= Contactables.findOne({_id: employeeId});
  return emp && emp.displayName;
}

Template.jobActivityPlacementsAdd.helpers({
  userName: userName,
  employeeName: employeeName
});

Template.jobActivityPlacementsEdit.helpers({
  userName: userName,
  employeeName: employeeName,
  employeeChanged:function(){
    return this.data.employee != this.data.oldEmployee;
  }
})
Template.jobActivityJobAdd.helpers({
  userName: userName
})
UI.registerHelper('activityType', function(){
  console.log('act type',this.type);
  switch (this.type){
    case Enums.activitiesType.placementEdit:
      return Template.jobActivityPlacementsEdit;
    case Enums.activitiesType.placementAdd:
      return Template.jobActivityPlacementsAdd;
    case Enums.activitiesType.jobAdd:
      return Template.jobActivityJobAdd;
  }

})