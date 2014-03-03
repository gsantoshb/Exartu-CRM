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

Template.contactable.viewModel = function () {
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

    self.removeTag = function (tag) {
        Meteor.call('removeContactableTag', contactableId, tag)
    };

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

    // Edit contactable

    self.updateContactable = function (options, callback) {
        if (!options.objUpdated.isValid()) {
            options.objUpdated.errors.showAllMessages();
            return;
        }

        var toJSObj = ko.toJS(options.objUpdated());
        _.forEach(_.keys(toJSObj), function (key) {
            if (_.isFunction(toJSObj[key]))
                delete toJSObj[key];
        });

        var set = {};
        set['$set'] = {};
        set['$set'][options.objNameUpdated] = toJSObj;

        Contactables.update({
            _id: self.contactable()._id()
        }, set, function (err, result) {
            if (!err)
                callback.call();
        });
    };

    // Edit contactable's general information (person or organization details)

    self.editModeContactableInfo = ko.observable(false);
    self.editModeContactableInfo.subscribe(function (value) {
        if (!value) {
            if (self.editOrganization)
                self.editOrganization().load(self.contactable().organization);
            else
                self.editPerson().load(self.contactable().person);
        }
    });

    if (self.contactable().person) {
        self.editPerson = ko.validatedObservable(new koPerson());
        self.editPerson().load(self.contactable().person);
    }

    if (self.contactable().organization) {
        self.editOrganization = ko.validatedObservable(new koOrganization());
        self.editOrganization().load(self.contactable().organization);
    }

    self.updateContactableInformation = function () {
        var options = {};

        if (self.editOrganization) {
            options.objUpdated = self.editOrganization;
            options.objNameUpdated = 'organization';
        } else {
            options.objUpdated = self.editPerson;
            options.objNameUpdated = 'person';
        }

        self.updateContactable(options, function () {
            self.editModeContactableInfo(false);
        })
    };

    // Edit objType

    self.editModeContactableObjType = ko.observable(false);
    self.editModeContactableObjType.subscribe(function (value) {
        if (!value)
            self.editObjType().load(self.contactable()[self.contactable().objNameArray()[0]]);
    });

    var objType = ObjTypes.findOne({
        objName: self.contactable().objNameArray()[0]
    });

    self.editObjType = ko.validatedObservable(koObjectGenerator(objType.fields));
    self.editObjType().load(self.contactable()[self.contactable().objNameArray()[0]]);

    self.updateContactableObjType = function () {
        var options = {
            objUpdated: self.editObjType,
            objNameUpdated: self.contactable().objNameArray()[0],
        }

        self.updateContactable(options, function () {
            self.editModeContactableObjType(false);
        });
    };

    return self;
};


Template.contactable.displayName = function () {
    return Session.get('entityDisplayName');
};