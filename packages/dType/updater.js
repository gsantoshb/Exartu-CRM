if (!dType){
    dType={};
}
dType.updater={
    afterInsert:function(userId, doc){
        var types= dType.core.getObjTypes(doc);

        _.each(types,function(type){
            var relations= dType.core.getTypeRelations(type);
            var obj= type.collection ? doc : doc[type.name];
            _.each(relations, function(relation){
                var oppositeVisibility= dType.core.getRelationOppositeVisivilityOnType(type, relation);
                var myVisibility= dType.core.getRelationVisivilityOnType(type, relation);
                if (oppositeVisibility){
                    var collection= dType.core.getCollection(myVisibility.collection);
                    var update=  getUpdate(doc, oppositeVisibility, myVisibility.target);
                    var targetId= getTargetId(obj, myVisibility);

                    if (targetId){
                        collection.update({ _id: targetId }, update,function(err, result){
                            if (err){
                                throw err
                            }else{
                                console.log(result);
                            }
                        })
                    }
                }
            })
        })

    },
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
    var result= {
        __notRunHook:true,
    };
    var selector= getPath(typeName) + '.' + visibility.name;
    //todo: the rel has field?
    result[selector]=obj._id;

    if (visibility.cardinality.max== 1){
        return { $set: result };
    }else{
        return { $addToSet: result };
    }
}
var getPath= function(typeName){
    var result=typeName;
    var type=dType.core.getObjType(typeName);

    while (type.parent){
        type=dType.core.getObjType(type.parent);
        if (type.parent)
            result = type.name + '.' + result;
    }
    return result;
}