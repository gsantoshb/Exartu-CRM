/**
 * Variables
 */
var tourIndex;
var jobCollection = JobsView;
var searchQuery, options;
var entityId;
var JobHandler;
var query;
var selectedSort = new ReactiveVar();
selectedSort.set({field: 'dateCreated', value: -1});
var searchDep = new Deps.Dependency;
var selectedSortDep = new Deps.Dependency;
var sortFields = [
  {field: 'startDate', displayName: 'Start date'},
  {field: 'dateCreated', displayName: 'Date created'}];

var initialized = new ReactiveVar(false);


var info = new Utils.ObjectDefinition({
  reactiveProps: {
    jobsCount: {},
    objType: {},
    objTypeDisplayName: {},
    isFiltering: {
      default: false
    }
  }
});

var listViewMode = new ReactiveVar(false);

var locationFields = ['address', 'city', 'state', 'country'];

var getLocationTagValue = function (locationField, locationFields) {
  var regex = new RegExp('(?:' + locationField + ':)((?!' + locationFields.filter(function (field) {
    return field != locationField;
  }).map(function (field) {
    return field + ':';
  }).join('|') + ').)*', 'ig');
  var match = regex.exec(query.location.value);
  var value;
  if (match)
    value = match[0].substring(locationField.length + 1).trim();

  return value;
};


var searchFields = ['displayName', 'publicJobTitle'];

var setSortField = function (field) {
  var selected = selectedSort.get();
  if (selected && selected.field == field.field) {
    if (selected.value == 1) {
      selected = undefined;

    }
    else {
      selected.value = 1;
     }
    } else {
    selected = field;
    selected.value = -1;
  }
  selectedSort.set(selected);
};

// Creates a reactive object from the parameters found in the URL if any
var loadqueryFromURL = function (params) {

  var jobType = {};
  var type = params.hash || params.type;
  if (type != undefined && type != 'all') {
    var re = new RegExp("^" + type + "$", "i");
    var objType = dType.ObjTypes.findOne({
      name: re
    });
    jobType.default = objType.name;
    info.objType.value = objType.name + 's';
  } else {
    jobType.default = undefined;
    info.objType.value = 'record(s)';
  }

  // Search string
  var searchStringQuery = {};
  if (params.search) {
    searchStringQuery.default = params.search;
  }

  // Mine only
  var mineQuery = {type: Utils.ReactivePropertyTypes.boolean};
  if (params.mine) {
    mineQuery.default = !!params.mine;
  }

  // Tags
  var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
  if (params.tags) {
    tagsQuery.default = params.tags.split(',');
  }

  // Location
  var locationQuery = {};
  if (params.address) {
    locationQuery.default = ' address: ' + params.address;
  }
  if (params.city) {
    locationQuery.default = locationQuery.default || '';
    locationQuery.default += ' city: ' + params.city;
  }
  if (params.state) {
    locationQuery.default = locationQuery.default || '';
    locationQuery.default += ' state: ' + params.state;
  }
  if (params.country) {
    locationQuery.default = locationQuery.default || '';
    locationQuery.default += ' country: ' + params.country;
  }

  // Process Status
  var statusQuery = {type: Utils.ReactivePropertyTypes.array};
  if (params.status) {
    statusQuery.default = params.status.split(',');
  }

  // Active Status
  var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
  if (params.activeStatus) {
    activeStatusQuery.default = params.activeStatus.split(',');
  }
  else {
    activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
  }

  return new Utils.ObjectDefinition({
    reactiveProps: {
      jobType: jobType,
      searchString: searchStringQuery,
      activeStatus: activeStatusQuery,
      mineOnly: mineQuery,
      tags: tagsQuery,
      location: locationQuery,
      status: statusQuery
    }
  });
};

Template.jobsBox.created = function () {
  if (!JobHandler) {
    JobHandler = SubscriptionHandlers.JobHandler;
  }

  // Set up query object with reactive properties
  query = query || loadqueryFromURL(Router.current().params.query);
  entityId = Session.get('entityId');
};

Template.jobsBox.destroyed = function(){
  if(JobHandler){
    JobHandler.stop();
    delete JobHandler;

  }
};


