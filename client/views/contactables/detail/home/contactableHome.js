Template.contactablePosts.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactablePosts.viewModel = function () {
    var self= {},
        contactableId= Session.get('entityId');

    self.contactable= ko.meteor.findOne(Contactables, {
        _id: contactableId
    });

    // <editor-fold desc="******  Contact Methods  ******">

    self.contactMethodsTypes = ko.meteor.find(ContactMethods,{});
    self.showAllContactMethods = ko.observable(false);
    self.contactMethods = ko.computed(function () {
        return self.showAllContactMethods() ? self.contactable().contactMethods() : self.contactable().contactMethods.slice(0, 3);
    });

    self.newContactMethod = ko.validatedObservable({
        value: ko.observable().extend({
            required: true
        }),
        type: ko.observable().extend({
            required: true
        }),
    })

    self.addContactMethod = function () {
        if (!self.newContactMethod.isValid()) {
            self.newContactMethod.errors.showAllMessages();
            return;
        }

        Meteor.call('addContactableContactMethod', contactableId, {
                value: self.newContactMethod().value(),
                type: self.newContactMethod().type()
            },
            function (err, result) {
                if (!err) {
                    self.newContactMethod().value("");
                    self.newContactMethod().value.isModified(false);
                    self.newContactMethod().type("");
                    self.newContactMethod().type.isModified(false);
                }
            })
    }
    // </editor-fold>


    // <editor-fold desc="****** TAGS  ******">
    self.newTag = ko.observable('');
    self.isAdding = ko.observable(false);
    self.addTag = function () {
        if (!self.newTag())
            return;

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
    // </editor-fold>

    return self;
}