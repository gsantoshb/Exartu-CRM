var clients = Contactables;
var activities = Activities;
var chartActivities = ChartActivities;

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
    if(Meteor.user() != null) {
        var hierId = Meteor.user().currentHierId;
        var members = Meteor.users.find({currentHierId: hierId}).fetch();
        var lkps = LookUps.find({
            lookUpCode: Enums.lookUpCodes.active_status,
            hierId: hierId,
            sortOrder: {$gt: 0}
        }, {sort: {sortOrder: 1}}).fetch();

        var trackers = [];

        _.each(members, function(member){
            var displayName = (member.username ? member.username : member.emails[0].address);
            trackers.push({
                displayName: displayName,
                counter: Contactables.find({userId: member._id, hierId: hierId}).count()
            });
        });
        _.sortBy(trackers, function(o) { return o.displayName; });

        teamMemberTrackers.set( trackers );
    }
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

    //Meteor.subscribe('activitiesContactables');
};

var incrementLimit = function(inc) {
    inc = inc || 30;
    //var newLimit = Session.get('limitActivities') + inc;
    //Session.set('limitActivities', newLimit);
    var newLimit = limitActivities.get() + inc;
    limitActivities.set(newLimit);
};

var weekDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

var activityTrackers = new ReactiveVar([]);
var chartData = new ReactiveVar({});
var showChart = new ReactiveVar(false);
var setChartData = function() {
    var trackersData = activityTrackers.get();
    var chartDataArr = [];
    var colWidth = Session.get("chartWidth"); // we get the chart width calculated before rendering this widget

    _.each(trackersData, function (tracker) {
        chartDataArr.push({
            drilldown: tracker.displayName,
            name: tracker.displayName,
            //name: ' ',
            y: tracker.counter
        });
    });

    chartData.set({
        chart: {
            type: 'column',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            backgroundColor: null
        },
        title: false,
        subtitle: false,
        backgroundColor: null,
        xAxis: {
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0,
            type: 'category'
        },
        yAxis: {
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            title: false,
            labels: {enabled: false}
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            column: {
                pointWidth: colWidth,
                borderWidth: 1
            },
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{y}'
                }
            }
        },

        tooltip: false,
        colors: ["#1bcdfd"],
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: chartDataArr
        }]
    });
};

var setActivityTrackers = function(){
    //var hierId = Meteor.user().currentHierId;
    var activity;
    var weekStart = (moment().startOf('isoweek').subtract(1, 'week').hour(0).minute(0).second(0).unix());//+86400; // unix time
    var dayStart = 0;
    var dayEnd = 0;

    var trackers = [];

    for(var i=1;i<=5;i++){
        //dayStart = weekStart + (86400 * 1000 * (i-1));
        //dayEnd = weekStart + (86400 * 1000 * i);
        dayStart = moment.utc( weekStart + (86400 * (i-1)), "X" ).toISOString();
        dayEnd = moment.utc( weekStart + (86400 * (i)), "X" ).toISOString();

        activity = chartActivities.find({"data.dateCreated": {
            $gte:new Date(dayStart),
            $lt:new Date(dayEnd)
        }}, {limit: 1000});

        trackers.push({
            displayName: weekDayNames[i],
            counter: activity.fetch().length
        });
    }
    activityTrackers.set( trackers );
};

Tracker.autorun(function(){
    //if (ActivitiesHandler) {
    //    ActivitiesHandler.setFilter({type: {$in: activityTypes.get()}}, {searchString: searchString.get()});
    //} else {
    //    SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
    //}

    //isReady.set(true);

    Session.setDefault('limitActivities', 30);
});
var handlerContactalbeTotal;
DashboardController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        if (!SubscriptionHandlers.ActivitiesHandler) {
          SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
          return [HierarchiesHandler, SubscriptionHandlers.ActivitiesHandler];
        }
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

    this.autorun(function () {
        //limitActivities.set(30);

        queryDep.depend();
        //setSubscription();
        setLeadTrackers();
        setTeamMembersTrackers();

        Session.setDefault('limitActivities', 30);

        var searchQuery = {
            type: { $in: activityTypes.get() },
            searchString: searchString.get()
        };

        var options = {
            limit: limitActivities.get(),
            sort: { 'data.dateCreated': -1 }
        };

        //Meteor.subscribe('getActivities', searchQuery, options);

    });

    $('body').addClass('dashboard-page');
};
Template.dashboard.rendered = function() {
    var sidebar = this.$('.sidebar').width();
    Session.set("chartWidth", (sidebar / 5) - 8);


    $(window).scroll(loadMoreHandler);
};
Template.dashboard.destroyed = function() {
    $(window).unbind('scroll', loadMoreHandler);
    $('body').removeClass('dashboard-page');
};

Template.dashboard.helpers({
    activities: function () {
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
        return !(Activities.find({type: { $in: intActivityTypes }}).count() < limitActivities.get());
    },
    getActivityChartObject: function() {
        return chartData.get();
    },
    showActivityChart: function() {
        return showChart.get();
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
        return true; //isReady.get();
    },
    getUserDisplayName: function() {
        var user = Meteor.user() != null ? Meteor.user() : {};
        var hier = Meteor.user() != null ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;

        if(user.firstName && user.lastName){
            return user.firstName+' '+user.lastName;
        }
        else{
            if(user.username)
                return user.username;
            else if(hier)
                return hier.name;
            else if(user.emails)
                return user.emails[0].address;
            else
                return '-';
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
    },
    checkNoNotes: function() {
        var nodes = Notes.find({links: {$elemMatch: { type: Enums.linkTypes.dashboard.value }}});
        return (nodes.count() >= 5);
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
    },
    'click .addDashboardNote': function(e) {
        e.preventDefault();

        Utils.showModal('dashboardAddNote');

        return false;
    },

    'click .addTaskDashboard': function(e) {
        e.preventDefault();

        Utils.showModal('addEditTask', null);

        return false;
    }
});