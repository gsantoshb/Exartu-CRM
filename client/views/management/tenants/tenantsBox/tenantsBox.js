var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['name', 'configuration.webName', 'configuration.title', '_id'];
var aidaHier;
var tenantCollection = Tenants;
var TenantHandler, tenantQuery;


var info = new Utils.ObjectDefinition({
    reactiveProps: {
        tenantsCount: {},
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

var listViewDefault = Session.get('tenantListViewMode');
if (!listViewDefault) {
    listViewDefault = false;
}
var listViewMode = new ReactiveVar(listViewDefault);
// Page - Variables
var searchDep = new Deps.Dependency;
var isSearching = false;

var loadTenantQueryFromURL = function (params) {

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

    // Inactive
    var inactiveQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.inactives) {
        inactiveQuery.default = !!params.inactives;
    }


    // Tags
    var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            inactives: inactiveQuery,
            tags: tagsQuery
        }
    });
};

// All

Template.tenantsBox.created = function () {
    tenantQuery = tenantQuery || loadTenantQueryFromURL(Router.current().params);

    var entityId = Session.get('entityId');
    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;
};
Template.tenantsBox.helpers ({
    information: function () {
        info.tenantsCount.value = TenantHandler.totalCount();
        return info;
    },
    isSearching: function() {
        searchDep.depend();
        return isSearching;
    }
});

var ActivityCounters = new Mongo.Collection('activityCounters');
var hiersContact = new ReactiveVar();
var options = {};
// List
Template.tenantsList.created = function () {
    Meteor.call('getAidaHiersContact', function(err,cb){
      if(cb) {
        hiersContact.set(cb);
        var indexOfAidaHier = _.indexOf(_.pluck(hiersContact.get(), "contactable"), null);
        aidaHier = hiersContact.get()[indexOfAidaHier].hier;
      }
    })

    if (!SubscriptionHandlers.TenantHandler) {
        SubscriptionHandlers.TenantHandler = Meteor.paginatedSubscribe('tenants');
    }
    this.subscribe('activityCounters');
    TenantHandler = SubscriptionHandlers.TenantHandler;
    Meteor.autorun(function () {
        var searchQuery = {};
        options = {};
        var urlQuery = new URLQuery();

        var searchString = tenantQuery.searchString.value;
        if (!_.isEmpty(searchString)) {
            searchQuery.$and = [];
            var stringSearches = [];
            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: searchString,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });
            urlQuery.addParam('search', searchString);
            searchQuery.$and.push({
                $or: stringSearches
            });
        }


        if (tenantQuery.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - tenantQuery.selectedLimit.value
            };
            urlQuery.addParam('creationDate', tenantQuery.selectedLimit.value);
        }

        if (tenantQuery.tags.value.length > 0) {
            searchQuery.tags = {
                $in: tenantQuery.tags.value
            };
            urlQuery.addParam('tags', tenantQuery.tags.value);
        }


        // Set url query
        urlQuery.apply();

        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            options.sort = {dateCreated:-1};
        }

        TenantHandler.setFilter(searchQuery);
        TenantHandler.setOptions(options);
        isSearching=false;
    })
};

var getActiveStatuses = function () {
    return null;
};

Template.tenantsList.helpers({
    tenants: function () {
        return tenantCollection.find({}, options);
    },
    info: function () {
        info.isFiltering.value = TenantHandler.totalCount() != 0;
        return info;
    },
    isLoading: function () {
        return SubscriptionHandlers.TenantHandler.isLoading();
    }
});


// List filters

Template.tenantsFilters.helpers({
    query: function () {
        return tenantQuery;
    },
    tags: function () {
        return tenantQuery.tags;
    },
    information: function () {


        var tenantCount = Session.get('tenantCount');
        if (tenantCount)
            info.tenantsCount.value = tenantCount;

        return info;
    }
});


Template.tenantsListSearch.helpers({
    searchString: function () {
        return tenantQuery.searchString;
    },
    isLoading: function () {
        return TenantHandler.isLoading();
    },
    listViewMode: function () {
        return listViewMode.get();
    }
});

