Template.jobActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: [Enums.activitiesType.matchupEdit, Enums.activitiesType.matchupAdd]}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: [Enums.activitiesType.matchupEdit, Enums.activitiesType.matchupAdd]}
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

Template.jobActivityMatchupsAdd.helpers({
  userName: userName,
  employeeName: employeeName
})
Template.jobActivityMatchupsEdit.helpers({
  userName: userName,
  employeeName: employeeName,
  employeeChanged:function(){
    return this.data.employee != this.data.oldEmployee;
  }
})
UI.registerHelper('activityType', function(){
  switch (this.type){
    case Enums.activitiesType.matchupEdit:
      return Template.jobActivityMatchupsEdit;
    case Enums.activitiesType.matchupAdd:
      return Template.jobActivityMatchupsAdd;
  }
})