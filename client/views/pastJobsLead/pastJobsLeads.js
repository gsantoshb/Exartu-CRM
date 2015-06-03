var ActiveFilter;
var InactiveFilter;
var SortStart;

PastJobLeadsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'pastJobLeads',
  action: function(){
    ActiveFilter =  new ReactiveVar(true);
    InactiveFilter = new ReactiveVar(false);
    SortStart = new ReactiveVar(0);
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
    var filter = {$or: [{active: ActiveFilter.get()}, {active: !InactiveFilter.get()}]};
    var options = {};
    if(SortStart.get() != 0) {
      options = {sort:{start:SortStart.get()}};
    }
    if (!SubscriptionHandlers.PastJobsLeadsHandler) {
      SubscriptionHandlers.PastJobsLeadsHandler = Meteor.paginatedSubscribe('pastJobLeads', {filter: filter, options:options});
    }
    else{
      SubscriptionHandlers.PastJobsLeadsHandler.setFilter(filter);
      SubscriptionHandlers.PastJobsLeadsHandler.setOptions(options);
    }
  })
}

Template.pastJobLeads.helpers({
  pastJobs: function(){
    var options = {};
    if(SortStart.get() != 0) {
      options = {sort:{start:SortStart.get()}};
    }
    return PastJobLeads.find({},options).fetch();
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
  },
  isSorting: function(){
    return SortStart.get() != 0;
  },
  sortingIcon: function(){
    if(SortStart.get() === -1){
      return "fa-sort-amount-desc";
    }
    else if(SortStart.get()===1){
      return "fa-sort-amount-asc"
    }
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
  },
  "click .sort-field-start": function(){
    if(SortStart.get() === -1){
      SortStart.set(0);
    }
    else if(SortStart.get()===1){
      SortStart.set(-1);
    }
    else if(SortStart.get()===0){
      SortStart.set(1);
    }
  }
})

