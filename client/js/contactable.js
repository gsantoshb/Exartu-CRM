ContactableController = RouteController.extend({
    layoutTemplate: 'contactable',
    action: function () {
        // define which template to render in function of the url's hash
        switch (this.params.hash) {
        case 'details':
            this.render('contactableDetails', {
                to: 'content'
            });
            break;
        case 'details':
            this.render('contactableDetails', {
                to: 'content'
            });
            break;
        case 'posts':
            this.render('contactablePosts', {
                to: 'content'
            });
            break;
        default:
            this.render('contactableHome', {
                to: 'content'
            });
            break;
        };
    },
    data: function () {
        Session.set('entityId', this.params._id); // save current contactable to later use on templates
        Session.set('entityCollection', 'Contactables');
    }
});

Template.contactable.rendered = function () {
    // load contactable information
    var vm = function () {
        var self = this,
            contactableId = Session.get('entityId');

        self.contactable = ko.meteor.findOne(Contactables, {
            _id: contactableId
        });

        Session.set('entityDisplayName', self.contactable().displayName());

        // TAGS
        self.newTag = ko.observable('');
        self.isAdding = ko.observable(false);
        self.addTag = function () {
            self.isAdding(true);
            Meteor.call('addContactableTag', contactableId, self.newTag(), function (err, result) {
                if (!err) {
                    self.isAdding(false);
                    self.newTag('');
                }
            })
        }

        self.getTemplateName = function (data) {
            if (data.Employee) return 'employee-template';
            if (data.Customer) return 'customer-template';
            if (data.Contact) return 'contact-template';
        }
        self.getObjTypeData = function (data) {
            if (data.Employee) return data.Employee;
            if (data.Customer) return data.Customer;
            if (data.Contact) return data.Contact;
        };
        self.activeTab = ko.computed(function () {
            return Router.current().params.hash || 'home';
        });


        return self;
    };
    helper.applyBindings(vm, 'contactableVM', ContactableHandler);
};

Template.contactable.displayName = function () {
    return Session.get('entityDisplayName');
};