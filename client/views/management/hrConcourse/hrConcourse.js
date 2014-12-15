hrConcourseManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
//    return [];
  },
  action: function () {
    if (this.ready())
      this.render('hrConcourse');
    else
      this.render('loading');
  }
});

var options;
var logo= null;
var fsFile= null;
Template.hrConcourse.created= function(){
  var hier= Hierarchies.findOne(Meteor.user().currentHierId);
  var config= (hier && hier.configuration) ? hier.configuration : {};
  options=  new Utils.ObjectDefinition({
    reactiveProps:{
      webName:{
        default: config.webName,
        validator: function(){
          return !_.isEmpty(this.value) && !/\s/.test(this.value);
        }
      },
      title:{
        default: config.title
      },
      background:{
        default: config.background || '#f3f3f4'
      }
    }
  })
}
Template.hrConcourse.helpers({
  options: function(){
    return options;
  },
  logo: function() {
    if (logo){
      HierarchiesFS.getUrlForBlaze(logo)
    }
    var hier= Hierarchies.findOne();
    var config= (hier && hier.configuration) ? hier.configuration : {};

    if (config && config.logo){
      return  HierarchiesFS.getUrlForBlaze(config.logo);
    }
    return '/assets/user-photo-placeholder.jpg';
  }
})
Template.hrConcourse.events({
  'click #saveButton': function(){
    var opt= options.getObject()

    if (fsFile) {
      var file = HierarchiesFS.insert(fsFile);
      logo = file._id;
      opt.logo= logo
      fsFile=null;
    }

    Meteor.call('saveConfiguration', opt, function(err, result){
      if (err){
        console.log(err);
        options.reset();
        fsFile=null;
      }
    })
  },
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    fsFile = new FS.File(e.target.files[0]);

    fsFile.metadata= {
      owner: Meteor.user().currentHierId,
      uploadedBy: Meteor.userId()
    };

//    var file= UsersFS.insert(fsFile);
//    logo= file._id;
  }
})

