var contactable = null;

Template.customerJobs.created = function () {
  if (!window.JobHandler){
    JobHandler = Meteor.paginatedSubscribe('jobs');
  }
  JobHandler.setFilter({customer: Session.get('entityId')});
};

Template.customerJobs.helpers({
  isCustomer: function(){
    contactable= Contactables.findOne({_id: Session.get('entityId')});
    return !! contactable.Customer;
  },
  jobs: function(){
    return Jobs.find();
  },
  jobTypes: function(){
    return dType.ObjTypes.find({parent: 'job'})
  },
  isNotLast: function(){
    var type = dType.ObjTypes.find({parent: 'job'}).fetch();
    return this._id != type[type.length - 1]._id;
  }
});

Template.customerJobs.events({
  'click .addJob': function(e){
    Session.set('addOptions', {customer: contactable._id});
    Router.go('/jobAdd/' + this.name);
    e.preventDefault();
  }
});