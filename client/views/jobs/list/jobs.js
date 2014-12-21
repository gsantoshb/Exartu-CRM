
var jobCollection = Jobs;
var JobHandler;
var query;

JobsController = RouteController.extend({
  template: 'jobs',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    SubscriptionHandlers.JobHandler = JobHandler = Meteor.paginatedSubscribe('jobs');
    return [JobHandler, Meteor.subscribe('lookUps')];
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

    // Inactive
    var inactiveQuery = { type: Utils.ReactivePropertyTypes.boolean };
    if (this.params.inactives) {
      inactiveQuery.default = !! this.params.inactives;
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
    var statusQuery = {};
    if (this.params.status) {
      statusQuery.default = this.params.status;
    }

    query = new Utils.ObjectDefinition({
      reactiveProps: {
        objType: objTypeQuery,
        searchString: searchStringQuery,
        selectedLimit: creationDateQuery,
        inactives: inactiveQuery,
        mineOnly: mineQuery,
        tags: tagsQuery,
        location: locationQuery,
        status: statusQuery
      }
    });

    this.render('jobs');
  },
  onAfterAction: function() {
    var title = 'My Network',
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

var listViewDefault=Session.get('dashboardListViewMode');
if (!listViewDefault)
{
  listViewDefault=true;
}
var listViewMode = new ReactiveVar(listViewDefault);


Template.jobs.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.jobsCount.value = JobHandler.totalCount();

  return info;
};

Template.jobs.isLoading = function () {
  return JobHandler.isLoading();
}

// List
Template.jobsList.created= function () {
  Meteor.autorun(function () {
    var searchQuery = {
      $and: [] // Push each $or operator here
    };
    var options = {};
    var urlQuery = new URLQuery();

    selectedSortDep.depend();

    // Sort by
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

    //Status / Inactive
    if (! query.inactives.value) {
      var inactiveStatusOR = {
        $or: []
      };
      var activeStatuses;
      var aux;
      _.each(['job'], function(objName){
        activeStatuses = getActiveStatuses(objName);
        if (_.isArray(activeStatuses) && activeStatuses.length > 0){
          aux={};
          aux['status'] = {
            $in: activeStatuses
          };

          inactiveStatusOR.$or.push(aux)
        }
      });
      if (inactiveStatusOR.$or.length > 0)
        searchQuery.$and.push(inactiveStatusOR);
    }

    if (query.inactives.value) {
      urlQuery.addParam('inactives', true);
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

    // Status filter
    if (query.status.value){
      searchQuery.$and.push({status: query.status.value});
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

Template.jobsList.info = function() {
  info.isFiltering.value = jobCollection.find().count() != 0;
  return info;
};

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

Template.jobsListSearch.jobTypes = jobTypes;

getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes["job"];

  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode;
    var implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();

    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
}

var searchFields = ['categoryName', 'industryName', 'durationName', 'statusName', 'publicJobTitle'];

Template.jobsList.jobs = function() {
  return jobCollection.find();
};

Template.jobsList.listViewMode= function() {
  return listViewMode.get();
};
Template.jobsListSearch.listViewMode= function() {
  return listViewMode.get();
};

Template.jobsList.isLoading = function() {
  return SubscriptionHandlers.JobHandler.isLoading();
};

// List search

Template.jobsList.jobTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.job });
};

Template.jobsListSearch.searchString = function() {
  return query.searchString;
};

// List sorting

var selectedSort;
var selectedSortDep = new Deps.Dependency;
var sortFields = [
  {field: 'startDate', displayName: 'Start date'},
  {field: 'endDate', displayName: 'End date'}
];

Template.jobsListSort.sortFields = function() {
  return sortFields;
};

Template.jobsListSort.selectedSort = function() {
  selectedSortDep.depend();
  return selectedSort;
};

Template.jobsListSort.isFieldSelected = function(field) {
  selectedSortDep.depend();
  return selectedSort && selectedSort.field == field.field;
};

Template.jobsListSort.isAscSort = function(field) {
  selectedSortDep.depend();
  return field.value == 1;
};

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

Template.jobsListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};

Template.jobsListSearch.events = {
  'click #list-view': function () {
    listViewMode.set(true);
    Session.set('dashboardListViewMode',true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('dashboardListViewMode',false);
  }
};



// List filters

Template.jobsFilters.query = function () {
  return query;
};

Template.jobsFilters.jobTypes = jobTypes;

// Item

Template.jobsListItem.pictureUrl = function(pictureFileId) {
  var picture = JobsFS.findOne({_id: pictureFileId});
  return picture? picture.url('JobsFSThumbs') : undefined;
};

Template.jobsListItem.jobIcon = function() {
  return helper.getEntityIcon(this);
};

Template.jobsListItem.displayObjType = function() {
  return Utils.getJobType(this);
};

Template.jobsListItem.placements = function () {
  return Placements.find({job: this._id}, { limit: 3, transform: null});
};

Template.jobsListItem.getEmployeeDisplayName = function () {
  var employee = Contactables.findOne(this.employee);
  return employee ? employee.displayName : 'Employee information not found!';
};

Template.jobInformation.customerName = function () {
  var customer =  Contactables.findOne(this.customer);
  return customer && customer.displayName;
};

Template.jobsListItem.countPlacements = function () {
  return Placements.find({job: this._id}).count();
};

Template.jobsListItem.morePlacements = function () {
  return Placements.find({job: this._id}).count() > 3;
};