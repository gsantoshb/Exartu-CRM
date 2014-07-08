
DealController = RouteController.extend({

    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [DealHandler, ObjTypesHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('deal')
    }
});

//var getDealDefinitionFromField=function(field, obj, path){
//    var type;
//    switch (field.fieldType){
//        case 'string':a
//            type=Utils.ReactivePropertyTypes.string;
//            break;
//        case 'date':
//            type=Utils.ReactivePropertyTypes.date;
//            break;
//        case 'number':
//            type=Utils.ReactivePropertyTypes.int;
//            break;
//        case 'lookUp':
//            type=Utils.ReactivePropertyTypes.lookUp;
//            break;
//
//    }
//
//    var result={
//        default: obj[field.name],
//        update: path+ field.name,
//        type: type
//    }
//    if(type==Utils.ReactivePropertyTypes.lookUp){
//
//        var displayName=obj[field.name+'Name']? obj[field.name+'Name']: LookUps.findOne({_id: obj[field.name]}).displayName;
//        result.displayName=displayName;
//        result.options=LookUps.find({codeType: field.lookUpCode});
//    }
//    return result;
//}
//toReactiveObject=function(addModel, obj){
//    var reactiveObj={
//        _id: obj._id,
//        reactiveProps: {}
//    }
//    var object=obj;
//    var path='';
//    var props={};
//    _.each(addModel.fieldGroups,function(fieldGroup){
//        _.each(fieldGroup.items,function(item){
//            if(item.type=='field'){
//                props[item.name]=getDealDefinitionFromField(item, object, path);
//
//            }
//        })
//    })
//    _.each(addModel.subTypes,function(subType){
//        path=subType.name + '.';
//        object=obj[subType.name];
//        _.each(subType.fieldGroups,function(fieldGroup){
//            _.each(fieldGroup.items,function(item){
//                if(item.type=='field'){
//                    props[item.name]=getDealDefinitionFromField(item, object, path);
//                }
//            })
//        })
//    })
//
//    _.extend(reactiveObj.reactiveProps, props);
//    return reactiveObj;
//}

var generateDealReactiveObject = function(deal) {
    var type=deal.objNameArray[1-deal.objNameArray.indexOf('deal')];
    var definition= Utils.toReactiveObject(dType.objTypeInstance(type), deal);
    definition.reactiveProps.tags={
        default: deal.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
    }
    definition.reactiveProps.location={
        default: deal.location,
        update: 'location'
    }
    return new Utils.ObjectDefinition(definition);
};



var self={};
Utils.reactiveProp(self, 'editMode', false);

Template.deal.created=function(){
    self.editMode=false;
}

Template.deal.helpers({
    deal: function(){
        var originalDeal=Deals.findOne({ _id: Session.get('entityId') });
        Session.set('dealDisplayName', originalDeal.displayName);
        deal = generateDealReactiveObject(originalDeal);
        return deal;
    },
    originalDeal:function(){
        return Deals.findOne({ _id: Session.get('entityId') });
    },
    editMode:function(){
        return self.editMode;
    },
    colorEdit:function(){
        return self.editMode ? '#008DFC' : '#ddd'
    },
    isType:function(typeName){
        return !! Deals.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
    },
    dealCollection: function(){
        return Deals;
    },
    getCustomer:function(){
        var j=Deals.findOne({ _id: Session.get('entityId')});
        return j && j.customer;
    },
    noteCount: function() {
        return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
    },

})
Template.deal.events({
    'click .editDeal':function(){
        self.editMode= ! self.editMode;
    },
    'click .saveButton':function(){

        if (!deal.isValid()) {
            deal.showErrors();
            return;
        }
        console.dir(deal.generateUpdate())
        Deals.update({_id: deal._id}, deal.generateUpdate(), function(err, result) {
            if (!err) {
                self.editMode=false;
                deal.updateDefaults();
            }
        });
    },
    'click .cancelButton':function(){
        self.editMode=false;
    },
    'click .see-less':function(){
        $('.deal-description').removeClass('in')
    },
    'click .see-more':function(){
        $('.deal-description').addClass('in')
    },
    'click .deal-description':function(e){
        if (!$(e.target).hasClass('see-less')){
            $('.deal-description').addClass('in')
        }
    },
    'click .add-tag': function() {
        addTag();
    },
    'keypress #new-tag': function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            addTag();
        }
    },
    'click .remove-tag': function() {
        deal.tags.remove(this.value);
    },
})


var addTag = function() {
    var inputTag = $('#new-tag')[0];

    if (!inputTag.value)
        return;

    if (_.indexOf(deal.tags.value, inputTag.value) != -1)
        return;
    deal.tags.insert(inputTag.value);
    inputTag.value = '';
    inputTag.focus();
};
Template.dealDescription.rendered=function(){
    var description=$('.deal-description');
    var container=description.find('.htmlContainer');
    if(container.height()<=100){
        description.addClass('none')
    }


    container.on('resize', _.debounce(function(){
        if(container.height()<=100){
            description.addClass('none')
        }else{
            description.removeClass('none')
        }
    },200));

}
Template.deal_tabs.helpers({
    getType: function(){
        return Enums.linkTypes.deal;
    }
})