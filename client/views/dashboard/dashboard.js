var clients = Contactables;
var activities = Activities;
var ActivitiesHandler;
var activityTypes = {
    val: [
        Enums.activitiesType.contactableAdd,
        Enums.activitiesType.taskAdd,
        Enums.activitiesType.placementAdd,
        Enums.activitiesType.jobAdd,
        Enums.activitiesType.noteAdd,
        Enums.activitiesType.fileAdd
    ],
    dep: new Tracker.Dependency,
    get: function() {
        this.dep.depend();
        return this.val;
    },
    set: function(newVal) {
        this.val = newVal;
        this.dep.changed();
    }
};

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

var leadTrackers = new ReactiveVar([]);
var teamMemberTrackers = new ReactiveVar([]);
var isReady = new ReactiveVar(null);
var limitActivities = new ReactiveVar(30);

var setLeadTrackers = function(){
    var hierId = (Meteor.user() ? Meteor.user().currentHierId : undefined);
    var lkps = LookUps.find({
        lookUpCode: Enums.lookUpCodes.client_status,
        hierId: hierId,
        sortOrder: {$gt: 0}
    }, {sort: {sortOrder: 1}}).fetch();

    var trackers = [];
    var oneMonthAgo = (moment().subtract(1, 'month').unix()) * 1000;

    _.each(lkps, function(item){
        var code = item._id;
        trackers.push({
            displayName: item.displayName,
            sortOrder: item.sortOrder,
            code: code,
            counter: clients.find({'Client.status': code}, {"dateCreated" : { $gte : oneMonthAgo }, hierId: hierId}).count()
        });
    });
    _.sortBy(trackers, function(o) { return o.sortOrder; });
    trackers.reverse();

    leadTrackers.set(trackers);
    //return trackers;
};

var setTeamMembersTrackers = function(){
    var hierId = Meteor.user().currentHierId;
    var members = Meteor.users.find({currentHierId: hierId}).fetch();

    var trackers = [];

    _.each(members, function(member){
        var displayName = (member.username ? member.username : member.emails[0].address);
        trackers.push({
            displayName: displayName,
            counter: clients.find({userId: member._id, hierId: hierId}).count()
        });
    });
    _.sortBy(trackers, function(o) { return o.displayName; });

    teamMemberTrackers.set( trackers );
    //return trackers;
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
};

var setSubscription = function(){
    if (ActivitiesHandler) {
        ActivitiesHandler.setFilter({type: {$in: activityTypes.get()}}, {searchString: searchString.get()});
    }
    else{
        SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
    }

    Meteor.subscribe('activitiesContactables');
};

var incrementLimit = function(inc) {
    inc = inc || 30;
    //var newLimit = Session.get('limitActivities') + inc;
    //Session.set('limitActivities', newLimit);
    var newLimit = limitActivities.get() + inc;
    limitActivities.set(newLimit);
};


Tracker.autorun(function(){
    //if (ActivitiesHandler) {
    //    ActivitiesHandler.setFilter({type: {$in: activityTypes.get()}}, {searchString: searchString.get()});
    //} else {
    //    SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
    //}

    //isReady.set(true);

    console.log('autorun');

    Session.setDefault('limitActivities', 30);

    var searchQuery = {
        type: { $in: activityTypes.get() },
        searchString: searchString.get()
    }

    var options = {
        limit: limitActivities.get(),
        sort: { 'data.dateCreated': -1 }
    };

    Meteor.subscribe('activitiesContactables');
    Meteor.subscribe('getActivities', searchQuery, options);
});

DashboardController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        //if (!SubscriptionHandlers.ActivitiesHandler) {
        //  SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
        //  return [HierarchiesHandler, SubscriptionHandlers.ActivitiesHandler];
        //}
        //setSubscription();
        //setLeadTrackers();
        //setTeamMembersTrackers();
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

var loadMoreHandler = function() {
    //console.log('load more');
    //ActivitiesHandler.loadMore();

    var threshold, target = $("body");
    var loader = $('.infinite-scroll-loader');
    if(!loader.length) return false;

    threshold = $(window).scrollTop() + $(window).height() - target.height();
    //console.log(threshold);
    if (target.offset().top < threshold + 1 && threshold < 2) {
        if (!loader.data("visible")) {
            // console.log("target became visible (inside viewable area)");
            loader.data("visible", true);
            loader.show();
            console.log('increment');
            incrementLimit();
        }
    } else {
        if (loader.data("visible")) {
            // console.log("target became invisible (below viewable arae)");
            loader.data("visible", false);
            loader.hide();
        }
    }
};

// Main template
Template.dashboard.created = function () {
    //setSubscription();
    //setLeadTrackers();
    //setTeamMembersTrackers();

    Session.set("chartWidth", ($('.sidebar').width() / 5) - 8);

    this.autorun(function () {
        //limitActivities.set(30);

        queryDep.depend();
        //setSubscription();
        setLeadTrackers();
        setTeamMembersTrackers();

        console.log('template autorun');

        Session.setDefault('limitActivities', 30);

        var searchQuery = {
            type: { $in: activityTypes.get() },
            searchString: searchString.get()
        }

        var options = {
            limit: limitActivities.get(),
            sort: { 'data.dateCreated': -1 }
        };

        Session.set("chartWidth", ($('.sidebar').width() / 5) - 8);
        Meteor.subscribe('getActivities', searchQuery, options);
    });
};
Template.dashboard.rendered = function() {
    $(window).bind('scroll', loadMoreHandler);
};
Template.dashboard.destroyed = function() {
    $(window).unbind('scroll', loadMoreHandler);
    loadMoreHandler = null;
    console.log('calling destroyed method');
};

Template.dashboard.helpers({
    activities: function () {
        console.log('updating the activities list...');
        console.log(limitActivities.get());
        var intActivityTypes = [];
        _.each(activityTypes.get(), function(activityType) {
            intActivityTypes.push(parseInt(activityType));
        });
        var activ = Activities.find({
            type: {
                $in: intActivityTypes
            }
        }, {sort: {'data.dateCreated': -1}});
        return activ;
    },
    moreResults: function() {
        var intActivityTypes = [];
        _.each(activityTypes.get(), function(activityType) {
            intActivityTypes.push(parseInt(activityType));
        });
        return !(Activities.find({type: { $in: intActivityTypes }}).count() < Session.get('limitActivities'));
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
        //console.log('handler count: ' + ActivitiesHandler.totalCount());
        //console.log(isReady.get());
        return true; //isReady.get();
    },
    getUserDisplayName: function() {
        var user = Meteor.user();
        var hier = Meteor.user() ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;

        if(user.firstName && user.lastName){
            return user.firstName+' '+user.lastName;
        }
        else{
            if(user.username)
                return user.username;
            else if(hier)
                return hier.name;
            else
                return user.emails[0].address;
        }
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
        return leadTrackers.get();
    },
    getTeamMembersTrackers: function() {
        return teamMemberTrackers.get();
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
        searchString.set(e.target.value);
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

        activityTypes.set(getSelectedActivityFilters());
        queryDep.changed();
    }
});