Template.tenantsListSearch.events({
    'click .addTenant': function (e) {
        Session.set('addOptions', {job: Session.get('entityId')});
        Router.go('/tenantAdd/tenant');
        e.preventDefault();
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('tenantListViewMode', true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('tenantListViewMode', false);
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
    }
});

// Item

Template.tenantsListItem.helpers({
    showAdd: function(){

      return (Meteor.user().currentHierId === aidaHier)&&(!_.contains(_.pluck(hiersContact.get(),"hier"), this._id));
    },
    idContactable: function(){
      if(Meteor.user().currentHierId === aidaHier){
        var i = _.indexOf(_.pluck(hiersContact.get(),"hier"), this._id);
        if(i>-1) {
          return (hiersContact.get()[i].contactable);
        }
        else{
          return false;
        }
      }
      else{
        return false;
      }
    },
    pictureUrl: function (pictureFileId) {
        var picture = TenantsFS.findOne({_id: pictureFileId});
        return picture ? picture.url('TenantsFSThumbs') : undefined;
    },
    tenantIcon: function () {
        return helper.getEntityIcon(this);
    },
    statusDisplayName: function (item) {
        var lookUp = LookUps.findOne({_id: this.tenantStatus});

        if (lookUp) return lookUp.displayName;
    },
    displayObjType: function () {
        return Utils.getTenantType(this);
    },
    listViewMode: function () {
        return listViewMode.get();
    },
    activityCount: function () {
        var counts = ActivityCounters.findOne(this._id);
        return counts && counts.activityCount;
    },
    lastDate: function () {
        var counts = ActivityCounters.findOne(this._id);
        return counts && counts.lastDate;
    },
    getHierEmail: function () {
      if(this.users && this.users[0]) {
        var user = TenantUsers.findOne(this.users[0]);
        return user && user.emails[0].address;
      }
    }
});

Template.tenantsListItem.events = {
  'click .addHierAsContactable': function(){
    var self = this;
    var leadLookUp = LookUps.findOne({lookUpCode: Enums.lookUpCodes.contact_status, isDefault: true});
    var emailLookUp = LookUps.findOne({lookUpCode: Enums.lookUpCodes.contactMethod_types, lookUpActions: Enums.lookUpAction.ContactMethod_Email});
    var phoneLookUp =  LookUps.findOne({lookUpCode: Enums.lookUpCodes.contactMethod_types, lookUpActions: Enums.lookUpAction.ContactMethod_WorkPhone});
    var activeLookUp = LookUps.findOne({lookUpCode: Enums.lookUpCodes.active_status, lookUpActions: Enums.lookUpAction.Implies_Active});
    if(self.users && self.users[0])
      var user = TenantUsers.findOne(self.users[0]);
    var firstname = "No name";
    var lastName = " ";
    if(self.userName) {
      var arrayName = self.userName.split(" ");


      if(arrayName.length>1){
        firstname = arrayName[0];
        lastName = arrayName[1];
      }
      else{
        firstname = arrayName[0];
      }
    }

    var contact =  { objNameArray: [ 'person', 'Contact', 'contactable' ],
                     person:    { firstName: firstname,
                                  lastName: lastName,
                                  middleName: '',
                                  jobTitle: '',
                                  salutation: '',
                                  birthDate: null },
                     Contact: { status: leadLookUp._id,
                                client: null },
                     statusNote: 'Created from tenant record',
                     activeStatus: activeLookUp._id,
                     howHeardOf: null,
                     contactMethods: []
    }
    if(self.phone){
      contact.contactMethods.push({type: phoneLookUp._id, value: self.phone})
    }
    if(user && user.emails){
      contact.contactMethods.push({type: emailLookUp._id, value: user.emails[0].address})
    }
                     //contactMethods: [{type: emailLookUp._id, value: user.emails[0].address}, {type: phoneLookUp._id, value: self.phone}]

    Meteor.call('addContactable', contact, function(err,result){
      if(result){
        var note = {};
        note.msg = self.name;
        note.links = [{id:result,type:Enums.linkTypes.contactable.value}];
        Meteor.call('addNote', note, function(err, res){
        })
        Meteor.call('setHiersContact', self._id, result, function(e,res){
          Meteor.call('getAidaHiersContact', function(err,r){
            if(r) {
              hiersContact.set(r);
            }
          })
          Utils.showModal('basicModal', {
            title: 'Contact added',
            message: 'Open this contact record in new window?',
            buttons: [{label: 'Close', classes: 'btn-info', value: false}, {
              label: 'Show',
              classes: 'btn-success',
              value: true
            }],
            callback: function (r) {
              if(r) {
                window.open('/contactable/' + result, '_blank');

              }

            }
          });
        })
      }

    })

  }
};

// list sort

var selectedSort = new ReactiveVar();
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'name', displayName: 'Name'}
];

Template.tenantListSort.helpers({
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

Template.tenantListSort.events = {
    'click .sort-field': function () {
        setSortField(this);
    }
};
