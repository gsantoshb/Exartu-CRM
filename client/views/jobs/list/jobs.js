/**
 * Variables
 */
var jobCollection = Jobs;
var JobHandler;
var query;

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

var listViewDefault = Session.get('jobListViewMode');
if (!listViewDefault) { listViewDefault = false; }

var listViewMode = new ReactiveVar(listViewDefault);

var locationFields = ['address', 'city', 'state', 'country'];

var getLocationTagValue = function(locationField, locationFields) {
  var regex = new RegExp('(?:'+ locationField + ':)((?!'+ locationFields.filter(function(field) {
    return field != locationField;
  }).map(function(field){
    return field + ':';
  }).join('|') +').)*', 'ig');
  var match = regex.exec(query.location.value);
  var value;
  if (match)
    value = match[0].substring(locationField.length + 1).trim();

  return value;
};

var jobTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.job });
};

var searchFields = ['jobTitle', 'publicJobTitle'];

// List sorting
var selectedSort;
var selectedSortDep = new Deps.Dependency;
var sortFields = [
  {field: 'startDate', displayName: 'Start date'},
  {field: 'endDate', displayName: 'End date'},
  {field: 'dateCreated', displayName: 'Date created'}
];

var setSortField = function(field) {
  if (selectedSort && selectedSort.field == field.field) {
    if (selectedSort.value == 1)
      selectedSort = undefined;
    else
      selectedSort.value = 1;
  } else {
    selectedSort = field;
    selectedSort.value = -1;
  }
  selectedSortDep.changed();
};

/**
 * Controller
 */
