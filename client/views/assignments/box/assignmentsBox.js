var entityType=null;
var isEntitySpecific=false;
var contactable;

var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  inactives: false,
  limit: 20
}));

PlacementsController = RouteController.extend({
  template: 'placements',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, PlacementHandler, PlacementHandler];
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
    this.render('placements');
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

Template.placementsBox.created = function(){
  query.limit.value = 20;
  console.log('placementsbox created', Utils.getEntityTypeFromRouter());
  var entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
  if (entityType != null) {
    isEntitySpecific = true;
    if (entityType == Enums.linkTypes.contactable.value) {
      contactable = Contactables.findOne({_id: entityId});
    }
  }
}
// List

Template.placementsList.info = function() {
  info.isFiltering.value = Placements.find().count() != 0;
  return info;
};

var placementTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.placement });
};


var searchDep = new Deps.Dependency;
var isSearching = false;
Template.placementsBox.isSearching = function() {
  searchDep.depend();
  return isSearching;
}

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes["placement"];

  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode;
    var implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();

    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
}
Template.placementsList.placements = function() {
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
    _.each(['placement'], function(objName){
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

  var placements = Placements.find(searchQuery, {limit: query.limit.value});


  return placements;
};

// All

Template.placementsBox.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.placementsCount.value = Placements.find(searchQuery).count();

  return info;
};

Template.placementsBox.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

// List search

Template.placementsList.placementTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.placement });
};

Template.placementsListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.placementsFilters.query = function () {
  return query;
};

Template.placementsFilters.placementTypes2 = placementTypes;

Template.placementsFilters.recentOptions = function() {
  return timeLimits;
};

Template.placementsFilters.typeOptionClass = function(option) {
  return query.objType.value == option.name? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';

};


Template.placementsFilters.recentOptionClass = function(option) {
  return query.selectedLimit.value == option? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';
};

Template.placementsFilters.tags = function() {
  return query.tags;
};

Template.placementsListSearch.isJob=function() {
  console.log('isjob',entityType);
  if (entityType==Enums.linkTypes.job.value) return true;
};
Template.placementsListSearch.events = {
  'click .addPlacement': function (e) {
    Session.set('addOptions', {job: Session.get('entityId')});
    Router.go('/placementAdd/placement');
    e.preventDefault();
  }
}

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

Template.placementsFilters.events = {
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
Template.placementsListItem.pictureUrl = function(pictureFileId) {
  var picture = PlacementsFS.findOne({_id: pictureFileId});
  return picture? picture.url('PlacementsFSThumbs') : undefined;
};

Template.placementsListItem.placementIcon = function() {
  return helper.getEntityIcon(this);
};

Template.placementsListItem.displayObjType = function() {
  return Utils.getPlacementType(this);
};


// Google analytic

_.forEach(['placementInformation'],
  function(templateName){
    Template[templateName]._events = Template[templateName]._events || [];
    Template[templateName]._events.push({
      events: 'click',
      handler: function() {
        GAnalytics.event("/placements", "quickAccess", templateName);
      }
    });
  });

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};