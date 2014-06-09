ContactableController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, ContactableHandler, ContactMethodsHandler, GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('contactable')
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

var resizer = function() {
  $(".contactable-left-col").css("height", $('.contactable-right-col-custom').height() - 30 + 'px');
};

Template.contactable.created = function() {
  $(window).resize(resizer);
};

Template.contactable.distroyed = function() {
  $(window).off('resize', resizer);
};

Template.contactable.rendered = function () {
  $('body').scrollTop(0)
  this.$('#content').css('background-color', 'transparent');
  var asd = function () {
    var hash = Router.current().params.hash || 'home';
    $('.nav-pills>.active').removeClass('active');
    $('.nav-pills-' + hash).addClass('active');
  }
  Meteor.autorun(asd);
}

Template.contactable.helpers({
  contactable: function () {
    return Contactables.findOne({
      _id: Session.get('entityId')
    })
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  createdAtFormatted: function () {
    return moment(this.createdAt).format('lll');
  },
  documentCount: function() {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count();
  },
  mainContactMethods: function() {
    var result = {};
    var contactMethods = ContactMethods.find().fetch();
    _.some(this.contactMethods, function(cm){
      var type = _.findWhere(contactMethods, {_id: cm.type});
      if (!type)
        return false;
      if (type.type == Enums.contactMethodTypes.email)
        result.email = cm;
      if (type.type == Enums.contactMethodTypes.phone)
        result.phone = cm;

      if (!result.email || !result.phone)
        return false;

      return true;
    });

    return result;
  }
});

Template.contactable.events({
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    var fsFile = new FS.File(e.target.files[0]),
      contactableId = Session.get('entityId');

    fsFile.metadata = {
      entityId: contactableId,
      owner: Meteor.userId(),
      name: fsFile.name()
    };

    var file = ContactablesFS.insert(fsFile, function () {
    });

    Meteor.call('updateContactablePicture', contactableId, file._id);
  },
  'click .send-message': function (e) {
    Composer.showModal('sendMessage', $data);
  },
  'click .addLocation': function () {
    $('#edit-Location').trigger('click');
  },
  'click .sendMessage':function(){
    Composer.showModal('sendMessage', Session.get('entityId'));
  }
});

Template.contact_header.events({
  "click .editCustomer": function () {
    Composer.showModal('contactCustomerAddEdit', Session.get('entityId'));
  }
})
