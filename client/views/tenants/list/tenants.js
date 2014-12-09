//TenantsController = RouteController.extend({
//  template: 'tenants',
//  layoutTemplate: 'mainLayout',
//  waitOn: function () {
//    return [TenantsHandler];
//  }
//});
//var tenantCollection = Tenants;
//var TenantHandler, tenantQuery;
//var info = new Utils.ObjectDefinition({
//  reactiveProps: {
//    objType: {},
//    isRecentDaySelected: {
//      default: false
//    },
//    objTypeDisplayName: {},
//    isRecentWeekSelected: {
//      default: false
//    },
//    isRecentMonthSelected: {
//      default: false
//    },
//    isRecentYearSelected: {
//      default: false
//    },
//    isFiltering: {
//      default: false
//    }
//  }
//});
//var loadTenantQueryFromURL = function (params) {
//  // Search string
//  var searchStringQuery = {};
//  if (params.search) {
//    searchStringQuery.default = params.search;
//  }
//
//  // CreationDate
//  var creationDateQuery = {};
//  if (params.creationDate) {
//    creationDateQuery.default = params.creationDate;
//  }
//  return new Utils.ObjectDefinition({
//    reactiveProps: {
//      searchString: {},
//      selectedLimit: creationDateQuery
//    }
//  });
//
//}
//Template.tenants.created=function() {
//  tenantQuery = tenantQuery || loadTenantQueryFromURL(Router.current().params);
//}
//Template.tenants.information = function() {
//  var searchQuery = {};
//
//  if (tenantQuery.objType.value)
//    searchQuery.objNameArray = tenantQuery.objType.value;
//
//  info.tenantsCount.value = TenantHandler.totalCount();
//
//  return info;
//};
//
//var searchDep = new Deps.Dependency;
//var isSearching = false;
//Template.tenantsBox.isSearching = function() {
//  searchDep.depend();
//  return isSearching;
//};
//
//Template.tenantsList.created = function () {
//  if (!SubscriptionHandlers.TenantHandler){
//    SubscriptionHandlers.TenantHandler = Meteor.paginatedSubscribe('tenants');
//  }
//  TenantHandler = SubscriptionHandlers.TenantHandler;
//  Meteor.autorun(function () {
//    var searchQuery = {};
//    var options = {};
//    var urlQuery = new URLQuery();
//
//    searchDep.depend();
//
//
//
//    if (!_.isEmpty(tenantQuery.searchString.value)) {
//      var stringSearches = [];
//      _.each(searchFields, function (field) {
//        var aux = {};
//        aux[field] = {
//          $regex: tenantQuery.searchString.value,
//          $options: 'i'
//        }
//        stringSearches.push(aux);
//      });
//      searchQuery = {
//        $and: [searchQuery, {
//          $or: stringSearches
//        }]
//      };
//
//      urlQuery.addParam('search', tenantQuery.searchString.value);
//    }
//
//    if (tenantQuery.selectedLimit.value) {
//      var dateLimit = new Date();
//      searchQuery.dateCreated = {
//        $gte: dateLimit.getTime() - tenantQuery.selectedLimit.value
//      };
//      urlQuery.addParam('creationDate', tenantQuery.selectedLimit.value);
//    }
//
//    if (! tenantQuery.inactives.value) {
//      var activeStatuses;
//      activeStatuses = getActiveStatuses('tenant');
//      if (_.isArray(activeStatuses) && activeStatuses.length > 0){
//        searchQuery.tenantStatus={
//          $in: activeStatuses
//        };
//      }
//    }
//
//    if (tenantQuery.inactives.value) {
//      urlQuery.addParam('inactives', true);
//    }
//
//    if (tenantQuery.tags.value.length > 0) {
//      searchQuery.tags = {
//        $in: tenantQuery.tags.value
//      };
//      urlQuery.addParam('tags', tenantQuery.tags.value);
//    }
//
//
//    // Set url query
//    urlQuery.apply();
//
//    if (selectedSort.get()) {
//      var selected = selectedSort.get();
//      options.sort = {};
//      options.sort[selected.field] = selected.value;
//    } else {
//      delete options.sort;
//    }
//
//    TenantHandler.setFilter(searchQuery);
////    TenantHandler.setOptions(options);
//  })
//};
//Template.tenantsList.info = function() {
//  info.isFiltering.value = TenantHandler.totalCount() != 0;
//  return info;
//};
//
//Template.tenantsList.isLoading = function() {
//  return SubscriptionHandlers.TenantHandler.isLoading();
//};
//Template.tenantsList.tenants = function() {
//  return tenantCollection.find();
//};
//
//Template.tenantsList.tenantTypes = function() {
//  return dType.ObjTypes.find({ parent: Enums.objGroupType.tenant });
//};
//
//// List filters
//
//Template.tenantsFilters.query = function () {
//  return tenantQuery;
//};
//
//Template.tenantsFilters.tags = function() {
//  return tenantQuery.tags;
//};
//Template.tenantsListSearch.searchString = function() {
//  return tenantQuery.searchString;
//};
//
//Template.tenantsListSearch.isLoading = function () {
//  return TenantHandler.isLoading();
//}
//
//
//// list sort
//
//var selectedSort =  new ReactiveVar();
//var sortFields = [
//  {field: 'dateCreated', displayName: 'Date'},
//  {field: 'name', displayName: 'Name'}
//];
//
//Template.tenantListSort.helpers({
//  sortFields: function() {
//    return sortFields;
//  },
//  selectedSort: function() {
//    return selectedSort.get();
//  },
//  isFieldSelected: function(field) {
//    return selectedSort.get() && selectedSort.get().field == field.field;
//  },
//  isAscSort: function() {
//    return selectedSort.get() ? selectedSort.get().value == 1: false;
//  }
//});
//
//var setSortField = function(field) {
//  var selected = selectedSort.get();
//  if (selected && selected.field == field.field) {
//    if (selected.value == 1)
//      selected = undefined;
//    else
//      selected.value = 1;
//  } else {
//    selected = field;
//    selected.value = -1;
//  }
//  selectedSort.set(selected);
//};
//
//Template.tenantListSort.events = {
//  'click .sort-field': function() {
//    setSortField(this);
//  }
//};
//
//
//Template.tenants.filters = function(){
//  return query;
//};
//
//Template.tenants.getFirstUserText = function ()
//{
//  return this.firstUser.emails[0].address;
//};
//
//Template.tenants.tenants = function () {
//  getTenants();
//  queryDep.depend();
//  return hiers.sort(hierSort);
//}
//
//
//
//
//
//
