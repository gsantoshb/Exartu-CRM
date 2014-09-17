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
    var title = 'Add ' + Session.get('objType');
    var description = '';

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
var options;
var employeeId;
var createPlacement= function(objTypeName){
  options= Session.get('addOptions');

  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  return model
};

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
    var employees = [];
      Contactables.find({ Employee: { $exists: true } }).forEach(function(doc) {
      employees.push({ id: doc._id, text: doc.displayName});
    });
    return employees;
  },
  selectEmployee: function () {
    return function (selectedValue) {
      employeeId = selectedValue;
    }
  },
  isSelected: function(id){
    return employeeId==id;
  }
});

Template.addPlacementPage.events({
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
});

Template.addPlacementPage.destroyed=function(){
  model=undefined;
};