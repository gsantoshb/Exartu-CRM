var contactableActivities = [
  Enums.activitiesType.contactableAdd,
  Enums.activitiesType.taskAdd,
  Enums.activitiesType.placementEdit,
  Enums.activitiesType.placementAdd,
  Enums.activitiesType.jobAdd,
  Enums.activitiesType.noteAdd,
  Enums.activitiesType.contactableUpdate,
  Enums.activitiesType.fileAdd
];

var ActivitiesHandler;

Template.contactableActivities.helpers({
  created: function () {
    var query = {
      $or: [
        {
          entityId: Session.get('entityId') // backward compatibility
        }, {
          links: Session.get('entityId')
        }
      ],
      type: {$in: contactableActivities}
    };

    if (! SubscriptionHandlers.ActivitiesHandler)
      SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: query});
    else
      ActivitiesHandler.setFilter(query);
  },
  activities: function(){
    return Activities.find({}, {
      sort: {
        'data.dateCreated': -1
      }
    });
  }
});

var userName= function(userId){
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

Template.registerHelper('contactableActivityType', function(){
  switch (this.type){
    case Enums.activitiesType.placementEdit:
      return Template.jobActivityPlacementsEdit;
    case Enums.activitiesType.placementAdd:
      return Template.newPlacementActivity;
    case Enums.activitiesType.contactableAdd:
      return Template.newContactableActivity;
    case Enums.activitiesType.jobAdd:
      return Template.newJobActivity;
    case Enums.activitiesType.taskAdd:
      return Template.newTaskActivity;
    case Enums.activitiesType.noteAdd:
      return Template.newNoteActivity;
    case Enums.activitiesType.contactableUpdate:
      return Template.contactableUpdateActivity;
    case Enums.activitiesType.fileAdd:
      return Template.newFileActivity;
  }
});