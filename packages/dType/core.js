if (!dType){
    dType={};
}
dType.core={};
/*
 * The core module provides an interface to access the objTypes, relations and services
 * This module make the hooks with the meteor collections
 */
if (Meteor.isServer){
    dType.ObjTypes = new Meteor.Collection("dtype.objTypes");
    Meteor.publish('dtype.objTypes', function () {
        if (Meteor.users){
            var user = Meteor.users.findOne({
                _id: this.userId
            });

            if (!user)
                return false;
        }
        return dType.ObjTypes.find({});
    })
    dType.Relations = new Meteor.Collection("dtype.relations");
    Meteor.publish('dtype.relations', function () {
        if (Meteor.users){
            var user = Meteor.users.findOne({
                _id: this.userId
            });

            if (!user)
                return false;
        }
        return dType.Relations.find({});
    })

    _Services = {};
    Collections= {};
    _FieldTypes= {};
}
if (Meteor.isClient){
    dType.ObjTypes= new Meteor.Collection("dtype.objTypes");
    dType.ObjTypesHandler=Meteor.subscribe("dtype.objTypes");

    dType.Relations=new Meteor.Collection("dtype.relations");
    dType.RelationsHandler=Meteor.subscribe("dtype.relations");

    _FieldTypes={};
}
if (Meteor.isServer){
    _.extend(dType.core,{
        createObjType: function(objType){
            if(objType.collection){
                if (! objType.collection._collection._dtypeId){
                    if (! objType.collection._collection._name)
                        objType.collection._collection._dtypeId='localCollection' + _.keys(Collections).length;
                    else{
                        objType.collection._collection._dtypeId=objType.collection._collection._name
                    }
                }

                Collections[objType.collection._collection._dtypeId]=objType.collection;
                var collection=objType.collection

                objType.collection=objType.collection._collection._dtypeId;
            }
            var oldObj=dType.ObjTypes.findOne({name: objType.name});
            if (oldObj){
                dType.ObjTypes.update({_id:oldObj._id},objType);
            }else{
                dType.ObjTypes.insert(objType);
            }

            if (collection){
                collection.before.insert(function(userId, doc){

                    return dType.validator.validateInsert.call(this, userId, doc);
                });
                collection.after.insert(function(userId, doc){
                    return dType.updater.afterInsert.call(this, userId, doc);
                });

                collection.before.update(dType.validator.validateUpdate);
                collection.after.update(dType.updater.afterUpdate);

                collection.after.remove(dType.validator.validateRemove);
                collection.before.remove(dType.updater.afterRemove);
            }
        },
        createRelation: function(relation){

            var oldRel= dType.Relations.findOne({name: relation.name});
            if (oldRel){
                 dType.Relations.update({ _id:oldRel._id },relation);
            }else{
                 dType.Relations.insert(relation);
            }
        },
        createService: function(services){
            _Services[services.name]=services;
        },
    });
}
_.extend(dType.core,{
    //objTypes

    getObjType: function(name){
        return dType.ObjTypes.findOne({name: name});
    },
    getObjTypes: function(obj){
        return dType.ObjTypes.find({ name: { $in: obj.objNameArray } }).fetch();
    },
//    getObjBaseType: function(obj){
//        var types = dType.core.getObjTypes(obj),
//            bases=[];
//        _.each(types,function(type){
//            while (type.parent){
//                type= dType.core.getObjType(base.parent);
//            }
//            if(bases.indexOf(type)<0)
//                bases.push(type);
//        })
//        return bases;
//    },
    getObjBaseTypes: function(obj){
        var types = dType.core.getObjTypes(obj),
            bases=[];
        _.each(types,function(type){
            while (type.parent){
                type= dType.core.getObjType(type.parent);
            }
            if((type.collection) &&! _.findWhere(bases,{name: type.name}))
                bases.push(type);
        })
        return bases;
    },
    getCollectionOfType: function(type){
        var typeObject= _.isObject(type) ? type : this.getObjType(type);
        while (typeObject && typeObject.parent){
            typeObject=this.getObjType(typeObject.parent)
        }
        return Collections[typeObject.collection];
    },

    //relations
    getCollection: function(collectionName){
        return Collections[collectionName];
    },
    getTypeRelations: function(type){
        return  dType.Relations.find({
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
            ]
        }).fetch();
    },
    getRelations: function(obj){
        var types =  this.getObjTypes(obj);
        var relations=[];
        _.each(types, function(type){
            var typeRelations= dType.core.getTypeRelations(type);
            relations.concat(typeRelations);
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

    //services

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
    },

    //fieldTypes
    createFieldType: function(fieldType){
        _FieldTypes[fieldType.name]=fieldType;
    },
    getFieldType: function(name){
        return _FieldTypes[name];
    }
});
