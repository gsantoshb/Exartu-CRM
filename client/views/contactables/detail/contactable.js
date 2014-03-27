ContactableController = RouteController.extend({
    layoutTemplate: 'contactable',
    data: function(){
        Session.set('entityId',this.params._id);
    },
    action: function () {
      // define which template to render in function of the url's hash
      switch (this.params.hash) {
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
          case 'documents':
            this.render('documents', {
              to: 'content'
            });
            break;
        default:
            this.render('contactableHome', {
                to: 'content'
            });
            break;
      };
    }
});
var aux;
Template.contactable.entityId = function(){
    return Session.get('entityId');
}
Template.contactable.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactable.viewModel = function () {
    var self = {},
        contactableId = Router.current().params._id;

    self.contactable = ko.meteor.findOne(Contactables, {
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


    self.getObjTypeData = function (data) {
        if (data.Employee) return data.Employee;
        if (data.Customer) return data.Customer;
        if (data.Contact) return data.Contact;
    };
    self.activeTab = ko.computed(function () {
        return Router.current().params.hash || 'home';
    });








    // <editor-fold desc="****** POSTS  ******">
    self.newPost = ko.observable("");

    self.adding = ko.observable(false);
    self.addPost = function () {
        self.adding(true);
        Meteor.call('addContactablePost', contactableId, {
            content: self.newPost()
        }, function (err, result) {
            if (!err) {
                self.adding(false);
                self.newPost("");
            }
        });
    }
    // </editor-fold>


    // <editor-fold desc="****** PICTURE  ******">
    var updatePicture = function () {
        if (self.picture() && self.picture().fileHandler.
            default) {
            self.pictureUrl(self.picture().fileHandler.
                default.url());
        } else if (!self.picture().fileHandler.
            default) {
            var getUrl = function (retries) {
                if (retries > 0) {
                    setTimeout(function () {
                        if (self.picture().fileHandler.
                            default)
                            self.pictureUrl(self.picture().fileHandler.
                                default.url());
                        else
                            getUrl(retries - 1);
                    }, 500);
                } else {
                    self.pictureErrorMessage("Error editing picture, try again");
                }
            }
            getUrl(10);
        }
    }

    if (!self.contactable().pictureFileId)
        self.contactable().pictureFileId = ko.observable('');

    var queryPicture = ko.computed(function () {
        return {
            _id: self.contactable().pictureFileId()
        }
    });

    self.picture = ko.meteor.findOne(ContactablesFS, queryPicture);
    self.picture.subscribe(function () {
        updatePicture();
    });
    self.pictureErrorMessage = ko.observable("");
    self.pictureUrl = ko.observable();
    self.pictureUrl.subscribe(function (value) {
        self.pictureErrorMessage("");
        self.loadPicture(false);
    });
    self.loadPicture = ko.observable(true);

    if (!self.picture()) {
        self.loadPicture(false);
    } else if (self.picture().fileHandler.
        default)
        self.pictureUrl(self.picture().fileHandler.
            default.url());


    self.editContactablePicture = function () {
        $('#edit-picture').trigger('click');
    }

    $('#edit-picture').change(function (e) {
        var fileId = ContactablesFS.storeFile(e.target.files[0], {
            entityId: contactableId
        });

        self.loadPicture(true);

        Meteor.call('updateContactablePicture', contactableId, fileId);
    });
    // </editor-fold>

    // Extra information on header for each objType
    self.getHeaderInfoVM = function (data) {
        if (data.Employee) return 'employee-header';
        if (data.Customer) return 'empty-header';
        if (data.Contact) return 'empty-header';
    };

    return self;
};




Template.contactable.rendered = function () {
    // TODO: Avoid mutliple bindings
    // Remove old binding to avoid multiple calls
    var nodeIds = ['edit-picture-btn'];
    _.forEach(nodeIds, function (nodeId) {
        node = $('#' + nodeId)[0];
        if (node)
            ko.cleanNode(node);
    })
};
