var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  inactives: false,
  limit: 20
}));

JobsController = RouteController.extend({
  template: 'jobs',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, JobHandler, PlacementHandler, LookUpsHandler];
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
    var type = this.params.hash || this.params.type;
    if (type != undefined && type != 'all') {
      var re = new RegExp("^" + type + "$", "i");
      var objType = dType.ObjTypes.findOne({
        name: re
      });
      query.objType.value = objType.name;
      info.objType.value = objType.name+'s';
    } else {
      query.objType.value = undefined;
      info.objType.value = 'record(s)';
    }
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
var searchFields = ['categoryName', 'industryName', 'durationName', 'statusName', 'publicJobTitle'];
var timeLimits = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    jobsCount: {},
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
    objType: {},
    inactives: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    onlyRecents: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    selectedLimit: {
      default: timeLimits.day
    },
    tags: {
      type: Utils.ReactivePropertyTypes.array,
      default: []
    },
    limit: {
      default: 15
    },
    location: {},
  }
});

Template.jobs.created = function(){
  query.limit.value = 20
}
// List

Template.jobsList.info = function() {
  info.isFiltering.value = Jobs.find().count() != 0;
  return info;
};

var jobTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.job });
};
Template.jobsListSearch.jobTypes = jobTypes;

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

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.jobs.isSearching = function() {
  searchDep.depend();
  return isSearching;
}

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes["job"];

  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode;
    var implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();

    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
}
Template.jobsList.jobs = function() {
  var searchQuery = {
    $and: [] // Push each $or operator here
  };

  searchDep.depend();

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

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


  if (query.onlyRecents.value) {
    var dateLimit = new Date();
    searchQuery.dateCreated = {
      $gte: dateLimit.getTime() - query.selectedLimit.value
    };
  }

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
    })
    searchQuery.$and.push(inactiveStatusOR);
  }

  if (query.tags.value.length > 0) {
    searchQuery.tags = {
      $in: query.tags.value
    };
  }

  // Location filter
  var locationOperatorMatch = false;
  if (query.location.value) {
    _.forEach(locationFields, function(locationField) {
      var value = getLocationTagValue(locationField, locationFields);

      if (value) {
        locationOperatorMatch = true;
        var aux = { term: {}};
        searchQuery['location.' + locationField] = {
          $regex: value,
          $options: 'i'
        };
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
    searchQuery.$and.push(locationOR);
  }

  if (searchQuery.$and.length == 0)
    delete searchQuery.$and;

  var jobs = Jobs.find(searchQuery, {limit: query.limit.value});

  return jobs;
};

// All

Template.jobs.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.jobsCount.value = Jobs.find(searchQuery).count();

  return info;
};

Template.jobs.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

// List search

Template.jobsList.jobTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.job });
};

Template.jobsListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.jobsFilters.query = function () {
  return query;
};

Template.jobsFilters.jobTypes2 = jobTypes;

Template.jobsFilters.recentOptions = function() {
  return timeLimits;
};

Template.jobsFilters.typeOptionClass = function(option) {
  return query.objType.value == option.name? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';

};


Template.jobsFilters.recentOptionClass = function(option) {
  return query.selectedLimit.value == option? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';
};

Template.jobsFilters.tags = function() {
  return query.tags;
};

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(query.tags.value, inputTag.value) != -1)
    return;

  query.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

Template.jobsFilters.events = {
  'click .add-tag': function() {
    addTag();
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function() {
    query.tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  },
  'click #recent-day': function(e) {
    query.selectedLimit.value = timeLimits.day;
  },
  'click #recent-week': function(e) {
    query.selectedLimit.value = timeLimits.week;
  },
  'click #recent-month': function(e) {
    query.selectedLimit.value = timeLimits.month;
  },
  'click #recent-year': function(e) {
    query.selectedLimit.value = timeLimits.year;
  },
  'click .typeSelect': function(e) {
    if (query.objType.value == this.name){
      query.objType.value= null;
    }else{
      query.objType.value= this.name;
    }
  }
};

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


// Google analytic

_.forEach(['jobInformation'],
  function(templateName){
    Template[templateName]._events = Template[templateName]._events || [];
    Template[templateName]._events.push({
      events: 'click',
      handler: function() {
        GAnalytics.event("/jobs", "quickAccess", templateName);
      }
    });
  });

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};