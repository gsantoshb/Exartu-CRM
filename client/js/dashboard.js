DashboardController = RouteController.extend({
    template: 'dashboard',
    layoutTemplate: 'mainLayout',
});

Template.dashboard.rendered = function () {
    var ViewModel = function () {
        this.greeting = ko.observable("Welcome to Exartu");
        self.activities = ko.meteor.find(Activities, {});
        return this;
    };

    ko.applyBindings(new ViewModel());
};