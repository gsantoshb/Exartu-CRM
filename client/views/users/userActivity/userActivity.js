
UserActivityController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    Session.set('activeTab', this.params.hash);
    this.render('userActivity')
  }
});
var userActivities=[Enums.activitiesType.userLogin];

  Template.userActivity.helpers({
  activities: function(){
      return Activities.find({
        $or:[
          {
            entityId: Session.get('entityId')
          }],
        type: {$in: userActivities}
      },{sort: {
        'data.dateCreated': -1
      }})
  }
});


UI.registerHelper('userName',function(userId){
  var user= Meteor.users.findOne({_id: userId});
  return user && user.username;
});


UI.registerHelper('activityType', function(){
  switch (this.type){
    case Enums.activitiesType.userLogin:
      return Template.jobActivityPlacementsEdit;
  }

});