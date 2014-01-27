DashboardController = RouteController.extend({
	template: 'dashboard',
	layoutTemplate: 'mainLayout'
});

Template.dashboard.rendered = function () {

	// Model
	var vm = function () {
		var self = this;
		self.greeting = ko.observable("Welcome to Exartu");
		//self.activities = ko.meteor.find(Activities, {});

		return self;
	};

	helper.applyBindings(vm, 'dashboardVM');

	// View
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
};