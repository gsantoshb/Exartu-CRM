DashboardController = RouteController.extend({
  template: 'dashboard',
  layoutTemplate: 'mainLayout'
});

var filters = ko.observable(ko.mapping.fromJS({
  limit: 10
}));
Template.dashboard.waitOn=['ObjTypesHandler', 'UsersHandler']
Template.dashboard.viewModel = function () {
  var self = this;

  var options = ko.computed(function () {
    return {limit: ko.toJS(filters().limit),
      sort: {
        'data.createdAt': -1
      }
    };
  });

  self.showMore = function () {
    filters().limit(filters().limit() + 10);
  }

  self.activities = ko.meteor.find(Activities, {}, options);

  self.activityVM = function (activity) {
    switch (activity.type()) {
      case 0:
        return 'dashboardContactableActivity';
      case 2:
        return 'dashboardTaskActivity';
      case 3:
        return 'dashboardJobActivity';
      default:
        return 'dashboardEmptyActivity';
    }
  };
  var now = new Date();
  var timeInADay = 24 * 60 * 60 * 1000;
  var days = [now.getTime() - (timeInADay) * 7, now.getTime() - (timeInADay) * 6, now.getTime() - (timeInADay) * 5, now.getTime() - (timeInADay) * 4, now.getTime() - (timeInADay) * 3, now.getTime() - (timeInADay) * 2, now.getTime() - (timeInADay) * 1, now.getTime() - (timeInADay) * 0];

  var customerQuery = {
    Customer: {
      $exists: true
    }
  };
  var employeeQuery = {
    Employee: {
      $exists: true
    }
  }
  self.jobHistory = getHistorical(Jobs, days);
  self.customerHistory = getHistorical(Contactables, days, customerQuery);
  self.employeeHistory = getHistorical(Contactables, days, employeeQuery);
  self.jobCount = ko.observable(Jobs.find().count());
  self.employeeCount = ko.observable(Contactables.find(employeeQuery).count());
  self.customerCount = ko.observable(Contactables.find(customerQuery).count());
  //    self.jobGrowth = ko.observable();

  return self;
};
var getHistorical = function (collection, timeStamps, query) {
  var history = [];
  var q = query || {};
  //    debugger;
  _.each(timeStamps, function (time) {
    q.createdAt = {
      $lte: time
    }
    history.push(collection.find(q).count());
  })
  var last = history.length - 1;
//    debugger;
  if (history[last] != 0) {
    var growth = Math.round(100 * (history[last] - history[last - 1]) / history[last]);
  } else {
    var growth = 0;
  }
  history = ko.observableArray(history);

  history.growth = (growth > 0 ? '+' : growth < 0 ? '-' : '') + growth + '%';
  return history;
}

var deepLog = function(obj, path) {
  if (path == undefined)
    path = "";
  _.forEach(_.keys(obj), function(key) {
    if(_.isObject(key))
      deepLog(key,  path + ' > ' + key);
    else {
      console.log('-----------------------------------------------------');
      path += ' > ' + key;
      console.log(path + ': ' + obj[key]);
    }
  })
};

Template.dashboard.rendered = function () {
  exartu = {
    // === Peity charts === //
    //        sparkline: function () {
    //            $(".sparkline_line_good span").sparkline("html", {
    //                type: "line",
    //                fillColor: "#4cd964",
    //                lineColor: "#4cd964",
    //                width: "50",
    //                height: "24"
    //            });
    //            $(".sparkline_line_bad span").sparkline("html", {
    //                type: "line",
    //                fillColor: "#de0a0a",
    //                lineColor: "#de0a0a",
    //                width: "50",
    //                height: "24"
    //            });
    //            $(".sparkline_line_neutral span").sparkline("html", {
    //                type: "line",
    //                fillColor: "#CCCCCC",
    //                lineColor: "#757575",
    //                width: "50",
    //                height: "24"
    //            });
    //
    //            $(".sparkline_bar_good span").sparkline('html', {
    //                type: "bar",
    //                barColor: "#4cd964",
    //                barWidth: "5",
    //                height: "24"
    //            });
    //            $(".sparkline_bar_bad span").sparkline('html', {
    //                type: "bar",
    //                barColor: "#de0a0a",
    //                barWidth: "5",
    //                height: "24"
    //            });
    //            $(".sparkline_bar_neutral span").sparkline('html', {
    //                type: "bar",
    //                barColor: "#757575",
    //                barWidth: "5",
    //                height: "24"
    //            });
    //        },

    // === Tooltip for flot charts === //
    flot_tooltip: function (x, y, contents) {

      $('<div id="tooltip">' + contents + '</div>').css({
        top: y + 5,
        left: x + 5
      }).appendTo("body").fadeIn(200);
    }
  }

  //    exartu.sparkline();
}