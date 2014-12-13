var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['name'];

var tenantUserCollection = TenantUsers;
var TenantUserHandler, tenantUserQuery;

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    tenantUsersCount: {},
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


var loadTenantUserQueryFromURL = function (params) {
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

Template.tenantUsersBox.created = function(){
  tenantUserQuery = tenantUserQuery || loadTenantUserQueryFromURL(Router.current().params);

  var entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
};

Template.tenantUsersBox.information = function() {
  var searchQuery = {};

  if (tenantUserQuery.objType.value)
    searchQuery.objNameArray = tenantUserQuery.objType.value;

  info.tenantUsersCount.value = TenantUserHandler.totalCount();

  return info;
};

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.tenantUsersBox.isSearching = function() {
  searchDep.depend();
  return isSearching;
};
var options = {};
// List
Template.tenantUsersList.created = function () {
  if (!SubscriptionHandlers.TenantUserHandler){
    SubscriptionHandlers.TenantUserHandler = Meteor.paginatedSubscribe('tenantUsers');
  }
  TenantUserHandler = SubscriptionHandlers.TenantUserHandler;
  Meteor.autorun(function () {
    var searchQuery = {};
    var params = {};
    options = {};
    var urlQuery = new URLQuery();

    searchDep.depend();


    if (!_.isEmpty(tenantUserQuery.searchString.value)) {
      params.searchString = tenantUserQuery.searchString.value;
      urlQuery.addParam('search', tenantUserQuery.searchString.value);
    }

    if (tenantUserQuery.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - tenantUserQuery.selectedLimit.value
      };
      urlQuery.addParam('creationDate', tenantUserQuery.selectedLimit.value);
    }

    if (! tenantUserQuery.inactives.value) {
        searchQuery.inactive = {$in: [null, false]}
    }

    if (tenantUserQuery.inactives.value) {
      urlQuery.addParam('inactives', true);
    }

    if (tenantUserQuery.tags.value.length > 0) {
      searchQuery.tags = {
        $in: tenantUserQuery.tags.value
      };
      urlQuery.addParam('tags', tenantUserQuery.tags.value);
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

    TenantUserHandler.setFilter(searchQuery, params);
    TenantUserHandler.setOptions(options);
  })
};

Template.tenantUsersList.info = function() {
  info.isFiltering.value = TenantUserHandler.totalCount() != 0;
  return info;
};

Template.tenantUsersList.isLoading = function() {
  return SubscriptionHandlers.TenantUserHandler.isLoading();
};

var getActiveStatuses = function(){
  return null;
};



Template.tenantUsersList.tenantUsers = function() {
  return tenantUserCollection.find({}, options);
};


// List filters

Template.tenantUsersFilters.query = function () {
  return tenantUserQuery;
};

Template.tenantUsersFilters.tags = function() {
  return tenantUserQuery.tags;
};



Template.tenantUsersListSearch.searchString = function() {
  return tenantUserQuery.searchString;
};

Template.tenantUsersListSearch.isLoading = function () {
  return TenantUserHandler.isLoading();
}

Template.tenantUsersListSearch.events = {
};

// Item

Template.tenantUsersListItem.helpers({

  pictureUrl: function(pictureFileId) {
    var picture = TenantUsersFS.findOne({_id: pictureFileId});
    return picture? picture.url('TenantUsersFSThumbs') : undefined;
  },
  tenantUserIcon: function() {
    return helper.getEntityIcon(this);
  },
  statusDisplayName: function(item) {
    var lookUp = LookUps.findOne({_id: this.tenantUserStatus});

    if (lookUp) return lookUp.displayName;
  },
  displayObjType: function() {
    return Utils.getTenantUserType(this);
  },
  getUserName: function()
  {
    return Utils.getLocalUserName(this);
  },
  getUserEmail: function()
  {
    return this.emails[0].address;
  }
});

// Item information

Template.tenantUserInformation.helpers({
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

Template.tenantUserListSort.helpers({
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

Template.tenantUserListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};
