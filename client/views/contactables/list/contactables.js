
var AuxContactablesHandler;
ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.AuxContactablesHandler) {
      SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables');
    }
    AuxContactablesHandler = SubscriptionHandlers.AuxContactablesHandler;
    return [AuxContactablesHandler];
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
    this.render('contactables');
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
    contactablesCount: {},
    objType: {},
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
    mineOnly: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    selectedLimit: {},
    tags: {
      type: Utils.ReactivePropertyTypes.array,
      default: []
    },
    limit: {},
    location: {},
    candidateStatus: {}
  }
});

// All

Template.contactables.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.contactablesCount.value = AuxContactablesHandler.totalCount();

  return info;
};

Template.contactables.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

Template.contactables.created = function(){
  query.limit.value = 20
};

Template.contactables.isLoading = function () {
  return AuxContactablesHandler.isLoading();
};

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.contactables.isSearching = function() {
  searchDep.depend();
  return isSearching;
};

Template.contactables.events({
  'click .parseText': function () {
    Utils.showModal('textParser');
  }
});



// List

var contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes[objName.toLowerCase()];
  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode,
      implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();
    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
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

Template.contactablesList.info = function() {
  info.isFiltering.value = AuxContactables.find().count() != 0;
  return info;
};

Template.contactablesList.created = function() {
  Meteor.autorun(function() {
    var searchQuery = {
      $and: [] // Push each $or operator here
    };

    // Type
    if (query.objType.value)
      searchQuery.objNameArray = query.objType.value;

    // Creation date
    if (query.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
      };
    }

    // Status / Inactive
    if (! query.inactives.value) {
      var inactiveStatusOR = {
        $or: []
      };
      var activeStatuses;
      var aux;
      _.each(['Employee', 'Contact', 'Customer'], function(objName){
        activeStatuses = getActiveStatuses(objName);
        if (_.isArray(activeStatuses) && activeStatuses.length > 0){
          aux={};
          aux[objName + '.status'] = {
            $in: activeStatuses
          };
          inactiveStatusOR.$or.push(aux)
        }
      });
      searchQuery.$and.push(inactiveStatusOR);
    }

    // Created by
    if (query.mineOnly.value) {
      searchQuery.userId = Meteor.userId();
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

    // Tags filter
    if (query.tags.value.length > 0) {
      searchQuery.tags = {
        $in: query.tags.value
      };
    }

    if (searchQuery.$and.length == 0)
      delete searchQuery.$and;

    if (!_.isEmpty(query.candidateStatus.value)){
      searchQuery._id = {$in:_.map(Placements.find({candidateStatus: {$in: query.candidateStatus.value }}).fetch(), function(placement){return placement.employee})}
    }
    AuxContactablesHandler.setFilter(searchQuery);
  });
};

Template.contactablesList.contactables = function() {
  // Dependencies
  esDep.depend();

  // Elasitsearch
  if (!_.isEmpty(query.searchString.value)) {
    return esResult;
  }

  // Hack: in the contactables collection coexists the regular contactables and the contact's customer
  // which I loaded using the contactables view in the server.
  // The problem is that those customer should not be listed since they do not belong to this page
  // to fix that I toke advantage of the fact that those customer 'have less fields',
  // that's wy I'm filtering out the one that don't have hierId.
  // A possible solution could be to use 2 collections in the client
  //return Contactables.find({hierId: {$exists: true}});

  return AuxContactables.find();
};

Template.contactablesList.contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};

// Elasticsearch

var esDep = new Deps.Dependency;
var esResult = [];

