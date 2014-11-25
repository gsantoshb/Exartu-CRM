var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['jobDisplayName','employeeDisplayName','customerDisplayName'];

var placementCollection = Placements;
var PlacementHandler, placementQuery;

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


var loadPlacementQueryFromURL = function (params) {
  // Search string
  var searchStringQuery = {};
  if (params.search) {
    searchStringQuery.default = params.search;
  }

  // CreationDate
  var creationDateQuery = {};
  if (params.creationDate) {
    creationDateQuery.default = params.creationDate;
  }

  // Inactive
  var inactiveQuery = { type: Utils.ReactivePropertyTypes.boolean };
  if (params.inactives) {
    inactiveQuery.default = !! params.inactives;
  }

  // Status
  var statusQuery = { type: Utils.ReactivePropertyTypes.array };
  if (params.status) {
    statusQuery.default = params.status.split(',');
  }

  // Tags
  var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
  if (params.tags) {
    tagsQuery.default = params.tags.split(',');
  }

  return new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      selectedLimit: creationDateQuery,
      inactives: inactiveQuery,
      tags: tagsQuery,
      statuses: statusQuery
    }
  });
};

// All

Template.placementsBox.created = function(){
  placementQuery = placementQuery || loadPlacementQueryFromURL(Router.current().params);

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

  if (placementQuery.objType.value)
    searchQuery.objNameArray = placementQuery.objType.value;

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
    var urlQuery = new URLQuery();

    searchDep.depend();

    if (entityType==Enums.linkTypes.job.value) searchQuery.job=Session.get('entityId');

    if (entityType==Enums.linkTypes.contactable.value) {
      if (contactable.Customer) searchQuery.customer=Session.get('entityId');
      if (contactable.Employee) searchQuery.employee=Session.get('entityId');
    }

    if (!_.isEmpty(placementQuery.searchString.value)) {
      var stringSearches = [];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: placementQuery.searchString.value,
          $options: 'i'
        }
        stringSearches.push(aux);
      });
      searchQuery = {
        $and: [searchQuery, {
          $or: stringSearches
        }]
      };

      urlQuery.addParam('search', placementQuery.searchString.value);
    }

    if (placementQuery.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - placementQuery.selectedLimit.value
      };
      urlQuery.addParam('creationDate', placementQuery.selectedLimit.value);
    }

    if (! placementQuery.inactives.value) {
      var activeStatuses;
      activeStatuses = getActiveStatuses('placement');
      if (_.isArray(activeStatuses) && activeStatuses.length > 0){
        searchQuery.placementStatus={
          $in: activeStatuses
        };
      }
    }

    if (placementQuery.inactives.value) {
      urlQuery.addParam('inactives', true);
    }

    if (placementQuery.tags.value.length > 0) {
      searchQuery.tags = {
        $in: placementQuery.tags.value
      };
      urlQuery.addParam('tags', placementQuery.tags.value);
    }

    if (placementQuery.statuses.value && placementQuery.statuses.value.length > 0){
      searchQuery.candidateStatus = {$in: placementQuery.statuses.value};
      urlQuery.addParam('status', placementQuery.statuses.value);
    }

    // Set url query
    urlQuery.apply();

    PlacementHandler.setFilter(searchQuery);
  })
};

Template.placementsList.info = function() {
  info.isFiltering.value = PlacementHandler.totalCount() != 0;
  return info;
};

var getActiveStatuses = function(){
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
  return placementQuery;
};

Template.placementsFilters.tags = function() {
  return placementQuery.tags;
};

Template.placementsFilters.candidateActionOptions= function() {
  return info.candidateActionOptions.value;
}

// List search

Template.placementsListSearch.isJob=function() {
  if (entityType==Enums.linkTypes.job.value) return true;
};

Template.placementsListSearch.searchString = function() {
  return placementQuery.searchString;
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
};
Template.placementsListItem.jobDisplayName = function () {
  var job = Jobs.findOne(this.job);
  return job && job.displayName;
};
Template.placementInformation.jobLocationDisplayName= function () {
  var job = Jobs.findOne(this.job);
  return job && Utils.getLocationDisplayName(job.location);
};
Template.placementsListItem.customerId = function () {
  var job = Jobs.findOne(this.job);
  var customer = job && Contactables.findOne(job.customer);
  return customer && customer._id;
};
Template.placementsListItem.customerDisplayName = function () {
  var job = Jobs.findOne(this.job);
  var customer = job && Contactables.findOne(job.customer);
  return customer && customer.displayName;
};

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