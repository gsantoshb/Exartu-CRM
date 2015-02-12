var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['emails[0].address', 'description'];

var leaderBoardCollection = LeaderBoards;
var LeaderBoardHandler, query;

var info = new Utils.ObjectDefinition({
    reactiveProps: {
        leaderBoardsCount: {},
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

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            tags: tagsQuery,
            objType: objTypeQuery
        }
    });
};
var listViewDefault = Session.get('leaderBoardListViewMode');
if (!listViewDefault) {
    listViewDefault = true;
}
var listViewMode = new ReactiveVar(listViewDefault);

var searchDep = new Deps.Dependency;
var isSearching = false;

// All
Template.leaderBoardsBox.created = function () {
    query = query || loadqueryFromURL(Router.current().params);
};

Template.leaderBoardsBox.helpers({
    information: function () {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        info.leaderBoardCount.value = LeaderBoardHandler.totalCount();

        return info;
    },

    isSearching: function () {
        searchDep.depend();
        return isSearching;
    }
});


var options = {};
// List
Template.leaderBoardList.created = function () {
    if (!SubscriptionHandlers.LeaderBoardHandler) {
        SubscriptionHandlers.LeaderBoardHandler = Meteor.paginatedSubscribe('leaderBoards');
    }
    LeaderBoardHandler = SubscriptionHandlers.LeaderBoardHandler;
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


        // Set url query
        urlQuery.apply();

        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        console.log('leadersearch',searchQuery);
        LeaderBoardHandler.setFilter(searchQuery, params);
        LeaderBoardHandler.setOptions(options);
    })
};

Template.leaderBoardList.helpers({
    info: function () {
        info.isFiltering.value = LeaderBoardHandler.totalCount() != 0;
        return info;
    },

    isLoading: function () {
        return SubscriptionHandlers.LeaderBoardHandler.isLoading();
    },

    leaderBoards: function () {
        return leaderBoardCollection.find({}, options);
    },


    listViewMode: function () {
        return listViewMode.get();
    }
});


// List filters
Template.leaderBoardFilters.helpers({
    query: function () {
        return query;
    },

    contactableTypes: function () {
        return dType.ObjTypes.find({parent: Enums.objGroupType.contactable});
    },

    tags: function () {
        return query.tags;
    }
});

// List search
Template.leaderBoardListSearch.helpers({
    isJob: function () {
        if (entityType == Enums.linkTypes.job.value) return true;
    },

    searchString: function () {
        return query.searchString;
    },

    isLoading: function () {
        return LeaderBoardHandler.isLoading();
    },

    listViewMode: function () {
        return listViewMode.get();
    }
});

Template.leaderBoardListSearch.events = {
    'click .addLeaderBoard': function (e) {
        Session.set('addOptions', {job: Session.get('entityId')});
        Router.go('/leaderBoardAdd/leaderBoard');
        e.preventDefault();
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('leaderBoardListViewMode', true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('leaderBoardListViewMode', false);
    }
};

// Item

Template.leaderBoardListItem.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    memberCount: function () {
        return this.members.length;
    }
});

// Item information

Template.leaderBoardInformation.helpers({});


// list sort

var selectedSort = new ReactiveVar();
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'displayName', displayName: 'Name'}
];

Template.leaderBoardListSort.helpers({
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

Template.leaderBoardListSort.events = {
    'click .sort-field': function () {
        setSortField(this);
    }
};