JobsController = RouteController.extend({
  template: 'jobs',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.JobHandler){
      SubscriptionHandlers.JobHandler = Meteor.paginatedSubscribe('jobs');
    }
    JobHandler = SubscriptionHandlers.JobHandler;

    return [SubscriptionHandlers.JobHandler, Meteor.subscribe('lookUps')];
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    if (this.isFirstRun == false) {
      this.render();
      return;
    }

    var objTypeQuery = {};
    var type = this.params.hash || this.params.type;
    if (type != undefined && type != 'all') {
      var re = new RegExp("^" + type + "$", "i");
      var objType = dType.ObjTypes.findOne({
        name: re
      });
      objTypeQuery.default = objType.name;
      info.objType.value = objType.name+'s';
    } else {
      objTypeQuery.default  = undefined;
      info.objType.value = 'record(s)';
    }

    // Search string
    var searchStringQuery = {};
    if (this.params.search) {
      searchStringQuery.default = this.params.search;
    }

    // CreationDate
    var creationDateQuery = {};
    if (this.params.creationDate) {
      creationDateQuery.default = this.params.creationDate;
    }

    // Mine only
    var mineQuery = { type: Utils.ReactivePropertyTypes.boolean };
    if (this.params.mine) {
      mineQuery.default = !! this.params.mine;
    }

    // Tags
    var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
    if (this.params.tags) {
      tagsQuery.default = this.params.tags.split(',');
    }

    // Location
    var locationQuery =  {};
    if (this.params.address) {
      locationQuery.default = ' address: ' + this.params.address;
    }
    if (this.params.city) {
      locationQuery.default = locationQuery.default || '';
      locationQuery.default += ' city: ' + this.params.city;
    }
    if (this.params.state) {
      locationQuery.default = locationQuery.default || '';
      locationQuery.default += ' state: ' + this.params.state;
    }
    if (this.params.country) {
      locationQuery.default = locationQuery.default || '';
      locationQuery.default += ' country: ' + this.params.country;
    }

    // Status
    var statusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (this.params.status) {
      statusQuery.default = this.params.status;
    }

    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (this.params.activeStatus) {
      activeStatusQuery.default = this.params.activeStatus.split(',');
    }
    else
    {
      activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    };

    query = new Utils.ObjectDefinition({
      reactiveProps: {
        objType: objTypeQuery,
        searchString: searchStringQuery,
        selectedLimit: creationDateQuery,
        activeStatus:activeStatusQuery,
        mineOnly: mineQuery,
        tags: tagsQuery,
        location: locationQuery,
        status: statusQuery
      }
    });

    this.render('jobs');
  },
  onAfterAction: function() {
    var title = 'Jobs',
      description = 'All your contacts are here';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

/**
 * Callbacks
 */
Template.jobList.created = function () {
  Meteor.autorun(function () {
    var searchQuery = {
      $and: [] // Push each $or operator here
    };
    var options = {};
    var urlQuery = new URLQuery();

    selectedSortDep.depend();

    // Sort
    if (selectedSort) {
      options.sort = {};
      options.sort[selectedSort.field] = selectedSort.value;
    } else {
      delete options.sort;
    }

    // Type
    if (query.objType.value) {
      searchQuery.$and.push({objNameArray: query.objType.value});
      urlQuery.addParam('type', query.objType.value);
    }

    // Creation date
    if (query.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.$and.push({
        dateCreated: {
          $gte: dateLimit.getTime() - query.selectedLimit.value
        }});
      urlQuery.addParam('creationDate', query.selectedLimit.value);
    }




    //Created by
    if (query.mineOnly.value) {
      searchQuery.$and.push({userId: Meteor.userId()});
      urlQuery.addParam('mine', true);
    }

    // Tags
    if (query.tags.value.length > 0) {
      searchQuery.$and.push({tags: {
        $in: query.tags.value
      }});
      urlQuery.addParam('tags', query.tags.value);
    }

    // Location filter
    var locationOperatorMatch = false;
    if (query.location.value) {
      _.forEach(locationFields, function(locationField) {
        var value = getLocationTagValue(locationField, locationFields);

        if (value) {
          locationOperatorMatch = true;
          searchQuery['location.' + locationField] = {
            $regex: value,
            $options: 'i'
          };
          urlQuery.addParam(locationField, value);
        }
      });
    }

    // If not location operator match is used then search on each field
    if (query.location.value && !locationOperatorMatch) {
      var locationOR = {
        $or: []
      };
      _.forEach(locationFields, function(locationField) {
        var aux = {};
        aux['location.' + locationField] = {
          $regex: query.location.value,
          $options: 'i'
        };
        locationOR.$or.push(aux);
      });
      if (locationOR.$or.length > 0)
        searchQuery.$and.push(locationOR);
    }

    if (!_.isEmpty(query.activeStatus.value)){
      searchQuery.activeStatus={$in: query.activeStatus.value};

      urlQuery.addParam('activeStatus', query.activeStatus.value);
    }

    if (!_.isEmpty(query.status.value)){
      searchQuery.status={$in: query.status.value};

      urlQuery.addParam('status', query.status.value);
    }

    if (searchQuery.$and.length == 0)
      delete searchQuery.$and;

    // String search
    if (query.searchString.value) {
      var stringSearches=[];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: query.searchString.value,
          $options: 'i'
        };
        stringSearches.push(aux);
      });

      urlQuery.addParam('search', query.searchString.value);

      // Search customer using search string in server side and return customers' ids
      // TODO: find another way to do this kind of search to avoid nested calls
      Meteor.call('findCustomer', query.searchString.value, function (err, result) {
        if (!err)
          stringSearches.push({
            customer: {
              $in: _.map(result, function (customer) {
                return customer._id;
              })
            }
          });

        searchQuery.$and.push({
          $or: stringSearches
        });

        JobHandler.setFilter(searchQuery);
      });
    }
    else {
      if (selectedSort){
        JobHandler.setOptions(options);
      }
      JobHandler.setFilter(searchQuery);
    }

    // Set url query
    urlQuery.apply();
  })
};

Template.jobList.rendered = function() {
  /**
   * @todo review code, this ia a small hack to make ti work.
   * This particular plugin doesn't seem to behave quite right if you initialize it more than once so we're doing it on each first click event.
   */
  $(document).on('click', 'button[data-toggle="popover"]', function(e) {
    var object = e.currentTarget;
    if( $(object).attr('data-init') == 'off' ){
      $(object).popover('show');
      $(object).attr('data-init', 'on');
    }
  });
};
/**
 * Helpers
 */
