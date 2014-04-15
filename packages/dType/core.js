if (!dType){
    dType={};
}
/*
 * The core module provides an interface to access the objTypes, relations and services
 * This module make the hooks with the meteor collections
 */

_ObjTypes = new Meteor.Collection("dtype.objTypes");

_Relations = new Meteor.Collection("dtype.relations");

_Services = {};

dType.core={
    createObjType: function(objType){

        console.log('creating2')
        var oldObj=_ObjTypes.findOne({name: objType.name});
        if (oldObj){
            console.log('updating');
//            _ObjTypes.update({_id: oldObj._id}, objType);
        }else{
            console.log('inserting');
            _ObjTypes.insert(objType);
        }

        if (objType.collection){
            console.log('hooking')
            var col=objType.collection;
            col.before.insert(dType.validator.validateInsert);
            col.after.insert(dType.updater.afterUpdate);

            col.before.update(dType.validator.validateUpdate);
            col.after.update(dType.updater.afterUpdate);

            col.after.remove(dType.validator.validateRemove);
            col.before.remove(dType.updater.afterRemove);
        }
    },
    getObjType: function(name){
        return _ObjTypes.findOne({name: name});
    },
    getObjTypes: function(obj){
        return _ObjTypes.find({ name: { $in: obj.objNameArray } }).fetch();
    },

    createRelation: function(relation){
        _Relations.insert(relation);
    },
    getTypeRelations: function(type){
        return _Relations.find({
            $or: [
                {
                    obj1: type.name
                }, {
                    $and: [
                        {
                            obj2: type.name
                        }, {
                            visibilityOn2 : {
                                $exists: true
                            }
                        }
                    ]
                },
//                    {
//                        'visibilityOn2.isGroupType': true,
//                        obj1: type.objGroupType
//                    },
//                    {
//                        $and: [
//                            {
//                                obj2: type.objGroupType
//                            }, {
//                                visibilityOn2: {
//                                    $exists: true
//                                }
//                            }
//                        ]
//                    }
            ]
        }).fetch();
    },
    getRelations: function(obj){
        var types =  this.getObjTypes(obj);
        var relations={};
        _.each(types, function(type){
            var typeRelations= dType.core.getTypeRelations(type);
            _.extend(relations,typeRelations);
        })
        return relations;
    },

    //returns from the relations that use this type, the visibility on this type
    getRelationsVisivilityOnType: function(type){
        var relationsArray= dType.core.getTypeRelations(type);
        var visibilities=[];
        _.each(relationsArray, function(rel){

            if(rel.obj1==type.name){
                visibilities.push(rel.visibilityOn1);

            }else if(rel.obj2==type.name){
                visibilities.push(rel.visibilityOn2);
            }
        });
        return visibilities;

    },
    getRelationOppositeVisivilityOnType: function(type, relation){
        var typeName= _.isObject(type) ? type.name : type;
        return relation.obj1==typeName ? relation.visibilityOn2 : relation.obj2==typeName ? relation.visibilityOn1 : null;
    },
    getRelationVisivilityOnType: function(type, relation){
        var typeName= _.isObject(type) ? type.name : type;
        return relation.obj1==typeName ? relation.visibilityOn1 : relation.obj2==typeName ? relation.visibilityOn2 : null;
    },
    getCollectionOfType: function(type){
        var typeObject= _.isObject(type) ? type : this.getObjType(type);

        while (typeObject.parent){
            typeObject=this.getObjType(typeObject.parent)
        }
        return typeObject.collection;
    },

    createService: function(services){
        _Services[services.name]=services;
    },
    getService: function(serviceName){
        return _Services[serviceName];
    },
    getServices: function(servicesSetting, extendServices){
        var services=[];
        _.each(servicesSetting, function(setting){
            var s=_Services[config.name];

            // add the config in the array
            if (extendServices){
                s=_.clone(s);
                s.setting=setting;
            }
            services.push(s);

        })
        return services;
    }

};