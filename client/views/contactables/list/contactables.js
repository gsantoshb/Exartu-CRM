var AuxContactablesHandler;

var query = {};

ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    //if (!SubscriptionHandlers.AuxContactablesHandler) {
    //  SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables');
    //}
    //AuxContactablesHandler = SubscriptionHandlers.AuxContactablesHandler;
    return [Meteor.subscribe('allPlacements')];
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

    // Status
    var statusQuery = { type: Utils.ReactivePropertyTypes.boolean };
    if (this.params.inactives) {
      statusQuery.default = !! this.params.inactives;
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

    // Employee's placements status
    var placementStatusQuery = {};
    if (type == 'Employee' && this.params.placementStatus) {
      placementStatusQuery.default = this.params.placementStatus.split(',');
    }

    query = new Utils.ObjectDefinition({
      reactiveProps: {
        objType: objTypeQuery,
        searchString: searchStringQuery,
        selectedLimit: creationDateQuery,
        inactives: statusQuery,
        mineOnly: mineQuery,
        tags: tagsQuery,
        location: locationQuery,
        candidateStatus: placementStatusQuery
      }
    });

    runESComputation();

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
    },
    isLoading: {
      default: false
    }
  }
});

// All

Template.contactables.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  var contactableCount = Session.get('contactableCount');
  if (contactableCount)
    info.contactablesCount.value = contactableCount;

  return info;
};

Template.contactablesList.isLoading = function () {
  return SubscriptionHandlers.AuxContactablesHandler.isLoading();
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

Template.contactables.isESSearch = function() {
  return !_.isEmpty(query.searchString.value);
};

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
  Meteor.autorun(function(c) {
    var urlQuery = new URLQuery();
    var searchQuery = {
      $and: [] // Push each $or operator here
    };

    // Search string
    if (query.searchString.value) {
      urlQuery.addParam('search', query.searchString.value);
    }

    // Type
    if (query.objType.value) {
      searchQuery.objNameArray = query.objType.value;
      urlQuery.addParam('type', query.objType.value);
    }

    // Creation date
    if (query.selectedLimit.value) {
      var dateLimit = new Date();
      searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
      };
      urlQuery.addParam('creationDate', query.selectedLimit.value);
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
      if (inactiveStatusOR.$or.length > 0)
        searchQuery.$and.push(inactiveStatusOR);
    }

    if (query.inactives.value) {
      urlQuery.addParam('inactives', true);
    }

    // Created by
    if (query.mineOnly.value) {
      searchQuery.userId = Meteor.userId();
      urlQuery.addParam('mine', true);
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

    // Tags filter
    if (query.tags.value.length > 0) {
      searchQuery.tags = {
        $in: query.tags.value
      };
      urlQuery.addParam('tags', query.tags.value);
    }

    if (searchQuery.$and.length == 0)
      delete searchQuery.$and;

    if (!_.isEmpty(query.candidateStatus.value)){
      searchQuery._id = {$in:_.map(AllPlacements.find({candidateStatus: {$in: query.candidateStatus.value }}).fetch(), function(placement){return placement.employee})}
      urlQuery.addParam('placementStatus', query.candidateStatus.value);
    }

    // Set url query
    urlQuery.apply();

    // HACK: Elasticsearch is used when searching with string, so is not necessary to set a new filter
    if (query.searchString.value) return;

    if (! SubscriptionHandlers.AuxContactablesHandler) {
      SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables', {filter: searchQuery});
    } else {
      SubscriptionHandlers.AuxContactablesHandler.setFilter(searchQuery);
    }
  });

  Meteor.autorun(function () {
    Session.set('contactableCount', SubscriptionHandlers.AuxContactablesHandler.totalCount());
  });
};

Template.contactablesList.contactables = function() {
  // Dependencies
  esDep.depend();

  // Elasitsearch
  if (!_.isEmpty(query.searchString.value)) {
    //urlQuery.push('type=' + query.objType.value);
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

var runESComputation = function () {
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
};

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