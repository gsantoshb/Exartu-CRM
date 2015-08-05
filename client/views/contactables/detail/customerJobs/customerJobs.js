
var contactable = null;
var JobHandler;

Template.clientJobs.created = function () {
  if (!SubscriptionHandlers.JobHandler){
    SubscriptionHandlers.JobHandler = Meteor.paginatedSubscribe('jobs', {filter: {client: Session.get('entityId')}});
  }else{
    SubscriptionHandlers.JobHandler.setFilter({client: Session.get('entityId')});

  }
  JobHandler = SubscriptionHandlers.JobHandler;
};

Template.clientJobs.helpers({
  isClient: function(){
    contactable= Contactables.findOne({_id: Session.get('entityId')});
    return !! contactable.Client;
  },
  jobs: function(){
    return Jobs.find();
  }
});

Template.clientJobs.events({
  'click .addJob': function(e){
    Session.set('addOptions', { client: contactable._id });
      console.log('set add aoptions',contactable);
    Router.go('/jobAdd/Temporary');
    e.preventDefault();
  }
});