Template.jobList.created = function () {
  initialized.set(false);
  /////////////hack/////////
  searchQuery = {

  };
  options = {};
  var urlQuery = new URLQuery();
  if (Session.get('entityId')) {
    searchQuery.clientId = Session.get('entityId');

  }
  var selected = selectedSort.get();
  options.sort = {};
  options.sort[selected.field] = selected.value;
  urlQuery.apply();
  setSubscription(searchQuery, options);
  /////////////////////////

  // Set up an autorun to filter the job list
  this.autorun(function () {
    searchQuery = {
      $and: [] // Push each $or operator here
    };
    options = {};
     var urlQuery = new URLQuery();
    if (Session.get('entityId')) {
      searchQuery.clientId = Session.get('entityId');
    }

    // Type
    if (query.jobType.value) {
      searchQuery.$and.push({type: query.jobType.value});
      urlQuery.addParam('type', query.jobType.value);
    }

    //Created by
    if (query.mineOnly.value) {
      searchQuery.$and.push({userId: Meteor.userId()});
      urlQuery.addParam('mine', true);
    }

    // Tags
    if (query.tags.value.length > 0) {
      searchQuery.$and.push({
        tags: {
          $in: query.tags.value
        }
      });
      urlQuery.addParam('tags', query.tags.value);
    }

    // Location filter
    var locationFilter = undefined;
    if (query.location.value) {
      // Check if any of the predefined location tags are used
      _.forEach(locationFields, function (locationField) {
        var value = getLocationTagValue(locationField, locationFields);
        if (value) {
          // Check for initialization
          if (!_.isObject(locationFilter)) {
            locationFilter = {};
          }

          locationFilter[locationField] = value;
          urlQuery.addParam(locationField, value);
        }
      });

      // If no tags were used set the value as string
      if (!_.isObject(locationFilter)) {
        locationFilter = query.location.value;
      }
    }
    if (_.isString(locationFilter)) {
      searchQuery.$or = [
        {'address.address': {$regex: locationFilter, $options: 'i'}},
        {'address.city': {$regex: locationFilter, $options: 'i'}},
        {'address.state': {$regex: locationFilter, $options: 'i'}},
        {'address.country': {$regex: locationFilter, $options: 'i'}}
      ];
    }
    if (_.isObject(locationFilter)) {
      _.each(locationFilter, function (v, k) {
        searchQuery['address.' + k] = {$regex: v, $options: 'i'}
      });
    }


    if (!_.isEmpty(query.activeStatus.value)) {
      searchQuery.activeStatus = {$in: query.activeStatus.value};
      urlQuery.addParam('activeStatus', query.activeStatus.value);
    }

    if (!_.isEmpty(query.status.value)) {
      searchQuery.status = {$in: query.status.value};
      urlQuery.addParam('status', query.status.value);
    }

    if (selectedSort.get()) {

      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }
    // String search
    if (query.searchString.value) {

      var stringSearches = [];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: query.searchString.value,
          $options: 'i'
        };
        stringSearches.push(aux);
      });
      searchQuery.$and.push({
        $or: stringSearches
      });
      urlQuery.addParam('search', query.searchString.value);
    }

    if (searchQuery.$and.length == 0){

      delete searchQuery.$and;
    }

    urlQuery.apply();
    setSubscription(searchQuery, options);

    initialized.set(true);
  })
};
var setSubscription = function (searchQuery, options) {
   if (SubscriptionHandlers.JobHandler) {
    SubscriptionHandlers.JobHandler.setFilter(searchQuery);
    SubscriptionHandlers.JobHandler.getFilter();
    SubscriptionHandlers.JobHandler.setOptions(options);
    JobHandler = SubscriptionHandlers.JobHandler;
    searchDep.changed();
  } else {
    SubscriptionHandlers.JobHandler = Meteor.paginatedSubscribe('jobsView', {
      filter: searchQuery,
      options: options
    });
    JobHandler = SubscriptionHandlers.JobHandler;
    searchDep.changed();
  }
};

