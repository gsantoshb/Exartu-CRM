ContactableController = RouteController.extend({
  layoutTemplate: 'contactable',
  data: function () {
    Session.set('entityId', this.params._id);
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
      case 'educations':
        this.render('contactableEducation', {
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
    }
    ;
  }
});
var aux;
Template.contactable.entityId = function () {
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
  self.activeTab = ko.dep(function () {
    return Router.current().params.hash || 'home';
  });

  self.contactablePicture = ContactablesFS.getThumbnailUrl(self.contactable().pictureFileId());

  self.pictureUrl = ko.computed(function() {
    if (self.contactablePicture().ready())
      return self.contactablePicture().picture();
    else
      return undefined;
  });

  self.editContactablePicture = function () {
    $('#edit-picture').trigger('click');
  };

  $('#edit-picture').change(function (e) {
    var fsFile = new FS.File(e.target.files[0]);
    fsFile.metadata = {
      entityId: contactableId,
      owner: Meteor.userId(),
      name: fsFile.name
    };
    var file = ContactablesFS.insert(fsFile); //, function(err, result) {
    ContactablesFS.getThumbnailUrl(file._id, self.contactablePicture);
    Meteor.call('updateContactablePicture', contactableId, file._id);
    //});
  });

  // Extra information on header for each objType
  self.getHeaderInfoVM = function (data) {
    if (data.Employee) return 'employee-header';
    if (data.Customer) return 'empty-header';
        if (data.Contact) return 'contact-header';
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
