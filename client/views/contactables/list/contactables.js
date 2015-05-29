/**
var tourIndex;
 * Controller
 */
ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    // todo: find a way to subscribe using the filters without braking pagination
    //if (!SubscriptionHandlers.ContactablesViewHandler) {
    //  SubscriptionHandlers.ContactablesViewHandler = Meteor.paginatedSubscribe('contactablesView');
    //
    //  return [SubscriptionHandlers.ContactablesViewHandler, LookUpsHandler];
    //}
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    var params = this.params.query;
    var objTypeQuery = {};
    var type = params.hash || params.type;
    if (type != undefined && type != 'all') {
      var objType = dType.ObjTypes.findOne({
        name: type
      });
      objTypeQuery.default = objType.name;
      info.objType.value = objType.name + 's';
    } else {
      objTypeQuery.default = undefined;
      info.objType.value = 'record(s)';
    }

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


    // Mine only
    var mineQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.mine) {
      mineQuery.default = !!params.mine;
    }
    // userId
    var userIdQuery = {};
    if (params.userId) {

      userIdQuery.default = params.userId;
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

    var taxIdQuery = {};
    if (params.taxId) {
      taxId.default = params.taxId;
    }

    var employeeProcessStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.employeeProcessStatus) {
      employeeProcessStatusQuery.default = params.employeeProcessStatus.split(',');
    }
    else {
      employeeProcessStatusQuery.default = [];
    }

    var clientProcessStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.clientProcessStatus) {
      clientProcessStatusQuery.default = params.clientProcessStatus.split(',');
    }
    else {
      clientProcessStatusQuery.default = [];
    }

    var contactProcessStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.contactProcessStatus) {
      contactProcessStatusQuery.default = params.contactProcessStatus.split(',');
    }
    else {
      contactProcessStatusQuery.default = [];
    }


    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.activeStatus) {
      activeStatusQuery.default = params.activeStatus.split(',');
    }
    else {
      activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    }


    query = new Utils.ObjectDefinition({
      reactiveProps: {
        objType: objTypeQuery,
        searchString: searchStringQuery,
        selectedLimit: creationDateQuery,
        mineOnly: mineQuery,
        tags: tagsQuery,
        location: locationQuery,
        employeeProcessStatus: employeeProcessStatusQuery,
        clientProcessStatus: clientProcessStatusQuery,
        contactProcessStatus: contactProcessStatusQuery,
        activeStatus: activeStatusQuery,
        taxId: taxIdQuery,
        userId: userIdQuery
      }
    });

    runESComputation();

    this.render('contactables');
  },
  onAfterAction: function () {
    var title = 'Network',
      description = 'Your contacts, employees and clients';
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
 * Variables
 */
var query = {};
var selectedValue = {};

var selected = new ReactiveVar([]);
var isAdding = new ReactiveVar(false);
var comonTypes = [];

// Page - Variables
var searchDep = new Deps.Dependency;
var totalCountDep = new Deps.Dependency;
var paginationReady = new ReactiveVar(false);
var isSearching = false;

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

var showFilters = new ReactiveVar(true);


// List - Variables
var contactableTypes = function () {
  return dType.ObjTypes.find({parent: Enums.objGroupType.contactable});
};

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
var clickedAllSelected = new ReactiveVar(false);
var listViewDefault = Session.get('contactableListViewMode');
if (!listViewDefault) {
  listViewDefault = false;
}
var listViewMode = new ReactiveVar(listViewDefault);
var options = {};

// List Sort - Variables
var selectedSort = new ReactiveVar();
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
  {field: 'displayName', displayName: 'Name'}
];

