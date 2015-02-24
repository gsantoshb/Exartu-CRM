/**
 * Variables
 */
var entityType = null;
var isEntitySpecific = false;
var contactable;
var searchFields = ['employeeInfo.firstName', 'employeeInfo.lastName', 'employeeInfo.middleName'];

var placementCollection = Placements;
var PlacementHandler, query;

var info = new Utils.ObjectDefinition({
    reactiveProps: {
        placementsCount: {},
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

    // Mine only
    var mineQuery = {type: Utils.ReactivePropertyTypes.boolean};
    if (params.mine) {
        mineQuery.default = !!params.mine;
    }



    // CreationDate
    var creationDateQuery = {};
    if (params.creationDate) {
        creationDateQuery.default = params.creationDate;
    }

    // Status
    var statusQuery = { type: Utils.ReactivePropertyTypes.array };
    if (params.status) {
        statusQuery.default = params.status.split(',');
    }

    // Tags
    var tagsQuery = { type: Utils.ReactivePropertyTypes.array };
    if (params.tags) {
        tagsQuery.default = params.tags.split(',');
    }

    var activeStatusQuery = {type: Utils.ReactivePropertyTypes.array};
    if (params.activeStatus) {
        activeStatusQuery.default = params.activeStatus.split(',');
    }
    else
    {
        if (Meteor.user()) // verify not a fresh reload
            activeStatusQuery.default = [Utils.getActiveStatusDefaultId()];
    };

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            selectedLimit: creationDateQuery,
            activeStatus: activeStatusQuery,
            tags: tagsQuery,
            mineOnly: mineQuery,
            statuses: statusQuery
        }
    });
};
var listViewDefault=Session.get('placementListViewMode');
if (!listViewDefault)
{
    listViewDefault=false;
}
var listViewMode = new ReactiveVar(listViewDefault);

var searchDep = new Deps.Dependency;
var isSearching = false;

var options = {};

var getCandidateStatuses = function(objname){
    var code = Enums.lookUpTypes["candidate"].status.lookUpCode;
    var lkps = LookUps.find( { lookUpCode:code, lookUpActions: { $in: [ objname ] }}).fetch();
    var ids = _.map(lkps,function(doc) {  return doc._id;});
    return ids;
};

// list sort
var selectedSort =  new ReactiveVar();
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
    {field: 'employeeInfo.lastName', displayName: 'Name'}
];

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

/**
 * Callbacks
 */
Template.placementsBox.created = function(){
    if (!SubscriptionHandlers.PlacementHandler){
        SubscriptionHandlers.PlacementHandler = Meteor.paginatedSubscribe('placements');
    }
    PlacementHandler = SubscriptionHandlers.PlacementHandler;
    query = query || loadqueryFromURL(Router.current().params.query);

    var entityId = Session.get('entityId');
    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;

    if (entityType != null) {
        isEntitySpecific = true;
        if (entityType == Enums.linkTypes.contactable.value) {
            contactable = Contactables.findOne({_id: entityId});
        }
    }
};

