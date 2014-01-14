ContactableController = RouteController.extend({
    layoutTemplate: 'contactableLayout',
    action: function () {
        // define which template to render in function of the url's hash
        switch (this.params.hash) {
        case 'messages':
            this.render('entityMessages');
            break;
        case 'activities':
            this.render('activities');
            break;
        case 'asendEmail':
            this.render('sendEmail');
            break;
        case undefined:
            this.render('activities');
            break;
        };
        // render contactableNavigation template on navigation region defined on contactableLayout (client/layouts.html)
        this.render('contactableNavigation', {
            to: 'navigation'
        });
        this.render('tags', {
            to: 'information'
        });
    },
    data: function () {
        Session.set('entityId', this.params._id); // save current contactable to later use on templates
        Session.set('entityCollection', 'Contactables');
    },
});

Template.contactableNavigation.rendered = function () {
    // load contactable information
    var vm = function () {
        var self = this;
        self.contactable = ko.meteor.findOne(Contactables, {
            _id: Session.get('entityId')
        });
        self.contactable().displayName = ko.computed(
            function () {
                var c = self.contactable();
                return c.isCustomer != undefined && c.isCustomer() ? c.organizationName() : c.firstName() + ', ' + c.lastName();
            }, self);

        return self;
    };
    ContactableHandler.wait(function () {
        ko.applyBindings(new vm(), document.getElementsByName('contactableNavigationVM')[0]);
    });
};