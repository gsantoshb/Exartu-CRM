var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['name'];

var tenantCollection = Tenants;
var TenantHandler, tenantQuery;

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    tenantsCount: {},
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


var loadTenantQueryFromURL = function (params) {
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
      tags: tagsQuery
    }
  });
};

// All

Template.tenantsBox.created = function(){
  tenantQuery = tenantQuery || loadTenantQueryFromURL(Router.current().params);

  var entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
};

Template.tenantsBox.information = function() {
  var searchQuery = {};

  if (tenantQuery.objType.value)
    searchQuery.objNameArray = tenantQuery.objType.value;

  info.tenantsCount.value = TenantHandler.totalCount();

  return info;
};

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.tenantsBox.isSearching = function() {
  searchDep.depend();
  return isSearching;
};
var options = {};
// List
Template.tenantsList.created = function () {
  if (!SubscriptionHandlers.TenantHandler){
    SubscriptionHandlers.TenantHandler = Meteor.paginatedSubscribe('tenants');
  }
  TenantHandler = SubscriptionHandlers.TenantHandler;
  Meteor.autorun(function () {
    var searchQuery = {};
    var params = {};
    options = {};
    var urlQuery = new URLQuery();

    searchDep.depend();



    var searchString=tenantQuery.searchString.value;
    if (!_.isEmpty(searchString)) {
      searchQuery.$and = [];
      var stringSearches = [];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: searchString,
          $options: 'i'
        };
        stringSearches.push(aux);
      });
      urlQuery.addParam('search', searchString);
      searchQuery.$and.push({
        $or: stringSearches
      });
    };



    if (tenantQuery.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - tenantQuery.selectedLimit.value
      };
      urlQuery.addParam('creationDate', tenantQuery.selectedLimit.value);
    }

    if (! tenantQuery.inactives.value) {
        searchQuery.inactive = {$in: [null, false]}
    }

    if (tenantQuery.inactives.value) {
      urlQuery.addParam('inactives', true);
    }

    if (tenantQuery.tags.value.length > 0) {
      searchQuery.tags = {
        $in: tenantQuery.tags.value
      };
      urlQuery.addParam('tags', tenantQuery.tags.value);
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

    TenantHandler.setFilter(searchQuery);
    TenantHandler.setOptions(options);
  })
};

Template.tenantsList.info = function() {
  info.isFiltering.value = TenantHandler.totalCount() != 0;
  return info;
};

Template.tenantsList.isLoading = function() {
  return SubscriptionHandlers.TenantHandler.isLoading();
};

var getActiveStatuses = function(){
  return null;
};



Template.tenantsList.tenants = function() {
  return tenantCollection.find({}, options);
};


// List filters

Template.tenantsFilters.query = function () {
  return tenantQuery;
};

Template.tenantsFilters.tags = function() {
  return tenantQuery.tags;
};



Template.tenantsListSearch.searchString = function() {
  return tenantQuery.searchString;
};

Template.tenantsListSearch.isLoading = function () {
  return TenantHandler.isLoading();
}

Template.tenantsListSearch.events = {
  'click .addTenant': function (e) {
    Session.set('addOptions', {job: Session.get('entityId')});
    Router.go('/tenantAdd/tenant');
    e.preventDefault();
  }
};

// Item

Template.tenantsListItem.helpers({

  pictureUrl: function(pictureFileId) {
    var picture = TenantsFS.findOne({_id: pictureFileId});
    return picture? picture.url('TenantsFSThumbs') : undefined;
  },
  tenantIcon: function() {
    return helper.getEntityIcon(this);
  },
  statusDisplayName: function(item) {
    var lookUp = LookUps.findOne({_id: this.tenantStatus});

    if (lookUp) return lookUp.displayName;
  },
  displayObjType: function() {
    return Utils.getTenantType(this);
  }
});

// Item information

Template.tenantInformation.helpers({
  getRateTypeDisplayName: function () {
    var rate = LookUps.findOne(this.type);
    return rate.displayName;
  }
});


// list sort

var selectedSort =  new ReactiveVar();
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
  {field: 'name', displayName: 'Name'}
];

Template.tenantListSort.helpers({
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

Template.tenantListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};
