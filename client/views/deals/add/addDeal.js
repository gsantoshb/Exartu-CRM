DealAddController = RouteController.extend({
    data: function(){
        console.log('obj',this.params.objType,this.params);
        Session.set('objType',this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('addDealPage');
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
var createDeal= function(objTypeName){
    console.log('deal',objTypeName,Session.get('objType'));
    var options= Session.get('addOptions');
    if (options){
        Session.set('addOptions', undefined);
    }

    model= new dType.objTypeInstance(Session.get('objType'), options);
    return model
}

Template.addDealPage.helpers({
    model: function(){
        if (!model){
            model=createDeal(Session.get('objType'));
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

Template.addDealPage.events({
    'click .btn-success': function(){
        console.log('dealadd',model);
        if (!dType.isValid(model)){
            console.log('modelnot valid');
            dType.displayAllMessages(model);
            return;
        }
        var obj=dType.buildAddModel(model)
        Meteor.call('addDeal', obj, function(err, result){
            if(err){
                console.dir(err)
            }else{
                history.back();
            }
        });
    },
    'click .goBack': function(){
        history.back();
    }
})

Template.addDealPage.destroyed=function(){
    model=undefined;
}