Template.placementList.created = function () {


    Meteor.autorun(function () {
        var searchQuery = {
            $and: [] // Push each $or operator here
        };
        var params = {};
        options = {};
        var urlQuery = new URLQuery();

        searchDep.depend();

        if (entityType==Enums.linkTypes.job.value) searchQuery.job=Session.get('entityId');

        if (entityType==Enums.linkTypes.contactable.value) {
            if (contactable.Client) {
                // Get client jobs
                var jobsId = Jobs.find({client: Session.get('entityId')}).map(function (job) { return job._id;});
                searchQuery.job = {$in: jobsId};
            }
            if (contactable.Employee) searchQuery.employee=Session.get('entityId');
        }

        if (!_.isEmpty(query.searchString.value)) {
            params.searchString = query.searchString.value;
            urlQuery.addParam('search', query.searchString.value);
        }

        //Created by
        if (query.mineOnly.value) {
            searchQuery.$and.push({userId: Meteor.userId()});
            urlQuery.addParam('mine', true);
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
        if (!_.isEmpty(query.activeStatus.value)){
            searchQuery.activeStatus={$in: query.activeStatus.value};

            urlQuery.addParam('activeStatus', query.activeStatus.value);
        };

        if (query.statuses.value && query.statuses.value.length > 0){
            searchQuery.candidateStatus = {$in: query.statuses.value};
            urlQuery.addParam('status', query.statuses.value);
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
        if (searchQuery.$and.length == 0)
            delete searchQuery.$and;
        PlacementHandler.setFilter(searchQuery, params);
        PlacementHandler.setOptions(options);
    })
};

/**
 * Helpers
 */
// Placements Box - Helpers
Template.placementsBox.helpers({
    isSearching: function () {
        searchDep.depend();
        return isSearching;
    }
});

// List Header - Helpers
Template.placementListHeader.helpers({
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Search - Helpers
Template.placementListSearch.helpers({
    isJob: function () {
        if (entityType == Enums.linkTypes.job.value) return true;
    },
    showAddButton: function() {
        return entityType == Enums.linkTypes.job.value;
    },
    searchString: function () {
        return query.searchString;
    },
    isLoading: function () {
        return PlacementHandler.isLoading();
    },
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Sort - Helpers
Template.placementListSort.helpers({
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

// List Filters - Helpers
Template.placementFilters.helpers({
    information: function() {
        var searchQuery = {};

        //if (query.objType.value)
        //    searchQuery.objNameArray = query.objType.value;

        info.placementsCount = PlacementHandler.totalCount();

        return info;
    },
    query: function () {
        return query;
    },
    tags: function () {
        return query.tags;
    }
});

// List - Helpers
Template.placementList.helpers({
    listViewMode: function () {
        return listViewMode.get();
    },
    info: function () {
        info.isFiltering.value = PlacementHandler.totalCount() != 0;
        return info;
    },
    isLoading: function () {
        return SubscriptionHandlers.PlacementHandler.isLoading();
    },
    placements: function () {
        return placementCollection.find({}, options);
    },
    placementTypes: function () {
        return dType.ObjTypes.find({parent: Enums.objGroupType.placement});
    },
    listViewMode: function () {
        return listViewMode.get();
    }
});

// List Item - Helpers
Template.placementListItem.helpers({
    employeeDisplayName: function () {
        var employee = Contactables.findOne(this.employee);
        return employee && employee.displayName;
    },
    jobDisplayName: function () {
        var job = Jobs.findOne(this.job);
        return job && job.displayName;
    },
    jobLocationDisplayName: function () {
        var job = Jobs.findOne(this.job);
        return job && Utils.getLocationDisplayName(job.location);
    },
    clientId: function () {
        var job = Jobs.findOne(this.job);
        var client = job && Contactables.findOne(job.client);
        return client && client._id;
    },
    clientDisplayName: function () {
        var job = Jobs.findOne(this.job);
        var client = job && Contactables.findOne(job.client);
        return client && client.displayName;
    },
    pictureUrl: function (pictureFileId) {
        var picture = PlacementsFS.findOne({_id: pictureFileId});
        return picture ? picture.url('PlacementsFSThumbs') : undefined;
    },
    placementIcon: function () {
        return helper.getEntityIcon(this);
    },
    statusDisplayName: function (item) {
        var lookUp = LookUps.findOne({_id: this.placementStatus});

        if (lookUp) return lookUp.displayName;
    },
    displayObjType: function () {
        return Utils.getPlacementType(this);
    },

    listViewMode: function () {
        return listViewMode.get();
    }
});

// Placement Information - Helpers
Template.placementInformation.helpers({
    getRateTypeDisplayName: function () {
        var rate = LookUps.findOne(this.type);
        return rate.displayName;
    }
});

/**
 * Events
 */
// List Search - Events
Template.placementListSearch.events({
    'keyup #searchString': _.debounce(function(e){
        query.searchString.value = e.target.value;
      },200),
    'click #toggle-filters': function(e){
        if( $(e.currentTarget).attr('data-view') == 'normal' ){
            $('body .network-content #column-filters').addClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-9').addClass('col-md-12');
            $(e.currentTarget).attr('data-view', 'wide');
        }
        else{
            $('body .network-content #column-filters').removeClass('hidden');
            $('body .network-content #column-list').removeClass('col-md-12').addClass('col-md-9');
            $(e.currentTarget).attr('data-view', 'normal');
        }
    },
    'click .addPlacement': function (e) {
        Session.set('addOptions', {job: Session.get('entityId')});
        Router.go('/placementAdd/placement');
        e.preventDefault();
    },
    'click #list-view': function () {
        listViewMode.set(true);
        Session.set('placementListViewMode',true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
        Session.set('placementListViewMode',false);
    }
});

// List Sort - Helpers
Template.placementListSort.events({
    'click .sort-field': function() {
        setSortField(this);
    }
});