Meteor.autorun(function() {
  if (_.isEmpty(query.searchString.value))
    return;

  query.searchString.dep.depend();

  // Process filters
  var filters = {
    bool: {
      must: [],
      should: []
    }
  };

  // Contactable type
  if (query.objType.value)
    filters.bool.must.push({term: {objNameArray: [query.objType.value.toLowerCase()]}});

  // Tags
  if (query.tags.value.length > 0) {
    var tags = {or: []};
    _.forEach(query.tags.value, function(tag) {
      tags.or.push({term: {tags: tag}});
    });
    filters.bool.must.push(tags);
  }

  // Only recent filters
  if (query.selectedLimit.value) {
    var now = new Date();
    filters.bool.must.push({range: {dateCreated: {gte: moment(new Date(now.getTime() - query.selectedLimit.value)).format("YYYY-MM-DDThh:mm:ss")}}});
  }

  // Include inactives
  if (!query.inactives.value) {
    var activeStatusFilter = {or: []}; 
    var activeStatuses;
    _.each(['Employee','Contact', 'Customer'], function(objName){
      activeStatuses = getActiveStatuses(objName);
      _.forEach(activeStatuses, function(activeStatus) {
        var statusFilter = {};
        statusFilter[objName + '.status'] = activeStatus.toLowerCase();
        activeStatusFilter.or.push({term: statusFilter});
      })
    });
    filters.bool.must.push(activeStatusFilter);
  }

  // Created by
  if (query.mineOnly.value) {
    filters.bool.must.push({term: {userId: Meteor.userId()}});
  }

  // Location filter
  var locationOperatorMatch = false;
  if (query.location.value) {
    _.forEach(locationFields, function(locationField) {
      var value = getLocationTagValue(locationField, locationFields);

      if (value) {
        locationOperatorMatch = true;
        var aux = { regexp: {}};
        aux.regexp['location.' + locationField] = '.*' + value + '.*';
        filters.bool.must.push(aux); 
      }
    });
  }

  // If not location operator match is used then search on each field
  if (query.location.value && !locationOperatorMatch) {
    _.forEach(locationFields, function(locationField) {
      var aux = { regexp: {}};
      aux.regexp['location.' + locationField] = '.*' + query.location.value + '.*';
      filters.bool.should.push(aux); 
    });
  }

  isSearching = true;
  searchDep.changed();

  Contactables.esSearch('.*' + query.searchString.value + '.*', filters,function(err, result) {
    if (!err) {
      esResult = _.map(result.hits, function(hit) {
        var contactable = Contactables._transform(hit._source);
        contactable._match = {
          score: (hit._score / result.max_score) * 100,
          properties: _.map(hit.highlight, function(matchedProperty, propertyName) {
            return propertyName;
          }),
          contexts: _.flatten(_.map(hit.highlight, function(matchedProperty, propertyName) {
            return matchedProperty;
          }))
        };
        return contactable;
      });
      esDep.changed();
      isSearching = false;
      searchDep.changed();
    } else
      console.log(err)
  });
});

// List search

Template.contactablesListSearch.contactableTypes = contactableTypes;

Template.contactablesListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.contactablesFilters.query = function () {
  return query;
};

Template.contactablesFilters.isSelectedType = function(typeName){
  return query.objType.value == typeName;
};

Template.contactablesFilters.contactableTypes = contactableTypes;

// Item

Template.contactablesListItem.pictureUrl = function(pictureFileId) {
  var picture = ContactablesFS.findOne({_id: pictureFileId});
  return picture? picture.url('ContactablesFSThumbs') : undefined;
};

Template.contactablesListItem.contactableIcon = function() {
  return helper.getEntityIcon(this);
};

Template.contactablesListItem.displayObjType = function() {
  return Utils.getContactableType(this);
};

Template.contactablesListItem.isESSearch = function() {
  return !_.isEmpty(query.searchString.value);
};

// Employee item

Template.employeeInformation.placementInfo = function () {
  if (!this.placement)
    return undefined;

  var placementInfo = {};
  var placement = Placements.findOne({_id: this.placement});

  var job = Jobs.findOne({
    _id: placement.job
  }, {
    transform: null
  });

  var customer = Contactables.findOne({_id: job.customer}, {transform: null});

  placementInfo.job = job._id;
  placementInfo.jobTitle = job.publicJobTitle;
  if (customer) {
    placementInfo.customerName = customer.organization.organizationName;
    placementInfo.customer = customer._id;
  }

  return placementInfo;
};

// Elasticsearch context match template

Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};