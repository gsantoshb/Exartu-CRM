Meteor.startup(function(){
    if (!process.dType){
        dType={};
    }
    /*
     * The core module provides an interface to access the objTypes, relations and services
     * This module make the hooks with the meteor collections
     */

    _ObjTypes = new Meteor.Collection("objTypesPrivate");

    _Relations = new Meteor.Collection("relationsPrivate");

    _Services = {};

    dType.core={
        createObjType: function(objType){
            ObjTypes.insert(objType);
            if (objType.collection){
                var col=objType.collection;
                col.before.insert(dType.validator.validateInsert);
                col.after.insert(dType.updater.afterInsert);

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
            return _ObjTypes.find({ name: { $in: obj.objNameArray } });
        },

        createRelation: function(relation){
            _Relations.insert(relation);
        },
        getRelations: function(obj){
            var types =  getObjTypes(obj);
            var relations={};
            _.each(types, function(type){
                var typeRelations=getTypeRelations(type);
                _.extend(relations,typeRelations);
            })
            return relations;
        },
        getTypeRelations: function(type){
            return _Relations.find({
                    $or: [
                        {
                            obj1: type.objName
                        }, {
                            $and: [
                                {
                                    obj2: type.objName
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
            });
        },
        //returns from the relations that use this type, the visibility on this type
        getRelationsVisivilityOnType: function(type){
            var relationsArray= getTypeRealtions(type);
            var visibilities=[];
            _.each(relationsArray, function(rel){

                if(rel.obj1==type.objName){
                    visibilities.push(rel.visibilityOn1);

                }else if(rel.obj2==type.objName){
                    visibilities.push(rel.visibilityOn2);
                }
            });
            return visibilities;

        },
        createService: function(services){
            _Services[services.name]=services;
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
});