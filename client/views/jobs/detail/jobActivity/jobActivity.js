Template.jobActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: [Enums.activitiesType.placementEdit, Enums.activitiesType.placementAdd]}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: [Enums.activitiesType.placementEdit, Enums.activitiesType.placementAdd]}
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
})
Template.jobActivityPlacementsEdit.helpers({
  userName: userName,
  employeeName: employeeName,
  employeeChanged:function(){
    return this.data.employee != this.data.oldEmployee;
  }
})
UI.registerHelper('activityType', function(){
  switch (this.type){
    case Enums.activitiesType.placementEdit:
      return Template.jobActivityPlacementsEdit;
    case Enums.activitiesType.placementAdd:
      return Template.jobActivityPlacementsAdd;
  }
})