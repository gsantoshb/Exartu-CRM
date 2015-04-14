var searchFields = ['currentHierId'];

var tenantUserCollection = TenantUsers;
var TenantUserHandler, tenantUserQuery;

var info = new Utils.ObjectDefinition({
    reactiveProps: {
        isRecentDaySelected: {
            default: false
        },
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
var loadTenantUserQueryFromURL = function (params) {
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

    // Tags
    var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            tags: tagsQuery
        }
    });
};

var TenantUsersLogin = new Mongo.Collection('tenantUsersLogin');

// All

Template.tenantUsersBox.created = function () {
    tenantUserQuery = tenantUserQuery || loadTenantUserQueryFromURL(Router.current().params);

    this.subscribe('tenantUsersLogin');
};


Template.tenantUsersBox.helpers({
    isSearching: function () {
        searchDep.depend();
        return isSearching;
    }
});

var searchDep = new Deps.Dependency;
var isSearching = false;

var options = {};
// List
Template.tenantUsersList.created = function () {
    if (!SubscriptionHandlers.TenantUserHandler) {
        SubscriptionHandlers.TenantUserHandler = Meteor.paginatedSubscribe('tenantUsers');
    }
    TenantUserHandler = SubscriptionHandlers.TenantUserHandler;
    Meteor.autorun(function () {
        var searchQuery = {};
        options = {};
        var urlQuery = new URLQuery();

        searchDep.depend();

        var searchString = tenantUserQuery.searchString.value;
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
            stringSearches.push({
                emails: {
                    $elemMatch: {
                        address: {
                            $regex: searchString,
                            $options: 'i'
                        }
                    }
                }
            });
            searchQuery.$and.push({
                $or: stringSearches
            });
        }

        if (tenantUserQuery.selectedLimit.value) {
            var dateLimit = new Date(tenantUserQuery.selectedLimit.value);
            searchQuery.createdAt = {
                $gte: dateLimit
            };
            urlQuery.addParam('creationDate', tenantUserQuery.selectedLimit.value);
        }

        if (tenantUserQuery.tags.value.length > 0) {
            searchQuery.tags = {
                $in: tenantUserQuery.tags.value
            };
            urlQuery.addParam('tags', tenantUserQuery.tags.value);
        }

        // Set url query
        urlQuery.apply();
        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            options.sort = {dateCreated: -1};
        }
        TenantUserHandler.setFilter(searchQuery);
        TenantUserHandler.setOptions(options);
    });
};

Template.tenantUsersList.helpers({
    info: function () {
        info.isFiltering.value = TenantUserHandler.totalCount() != 0;
        return info;
    },
    isLoading: function () {
        return SubscriptionHandlers.TenantUserHandler.isLoading();
    },
    tenantUsers: function () {
        return tenantUserCollection.find({}, options);
    }
});


Template.tenantUsersFilters.helpers({
    query: function () {
        return tenantUserQuery;
    },
    tags: function () {
        return tenantUserQuery.tags;
    },
    tenantUsersCount: function () {
        return SubscriptionHandlers.TenantUserHandler.totalCount();
    }
});

Template.tenantUsersListSearch.helpers({
    searchString: function () {
        return tenantUserQuery.searchString;
    },
    isLoading: function () {
        return TenantUserHandler.isLoading();
    },
    listViewMode: function () {
        return listViewMode.get();
    }
});


Template.tenantUsersListSearch.events({

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

Template.tenantUsersListItem.helpers({
    pictureUrl: function (pictureFileId) {
        var picture = TenantUsersFS.findOne({_id: pictureFileId});
        return picture ? picture.url('TenantUsersFSThumbs') : undefined;
    },
    getUserName: function () {
        return Utils.getLocalUserName(this);
    },
    getUserEmail: function () {
        return this.emails[0].address;
    },
    lastLogin: function () {
        var activity = TenantUsersLogin.findOne({ entityId: this._id }, { sort: { 'data.dateCreated': -1 } });
        return activity && activity.data && activity.data.dateCreated;
    }
});

// list sort

var selectedSort = new ReactiveVar();
var sortFields = [
    {field: 'createdAt', displayName: 'Date'},
    {field: 'name', displayName: 'Name'}
];

Template.tenantUserListSort.helpers({
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

Template.tenantUserListSort.events({
    'click .sort-field': function () {
        setSortField(this);
    }
});
