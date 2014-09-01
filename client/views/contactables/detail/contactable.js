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

    Session.set('activeTab',this.params.hash);

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

Template.contactable.rendered = function () {
  $('body').scrollTop(0);
};
Template.displayObjType = function() {
  if (info.objType.value)
    return '';
  return Utils.getContactableType(this);
};

Template.contactable.helpers({
  displayObjType: function() {
    return Utils.getContactableType(this);
  },
  contactable: function () {
    var contactable = Contactables.findOne({
      _id: Session.get('entityId')
    });
    Session.set('contactableDisplayName', contactable.displayName);
    return contactable;
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
  },
  'click #makeEmployee': function(){
    //todo: make this in dType, checking required fields, defaultValues, etc
    
    Contactables.update({ _id: Session.get('entityId') }, {
      $set: {
        Employee : {}
      },
      $push: {objNameArray: 'Employee'}
    });
  },
  'click #makeContact': function(){
    Contactables.update({ _id: Session.get('entityId') }, {
      $set: {
        Contact : {}
      },
      $push: {objNameArray: 'Contact'}
    });
  }
});
//
//Template.contact_header.events({
//  "click .editCustomer": function () {
//    Composer.showModal('contactCustomerAddEdit', Session.get('entityId'));
//  }
//});

Template.contactable_header.helpers({
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
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  }
});

Template.all_tabs.helpers({
  isActive: function(name){
    var activeTab = Session.get('activeTab') || 'details';
    return (name == activeTab) ? 'active' : '';
  }
})

var getLinkType= function(){
  return Enums.linkTypes.contactable;
}

