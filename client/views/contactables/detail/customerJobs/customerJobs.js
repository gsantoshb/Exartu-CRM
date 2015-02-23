
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
  },
  isNotLast: function(){
    var type = dType.ObjTypes.find({parent: 'job'}).fetch();
    return this._id != type[type.length - 1]._id;
  }
});

Template.clientJobs.events({
  'click .addJob': function(e){
    Session.set('addOptions', { client: contactable._id });
    Router.go('/jobAdd/Temporary');
    e.preventDefault();
  }
});