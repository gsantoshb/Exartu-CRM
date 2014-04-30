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
  _contactableId = contactableId;

  self.contactable = ko.meteor.findOne(Contactables, {
    _id: contactableId
  });

  if (self.contactable().contactMethods()) {
    self.firstCellPhone = _.findWhere(ko.toJS(self.contactable().contactMethods()), {typeEnum: 0});
    self.firstEmail = _.findWhere(ko.toJS(self.contactable().contactMethods()), {typeEnum: 2});
  }

  self.filesCollection = ContactablesFS;

  self.getObjTypeData = function (data) {
    if (data.Employee) return data.Employee;
    if (data.Customer) return data.Customer;
    if (data.Contact) return data.Contact;
  };
  self.activeTab = ko.dep(function () {
    return Router.current().params.hash || 'home';
  });

  self.contactablePicture = ContactablesFS.getThumbnailUrl(self.contactable().pictureFileId());
  _contactablePicture = self.contactablePicture
  self.pictureUrl = ko.computed(function () {
    if (self.contactablePicture().ready())
      return self.contactablePicture().picture();
    else
      return undefined;
  });

  self.editContactablePicture = function () {
    $('#edit-picture').trigger('click');
  };

  $('#edit-picture').off('change', updatePicture);
  $('#edit-picture').change(updatePicture);

  // Extra information on header for each objType
  self.getHeaderInfoVM = function (data) {
    if (data.Employee) return 'employee-header';
    if (data.Customer) return 'empty-header';
    if (data.Contact) return 'contact-header';
  };

  // Posts
  self.posts = ko.computed(function() {
    var clone = _.clone(self.contactable().posts());
    return clone.reverse();
  });

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

  return self;
};
//hack: the vm is called multiple times, so the image was being uploaded multiple times
//      a temp fix is to take the uploadfunction out of the vm, so i can make the $(...).off('change', updatePicture)
//      to make this i had to have this two variables (the ones with _...) with the data from the vm that is needed here
var _contactableId;
var _contactablePicture;
var updatePicture = function (e) {
  var fsFile = new FS.File(e.target.files[0]);
  fsFile.metadata = {
    entityId: _contactableId,
    owner: Meteor.userId(),
    name: fsFile.name
  };
  var file = ContactablesFS.insert(fsFile); //, function(err, result) {
  ContactablesFS.getThumbnailUrl(file._id, _contactablePicture);
  Meteor.call('updateContactablePicture', _contactableId, file._id);
  //});
}

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