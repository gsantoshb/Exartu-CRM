
var contactableActivities=[Enums.activitiesType.contactableAdd,Enums.activitiesType.placementEdit, Enums.activitiesType.placementAdd,Enums.activitiesType.jobAdd];

  Template.contactableActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: contactableActivities}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: contactableActivities}
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
};

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
});
Template.jobActivityJobAdd.helpers({
  userName: userName
});

UI.registerHelper('contactableActivityType', function(){
  console.log('act type',this,this.type);
  switch (this.type){

    case Enums.activitiesType.placementEdit:
      return Template.jobActivityPlacementsEdit;
    case Enums.activitiesType.placementAdd:
      return Template.jobActivityPlacementsAdd;
    case Enums.activitiesType.jobAdd:
      return Template.jobActivityJobAdd;
    case Enums.activitiesType.contactableAdd:
      return Template.newContactableActivity;
    case Enums.activitiesType.jobAdd:
      return Template.newJobActivity;
    case Enums.activitiesType.taskAdd:
      return Template.newTaskActivity;
    }
});