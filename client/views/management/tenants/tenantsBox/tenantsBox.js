var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['name', 'configuration.webName', 'configuration.title', '_id'];

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

var options = {};
// List
Template.tenantsList.created = function () {
    if (!SubscriptionHandlers.TenantHandler) {
        SubscriptionHandlers.TenantHandler = Meteor.paginatedSubscribe('tenants');
    }
    this.subscribe('activityCounters');
    TenantHandler = SubscriptionHandlers.TenantHandler;
    Meteor.autorun(function () {
        var searchQuery = {};
        var params = {};
        options = {};
        var urlQuery = new URLQuery();
        isSearching=true;

        searchDep.depend();


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
        ;


        if (tenantQuery.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - tenantQuery.selectedLimit.value
            };
            urlQuery.addParam('creationDate', tenantQuery.selectedLimit.value);
        }

        if (!tenantQuery.inactives.value) {
            searchQuery.inactive = {$in: [null, false]}
        }

        if (tenantQuery.inactives.value) {
            urlQuery.addParam('inactives', true);
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
            delete options.sort;
        }

        TenantHandler.setFilter(searchQuery);
        TenantHandler.setOptions(options);
        Session.set('tenantCount', TenantHandler.totalCount());
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
        console.log('counts', counts);
        return counts && counts.lastDate;
    }
});

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
