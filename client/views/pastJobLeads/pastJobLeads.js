var ActiveFilter;
var InactiveFilter;
var sortStart;
var searchFilter;
var searchQuery = {};


PastJobLeadsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'pastJobLeads',
  action: function(){
    ActiveFilter =  new ReactiveVar(true);
    InactiveFilter = new ReactiveVar(false);
    sortDateCreated = new ReactiveVar(0);
    searchFilter = new ReactiveVar("");
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
console.log("35 pastjobleads");
      searchQuery.$or = [
        {'employeeName': {$regex: searchFilter.get(), $options: 'i'}},
        {'supervisor': {$regex: searchFilter.get(), $options: 'i'}},
        {'position': {$regex: searchFilter.get(), $options: 'i'}},
        {'company': {$regex: searchFilter.get(), $options: 'i'}}
      ];
    var filter = {$and:[{$or: [{active: ActiveFilter.get()}, {active: !InactiveFilter.get()}]}, searchQuery]};
    var options = {};
    if(sortDateCreated.get() != 0) {
      options = {sort:{start:sortDateCreated.get()}};
    }
    if (!SubscriptionHandlers.PastJobsLeadsHandler) {
      SubscriptionHandlers.PastJobsLeadsHandler = Meteor.paginatedSubscribe('pastJobLeads', {filter: EJSON.clone(filter), options:options});
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
    if(sortDateCreated.get() != 0) {
      options = {sort:{start:sortDateCreated.get()}};
    }
    return PastJobLeads.find({},options);
  },
  editingComment: function(){
    return editingComment.get();
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
    return sortDateCreated.get() != 0;
  },
  sortingIcon: function(){
    if(sortDateCreated.get() === -1){
      return "fa-sort-amount-desc";
    }
    else if(sortDateCreated.get()===1){
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
  "click .sort-field-dateCreated": function(){
    if(sortDateCreated.get() === -1){
      sortDateCreated.set(0);
    }
    else if(sortDateCreated.get()===1){
      sortDateCreated.set(-1);
    }
    else if(sortDateCreated.get()===0){
      sortDateCreated.set(1);
    }
  },
  "keyup #searchString": function(e){
    searchFilter.set(e.target.value);
  }
})

