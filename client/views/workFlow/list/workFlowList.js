var reactFinished = new ReactiveVar(true);
var reactInProgress = new ReactiveVar(true);
var reactCanceled = new ReactiveVar(true);
var reactJobOffer = new ReactiveVar(true);
var reactCreatedBy = new ReactiveVar("");
var reactPlacementConfirm = new ReactiveVar(true);

WorkFlowsController = RouteController.extend({
  data: function(){
  },
  waitOn: function () {
  },
  action: function () {
    this.render('workFlowList');
    if(this.params.query.jobOfferStatus === "false"){
      reactJobOffer.set(false);
    }
    if(this.params.query.placementConfirmStatus === "false"){
      reactPlacementConfirm.set(false);
    }
    if(this.params.query.finished === "false"){
      reactFinished.set(false);
    }
    if(this.params.query.inProgress === "false"){
      reactInProgress.set(false);
    }
    if(this.params.query.canceled === "false"){
      reactCanceled.set(false);
    }
    if(this.params.query.createdBy != ""){
      reactCreatedBy.set(this.params.query.createdBy);
    }
  },
  onAfterAction: function() {
  }
});

var entityId;
var entityType;

var reload = function(){
 var aux = {}
 if(!reactJobOffer.get()){
   aux.jobOfferStatus = "false"
 }
 if(!reactPlacementConfirm.get()){
   aux.placementConfirmStatus = "false"
 }
 if(!reactFinished.get()){
   aux.finished = "false"
 }
 if(!reactInProgress.get()){
   aux.inProgress = "false"
 }
 if(!reactCanceled.get()){
   aux.canceled = "false"
 }
 if(reactCreatedBy.get() != ""){
   aux.createdBy = reactCreatedBy.get();
 }


 var paramsString =  $.param(aux);
 if(paramsString != "") {
   Router.go("/workFlows?" + paramsString);
 }
 else{
   Router.go("/workFlows");
 }
}

var depFilter = new Deps.Dependency;

Template.workFlowListBox.rendered = function(){
  this.$('#userId').select2({
    //data: options,
    //multiple: this.data.multi,
    //allowClear: true,
    //placeholder: this.data.title,
    //initSelection: this.data.initSelection
  })
}


Template.workFlowListBox.created = function(){
  entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  console.log("entityId", entityId);
  console.log("entityType", entityType);

  Meteor.autorun(function(){
    var filterOr = [];
    var filterType = [];
    var filterCreatedBy = {};
    if(reactFinished.get()){
      //get all workflow that have each element of flow called and status isn't canceled
      filterOr.push({$and:[{flow:{$not:{$elemMatch:{called:!reactFinished.get()}}}},{status:{$ne:'canceled'}}]})
    }
    if(reactInProgress.get()){
      filterOr.push({$and:[{flow:{$elemMatch:{called:!reactInProgress.get()}}},{status:{$ne:'canceled'}}]})
    }
    if(reactCanceled.get()){
      filterOr.push({status:'canceled'})
    }
    if(reactJobOffer.get()){
      filterType.push({type:Enums.workFlowTypes.jobOffer})

    }
    if(reactPlacementConfirm.get()){
      filterType.push({type:Enums.workFlowTypes.placementConfirm})
    }
    if(reactCreatedBy.get() != ""){
      filterCreatedBy.userId = reactCreatedBy.get();
    }

    if(!SubscriptionHandlers.WorkFlowsHandler) {
       SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows');
    }

      if(filterType.length>0) {
        if(filterOr.length>0){
          if(_.isEmpty(filterCreatedBy))
            SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterType}, {$or:filterOr}]});
          else{
            SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterType}, {$or:filterOr}, filterCreatedBy]});
          }
        }
        else{
          if(_.isEmpty(filterCreatedBy))
             SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterType}]});
          else{
            SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterType}, filterCreatedBy]});
          }
        }
      }
      else{
        if(filterOr.length>0){
          if(_.isEmpty(filterCreatedBy))
            SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterOr}]});
          else{
            SubscriptionHandlers.WorkFlowsHandler.setFilter({$and: [{$or: filterOr}, filterCreatedBy]});
          }
        }
        else {
          if(_.isEmpty(filterCreatedBy))
            SubscriptionHandlers.WorkFlowsHandler.setFilter({});
          else{
            SubscriptionHandlers.WorkFlowsHandler.setFilter(filterCreatedBy);
          }
        }
      }


  })
}

