MatchupAddController = RouteController.extend({
  data: function(){
    Session.set('objType',this.params.objType);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('addMatchupPage');
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
var createMatchup= function(objTypeName){
  options= Session.get('addOptions');
  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  return model
}

Template.addMatchupPage.helpers({
  employeeId: function () {
  return employeeId;
  },
  model: function(){
    if (!model){
      model=createMatchup(Session.get('objType'));
    }
    return model;
  },
  objTypeName: function(){
    return Session.get('objType');
  },
  employees:function() {
    console.log('meployees');
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

Template.addMatchupPage.events({
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

    Meteor.call('addMatchup', obj, function(err, result){
      if(err){
        console.dir(err)
      }
      else{
        console.log('matchup result',result);
        Router.go('/matchup/' + result._id);
      }
    });
  },
  'click .goBack': function(){
    history.back();
  }
})

Template.addMatchupPage.destroyed=function(){
  model=undefined;
}