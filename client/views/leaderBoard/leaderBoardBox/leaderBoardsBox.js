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

    // Tags
    var tagsQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    };
    var leaderBoardQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.leaderBoard) {
        leaderBoardQuery.default = params.leaderBoard;
    };

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            leaderBoardType: leaderBoardQuery,
            tags: tagsQuery
        }
    });
};


var listViewDefault = Session.get('leaderBoardListViewMode');
if (!listViewDefault) {
    listViewDefault = true;
}
var listViewMode = new ReactiveVar(listViewDefault);

var isSearching = false;

// All
Template.leaderBoardsBox.created = function () {
    if (!SubscriptionHandlers.LeaderBoardHandler) {
        SubscriptionHandlers.LeaderBoardHandler = Meteor.paginatedSubscribe('leaderBoards');
    }
    LeaderBoardHandler = SubscriptionHandlers.LeaderBoardHandler;
    query =  loadqueryFromURL(Router.current().params);
};

var getBoard=function() {
    var board=Enums.lookUpAction.LeaderBoardType_Activity;
    if (query.leaderBoardType.value)
    {
        var lkp=LookUps.findOne({_id:query.leaderBoardType.value});
        if (lkp && lkp.lookUpActions && lkp.lookUpActions.length>0)
        {
            board=lkp.lookUpActions[0];
        }
    }
    return board;
};
Template.leaderBoardsBox.helpers({
    getLeaderBoardHeaderTemplate: function(){
        switch (getBoard()) {
            case Enums.lookUpAction.LeaderBoardType_Activity:
                return 'leaderBoardActivityListHeader';
            case Enums.lookUpAction.LeaderBoardType_Pipeline:
                alert('this board is under construction');
                return 'leaderBoardPipelineListHeader';
            case Enums.lookUpAction.LeaderBoardType_Contacts:
                alert('this board is under construction');
                return 'leaderBoardContactListHeader';
        };
    },


    information: function () {
        var searchQuery = {};

        if (query.objType.value)
            searchQuery.objNameArray = query.objType.value;

        info.leaderBoardCount.value = LeaderBoardHandler.totalCount();

        return info;
    },

    isSearching: function () {
        return isSearching;
    }
});


var options = {};
// List
var searchQuery;
Template.leaderBoardList.created = function () {

    Meteor.autorun(function () {
        searchQuery = {};
        var params = {};
        options = {};
        var urlQuery = new URLQuery();

        if (query.tags.value.length > 0) {
            searchQuery.tags = {
                $in: query.tags.value
            };
            urlQuery.addParam('tags', query.tags.value);
        };
        if (query.leaderBoardType.value) {
            urlQuery.addParam('leaderBoardType',query.leaderBoardType.value)
        };
        // Set url query
        urlQuery.apply();

        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        if (query.searchString.value) {
            //find user emails matching the search string
            var uids=[];
            var users=Meteor.users.find({'emails.0.address': {$regex: query.searchString.value,$options: 'i'}}).fetch();
            _.map(users, function (doc) {
                uids.push(doc._id);
            });
            searchQuery._id= {$in: uids};
            urlQuery.addParam('search', query.searchString.value);
        }
        LeaderBoardHandler.setFilter(searchQuery, params);
        LeaderBoardHandler.setOptions(options);
    })
};

Template.leaderBoardList.helpers({
    getLeaderBoardListItemTemplate: function(){
        switch (getBoard()) {
            case Enums.lookUpAction.LeaderBoardType_Activity:
                return 'leaderBoardActivityListItem';
            case Enums.lookUpAction.LeaderBoardType_Pipeline:
                return 'leaderBoardPipelineListItem';
            case Enums.lookUpAction.LeaderBoardType_Contacts:
                return 'leaderBoardContactListItem';
        };
    },
    info: function () {
        info.isFiltering.value = LeaderBoardHandler.totalCount() != 0;
        return info;
    },

    isLoading: function () {
        return SubscriptionHandlers.LeaderBoardHandler.isLoading();
    },

    leaderBoards: function () {
        switch (getBoard()) {
            case Enums.lookUpAction.LeaderBoardType_Activity:
                var activity=leaderBoardCollection.findOne({_id:'Notes'}, options);
                if (query.searchString.value)
                {
                    var uids=[];
                    var users=Meteor.users.find({'emails.0.address': {$regex: query.searchString.value,$options: 'i'}}).fetch();
                    _.map(users, function (doc) {
                        uids.push(doc._id);
                    });
                    return _.filter(activity.counts,function(c) { return _.contains(uids, c._id)});
                }
                else
                {
                    return activity.counts;
                };
            case Enums.lookUpAction.LeaderBoardType_Pipeline:
                return 'leaderBoardPipelineListItem';
            case Enums.lookUpAction.LeaderBoardType_Contacts:
                return 'leaderBoardContactListItem';
        };
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

    tags: function () {
        return query.tags;
    }
});

// List search
Template.leaderBoardListSearch.helpers({
    query: function () {
        return query;
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
    'keyup #searchString': _.debounce(function(e){
        query.searchString.value = e.target.value;
    },200),
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

Template.leaderBoardActivityListItem.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    memberCount: function () {
        return this.members.length;
    }
});
Template.leaderBoardContactListItem.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    memberCount: function () {
        return this.members.length;
    }
});
Template.leaderBoardPipelineListItem.helpers({
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
