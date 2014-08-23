AssignmentAddController = RouteController.extend({
  data: function(){
    Session.set('objType',this.params.objType);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('addAssignmentPage');
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
var createAssignment= function(objTypeName){
  var options= Session.get('addOptions');
  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  return model
}

Template.addAssignmentPage.helpers({
  model: function(){
    if (!model){
      model=createAssignment(Session.get('objType'));
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
  }
});

Template.addAssignmentPage.events({
  'click .btn-success': function(){
    if (!dType.isValid(model)){
      dType.displayAllMessages(model);
      console.log('assignment dtype invalid',model);
      return;
    }
    var obj=dType.buildAddModel(model);


    Meteor.call('addAssignment', obj, function(err, result){
      if(err){
        console.dir(err)
      }
      else{
        console.log('assignment result',result);
        Router.go('/assignment/' + result._id);
      }
    });
  },
  'click .goBack': function(){
    history.back();
  }
})

Template.addAssignmentPage.destroyed=function(){
  model=undefined;
}