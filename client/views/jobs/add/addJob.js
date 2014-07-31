JobAddController = RouteController.extend({
    data: function(){
        Session.set('objType',this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('addJobPage');
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
var createJob= function(objTypeName){
    var options= Session.get('addOptions');
    if (options){
      Session.set('addOptions', undefined);
    }

    model= new dType.objTypeInstance(Session.get('objType'), options);
    return model
}

Template.addJobPage.helpers({
    model: function(){
        if (!model){
            model=createJob(Session.get('objType'));
        }
        return model;
    },
    subTypeArray: function(){
        subTypesDep.depend();
        return model.subTypes;
    },
    objTypeName: function(){
        return Session.get('objType');
    }
})

Template.addJobPage.events({
    'click .btn-success': function(){
        if (!dType.isValid(model)){
            dType.displayAllMessages(model);
            return;
        }
        var obj=dType.buildAddModel(model)
        Meteor.call('addJob', obj, function(err, result){
            if(err){
                console.dir(err)
            }else{
              history.back();
              Meteor.call('setLastCustomerUsed', obj.customer, function(){
                if(err)
                  console.dir(err)
              });
            }
        });
    },
    'click .goBack': function(){
        history.back();
    }
})

Template.addJobPage.destroyed=function(){
    model=undefined;
}