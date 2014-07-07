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
      case 'notes':
        this.render('contactableNotes', {
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

    GAnalytics.event("contactables", "details");
  },
  onAfterAction: function() {
    var title = 'All Contacts / ' + Session.get('contactableDisplayName'),
      description = 'Contact information';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var resizer = function() {
  $(".contactable-left-col").css("height", $('.contactable-right-col-custom').height() - 30 + 'px');
};

Template.contactable.created = function() {
  $(window).resize(resizer);
};

Template.contactable.destroyed = function() {
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
Template.displayObjType = function() {

    if (info.objType.value)
        return '';

    if (this.Customer)
        return 'Customer';
    if (this.Employee)
        return 'Employee';
    if (this.Contact)
        return 'Contact';
};
Template.contactable.helpers({
  displayObjType: function() {
      console.log('contactableobject',this);
      if (this.Customer)
          return 'Customer';
      if (this.Employee)
          return 'Employee';
      if (this.Contact)
          return 'Contact';
  },
  contactable: function () {
    var contactable = Contactables.findOne({
      _id: Session.get('entityId')
    });
    Session.set('contactableDisplayName', contactable.displayName);
    return contactable;
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  dateCreatedFormatted: function () {
    return moment(this.dateCreated).format('lll');
  },
  documentCount: function() {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count() + ResumesFS.find({'metadata.employeeId': Session.get('entityId')}).count();
  },
  noteCount: function() {
      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  jobCount: function() {
      return Jobs.find({'customer': Session.get('entityId')}).count();
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
  },
  ContactablesCollection: function(){
    return Contactables;
  }
});

Template.contactable.events({
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    var fsFile = new FS.File(e.target.files[0]),
      contactableId = Session.get('entityId');

    if (fsFile != undefined) {

      fsFile.metadata = {
        entityId: contactableId,
        owner: Meteor.userId(),
        name: fsFile.name()
      };

      var file = ContactablesFS.insert(fsFile, function () {
      });

      Meteor.call('updateContactablePicture', contactableId, file._id);
    }
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
var getLinkType= function(){
  return Enums.linkTypes.contactable;
}
Template.contact_tabs.helpers({
  getLinkType: getLinkType,
})
Template.customer_tabs.helpers({
  getLinkType: getLinkType,
})
Template.employee_tabs.helpers({
  getLinkType: getLinkType,
})
