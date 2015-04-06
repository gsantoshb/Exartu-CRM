var clients = Contactables;
var ActivitiesHandler;
var activityTypes = [
    Enums.activitiesType.contactableAdd,
    Enums.activitiesType.taskAdd,
    Enums.activitiesType.placementAdd,
    Enums.activitiesType.jobAdd,
    Enums.activitiesType.noteAdd,
    Enums.activitiesType.fileAdd
];

DashboardController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        //if (!SubscriptionHandlers.ActivitiesHandler) {
        //  SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes}}});
        //  return [HierarchiesHandler, SubscriptionHandlers.ActivitiesHandler];
        //}
        setLeadTrackers();
        setTeamMembersTrackers();
    },
    onAfterAction: function () {
        var title = 'Dashboard',
            description = 'Quickly check system status and activity';
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


var query = {
    options: {
        limit: 50,
        sort: {'data.dateCreated': -1}
    },
    filter: {
        searchString: ''
    }
};
var queryDep = new Deps.Dependency;
var searchString = new ReactiveVar('');
var listViewMode = new ReactiveVar(true);

var leadTrackers = [];
var teamMemberTrackers = [];

var setLeadTrackers = function(){
    var hierId = Meteor.user().currentHierId;
    var lkps = LookUps.find({
        lookUpCode: Enums.lookUpCodes.client_status,
        hierId: hierId,
        sortOrder: {$gt: 0}
    }, {sort: {sortOrder: 1}}).fetch();

    leadTrackers = [];
    var oneMonthAgo = moment().subtract(1, 'month') - 1000;

    _.each(lkps, function(item){
        var code = item._id;
        leadTrackers.push({
            displayName: item.displayName,
            sortOrder: item.sortOrder,
            code: code,
            counter: clients.find({'Client.status': code}, {"dateCreated" : { $gte : oneMonthAgo }, hierId: hierId}).count()
        });
    });

    _.sortBy(leadTrackers, function(o) { return o.sortOrder; });
    leadTrackers.reverse();

    return leadTrackers;
};

var setTeamMembersTrackers = function(){
    var hierId = Meteor.user().currentHierId;
    var members = Meteor.users.find({currentHierId: hierId}).fetch();

    teamMemberTrackers = [];

    _.each(members, function(member){
        var displayName = (member.username ? member.username : member.emails[0].address);
        teamMemberTrackers.push({
            displayName: displayName,
            counter: clients.find({userId: member._id, hierId: hierId}).count()
        });
    });

    _.sortBy(teamMemberTrackers, function(o) { return o.displayName; });
console.log(teamMemberTrackers);
    return teamMemberTrackers;
};

var getSelectedActivityFilters = function(){
    var filters = [];
    $('.activityFilter-option').each(function() {
        if($(this).prop('checked') && $(this).val() != 'all')
            filters.push($(this).val());
    });
    //console.log('filters : ');
    //console.log(filters);

    return filters;
}

// Main template
Template.dashboard.created = function () {
    Meteor.autorun(function () {

        queryDep.depend();
        if (ActivitiesHandler) {
            ActivitiesHandler.setFilter({type: {$in: activityTypes}}, {searchString: query.filter.searchString});
        }
        else{
            SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes}}});
        }
        setLeadTrackers();
        setTeamMembersTrackers();
        //console.log(leadTrackers);
        console.log(teamMemberTrackers);

    });
    //
    //console.log( Enums.lookUpTypes.deal );
};

Template.dashboard.helpers({
    activities: function () {
        //console.log( 'is infinite scroll : '+SubscriptionHandlers.ActivitiesHandler.isInfiniteScroll() );
        return Activities.find({}, {sort: {'data.dateCreated': -1}});
    },
    listViewMode: function () {
        return listViewMode.get();
    },
    getTemplateForActivity: function () {
        switch (this.type) {
            case Enums.activitiesType.contactableAdd:
                return 'contactableAddActivity';
            case Enums.activitiesType.jobAdd:
                return 'jobAddActivity';
            case Enums.activitiesType.taskAdd:
                return 'taskAddActivity';
            case Enums.activitiesType.placementAdd:
                return 'placementAddActivity';
            case Enums.activitiesType.noteAdd:
                return 'noteAddActivity';
            case Enums.activitiesType.fileAdd:
                return 'fileAddActivity';
        }
    },
    getCtx: function () {
        this.listViewMode = listViewMode.get();
        return this;
    },
    isReady: function(){

        return ActivitiesHandler.ready();

    },
    userName: function () {
        return Meteor.user().username;
    },
    userEmail: function () {
        return Meteor.user().emails[0].address;
    },
    currentHierName: function () {
        var hier = Meteor.user() ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;
        return hier ? hier.name : '';
    },
    getLeadTrackers: function() {
        return leadTrackers;
    },
    getTeamMembersTrackers: function() {
        return teamMemberTrackers;
    },

    getTypeContactable: function(){
        return Enums.activitiesType.contactableAdd;
    },
    getTypeTasks: function(){
        return Enums.activitiesType.taskAdd;
    },
    getTypePlacements: function(){
        return Enums.activitiesType.placementAdd;
    },
    getTypeJobs: function(){
        return Enums.activitiesType.jobAdd;
    },
    getTypeNotes: function(){
        return Enums.activitiesType.noteAdd;
    },
    getTypeFiles: function(){
        return Enums.activitiesType.fileAdd;
    }
});

Template.dashboard.events({
    'keyup #searchString': _.debounce(function (e) {
        query.filter.searchString = e.target.value;
        queryDep.changed();
        console.log('it should search now...');
    }, 200),
    'click #list-view': function () {
        listViewMode.set(true);
    },
    'click #detail-view': function () {
        listViewMode.set(false);
    },
    'click #activityFilter input': function(e, ctx) {
        //console.log(getSelectedActivityFilters());
        console.log($(e.currentTarget).val());
        if( $(e.currentTarget).val() == 'all' ){
            if( $(e.currentTarget).prop('checked') ){
                _.each($('#activityFilter input'), function(element){
                    $(element).prop('checked', true);
                });
            }
            else{
                _.each($('#activityFilter input'), function(element){
                    $(element).prop('checked', false);
                });
            }
        }
        else {
            if (!$(e.currentTarget).prop('checked'))
                $('#activityFilter input#feed-all').prop('checked', false);
        }

        activityTypes = getSelectedActivityFilters();
        queryDep.changed();
    }
});
