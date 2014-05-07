dType={};
dType.ObjTypes= new Meteor.Collection("dtype.objTypes");
Meteor.subscribe("dtype.objTypes");

dType.Relations=new Meteor.Collection("dtype.relations");
Meteor.subscribe("dtype.relations");
var getObjType=function(name){
    return  dType.ObjTypes.findOne({name: name});
}
dType.obj=function(ObjTypeName){
    var objType=getObjType(ObjTypeName);
    var model=this;
    model.fieldGruoups={};
//    return model;
    _.each(objType.fields, function(field){
        if (! model.fieldGruoups[field.fieldGroup || 'defaultGroup'])
            model.fieldGruoups[field.fieldGroup || 'defaultGroup'] = [];
        model.fieldGruoups[field.fieldGroup || 'defaultGroup'].push(new getFieldModel(field))
    })
    return model;
    _.each(visibilities, function(v){
        if (! model.fieldGruoups[v.fieldGroup || 'defaultGroup'])
            model.fieldGruoups[v.fieldGroup || 'defaultGroup'] = [];
        model.fieldGruoups[v.fieldGroup || 'defaultGroup'].push(new getVisibilityModel(v))
    })
}
dType.obj.prototype={
    toKO:function(){
        var self=this;
        var result=ko.mapping.fromJS(self);
        return result
    }
}

var build=function(model){
    if (!model().isValid()) {
        model.errors.showAllMessages();
        return;
    };
    var objRels = [];
    var ObjGroupRelNames = [];

    var ObjGroupRelValues = [];
    _.each(self.relations(), function (r) {
        if (r.relation.isGroupType) {
            ObjGroupRelNames.push(r.relation.name);
            if (r.value())
                ObjGroupRelValues.push(r.value());
        } else {
            objRels.push({
                name: r.relation.name,
                value: r.value() ? r.value() : null
            });
        }
    });

    _.extend(model(), _.object(ObjGroupRelNames, ObjGroupRelValues));


    var fields = model()[self.objTypeName()]();
    delete model()[self.objTypeName()];
    model()[self.objTypeName()] = {};
    _.forEach(fields, function (field) {
        model()[self.objTypeName()][field.name] = field.value() || field.defaultValue;
    })
    _.forEach(objRels, function (rel) {
        model()[self.objTypeName()][rel.name] = rel.value;
    })
    //            _.extend(model()[self.objTypeName()], _.object(relNames, relValues));
    model().objNameArray=[self.objTypeName()];

    return ko.toJS(model);
}
var getFieldModel= function(field){
    var item= this;
    item._field=_.clone(field);
    var value;
    if (field.fieldType == 'string') {
        value= field.defaultValue;
        _.extend(item, {
            value: value
        });

    } else if (field.fieldType == 'lookUp') {
        value= field.defaultValue;
        _.extend(item, {
            value: value
        })
    } else{
        _.extend(item, {
            value: ko.observable()
        })
    }
    return item;
}
