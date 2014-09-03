var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  inactives: false,
  limit: 20
}));

MatchupsController = RouteController.extend({
  template: 'matchups',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, MatchupHandler, MatchupHandler];
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
    this.render('matchups');
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
var searchFields = ['jobDisplayName','employeeDisplayName','customerDisplayName'];

var timeLimits = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    matchupsCount: {},
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
    }
  }
});

Template.matchupsBox.created = function(){
  query.limit.value = 20
}
// List

Template.matchupsList.info = function() {
  info.isFiltering.value = Matchups.find().count() != 0;
  return info;
};

var matchupTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.matchup });
};
Template.matchupsListSearch.matchupTypes = matchupTypes;



var searchDep = new Deps.Dependency;
var isSearching = false;
Template.matchupsBox.isSearching = function() {
  searchDep.depend();
  return isSearching;
}

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes["matchup"];

  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode;
    var implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();

    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
}
Template.matchupsList.matchups = function() {
  var searchQuery = {};
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
    searchQuery.$or=[];
    var activeStatuses;
    var aux;
    _.each(['matchup'], function(objName){
      activeStatuses = getActiveStatuses(objName);
      if (_.isArray(activeStatuses) && activeStatuses.length > 0){
        aux={};
        aux['status'] = {
          $in: activeStatuses
        };

        searchQuery.$or.push(aux)
      }
    })
  }

  if (query.tags.value.length > 0) {
    searchQuery.tags = {
      $in: query.tags.value
    };
  }

  var matchups = Matchups.find(searchQuery, {limit: query.limit.value});


  return matchups;
};

// All

Template.matchupsBox.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.matchupsCount.value = Matchups.find(searchQuery).count();

  return info;
};

Template.matchupsBox.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

// List search

Template.matchupsList.matchupTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.matchup });
};

Template.matchupsListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.matchupsFilters.query = function () {
  return query;
};

Template.matchupsFilters.matchupTypes2 = matchupTypes;

Template.matchupsFilters.recentOptions = function() {
  return timeLimits;
};

Template.matchupsFilters.typeOptionClass = function(option) {
  return query.objType.value == option.name? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';

};


Template.matchupsFilters.recentOptionClass = function(option) {
  return query.selectedLimit.value == option? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';
};

Template.matchupsFilters.tags = function() {
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

Template.matchupsFilters.events = {
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
Template.matchupsListItem.pictureUrl = function(pictureFileId) {
  var picture = MatchupsFS.findOne({_id: pictureFileId});
  return picture? picture.url('MatchupsFSThumbs') : undefined;
};

Template.matchupsListItem.matchupIcon = function() {
  return helper.getEntityIcon(this);
};

Template.matchupsListItem.displayObjType = function() {
  return Utils.getMatchupType(this);
};


// Google analytic

_.forEach(['matchupInformation'],
  function(templateName){
    Template[templateName]._events = Template[templateName]._events || [];
    Template[templateName]._events.push({
      events: 'click',
      handler: function() {
        GAnalytics.event("/matchups", "quickAccess", templateName);
      }
    });
  });

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};