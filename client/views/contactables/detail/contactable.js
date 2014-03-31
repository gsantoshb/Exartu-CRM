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
        case 'pastJobs':
            this.render('contactablePastJobs', {
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





    self.getObjTypeData = function (data) {
        if (data.Employee) return data.Employee;
        if (data.Customer) return data.Customer;
        if (data.Contact) return data.Contact;
    };
    self.activeTab =ko.dep(function(){
        return Router.current().params.hash || 'home';
    });











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