// Page - Helpers
Template.jobs.helpers({
  isLoading: function () {
    return JobHandler.isLoading();
  }
});

// List Header - Helpers
Template.jobListHeader.helpers({
  listViewMode:  function() {
    return listViewMode.get();
  }
});

// List Search - Helpers
Template.jobListSearch.helpers({
  jobTypes: jobTypes,
  listViewMode:  function() {
    return listViewMode.get();
  },
  searchString: function() {
    return query.searchString;
  }
});

// List Sort - Helpers
Template.jobListSort.helpers({
  sortFields: function() {
    return sortFields;
  },

  selectedSort: function() {
    selectedSortDep.depend();
    return selectedSort;
  },

  isFieldSelected: function(field) {
    selectedSortDep.depend();
    return selectedSort && selectedSort.field == field.field;
  },

  isAscSort: function(field) {
    selectedSortDep.depend();
    return field.value == 1;
  }
});

// List Filters - Helpers
Template.jobFilters.helpers({
  information: function() {
    var searchQuery = {};

    if (query.objType.value)
      searchQuery.objNameArray = query.objType.value;

    info.jobsCount.value = JobHandler.totalCount();

    return info;
  },
  query: function () {
    return query;
  },
  jobTypes: jobTypes
});

// List - Helpers
Template.jobList.helpers({
  info: function() {
    info.isFiltering.value = jobCollection.find().count() != 0;
    return info;
  },
  listViewMode: function() {
    return listViewMode.get();
  },
  jobs: function() {
    return jobCollection.find();
  },
  isLoading: function() {
    return SubscriptionHandlers.JobHandler.isLoading();
  },
  jobTypes: function() {
    return dType.ObjTypes.find({ parent: Enums.objGroupType.job });
  }
});

// List Items - Helpers
Template.jobListItem.helpers({
  listViewMode: function() {
    return listViewMode.get();
  },
  pictureUrl: function(pictureFileId) {
    var picture = JobsFS.findOne({_id: pictureFileId});
    return picture? picture.url('JobsFSThumbs') : undefined;
  },
  jobIcon: function() {
    return helper.getEntityIcon(this);
  },
  displayObjType: function() {
    return Utils.getJobType(this);
  },
  placements: function () {
    return Placements.find({job: this._id}, { limit: 3, transform: null});
  },
  getEmployeeDisplayName: function () {
    var employee = Contactables.findOne(this.employee);
    return employee ? employee.displayName : 'Employee information not found!';
  },
  customerName: function () {
    var customer =  Contactables.findOne(this.customer);
    return customer && customer.displayName;
  },
  countPlacements: function () {
    return Placements.find({job: this._id}).count();
  },
  morePlacements: function () {
    return Placements.find({job: this._id}).count() > 3;
  }
});

// Job Information - Helpers
Template.jobInformation.helpers({
  customerName: function () {
    var customer =  Contactables.findOne(this.customer);
    return customer && customer.displayName;
  },

  departmentName: function () {
    var customer =  Contactables.findOne(this.customer);
    if ( customer && customer.Customer) return customer.Customer.department;
  }
});

/**
 * Events
 */
// List Search - Events
Template.jobListSearch.events = {
  'click #toggle-filters': function(e){
    if( $(e.currentTarget).attr('data-view') == 'normal' ){
      $('body .network-content #column-filters').addClass('hidden');
      $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
      $(e.currentTarget).attr('data-view', 'wide');
    }
    else{
      $('body .network-content #column-filters').removeClass('hidden');
      $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
      $(e.currentTarget).attr('data-view', 'normal');
    }
  },
  'click #list-view': function () {
    listViewMode.set(true);
    Session.set('jobListViewMode',true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('jobListViewMode',false);
  }
};

// List Sort - Events
Template.jobListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};