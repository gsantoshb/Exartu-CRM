PlacementAddController = RouteController.extend({
  data: function(){
    Session.set('objType',this.params.objType);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('addPlacementPage');
  },
  onAfterAction: function() {
    var title = 'Add ' + Session.get('objType'),
      description = '';
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

var model;
var subTypesDep=new Deps.Dependency;
var options;
var employeeId;
var createPlacement= function(objTypeName){
  options= Session.get('addOptions');
  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  return model
}

Template.addPlacementPage.helpers({
  employeeId: function () {
  return employeeId;
  },
  model: function(){
    if (!model){
      model=createPlacement(Session.get('objType'));
    }
    return model;
  },
  objTypeName: function(){
    return Session.get('objType');
  },
  employees:function() {

    return Contactables.find({
      Employee: {
        $exists: true
      }
    });
  },
  isSelected: function(id){
    return employeeId==id;
  },
  log: function(){
    console.log('this',this);
  }
});

Template.addPlacementPage.events({
    'change .employeeSelect': function (e, ctx) {

      employeeId = e.target.value;
    },
  'click .btn-success': function(){
    if (!dType.isValid(model)){
      dType.displayAllMessages(model);
      return;
    }
    var obj=dType.buildAddModel(model);

    if (options.job) obj.job=options.job;
    obj.employee=employeeId;

    Meteor.call('addPlacement', obj, function(err, result){
      if(err){
        console.dir(err)
      }
      else{
        Router.go('/placement/' + result._id);
      }
    });
  },
  'click .goBack': function(){
    history.back();
  }
})

Template.addPlacementPage.destroyed=function(){
  model=undefined;
}