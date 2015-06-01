var ActiveFilter;
var InactiveFilter;

PastJobLeadsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'pastJobLeads',
  action: function(){
    ActiveFilter =  new ReactiveVar(true);
    InactiveFilter = new ReactiveVar(false);
    //readUrl
    var params = this.params.query;
    if(params && (params.activeFilter==="true")){
      ActiveFilter.set(true);
    }
    else if(params && (params.activeFilter==="false")){
      ActiveFilter.set(false);
    }
    if(params && (params.inactiveFilter==="true")){
      InactiveFilter.set(true);
    }
    else if(params && (params.inactiveFilter==="false")){
      InactiveFilter.set(false);
    }
    this.render('pastJobLeads');
  }
});

Template.pastJobLeads.created = function(){
  Meteor.autorun(function(){
    if (!SubscriptionHandlers.PastJobsLeadsHandler) {
      SubscriptionHandlers.PastJobsLeadsHandler = Meteor.paginatedSubscribe('pastJobLeads', {filter: {$or: [{active: ActiveFilter.get()}, {active: !InactiveFilter.get()}]}});
    }
    else{
      SubscriptionHandlers.PastJobsLeadsHandler.setFilter( {$or: [{active: ActiveFilter.get()}, {active: !InactiveFilter.get()}]});
    }
  })
}

Template.pastJobLeads.helpers({
  pastJobs: function(){
    return PastJobLeads.find().fetch();
  },
  editingComent: function(){
    return editingComent.get();
  },
  pastJobsCount: function(){
    return SubscriptionHandlers.PastJobsLeadsHandler.totalCount();
  },
  Active: function(){
    return ActiveFilter.get() ? "btn-primary" : "btn-default";
  },
  Inactive: function(){
    return InactiveFilter.get() ? "btn-primary" : "btn-default";
  }
})

var updateUrl = function(){
  //set url
  var url = new URLQuery();
  if(ActiveFilter.get()===false){
    url.addParam("activeFilter",false);
  }
  if(InactiveFilter.get()===true){
    url.addParam("inactiveFilter",true);
  }
  url.apply();
}

Template.pastJobLeads.events({
  "click #Active-button": function(){
    ActiveFilter.set(!ActiveFilter.get());
    updateUrl();
  },
  "click #Inactive-button": function(){
    InactiveFilter.set(!InactiveFilter.get());
    updateUrl();
  }
})

