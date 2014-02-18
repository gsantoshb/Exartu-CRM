DashboardController = RouteController.extend({
    template: 'dashboard',
    layoutTemplate: 'mainLayout'
});

Template.dashboard.viewModel = function () {
    var self = this;

    self.activities = ko.meteor.find(Activities, {}, {
        sort: {
            'data.createdAt': -1
        }
    });
    self.activityVM = function (activity) {
        switch (activity.type()) {
        case 0:
            console.log('contactable activity');
            return 'dashboardContactableActivity';
        default:
            console.log('empty activity');
            return 'dashboardEmptyActivity';
        }
    };

    self.getActivityTime = function (activity) {
        var now = new Date();
        var diffMs = now - new Date(activity.data.createdAt());
        var diffDays = Math.floor(diffMs / 86400000);
        var diffHours = Math.floor((diffMs % 86400000) / 3600000);
        var diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000);

        if (diffDays >= 1) {
            return {
                unity: 'D',
                diff: diffDays
            }
        } else if (diffHours >= 1) {
            return {
                unity: 'H',
                diff: diffHours
            }
        } else {
            return {
                unity: 'M',
                diff: diffMins
            }
        }
    }

    return self;
};

Template.dashboard.rendered = function () {
    exartu = {
        // === Peity charts === //
        sparkline: function () {
            $(".sparkline_line_good span").sparkline("html", {
                type: "line",
                fillColor: "#4cd964",
                lineColor: "#4cd964",
                width: "50",
                height: "24"
            });
            $(".sparkline_line_bad span").sparkline("html", {
                type: "line",
                fillColor: "#de0a0a",
                lineColor: "#de0a0a",
                width: "50",
                height: "24"
            });
            $(".sparkline_line_neutral span").sparkline("html", {
                type: "line",
                fillColor: "#CCCCCC",
                lineColor: "#757575",
                width: "50",
                height: "24"
            });

            $(".sparkline_bar_good span").sparkline('html', {
                type: "bar",
                barColor: "#4cd964",
                barWidth: "5",
                height: "24"
            });
            $(".sparkline_bar_bad span").sparkline('html', {
                type: "bar",
                barColor: "#de0a0a",
                barWidth: "5",
                height: "24"
            });
            $(".sparkline_bar_neutral span").sparkline('html', {
                type: "bar",
                barColor: "#757575",
                barWidth: "5",
                height: "24"
            });
        },

        // === Tooltip for flot charts === //
        flot_tooltip: function (x, y, contents) {

            $('<div id="tooltip">' + contents + '</div>').css({
                top: y + 5,
                left: x + 5
            }).appendTo("body").fadeIn(200);
        }
    }
    
    exartu.sparkline();
}