Template.workFlowListBox.helpers({
  'entityId': function(){
    return entityId;
  },
  'totalCount': function(){
    return SubscriptionHandlers.WorkFlowsHandler.totalCount()
  },
  'workFlows': function(){
    return WorkFlows.find({}, {sort:{dateCreated:-1}});
  },
  'getFinishedClass': function(){
    if( reactFinished.get() )
       return 'btn-primary';
    else{
       return 'btn-default'
    }
  },
  'getInProgressClass': function(){
    if( reactInProgress.get() )
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  },
  'getCanceledClass': function(){
    if( reactCanceled.get() )
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  },
  'showAdd': function() {
    if (entityType === Enums.linkTypes.job.value){
      return true;
    }
    else{
        return false;
    }
  },
  'getJobOfferClass': function(){
    if(reactJobOffer.get())
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  },
  'getConfirmPlacementClass': function(){
    if(reactPlacementConfirm.get())
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  },
  users: function () {
    return Meteor.users.find({inactive:{$ne: true}}).fetch()

  }
  //userChanged: function () {
  //  var self = this;
  //  return function (value) {
  //    addTag.call(self, value);
  //    Template.instance().$('input[type=hidden]').data().select2.clear();
  //  }
  //}
})

Template.workFlowListBox.events({
  'click #inProgress': function(){
    reactInProgress.set(!reactInProgress.get())
    reload();
  },
  'click #finished': function(){
    reactFinished.set(!reactFinished.get())
    reload();
  },
  'click #canceled': function(){
    reactCanceled.set(!reactCanceled.get())
    reload();
  },
  'click #jobOfferFilter': function(){
    reactJobOffer.set(!reactJobOffer.get())
    reload();
  },
  'click #confirmPlacementFilter': function(){
    reactPlacementConfirm.set(!reactPlacementConfirm.get())
    reload();
  },
  'change #userId': function(e, ctx){
    reactCreatedBy.set(e.target.value);
    reload();
  }
})

Template.workFlowsListItem.helpers({
  'getWorkFlowType': function(){
    switch (this.type){
      case Enums.workFlowTypes.jobOffer:
      {
        return 'Job offer';
        break;
      }
      case Enums.workFlowTypes.placementConfirm:
      {
        return 'Confirm placement';
        break;
      }
    }
  },
  'numberCalled': function(){
    var count = 0;
    _.forEach(this.flow, function(f){
      if(f.called){
        count++;
      }
    })
    return count;
  },
  'totalToCall': function(){
    return this.flow.length;
  },
  'isFinished': function(){
    var count = 0;
    _.forEach(this.flow, function(f){
      if(f.called){
        count++;
      }
    })
    return (count === this.flow.length);
  },
  'isCanceled': function(){
    return this.status === 'canceled';
  }
})
//
//Template.select2.rendered = function () {
//  if (this.data && _.isArray(this.data.options)) {
//    var options = this.data.options;
//    Template.instance().$('#input').select2({
//      data: options,
//      multiple: this.data.multi,
//      allowClear: true,
//      placeholder: this.data.title,
//      initSelection: this.data.initSelection
//    });
//  }
//  if (this.data && _.isFunction(this.data.options)) {
//    Meteor.autorun(_.bind(function () {
//      var options = this.data.options();
//      if (_.isArray(options)) {
//        Template.instance().$('#input').select2({
//          data: options,
//          allowClear: true
//        });
//      }
//    }, this));
//  }
//};
//
//Template.select2.created = function () {
//  this.data.selected = this.data.multi ? [] : null;
//};
//
//Template.select2.events({
//  'change #input': function (e, ctx) {
//    ctx.data.selected = e.val;
//    ctx.data && ctx.data.onSelected && ctx.data.onSelected(ctx.data.selected);
//  }
//});