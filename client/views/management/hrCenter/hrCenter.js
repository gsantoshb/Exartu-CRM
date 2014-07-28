hrCenterManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
//    return [];
  },
  action: function () {
    if (this.ready())
      this.render('hrCenter');
    else
      this.render('loading');
  }
});

var options;
Template.hrCenter.created= function(){
  var hier= Hierarchies.findOne();
  var config= (hier && hier.configuration) ? hier.configuration : {};
  options=  new Utils.ObjectDefinition({
    reactiveProps:{
      webName:{
        default: config.webName,
        validator: Utils.Validators.stringNotEmpty
      },
      title:{
        default: config.title,
        validator: Utils.Validators.stringNotEmpty
      },
      background:{
        default: config.color || '#f3f3f4'
      }
    }
  })
}
Template.hrCenter.helpers({
  options: function(){
    return options;
  }
})
Template.hrCenter.events({
  'click #saveButton': function(){
    Meteor.call('saveConfiguration', options.getObject(), function(err, result){
      if (err){
        console.log(err);
        options.reset();
      }
    })
  }
})

