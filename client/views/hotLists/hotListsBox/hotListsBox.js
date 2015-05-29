var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['displayName', 'description'];

var hotListCollection = HotLists;
var HotListHandler, query;

var  leftSectionTitle = new ReactiveVar();
var hotListCount = new ReactiveVar();


var info = new Utils.ObjectDefinition({
    reactiveProps: {
        hotListsCount: {},
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


var loadqueryFromURL = function (params) {
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

    // Tags
    var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }
    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.activeStatus) {
        activeStatusQuery.default = params.activeStatus.split(',');
    }
    else {
        if (Meteor.user()) // verify not a fresh reload
            activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    }
    ;
    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            activeStatus: activeStatusQuery,
            tags: tagsQuery,
            objType: objTypeQuery
        }
    });
};
var listViewDefault = Session.get('hotListListViewMode');
if (!listViewDefault) {
    listViewDefault = true;
}
var listViewMode = new ReactiveVar(listViewDefault);

var searchDep = new Deps.Dependency;
var isSearching = false;

// All
Template.hotListsBox.created = function () {
    query = query || loadqueryFromURL(Router.current().params);
};

Template.hotListsBox.helpers({
    information: function () {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        info.hotListCount.value = HotListHandler.totalCount();

        return info;
    },

    isSearching: function () {
        searchDep.depend();
        return isSearching;
    }
});


var options = {};
// List
Template.hotListList.created = function () {
    if (!SubscriptionHandlers.HotListHandler) {
        SubscriptionHandlers.HotListHandler = Meteor.paginatedSubscribe('hotLists');
    }
    HotListHandler = SubscriptionHandlers.HotListHandler;
    hotListCount.set( HotListHandler.totalCount() );

    selectedSort.set({field: 'displayName', value: 1});

    Meteor.autorun(function () {
        var searchQuery = {};
        var params = {};
        options = {};
        var urlQuery = new URLQuery();

        searchDep.depend();

        if (!_.isEmpty(query.searchString.value)) {
            params.searchString = query.searchString.value;
            urlQuery.addParam('search', query.searchString.value);
        }

        if (query.selectedLimit.value) {
            var dateLimit = new Date();
            searchQuery.dateCreated = {
                $gte: dateLimit.getTime() - query.selectedLimit.value
            };
            urlQuery.addParam('creationDate', query.selectedLimit.value);
        }

        if (query.tags.value.length > 0) {
            searchQuery.tags = {
                $in: query.tags.value
            };
            urlQuery.addParam('tags', query.tags.value);
        }
        if (!_.isEmpty(query.activeStatus.value)) {
            searchQuery.activeStatus = {$in: query.activeStatus.value};

            urlQuery.addParam('activeStatus', query.activeStatus.value);
        }
        ;


        // Set url query
        urlQuery.apply();

        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        HotListHandler.setFilter(searchQuery, params);
        HotListHandler.setOptions(options);

        hotListCount.set( HotListHandler.totalCount() );
    })
};

Template.hotListList.destroyed = function () {
  if (SubscriptionHandlers.HotListHandler) {
    SubscriptionHandlers.HotListHandler.stop();
    delete SubscriptionHandlers.HotListHandler;
  }
};

Template.hotListList.helpers({
    info: function () {
        info.isFiltering.value = HotListHandler.totalCount() != 0;
        return info;
    },

    isLoading: function () {
        return SubscriptionHandlers.HotListHandler.isLoading();
    },

    hotLists: function () {
        return hotListCollection.find({}, options);
    },


    listViewMode: function () {
        return listViewMode.get();
    }
});


// List filters
Template.hotListFilters.helpers({
    query: function () {
        return query;
    },
    leftSectionTitle: function() {
        if( hotListCount.get() > 1) leftSectionTitle.set('Hot Lists');
        else leftSectionTitle.set('Hot List');
        return leftSectionTitle.get();
    },
    contactableTypes: function () {
        return dType.ObjTypes.find({parent: Enums.objGroupType.contactable});
    },

    tags: function () {
        return query.tags;
    }
});

// List search
Template.hotListListSearch.helpers({
    isJob: function () {
        if (entityType == Enums.linkTypes.job.value) return true;
    },

    searchString: function () {
        return query.searchString;
    },

    isLoading: function () {
        return HotListHandler.isLoading();
    },

    listViewMode: function () {
        return listViewMode.get();
    }
});

Template.hotListListSearch.events = {
    'click .addHotList': function (e) {
        Session.set('addOptions', {job: Session.get('entityId')});
        Router.go('/hotListAdd');
        e.preventDefault();
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('hotListListViewMode', true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('hotListListViewMode', false);
    }
};

Template.hotListListHeader.helpers({
    listViewMode: function () {
        return listViewMode.get();
    }
});

// Item

Template.hotListListItem.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    memberCount: function () {
        return (this.members ? this.members.length : 0);
    }
});

// Item information

Template.hotListInformation.helpers({});


// list sort

var selectedSort = new ReactiveVar();
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'displayName', displayName: 'Name'}
];

Template.hotListListSort.helpers({
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

Template.hotListListSort.events = {
    'click .sort-field': function () {
        setSortField(this);
    }
};

