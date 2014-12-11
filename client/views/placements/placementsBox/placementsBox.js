var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['employeeInfo.firstName', 'employeeInfo.lastName', 'employeeInfo.middleName'];

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
var options = {};
// List
Template.placementsList.created = function () {
  if (!SubscriptionHandlers.PlacementHandler){
    SubscriptionHandlers.PlacementHandler = Meteor.paginatedSubscribe('placements');
  }
  PlacementHandler = SubscriptionHandlers.PlacementHandler;
  Meteor.autorun(function () {
    var searchQuery = {};
    var params = {};
    options = {};
    var urlQuery = new URLQuery();

    searchDep.depend();

    if (entityType==Enums.linkTypes.job.value) searchQuery.job=Session.get('entityId');

    if (entityType==Enums.linkTypes.contactable.value) {
      if (contactable.Customer) {
        // Get customer jobs
        var jobsId = Jobs.find({customer: Session.get('entityId')}).map(function (job) { return job._id;});
        searchQuery.job = {$in: jobsId};
      }
      if (contactable.Employee) searchQuery.employee=Session.get('entityId');
    }

    if (!_.isEmpty(placementQuery.searchString.value)) {
      params.searchString = placementQuery.searchString.value;
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

    if (selectedSort.get()) {
      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }

    PlacementHandler.setFilter(searchQuery, params);
    PlacementHandler.setOptions(options);
  })
};

Template.placementsList.info = function() {
  info.isFiltering.value = PlacementHandler.totalCount() != 0;
  return info;
};

Template.placementsList.isLoading = function() {
  return SubscriptionHandlers.PlacementHandler.isLoading();
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
  return placementCollection.find({}, options);
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

Template.placementsListItem.helpers({
  employeeDisplayName: function () {
    var employee = Contactables.findOne(this.employee);
    return employee && employee.displayName;
  },
  jobDisplayName: function () {
    var job = Jobs.findOne(this.job);
    return job && job.displayName;
  },
  jobLocationDisplayName: function () {
    var job = Jobs.findOne(this.job);
    return job && Utils.getLocationDisplayName(job.location);
  },
  customerId: function () {
    var job = Jobs.findOne(this.job);
    var customer = job && Contactables.findOne(job.customer);
    return customer && customer._id;
  },
  customerDisplayName: function () {
    var job = Jobs.findOne(this.job);
    var customer = job && Contactables.findOne(job.customer);
    return customer && customer.displayName;
  },
  pictureUrl: function(pictureFileId) {
    var picture = PlacementsFS.findOne({_id: pictureFileId});
    return picture? picture.url('PlacementsFSThumbs') : undefined;
  },
  placementIcon: function() {
    return helper.getEntityIcon(this);
  },
  statusDisplayName: function(item) {
    var lookUp = LookUps.findOne({_id: this.placementStatus});

    if (lookUp) return lookUp.displayName;
  },
  displayObjType: function() {
    return Utils.getPlacementType(this);
  }
});

// Item information

Template.placementInformation.helpers({
  getRateTypeDisplayName: function () {
    var rate = LookUps.findOne(this.type);
    return rate.displayName;
  }
});


// list sort

var selectedSort =  new ReactiveVar();
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
  {field: 'employeeInfo.lastName', displayName: 'Name'}
];

Template.placementListSort.helpers({
  sortFields: function() {
    return sortFields;
  },
  selectedSort: function() {
    return selectedSort.get();
  },
  isFieldSelected: function(field) {
    return selectedSort.get() && selectedSort.get().field == field.field;
  },
  isAscSort: function() {
    return selectedSort.get() ? selectedSort.get().value == 1: false;
  }
});

var setSortField = function(field) {
  var selected = selectedSort.get();
  if (selected && selected.field == field.field) {
    if (selected.value == 1)
      selected = undefined;
    else
      selected.value = 1;
  } else {
    selected = field;
    selected.value = -1;
  }
  selectedSort.set(selected);
};

Template.placementListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};
