
var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['employeeInfo.firstName', 'employeeInfo.lastName', 'employeeInfo.middleName'];

var hotListCollection = HotLists;
var HotListHandler, query;

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    hotListsCount: {},
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


var loadqueryFromURL = function (params) {
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


  // Status
  var objTypeQuery = { type: Utils.ReactivePropertyTypes.array };
  if (params.status) {
    objTypeQuery.default = params.status.split(',');
  }

  // Tags
  var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
  if (params.tags) {
    tagsQuery.default = params.tags.split(',');
  }
  var activeobjTypeQuery = {type: Utils.ReactivePropertyTypes.array};
  if (params.activeStatus) {
    activeobjTypeQuery.default = params.activeStatus.split(',');
  }
  else
  {
    if (Meteor.user()) // verify not a fresh reload
        activeobjTypeQuery.default = [Utils.getActiveStatusDefaultId()];
  };
  return new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      selectedLimit: creationDateQuery,
      activeStatus:activeobjTypeQuery,
      tags: tagsQuery,
      objTypes: objTypeQuery
    }
  });
};
var listViewDefault=Session.get('hotListListViewMode');
if (!listViewDefault)
{
  listViewDefault=true;
}
var listViewMode = new ReactiveVar(listViewDefault);

var searchDep = new Deps.Dependency;
var isSearching = false;

// All
Template.hotListsBox.created = function(){
  query = query || loadqueryFromURL(Router.current().params);

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

Template.hotListsBox.helpers({
  information: function () {
    var searchQuery = {};

    if (query.objType.value)
      searchQuery.objNameArray = query.objType.value;

    info.hotListsCount.value = HotListHandler.totalCount();

    return info;
  },

  isSearching: function () {
    searchDep.depend();
    return isSearching;
  }
});


var options = {};
// List
Template.hotListList.created = function () {
  if (!SubscriptionHandlers.HotListHandler){
    SubscriptionHandlers.HotListHandler = Meteor.paginatedSubscribe('hotLists');
  }
  HotListHandler = SubscriptionHandlers.HotListHandler;
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

    if (!_.isEmpty(query.searchString.value)) {
      params.searchString = query.searchString.value;
      urlQuery.addParam('search', query.searchString.value);
    }

    if (query.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
      };
      urlQuery.addParam('creationDate', query.selectedLimit.value);
    }

    if (query.tags.value.length > 0) {
      searchQuery.tags = {
        $in: query.tags.value
      };
      urlQuery.addParam('tags', query.tags.value);
    }
    if (!_.isEmpty(query.activeStatus.value)){
      searchQuery.activeStatus={$in: query.activeStatus.value};

      urlQuery.addParam('activeStatus', query.activeStatus.value);
    };

    if (query.objTypes.value && query.objTypes.value.length > 0){
      searchQuery.candidateStatus = {$in: query.objTypes.value};
      urlQuery.addParam('status', query.objTypes.value);
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
    console.log('hotlistquery',searchQuery);
    HotListHandler.setFilter(searchQuery, params);
    HotListHandler.setOptions(options);
  })
};

Template.hotListList.helpers({
  info: function () {
    info.isFiltering.value = HotListHandler.totalCount() != 0;
    return info;
  },

  isLoading: function () {
    return SubscriptionHandlers.HotListHandler.isLoading();
  },

  hotLists: function () {
    return hotListCollection.find({}, options);
  },

  contactableTypes: function() {
    return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
  },

  listViewMode: function () {
    return listViewMode.get();
  }
});



var getHotListTypes = function(){
  return [
    Enums.hotListCategories.employee,
    Enums.hotListCategories.customer,
    Enums.hotListCategories.employee,
  ]
};



// List filters
Template.hotListsFilters.helpers({
  query: function () {
    return query;
  },

  tags: function () {
    return query.tags;
  }
});

// List search
Template.hotListListSearch.helpers({
  isJob: function () {
    if (entityType == Enums.linkTypes.job.value) return true;
  },

  searchString: function () {
    return query.searchString;
  },

  isLoading: function () {
    return HotListHandler.isLoading();
  },

  listViewMode: function () {
    return listViewMode.get();
  }
});

Template.hotListListSearch.events = {
  'click .addHotList': function (e) {
    Session.set('addOptions', {job: Session.get('entityId')});
    Router.go('/hotListAdd/hotList');
    e.preventDefault();
  },
  'click #list-view': function () {
    listViewMode.set(true);
    Session.set('hotListListViewMode',true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('hotListListViewMode',false);
  }  
};

// Item

Template.hotListListItem.helpers({
  displayObjType: function () {
    return Utils.getContactableType(this);
  },
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
  pictureUrl: function (pictureFileId) {
    var picture = HotListsFS.findOne({_id: pictureFileId});
    return picture ? picture.url('HotListsFSThumbs') : undefined;
  },
  hotListIcon: function () {
    return helper.getEntityIcon(this);
  },
  statusDisplayName: function (item) {
    var lookUp = LookUps.findOne({_id: this.hotListStatus});

    if (lookUp) return lookUp.displayName;
  },
  displayObjType: function () {
    return Utils.getHotListType(this);
  },

  listViewMode: function () {
    return listViewMode.get();
  }
});

// Item information

Template.hotListInformation.helpers({
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

Template.hotListListSort.helpers({
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

Template.hotListListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};
