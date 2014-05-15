loading=true;
stopLoading=function(){
    loading=false;
    loadDep.changed()
}
loadDep=new Deps.Dependency
var ForEverHandler={
    ready:function(){
        loadDep.depend();
        return ! loading;
    }
}

ContactableController = RouteController.extend({
//  layoutTemplate: 'contactable',
    waitOn: function () {
        return [ObjTypesHandler, ContactableHandler, ContactMethodsHandler, ForEverHandler]//GoogleMaps
    },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if(!this.ready()){
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
    };
  }
});

Template.contactable.rendered=function(){
  var asd=function(){
    var hash=Router.current().params.hash || 'home';
    $('.nav-pills>.active').removeClass('active');
    $('.nav-pills-' + hash).addClass('active');
  }
  Meteor.autorun(asd);
}

UI.registerHelper('date', function (value) {
  debugger;
  return moment(value).format('MMMM Do YYYY, h:mm a');
});

Template.contactable.helpers({
  contactable: function(){
    return Contactables.findOne({
      _id: Session.get('entityId')
    })
  },
  pictureUrl:function(){
    if (this.pictureFileId){
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  createdAtFormatted: function() {
    return moment(this.createdAt).format('lll');
  }
})

Template.contactable.events({
  'click .edit-pic': function(){
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function(e){
    var fsFile = new FS.File(e.target.files[0]),
      contactableId=Session.get('entityId');
    fsFile.metadata = {
      entityId: contactableId,
      owner: Meteor.userId(),
      name: fsFile.name
    };
    var file = ContactablesFS.insert(fsFile);
    Meteor.call('updateContactablePicture', contactableId, file._id);
  },
  'click .send-message': function(e){
    Composer.showModal('sendMessage', $data);
  },
  'keypress #note-input': function (e) {
    if (e.which === 13) {
      Meteor.call('addContactablePost', Session.get('entityId'), {
        content: e.currentTarget.value
      }, function (err, result) {
        if (!err) {
        }
      });
    }
  },
'click .addContact': function(){
    Session.set('options',{Contact:{customer: Session.get('entityId')}})
    Router.go('addContactablePage', {objType: 'Contact'});
}
});