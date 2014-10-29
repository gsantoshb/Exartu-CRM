var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['jobDisplayName','employeeDisplayName','customerDisplayName'];

var placementCollection = Placements;
var PlacementHandler;

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    candidateActionOptions:{ default: ['Submittal','Sendout','Placed']},
    placementsCount: {},
    objType: {},
    isRecentDaySelected: {
      default: false
    },
    objTypeDisplayName: {},
    isRecentWeekSelected: {
      default: false
    },
    isRecentMonthSelected: {
      default: false
    },
    isRecentYearSelected: {
      default: false
    },
    isFiltering: {
      default: false
    }
  }
});
var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {},
    candidateAction: {},
    inactives: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    selectedLimit: {},
    tags: {
      type: Utils.ReactivePropertyTypes.array,
      default: []
    },
    statuses: {
      type: Utils.ReactivePropertyTypes.array,
      default: []
    }
  }
});

// All

Template.placementsBox.created = function(){
  var entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
  if (entityType != null) {
    isEntitySpecific = true;
    if (entityType == Enums.linkTypes.contactable.value) {
      contactable = Contactables.findOne({_id: entityId});
    }
  }
};

Template.placementsBox.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.placementsCount.value = PlacementHandler.totalCount();

  return info;
};

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.placementsBox.isSearching = function() {
  searchDep.depend();
  return isSearching;
};

// List
Template.placementsList.created = function () {
  if (!SubscriptionHandlers.PlacementHandler){
    SubscriptionHandlers.PlacementHandler = Meteor.paginatedSubscribe('placements');
  }
  PlacementHandler = SubscriptionHandlers.PlacementHandler;
  Meteor.autorun(function () {

    var searchQuery = {};
    searchDep.depend();

    if (entityType==Enums.linkTypes.job.value) searchQuery.job=Session.get('entityId');

    if (entityType==Enums.linkTypes.contactable.value) {
      if (contactable.Customer) searchQuery.customer=Session.get('entityId');
      if (contactable.Employee) searchQuery.employee=Session.get('entityId');
    }

    if (!_.isEmpty(query.searchString.value)) {
      var stringSearches=[];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: query.searchString.value,
          $options: 'i'
        }
        stringSearches.push(aux);
      });
      searchQuery = {
        $and: [searchQuery, {
          $or: stringSearches
        }]
      };
    }

    if (query.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
      };
    }

    if (! query.inactives.value) {
      var activeStatuses;
      activeStatuses = getActiveStatuses('placement');
      if (_.isArray(activeStatuses) && activeStatuses.length > 0){
        searchQuery.placementStatus={
          $in: activeStatuses
        };
      }
    }

    if (!_.isEmpty(query.candidateAction.value) ) {
      var candidateStatuses = getCandidateStatuses(query.candidateAction.value.valueOf());
      if (_.isArray(candidateStatuses) && candidateStatuses.length > 0){
        searchQuery.candidateStatus={
          $in: candidateStatuses
        };

      }
      else
      {
        // if here then no candidate statuses match the desired one so must return no rows
        searchQuery.candidateStatus={true:false};
      }
    }

    if (query.tags.value.length > 0) {
      searchQuery.tags = {
        $in: query.tags.value
      };
    }

    if (query.statuses.value && query.statuses.value.length){
      searchQuery.candidateStatus = {$in: query.statuses.value};
    }
    PlacementHandler.setFilter(searchQuery);
  })
}
Template.placementsList.info = function() {
  info.isFiltering.value = PlacementHandler.totalCount() != 0;
  return info;
};

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes["placement"];
  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode;
    var implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();
    var ids= _.map(implyActives,function(doc){ return doc._id});
    return ids;
  }
  return null;
};

var getCandidateStatuses = function(objname){
  var code = Enums.lookUpTypes["candidate"].status.lookUpCode;
  var lkps= LookUps.find( { lookUpCode:code, lookUpActions: { $in: [ objname ] }}).fetch();
  var ids= _.map(lkps,function(doc) {  return doc._id;});
  return ids;
};

Template.placementsList.placements = function() {
  return placementCollection.find();
};

Template.placementsList.placementTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.placement });
};

// List filters

Template.placementsFilters.query = function () {
  return query;
};

Template.placementsFilters.tags = function() {
  return query.tags;
};

Template.placementsFilters.candidateActionOptions= function() {
  return info.candidateActionOptions.value;
}

// List search

Template.placementsListSearch.isJob=function() {
  if (entityType==Enums.linkTypes.job.value) return true;
};

Template.placementsListSearch.searchString = function() {
  return query.searchString;
};

Template.placementsListSearch.isLoading = function () {
  return PlacementHandler.isLoading();
}

Template.placementsListSearch.events = {
  'click .addPlacement': function (e) {
    Session.set('addOptions', {job: Session.get('entityId')});
    Router.go('/placementAdd/placement');
    e.preventDefault();
  }
};

// Item

Template.placementsListItem.employeeDisplayName = function () {
  var employee = Contactables.findOne(this.employee);
  return employee && employee.displayName;
}
Template.placementsListItem.jobDisplayName = function () {
  var job = Jobs.findOne(this.job);
  return job && job.displayName;
}
Template.placementsListItem.customerDisplayName = function () {
  var job = Jobs.findOne(this.job);
  var customer = job && Contactables.findOne(job.customer);
  return customer && customer.displayName;
}

Template.placementsListItem.pictureUrl = function(pictureFileId) {
  var picture = PlacementsFS.findOne({_id: pictureFileId});
  return picture? picture.url('PlacementsFSThumbs') : undefined;
};

Template.placementsListItem.placementIcon = function() {
  return helper.getEntityIcon(this);
};

Template.placementsListItem.statusDisplayName = function(item) {

  var lookUp = LookUps.findOne({_id: this.placementStatus});

  if (lookUp) return lookUp.displayName;
};

Template.placementsListItem.displayObjType = function() {
  return Utils.getPlacementType(this);
};