var setSortField = function (field) {
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


/**
 * Callbacks
 */
Template.contactablesList.created = function () {
  paginationReady.set(false);

  Meteor.autorun(function (c) {
    var urlQuery = new URLQuery();
    var searchQuery = {
      $and: [] // Push each $or operator here
    };

    // Search string
    if (query.searchString && query.searchString.value) {
      urlQuery.addParam('search', query.searchString.value);
    }

    // Type
    if (query.objType.value) {
      searchQuery[query.objType.value] = true;
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

    // Created by
    if (query.mineOnly.value) {
      searchQuery.userId = Meteor.userId();
      urlQuery.addParam('mine', true);
    }

    if (query.userId.value) {
      searchQuery.userId = query.userId.value;
      urlQuery.addParam('userId', query.userId.value);
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

    // Tags filter
    if (query.tags.value.length > 0) {
      searchQuery.tags = {
        $in: query.tags.value
      };
      urlQuery.addParam('tags', query.tags.value);
    }

    if (query.taxId.value) {
      var taxIdOR = {
        $or: []
      };
      var aux = {};
      aux['taxID'] = query.taxId.value;
      taxIdOR.$or.push(_.clone(aux));
      aux['taxID'] = {$regex: '([0-9]{3}-?[0-9]{2}-?)(' + query.taxId.value + ')', $options: 'i'};
      taxIdOR.$or.push(_.clone(aux));
      aux = {};
      aux['contactMethods'] = {$elemMatch: {value: {$regex: query.taxId.value, $options: 'i'}}};
      taxIdOR.$or.push(_.clone(aux));
      searchQuery.$and.push(taxIdOR);

    }

    if (searchQuery.$and.length == 0)
      delete searchQuery.$and;
    if ((query.objType.value === "Employee") && !_.isEmpty(query.employeeProcessStatus.value)) {
      searchQuery.employeeStatus = {$in: query.employeeProcessStatus.value};

      urlQuery.addParam('employeeProcessStatus', query.employeeProcessStatus.value);
    }
    if ((query.objType.value === "Client") && !_.isEmpty(query.clientProcessStatus.value)) {
      searchQuery.clientStatus = {$in: query.clientProcessStatus.value};

      urlQuery.addParam('clientProcessStatus', query.clientProcessStatus.value);
    }
    if ((query.objType.value === "Contact") && (!_.isEmpty(query.contactProcessStatus.value))) {
      searchQuery.contactStatus = {$in: query.contactProcessStatus.value};

      urlQuery.addParam('contactProcessStatus', query.contactProcessStatus.value);
    }
    if (!_.isEmpty(query.activeStatus.value)) {
      searchQuery.activeStatus = {$in: query.activeStatus.value};

      urlQuery.addParam('activeStatus', query.activeStatus.value);
    }
    // Set url query
    urlQuery.apply();
    isSearching = false;
    // Avoid update handler's filter when an Elasticsearch query will be performed
    if (query.searchString.value) return;
    if (selectedSort.get()) {
      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }

    if (_.isString(locationFilter)) {
      searchQuery.$or = [
        {'addresses.address': {$regex: locationFilter, $options: 'i'}},
        {'addresses.city': {$regex: locationFilter, $options: 'i'}},
        {'addresses.state': {$regex: locationFilter, $options: 'i'}},
        {'addresses.country': {$regex: locationFilter, $options: 'i'}}
      ];
    }
    if (_.isObject(locationFilter)) {
      _.each(locationFilter, function (v, k) {
        searchQuery['addresses.' + k] = {$regex: v, $options: 'i'}
      });
    }
    if (SubscriptionHandlers.ContactablesViewHandler) {
      SubscriptionHandlers.ContactablesViewHandler.setFilter(searchQuery);
      SubscriptionHandlers.ContactablesViewHandler.setOptions(options);
    }
    else
      SubscriptionHandlers.ContactablesViewHandler = Meteor.paginatedSubscribe('contactablesView', {
        filter: searchQuery,
        options: options
      });

  });

  paginationReady.set(true);

  selected.set([]);

  Meteor.autorun(function () {

    if (query.searchString.value)
      Session.set('contactableCount', esResult.length);
    else {
      if (SubscriptionHandlers && SubscriptionHandlers.ContactablesViewHandler)
        Session.set('contactableCount', SubscriptionHandlers.ContactablesViewHandler.totalCount());
    }
  });
};

Template.contactablesList.rendered = function () {
  Meteor.call('getIndexTour', "tourActivities", function(err,cb){
    if((cb>=4) &&(cb<9)){
      if (!_.contains(Meteor.user().tours, "tourActivities")) {
          $("#tourActivities").joyride({
            autoStart: true,
            startOffset:cb+1,
            modal: true,
            postRideCallback: function(ev) {
              Meteor.call('setVisitedTour', "tourActivities", 27, function(err,cb){
              })
            },
            postStepCallback: function(e, ctx){
              tourIndex = e;
              Meteor.call('setVisitedTour', "tourActivities", e, function(err,cb){
              })
              if(e===9){
                Router.go("/jobs");
              }
            }

          });


          };

      }

  });

};

Template.contactablesList.destroyed = function () {
  if (SubscriptionHandlers.ContactablesViewHandler) {
    SubscriptionHandlers.ContactablesViewHandler.stop();
    delete SubscriptionHandlers.ContactablesViewHandler;
  }
  if (SubscriptionHandlers.ContactablesHotListHandler) {
    SubscriptionHandlers.ContactablesHotListHandler.stop();
    delete SubscriptionHandlers.ContactablesHotListHandler;
  }
  $('button[data-toggle="popover"]').attr('data-init', 'off');
  $('.popover').hide().popover('destroy');

    $("#tourActivities").joyride('destroy');

};

Template.contactablesListItem.destroyed = function () {
  $('button[data-toggle="popover"]').attr('data-init', 'off');
  $('.popover').hide().popover('destroy');
};


/**
 * Helpers
 */
// Page - Helpers
Template.contactables.helpers({
  isSearching: function () {
    searchDep.depend();
    totalCountDep.changed();
    return isSearching;
  },
  showFilters: function () {
    return showFilters.get();
  }
});

// List Header - Helpers
Template.contactablesListHeader.helpers({
  listViewMode: function () {
    return listViewMode.get();
  },
  //selection
  selectedCount: function () {
    return selected.get().length;
  },
  areAllSelectedTheSameType: function () {

    // if the selection is remote selection.types will be an array of names and counts
    // check the length of types to see if all are the same types and also save the commonTypes as it is done if selection is not remote (in that case selection is an array)
    var selection = selected.get();
    if (! _.isArray(selection)){
      _.each(selection.types, function (type) {
        comonTypes.push(type.name.toLowerCase());
      });
      return selection.types.length == 1;
    }

    if (_.isEmpty(selected.get())) return true;
    //check if there is a common type along all items selected ignoring contactable, person and organization
    var comonTypesUpper = _.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization');
    comonTypes = [];
    _.forEach(comonTypesUpper, function (value) {
      comonTypes.push(value.toLowerCase());
    });
    return !_.isEmpty(comonTypes);
  },
  showSelectAll: function () {
    return clickedAllSelected.get() && SubscriptionHandlers.ContactablesViewHandler.pageCount() > 1;
  },
  differentTypesSelected: function () {
    var result = {};
    var selection = selected.get();

    // if the selection is remote the server has already given us the array we need (types)
    if (! _.isArray(selection)){
      return selection.types;
    }
    // create a hash that contains for each type the count of elements of this type, ignoring contactable, person, organization
    _.each(selection, function (item) {
      _.each(_.without(item.type, 'contactable', 'person', 'organization'), function (type) {
        result[type] = result[type] || 0;
        ++result[type];
      })
    });

    // map the hash to an array of name and count objects
    return _.map(result, function (value, key) {
      return {
        name: key,
        count: value
      }
    });
  },
  totalCount: function () {
    if (SubscriptionHandlers.ContactablesViewHandler.isLoading())
      return 0;
    else
      return SubscriptionHandlers.ContactablesViewHandler.totalCount();
  },
  getHotList: function () {
    return function (string) {
      var self = this;
      Meteor.call('findHotList',comonTypes, string, function (err, result) {
        if (result) {
          var array = _.map(result, function (r) {
            return {text: r.displayName, id: r._id};
          });
          self.ready(array);
        }
      });
    };
  },
  getJobs: function () {
    return function (string) {
      var self = this;
      Meteor.call('findJob', string, function (err, cb) {
        if (cb) {
          var array = _.map(cb, function (r) {
            return {text: r.publicJobTitle + " @ " + r.clientDisplayName, id: r._id};
          });
          self.ready(array);
        }
      })
    }
  },
  JobChanged: function () {
    var self = this;
    return function (value, text) {
      self.value = value;
      selectedValue.id = value;
      selectedValue.text = text;
    }
  },
  hotListChanged: function () {
    var self = this;
    return function (id, name) {
      self.value = id;
      selectedValue.id = id;
      selectedValue.name = name;
    }
  },
  allEmployee: function () {
    return _.contains(comonTypes, "employee");
  },
  isAdding: function () {
    return isAdding.get();
  }
});

// List Search - Helpers
Template.contactablesListSearch.helpers({
  isESSearch: function () {
    return !_.isEmpty(query.searchString.value);
  },
  contactableTypes: contactableTypes,
  searchString: function () {
    return query.searchString;
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  showFilters: function () {
    return showFilters.get();
  },
  paginationReady: function () {
    return paginationReady.get();
  }

});

// List Sort - Helpers
Template.contactableListSort.helpers({
  sortFields: function () {
    return sortFields;
  },
  selectedSort: function () {
    return selectedSort.get();
  },
  isFieldSelected: function (field) {
    return selectedSort.get() && selectedSort.get().field == field.field;
  },
  isAscSort: function () {
    return selectedSort.get() ? selectedSort.get().value == 1 : false;
  }
});

// List Filters - Helpers
Template.contactablesFilters.helpers({
  users: function () {
    return Meteor.users.find({}, {sort: {'emails.address': 1}});
  },
  query: function () {
    return query;
  },
  isSelectedType: function (typeName) {
    return query.objType.value == typeName;
  },
  contactableTypes: contactableTypes,
  isUserSelected: function () {
    return this._id == query.userId.value;
  },
  contactablesCount: function () {
    totalCountDep.depend();
    if (!_.isEmpty(query.searchString.value)) {
      return esResult.length;
    }
    else {
      return SubscriptionHandlers.ContactablesViewHandler && SubscriptionHandlers.ContactablesViewHandler.totalCount();
    }
  }
});

// List - Helpers
Template.contactablesList.helpers({
  isLoading: function () {
    return SubscriptionHandlers.ContactablesViewHandler ? SubscriptionHandlers.ContactablesViewHandler.isLoading() : false;
  },
  info: function () {
    info.isFiltering.value = AuxContactables.find().count() != 0;
    return info;
  },
  contactables: function () {
    // Dependencies
    esDep.depend();
    // ElasticSearch
    if (!_.isEmpty(query.searchString.value)) {
      //urlQuery.push('type=' + query.objType.value);
      return esResult;
    }
    return ContactablesView.find({}, {sort: options.sort});
  },
  contactableTypes: contactableTypes,
  listViewMode: function () {
    return listViewMode.get();
  }
});

// List Item - Helpers
Template.contactablesListItem.helpers({
  pictureUrl: function (pictureFileId) {
    var picture = ContactablesFS.findOne({_id: pictureFileId});
    return picture ? picture.url('ContactablesFSThumbs') : undefined;
  },
  displayObjType: function () {
    return Utils.getContactableType(this);
  },
  isESSearch: function () {
    return !_.isEmpty(query.searchString.value);
  },
  isSelected: function () {

    // if the selection is remote i can check if the contactable is selected by checking if this contactable matches the filter used
    if (!_.isArray(selected.get())){
      var filter = EJSON.clone(selected.get().filter);
      filter._id = this._id;
      return  !! ContactablesView.findOne(filter);
    }

    return !!_.findWhere(selected.get(), {id: this._id});
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  getStatus: function () {
    return this.activeStatus;
  },
  getProcessStatus: function () {
    if (this.Client) return this.clientStatus;
    if (this.Employee) return this.employeeStatus;
    if (this.Contact) return this.contactStatus;
    return null;
  },
  getDepartment: function () {
    if (this.Client && this.department) {
      var dept = this.department;
      if (dept == 'Primary') return null;
    }
    return dept;
  },
  showOnlyName: function () {
    return (!this.Employee && this.Contact);
  }
});


Template.contactables.helpers({
  isESSearch: function () {
    return !_.isEmpty(query.searchString.value);
  },
  paginationReady: function () {
    return paginationReady.get();
  }
});

/**
 * Events
 */
// Page - Events
Template.contactables.events({
  'click .parseText': function () {
    Utils.showModal('textParser');
  },
  'click button[data-toggle="popover"]': function (e, ctx) {
    var object = e.currentTarget;
    var attr = $(object).attr('aria-describedby');
    // destroy any other popovers open on page
    $('.popover').popover('destroy');

    if (!(typeof attr !== typeof undefined && attr !== false)) {
      // we set all other popovers besides this one to off so that we can open them next time
      $(object).popover('show');
    }
  }
});

// List Header - Events
Template.contactablesListHeader.events({
  'change #selectAll': function (e) {
    if (e.target.checked) {
      //add all local items (not already selected) to the selection
      clickedAllSelected.set(true);
      ContactablesView.find().forEach(function (contactable) {
        if (!_.findWhere(selected.curValue, {id: contactable._id})) {
          var objNameArray = [];
          _.each(['Client','Contact','Employee'], function (key) {
            if (contactable[key]){
              objNameArray.push(key);
            }
          });
          selected.curValue.push({
            id: contactable._id,
            type: objNameArray,
            activeStatus: contactable.activeStatus,
            email: Utils.getContactableEmail(contactable)
          });
        }
      });
      selected.dep.changed();
    } else {
      //clear selection
      selected.set([]);
    }
  },
  'click #sendEmailTemplate': function () {
    // get the common type that all selected entities have, ignoring contactable, person and organization
    var commonType = _.without(_.intersection.apply(this, _.pluck(selected.get(), 'type')), 'contactable', 'person', 'organization');

    if (!commonType || !commonType.length) return;
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

    Utils.showModal('sendEmailTemplateModal', context);
  },

  'click #selectAllRemotes': function () {
    // this function calls the server and get the information needed for the view, but doesn't return a huge array as it used to.
    // the result will contain the count, an array called types (with name and the count for each type)
    // we also save the filter that was used so we can call 'addMembersToHotListFromQuery' using this filter and this way the server will get the ids back
    var filter = EJSON.clone(SubscriptionHandlers.ContactablesViewHandler.getFilter());
    Meteor.call('getAllContactablesForSelectionFromView', filter, function (err, result) {
      if (err) {
        console.log('get all contactables error', err);
      } else {
        result.filter = filter;
        selected.set(result);
      }
    })
  },
  'click .selectOneType': function () {
    var self = this;

    // if the selection is remote we modified the filter to match this type and call getAllContactablesForSelectionFromView to get the new selection
    var selection = selected.get();
    if (! _.isArray(selection)){
      var filter = selection.filter;
      filter[self.name] = true;
      Meteor.call('getAllContactablesForSelectionFromView', filter, function (err, result) {
        if (err) {
          console.log('get all contactables error', err);
        } else {
          result.filter = filter;
          selected.set(result);
        }
      });
      return;
    }

    //remove all items that are not of this type
    selected.set(_.filter(selected.get(), function (item) {
      return _.contains(item.type, self.name);
    }));
  },
  'click .add-hotList': function (e, ctx) {
    addHotList.call(this);
  },
  'click .add-placement': function (e, ctx) {
    addPlacement.call(this);
  }
});

Template.contactablesListSearch.events({
  'keyup #searchString': _.debounce(function (e) {
    query.searchString.value = e.target.value;
  }, 100),
  'click #toggle-filters': function (e) {
    showFilters.set(!showFilters.get());
  },
  'click #list-view': function () {
    listViewMode.set(true);
    Session.set('contactableListViewMode', true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('contactableListViewMode', false);
  }
});

// List Sort - Events
Template.contactableListSort.events({
  'click .sort-field': function () {
    setSortField(this);
  }
});

// List Item - Events
Template.contactablesListItem.events({
  'click .select': function (e) {
    if (e.target.checked) {
      var contactable = this;
      var objNameArray = [];
      _.each(['Client','Contact','Employee'], function (key) {
        if (contactable[key]){
          objNameArray.push(key);
        }
      });
      selected.curValue.push({
        id: contactable._id,
        type: objNameArray,
        activeStatus: contactable.activeStatus,
        email: Utils.getContactableEmail(this)
      })
    } else {
      var item = _.findWhere(selected.curValue, {id: this._id});
      selected.curValue.splice(selected.curValue.indexOf(item), 1);
    }
    selected.dep.changed();
    clickedAllSelected.set(false);
  }
});


var addPlacement = function () {
  if (!selectedValue.id) {
    return;
  }
  var info = [];
  var inc = 0;

  // if the selection is remote call addPlacementForAllInQuery
  if (!_.isArray(selected.get())){
    Meteor.call('addPlacementForAllInQuery', selectedValue.id, selected.get().filter, function (err, infoArray) {
      var message = "";
      _.forEach(infoArray, function (info) {
        message = message + "<a href='/placement/" + info.placementId + "' target='_blank'>" + info.employeeDisplayName + "</a><br>";
      });
      Utils.showModal('basicModal', {
        title: 'Placements added',
        message: info.length + ' placements added.<br>Job: ' + selectedValue.text + '<br>Employees:<br>' + message,
        buttons: [{
          label: 'Ok',
          classes: 'btn-success',
          value: true
        }],
        callback: function (result) {
          //deselect all
          selected.set([])
        }
      });
    });
  }else{
    _.forEach(selected.get(), function (employee) {
      var placement = {};
      placement.job = selectedValue.id;
      placement.employee = employee.id;
      var status = LookUps.findOne({lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode, isDefault: true});
      placement.candidateStatus = status._id;
      placement.objNameArray = ["placement"];
      var lookUpActive = LookUps.findOne({
        lookUpCode: Enums.lookUpCodes.active_status,
        lookUpActions: Enums.lookUpAction.Implies_Active
      });
      if (employee.activeStatus === lookUpActive._id) {


        Meteor.call('addPlacement', placement, function (err, cb) {
          inc = inc + 1;
          if (cb) {
            info.push({placement: cb, employee: employee.id});
            if (selected.get().length <= inc) {
              //finished
              var message = "";
              _.forEach(info, function (p) {
                var cont = ContactablesView.findOne({_id: p.employee});
                message = message + "<a href='/placement/" + p.placement + "' target='_blank'>" + cont.displayName + "</a><br>";
              });
              Utils.showModal('basicModal', {
                title: 'Placements added',
                message: info.length + ' placements added.<br>Job: ' + selectedValue.text + '<br>Employees:<br>' + message,
                buttons: [{
                  label: 'Ok',
                  classes: 'btn-success',
                  value: true
                }],
                callback: function (result) {
                  //deselect all
                  selected.set([])
                }
              });

            }
          }
        });
      }
      else {
        inc = inc + 1;
      }
    });
  }


};

var addHotList = function () {
  if (!selectedValue.id) {
    return;
  }

  var afterAdd = function (result) {
    Utils.showModal('basicModal', {
      title: 'Navigate to Hot List',
      message: result + ' added to hotlist \'' + selectedValue.name + '\'. Navigate to hotlist?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
        label: 'Yes',
        classes: 'btn-success',
        value: true
      }],
      callback: function (result) {
        if (result) {
          Router.go('/hotlist/' + selectedValue.id);
        }
      }
    });
  }

  isAdding.set(true);
  var selection = selected.get();
  // if the selection is remote we call addMembersToHotListFromQuery with the filter that we saved previously
  if (! _.isArray(selection)){
    Meteor.call('addMembersToHotListFromQuery', selectedValue.id, selection.filter, function (err, result) {
      isAdding.set(false);
      if (err){
        console.log(err);
      }else{
        afterAdd(result);
      }
    })
  }else{
    var ids = _.pluck(selection, 'id');
    Meteor.call('addMembersToHotList', selectedValue.id, ids, function (err, result) {
      isAdding.set(false);
      if (err){
        console.log(err);
      }else{
        afterAdd(result);
      }
    })
  }

};


/**
 * Elastic Search integration
 */
var esDep = new Deps.Dependency;
var esResult = [];

var runESComputation = function () {
  Meteor.autorun(function () {

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
      _.forEach(query.tags.value, function (tag) {
        tags.or.push({term: {tags: tag}});
      });
      filters.bool.must.push(tags);
    }

    // Only recent filters
    if (query.selectedLimit.value) {
      var now = new Date();
      filters.bool.must.push({range: {dateCreated: {gte: moment(new Date(now.getTime() - query.selectedLimit.value)).format("YYYY-MM-DDThh:mm:ss")}}});
    }

    //Created by
    if (query.mineOnly.value) {
      var fullUserId = Meteor.userId();
      var spltUserId = fullUserId.split("-");
      for (i in spltUserId) {
        filters.bool.must.push({regexp: {userId: '.*' + spltUserId[i] + '.*'}});
      }
    }

    //location////
    if (query.location.value) {
      var usedTags = false;
      _.forEach(locationFields, function (locationField) {
        var value = getLocationTagValue(locationField, locationFields);
        if (value) {
          var term = {};
          term[locationField + '.value'] = value.toLowerCase();
          filters.bool.must.push({term: term});
          usedTags = true;
        }
      });
      if (!usedTags) {
        var or = [];
        _.forEach(locationFields, function (locationField) {
          var term = {};
          term[locationField + '.value'] = query.location.value.toLowerCase();
          or.push({term: term});
        });
        filters.bool.must.push({or: or});

      }
    }

    if ((query.objType.value === "Contact") && (query.contactProcessStatus.value.length > 0)) {
      var processArray = [];
      _.forEach(query.contactProcessStatus.value, function (p) {
        processArray.push(p.toLowerCase());
      });
      filters.bool.must.push({terms: {'Contact.status': processArray}});
    }

    if (query.activeStatus.value.length > 0) {
      var processArray = [];
      _.forEach(query.activeStatus.value, function (p) {
        processArray.push(p.toLowerCase());
      });
      filters.bool.must.push({terms: {'activeStatus': processArray}});
    }


    isSearching = true;
    searchDep.changed();
    Contactables.esSearch('.*' + query.searchString.value + '.*', filters, function (err, result) {
      if (!err) {
        esResult = _.map(result.hits, function (hit) {
          var contactable = Contactables._transform(hit._source);
          contactable._match = {
            score: (hit._score / result.max_score) * 100,
            properties: _.map(hit.highlight, function (matchedProperty, propertyName) {
              return {key: propertyName, value: matchedProperty};
            }),
            contexts: _.flatten(_.map(hit.highlight, function (matchedProperty, propertyName) {
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

// Elasticsearch context match template
Template.esContextMatch.rendered = function () {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};