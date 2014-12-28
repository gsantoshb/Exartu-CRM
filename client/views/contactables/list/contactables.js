var query = {};
var selected = undefined;

ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    SubscriptionHandlers.AuxContactablesHandler = Meteor.paginatedSubscribe('auxContactables');
    return [SubscriptionHandlers.AuxContactablesHandler];
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
      var objType = dType.ObjTypes.findOne({
        name: type
      });
      objTypeQuery.default = objType.name;
      info.objType.value = objType.name + 's';
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

    var taxIdQuery={};
    if (this.params.taxId){
      taxId.default= this.params.taxId;
    }

    // Employee's placements status
    var placementStatusQuery = { type: Utils.ReactivePropertyTypes.array };
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
        candidateStatus: placementStatusQuery,
        taxId: taxIdQuery
      }
    });

    runESComputation();

    selected = new ReactiveVar([]);

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

Template.contactables.helpers({
  information: function() {
    var searchQuery = {};

    if (query.objType.value)
      searchQuery.objNameArray = query.objType.value;

    var contactableCount = Session.get('contactableCount');
    if (contactableCount)
      info.contactablesCount.value = contactableCount;

    return info;
  },
  isSearching: function() {
    searchDep.depend();
    return isSearching;
  }
});

var searchDep = new Deps.Dependency;
var isSearching = false;

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
var getAllStatuses = function(objName){
  var status = Enums.lookUpTypes[objName.toLowerCase()];
  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode, 
        implyAll = LookUps.find({lookUpCode: lookUpCodes}).fetch();
    return _.map(implyAll ,function(doc){ return doc._id});
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

var clickedAllSelected = new ReactiveVar(false);

var listViewDefault=Session.get('contactableListViewMode');
if (!listViewDefault)
{
  listViewDefault=false;
}
var listViewMode = new ReactiveVar(listViewDefault);
var options = {};
Template.contactablesList.created = function() {
  Meteor.autorun(function(c) {
    var urlQuery = new URLQuery();
    var searchQuery = {
      $and: [] // Push each $or operator here
    };
    var clientParams = {};

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

    if (query.taxId.value){
      var taxIdOR = {
        $or: []
      };
      var aux={};
      aux['taxId']=query.taxId.value;
      taxIdOR.$or.push(aux );
      aux['taxId']={$regex: '([0-9]{5})([' + query.taxId.value + ']{4})' , $options: 'i'};
      taxIdOR.$or.push(aux );
      var aux={};
      aux['contactMethods']={$elemMatch: {value: {$regex:query.taxId.value,$options:'i'}}}
      taxIdOR.$or.push(aux );
      searchQuery.$and.push(taxIdOR);

    }

    if (searchQuery.$and.length == 0)
      delete searchQuery.$and;

    if (query.objType.value == 'Employee' && !_.isEmpty(query.candidateStatus.value)){
      clientParams.placementStatus = query.candidateStatus.value;
      urlQuery.addParam('placementStatus', query.candidateStatus.value);
    }

    // Set url query
    urlQuery.apply();

    // Avoid update handler's filter when an Elasticsearch query will be performed
    if (query.searchString.value) return;
    if (selectedSort.get()) {
      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }

    if (SubscriptionHandlers.AuxContactablesHandler) {
      SubscriptionHandlers.AuxContactablesHandler.setFilter(searchQuery, clientParams);
      SubscriptionHandlers.AuxContactablesHandler.setOptions(options);
    }
    else
      SubscriptionHandlers.AuxContactablesHandler =
          Meteor.paginatedSubscribe('auxContactables', {filter: searchQuery, params: clientParams,options:options});
  });

  Meteor.autorun(function () {
    // If Elasticsearch is being used to search then use its result length as contactableCount
    if (query.searchString.value)
      Session.set('contactableCount', esResult.length);
    else
      Session.set('contactableCount', SubscriptionHandlers.AuxContactablesHandler.totalCount());
  });
};

Template.contactablesList.helpers({
  isLoading: function () {
     return SubscriptionHandlers.AuxContactablesHandler? SubscriptionHandlers.AuxContactablesHandler.isLoading() : false;
  },
  info: function() {
    info.isFiltering.value = AuxContactables.find().count() != 0;
    return info;
  },
  contactables: function() {
    // Dependencies

    // ElasticSearch
    if (!_.isEmpty(query.searchString.value)) {
      //urlQuery.push('type=' + query.objType.value);
      return esResult;
    }
    return AuxContactables.find();
  },
  contactableTypes: function() {
    return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
  },
  //selection
  selectedCount: function () {
    return selected.get().length;
  },
  areAllChecked: function () {
    // true if the count of all contactables (in the local collection) that are selected is equal to the count of all contactables (in the local collection)
    return AuxContactables.find({_id: { $in : _.pluck(selected.get(),'id') } }).count() == AuxContactables.find().count();
  },
  areAllSelectedTheSameType: function () {
    if (_.isEmpty(selected.get())) return true;
    //check if there is a common type along all items selected ignoring contactable, person and organization
    return !_.isEmpty(_.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization'));
  },
  showSelectAll: function () {
    return clickedAllSelected.get() && SubscriptionHandlers.AuxContactablesHandler.pageCount() > 1;
  },
  totalCount: function () {
    return SubscriptionHandlers.AuxContactablesHandler.totalCount();
  },
  withoutEmail: function () {
    return _.filter(selected.get(), function (item) {
      return ! item.email
    }).length;
  },
  differentTypesSelected: function () {
    var result = {};
    // create a hash that contains for each type the count of elements of this type, ignoring contactable, person, organization
    _.each(selected.get(), function (item) {
      _.each(_.without(item.type,'contactable', 'person', 'organization'), function (type) {
        result[type] = result[type] || 0;
        ++result[type];
      })
    });

    // map the hash to an array of name and count objects
    return _.map(result, function (value, key){
      return {
        name: key,
        count: value
      }
    });
  }
});
Template.contactablesListSearch.events({
  'click #list-view': function () {
    listViewMode.set(true);
    Session.set('contactableListViewMode',true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('contactableListViewMode',false);
  }
})
Template.contactablesList.events({

  'change #selectAll': function (e) {
    if (e.target.checked){
      //add all local items (not already selected) to the selection
      clickedAllSelected.set(true);
      AuxContactables.find().forEach(function (contactable) {
        if (!_.findWhere(selected.curValue, {id: contactable._id})){
          selected.curValue.push({id: contactable._id, type: contactable.objNameArray, email: Utils.getContactableEmail(contactable) });
        }
      });
      selected.dep.changed();
    }else{
      //clear selection
      selected.set([]);
    }
  },
  'click #sendTemplate': function () {
    // get the common type that all selected entities have, ignoring contactable, person and organization
    var commonType = _.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization');

    if (! commonType || ! commonType.length) return;
    commonType = commonType[0];

    //filter from the selection the ones that don't have email
    var filtered = _.filter(selected.get(), function (item) {
      return item.email;
    });

    var context = {
      category: [Enums.emailTemplatesCategories[commonType.toLowerCase()]],
      recipient: _.map(filtered, function (item) {
        return {
          id: item.id,
          email: item.email
        };
      })
    };
    context[commonType] = _.pluck(filtered, 'id');

    Utils.showModal('sendTemplateModal', context);
  },
  'click .selectOneType': function () {
    //remove all items that are not of this type
    var self = this;
    selected.set(_.filter(selected.get(), function (item) {
      return _.contains(item.type, self.name);
    }));
  },
  'click #selectAllRemotes': function () {
    Meteor.call('getAllContactablesForSelection', SubscriptionHandlers.AuxContactablesHandler.getFilter(), function(err, result){
      if (err){
        console.log(err);
      }else{
        selected.set(_.map(result, function (contactable) {
          return {id: contactable._id, type: contactable.objNameArray, email: Utils.getContactableEmail(contactable) };
        }));
      }
    })
  }
});

// hack: because the handler is created on the created hook, the SubscriptionHandlers 'cleaner' can't find it
Template.contactablesList.destroyed = function() {
  if (SubscriptionHandlers.AuxContactablesHandler) {
    SubscriptionHandlers.AuxContactablesHandler.stop();
    delete SubscriptionHandlers.AuxContactablesHandler;
  }
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
    if (!query.inactives.value) 
    {
      var activeStatusFilter = {or: []};
      var activeStatuses;
      _.each(['Employee', 'Contact', 'Customer'], function (objName) {
        activeStatuses = getActiveStatuses(objName);
        _.forEach(activeStatuses, function (activeStatus) {
          var statusFilter = {};
          statusFilter[objName + '.status'] = activeStatus.toLowerCase();
          activeStatusFilter.or.push({term: statusFilter});
        })
      });
      filters.bool.must.push(activeStatusFilter);
    }
      else
      { // hack for problem of esSearch not filtering by hierarchy...enforce that here by forcing a match on a valid status in the hierarchyQ
        var allStatusFilter = {or: []};
        var allStatuses;
        _.each(['Employee', 'Contact', 'Customer'], function (objName) {
          allStatuses = getAllStatuses(objName);
          _.forEach(allStatuses, function (allStatus) {
            var statusFilter = {};
            statusFilter[objName + '.status'] = allStatus.toLowerCase();
            allStatusFilter.or.push({term: statusFilter});
          })
        });
        filters.bool.must.push(allStatusFilter);        
      };


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

Template.contactablesListSearch.helpers({
  contactableTypes: contactableTypes,
  searchString: function () {
    return query.searchString;
  }
  ,
  listViewMode: function () {
    return listViewMode.get();
  }
});

// List filters

Template.contactablesFilters.helpers({
  query: function () {
    return query;
  },
  isSelectedType: function(typeName){
    return query.objType.value == typeName;
  },
  contactableTypes: contactableTypes
});

// Item

Template.contactablesListItem.helpers({
  pictureUrl: function(pictureFileId) {
  var picture = ContactablesFS.findOne({_id: pictureFileId});
  return picture ? picture.url('ContactablesFSThumbs') : undefined;
},
  contactableIcon: function () {
    return helper.getEntityIcon(this);
  },
  displayObjType: function () {
    return Utils.getContactableType(this);
  },
  isESSearch: function () {
    return !_.isEmpty(query.searchString.value);
  },
  getLastNote: function () {

    var note = Notes.findOne({'links.id': this._id}, {sort: {dateCreated: -1}});
    if (note && note.msg.length > 50) {
      note.msg = note.msg.slice(0, 50) + '..';
    }
    return note;
  },
  isSelected: function () {
    return !! _.findWhere(selected.get(), { id: this._id });
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  getStatus: function () {
    if (this.Customer) return this.Customer.status;
    if (this.Employee) return this.Employee.status;
    if (this.Contact) return this.Contact.status;
  },
  getDepartment: function (){

    if (this.Customer && this.Customer.department)
    {
      var dept=this.Customer.department;
      if (dept=='Primary') return null;
      dept=" - " + dept
    }
    return dept;
  }
});

Template.contactablesListItem.events({
  'click .select': function (e) {
    if (e.target.checked){
      selected.curValue.push({
        id: this._id,
        type: this.objNameArray,
        email: Utils.getContactableEmail(this)
      })
    }else{
      var item = _.findWhere(selected.curValue, {id: this._id});
      selected.curValue.splice(selected.curValue.indexOf(item), 1 );
    }
    selected.dep.changed();
    clickedAllSelected.set(false);
  }
});

// Employee item

Template.employeeInformation.helpers({
  placementInfo: function () {
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
  }
});

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};

Template.registerHelper('listViewMode', function () {
  return listViewMode.get();
});
// list sort

var selectedSort =  new ReactiveVar();
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
  {field: 'displayName', displayName: 'Name'}
];

Template.contactableListSort.helpers({
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

Template.contactableListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};
