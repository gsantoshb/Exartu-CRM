if (!dType){
    dType={};
}

dType.updater={
    afterUpdate:function(userId, doc, fieldNames, modifier, options){
        var relations= dType.core.getRelations(doc);
        relations= dType.util.toObject(relations, 'name');
        _.each(fieldNames,function(name){
            var relation= relations[name];
            if (relation){
                var oppositeVisibility= dType.core.getRelationOppositeVisivilityOnType(type, relation);
                var myVisibility= dType.core.getRelationVisivilityOnType(type, relation);
                if (oppositeVisibility){
                    var collection= dType.core.getCollectionOfType(myVisibility.target);
                    collection.update({ _id: getTargetId(doc, myVisibility) }, getUpdate(doc, oppositeVisibility, myVisibility.target))
                }
            }
        });
    }
};
var getTargetId= function(obj, visibility){
    //todo if the relation's value on this side has fields
    return obj[visibility.name];
}
var getUpdate= function(obj, visibility, typeName){
    var result= {};
    var selector= getPath(typeName) + '.' + visibility.name;
    //todo: the rel has field?
    result[selector]=obj._id;

    if (visibility.cardinality.max== 1){
        return result.$set=result;
    }else{
        return result.$addToSet=result;
    }
}
var getPath= function(typeName){
    var result=typeName;
    var type=dType.core.getObjType(typeName);
    while (type.parent){
        result = type.parent + '.' + result;
        type=dType.core.getObjType(type.parent);
    }
    return result;
}