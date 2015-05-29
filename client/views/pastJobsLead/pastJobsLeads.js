PastJobLeadsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'pastJobLeads'
});


var editingComent = new ReactiveVar(false);
Template.pastJobLeads.created = function(){
  if(!SubscriptionHandlers.PastJobsLeadsHandler){
     SubscriptionHandlers.PastJobsLeadsHandler = Meteor.paginatedSubscribe('pastJobLeads', {});
  }
}


Template.pastJobLeads.helpers({
  pastJobs: function(){
    return PastJobLeads.find().fetch();
  },
  editingComent: function(){
    return editingComent.get();
  }
})

Template.pastJobLeads.events({
  "change #active": function(e){
     Meteor.call('setActive', e.target.value, e.target.checked, function(err, r){
       debugger;
     });
  },
  "click #editing-active": function(e){
    editingComent.set(!editingComent.get())
  },
  "click #save-comment": function(e){
    Meteor.call('setComment', e.target.value,$("#comment")[0].value, function(){
      editingComent.set(!editingComent.get());
    });
  }
})