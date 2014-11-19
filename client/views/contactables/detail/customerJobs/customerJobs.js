
var contactable = null;
var JobHandler;

Template.customerJobs.created = function () {
  if (!SubscriptionHandlers.JobHandler){
    SubscriptionHandlers.JobHandler = Meteor.paginatedSubscribe('jobs', {filter: {customer: Session.get('entityId')}});
  }else{
    SubscriptionHandlers.JobHandler.setFilter({customer: Session.get('entityId')});

  }
  JobHandler = SubscriptionHandlers.JobHandler;
};

Template.customerJobs.helpers({
  isCustomer: function(){
    contactable= Contactables.findOne({_id: Session.get('entityId')});
    return !! contactable.Customer;
  },
  jobs: function(){
    return Jobs.find();
  },
  isNotLast: function(){
    var type = dType.ObjTypes.find({parent: 'job'}).fetch();
    return this._id != type[type.length - 1]._id;
  }
});

Template.customerJobs.events({
  'click .addJob': function(e){
    Session.set('addOptions', { customer: contactable._id });
    Router.go('/jobAdd/Temporary');
    e.preventDefault();
  }
});