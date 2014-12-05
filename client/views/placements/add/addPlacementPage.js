PlacementAddController = RouteController.extend({
  waitOn: function () {
    return [Meteor.subscribe('allEmployees')];
  },
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
var sending = new ReactiveVar(false);

var createPlacement= function(objTypeName){
  options= Session.get('addOptions');

  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  var defaultStatus = LookUps.findOne({lookUpCode: Enums.lookUpTypes.placement.status.lookUpCode, isDefault: true});
  if (defaultStatus) model.status = defaultStatus._id;
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
    AllEmployees.find({},{ sort: { 'person.lastName' : 1 }}).forEach(function(doc) {
      employees.push({ id: doc._id, text: doc.displayName + '      ['+ doc._id  + ']'  });
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
  },
  disableButton: function () {
    return sending.get();
  }
});

Template.addPlacementPage.events({
  'click .btn-success': function(){
    if (!dType.isValid(model)){
      dType.displayAllMessages(model);
      return;
    }
    var obj = dType.buildAddModel(model);

    if (options.job) obj.job=options.job;
    obj.employee=employeeId;
    sending.set(true);
    Meteor.call('addPlacement', obj, function(err, result){
      sending.set(false);
      if(err){
        console.dir(err)
      }
      else{
        Router.go('/placement/' + result);
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