// List - Helpers
Template.jobList.helpers({
  info: function () {
    info.isFiltering.value = jobCollection.find().count() != 0;
    return info;
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  jobs: function () {
    searchDep.depend();
    selectedSortDep.depend();
    return jobCollection.find({}, options);
  },
  isLoading: function () {
    return SubscriptionHandlers.JobHandler.isLoading();
  }
});

Template.jobList.rendered = function () {
  /**
   * @todo review code, this ia a small hack to make ti work.
   * This particular plugin doesn't seem to behave quite right if you initialize it more than once so we're doing it on each first click event.
   */
  $(document).on('click', 'button[data-toggle="popover"]', function (e) {
    var object = e.currentTarget;
    if ($(object).attr('data-init') == 'off') {
      $(object).popover('show');
      $(object).attr('data-init', 'on');
    }
  });
  Meteor.call('getIndexTour', "tourActivities", function(err,cb){
    tourIndex = cb;
    if((tourIndex>=9)&&(tourIndex < 14)){
      $("#tourActivities").joyride({
        autoStart: true,
        startOffset:tourIndex + 1,
        modal: true,
        postRideCallback: function(e) {
          Meteor.call('setVisitedTour', "tourActivities",27, function(err,cb){
          })
        },
        postStepCallback: function(e, ctx){
          tourIndex = e;
          Meteor.call('setVisitedTour', "tourActivities", tourIndex, function(err,cb){
          })
          if(e===14){
            Router.go("/placements");
          }

        }
      });
    }
  });
};

Template.jobList.destroyed = function(){
  $("#tourActivities").joyride('destroy');
}
/**
 * Helpers
 */
// Page - Helpers
Template.jobs.helpers({
  isLoading: function () {
    return SubscriptionHandlers.JobHandler.isLoading();
  }
});

// List Header - Helpers
Template.jobListHeader.helpers({
  listViewMode: function () {
    return listViewMode.get();
  }
});

// List Search - Helpers
Template.jobListSearch.helpers({
  showAddButton: function () {
    return (entityId) ? true : false;
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  searchString: function () {
    return query.searchString;
  },
  initialized: function () {
    return initialized.get();
  }
});

// List Sort - Helpers
Template.jobListSort.helpers({
  sortFields: function () {
    return sortFields;
  },

  selectedSort: function () {
    selectedSortDep.depend();
    return selectedSort;
  },

  isFieldSelected: function (field) {
    selectedSortDep.depend();
    return selectedSort && selectedSort.field == field.field;
  },

  isAscSort: function (field) {
    selectedSortDep.depend();
    return field.value == 1;
  }
});

// List Filters - Helpers
Template.jobFilters.helpers({
  jobsCount: function () {
    searchDep.depend();
    if(JobHandler && !JobHandler.isLoading()) {
      return SubscriptionHandlers.JobHandler.totalCount();
    }
    else{
      return 0;
    }
  },
  query: function () {
    return query;
  },
  jobTypes: function () {
    return dType.ObjTypes.find({parent: Enums.objGroupType.job});
  }
});


// List Items - Helpers
Template.jobListItem.events({
  'click .show-placements': function (e) {
    alert(e);
  }
});
Template.jobListItem.helpers({
  listViewMode: function () {
    return listViewMode.get();
  },

  jobIcon: function () {
    return helper.getEntityIcon(this);
  },
  displayObjType: function () {
    return Utils.getJobType(this);
  },
  placements: function () {
    return Placements.find({job: this._id}, {limit: 3, transform: null});
  },
  countPlacements: function () {
    return Placements.find({job: this._id}).count();
  },
  countRequired: function () {
    return this.numberRequired;
  }
});

// Job Information - Helpers
Template.jobInformation.helpers({
  clientName: function () {
    var client = Contactables.findOne(this.client);
    return client && client.displayName;
  },

  departmentName: function () {
    var client = Contactables.findOne(this.client);
    if (client && client.Client) return client.Client.department;
  }
});

/**
 * Events
 */
// List Search - Events
Template.jobListSearch.events = {
  'keyup #searchString': _.debounce(function (e) {
    query.searchString.value = e.target.value;
  }, 200),
  'click .addJob': function (e) {
    Session.set('addOptions', {client: entityId});
    Router.go('/jobAdd/Temporary');
    e.preventDefault();
  },
  'click #toggle-filters': function (e) {
    if ($(e.currentTarget).attr('data-view') == 'normal') {
      $('body .network-content #column-filters').addClass('hidden');
      $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
      $(e.currentTarget).attr('data-view', 'wide');
    }
    else {
      $('body .network-content #column-filters').removeClass('hidden');
      $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
      $(e.currentTarget).attr('data-view', 'normal');
    }
  },
  'click #list-view': function () {
    listViewMode.set(true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
  }
};

// List Sort - Events
Template.jobListSort.events = {
  'click .sort-field': function () {
    setSortField(this);
  }
};