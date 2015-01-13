HotListAddController = RouteController.extend({
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
    this.render('addHotListPage');
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

var sending = new ReactiveVar(false);

var createHotList= function(objTypeName){
  options= Session.get('addOptions');

  if (options){
    Session.set('addOptions', undefined);
  }

  model= new dType.objTypeInstance(Session.get('objType'), options);
  var defaultStatus = LookUps.findOne({lookUpCode: Enums.lookUpTypes.hotList.status.lookUpCode, isDefault: true});
  if (defaultStatus) model.status = defaultStatus._id;
  return model
};

Template.addHotListPage.helpers({

  model: function(){
    if (!model){
      model=createHotList(Session.get('objType'));
    }
    return model;
  },
  objTypeName: function(){
    return Session.get('objType');
  },

  isSelected: function(id){
    return employeeId==id;
  },
  disableButton: function () {
    return sending.get();
  }
});

Template.addHotListPage.events({
  'click .btn-success': function(){
    if (!dType.isValid(model)){
      dType.displayAllMessages(model);
      return;
    }
    var obj = dType.buildAddModel(model);

    sending.set(true);
    Meteor.call('addHotList', obj, function(err, result){
      sending.set(false);
      if(err){
        console.dir(err)
      }
      else{
        Router.go('/hotList/' + result);
      }
    });
  },
  'click .goBack': function(){
    history.back();
  }
});

Template.addHotListPage.destroyed=function(){
  model=undefined;
};