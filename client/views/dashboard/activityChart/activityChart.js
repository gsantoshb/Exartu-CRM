var self = this;
var activities = ChartActivities;

var weekDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

var activityTrackers = new ReactiveVar([]);
var chartData = new ReactiveVar({});
var setChartData = function() {
    var trackersData = activityTrackers.get();
    var chartDataArr = [];
    var colWidth = Session.get("chartWidth"); // we get the chart width calculated before rendering this widget

    _.each(trackersData, function (tracker) {
        chartDataArr.push({
            drilldown: tracker.displayName,
            name: tracker.displayName,
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
    return;
};

var setActivityTrackers = function(){
    var hierId = Meteor.user().currentHierId;
    var activity;
    var weekStart = (moment().startOf('isoweek').subtract(1, 'week').hour(0).minute(0).second(0).unix())+86400; // unix time
    var dayStart = 0;
    var dayEnd = 0;

    var trackers = [];

    for(var i=1;i<=5;i++){
        //dayStart = weekStart + (86400 * 1000 * (i-1));
        //dayEnd = weekStart + (86400 * 1000 * i);
        dayStart = moment.utc( weekStart + (86400 * (i-1)), "X" ).toISOString();
        dayEnd = moment.utc( weekStart + (86400 * (i)), "X" ).toISOString();
        activity = activities.find({"data.dateCreated": {
            $gte:new Date(dayStart),
            $lt:new Date(dayEnd)
        }}, {limit: 1000});

        trackers.push({
            displayName: weekDayNames[i],
            counter: activity.fetch().length
        });
    }

    console.log(activities.find({}).count());

    activityTrackers.set( trackers );
    return trackers;
};

Template.activityChart.created = function(){
    setActivityTrackers();
    setChartData();

    Meteor.autorun(function () {
        setActivityTrackers();
        setChartData();
    });
};

Template.activityChart.rendered = function(){};

Template.activityChart.helpers({
    getActivityChartObject: function() {
        return chartData.get();
    }
});
