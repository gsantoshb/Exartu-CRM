if (!dType){
    dType={};
}
/*
 * The core module provides an interface to access the objTypes, relations and services
 * This module make the hooks with the meteor collections
 */

_ObjTypes = new Meteor.Collection("dtype.objTypes");
Meteor.publish('dtype.objTypes', function () {
    if (Meteor.users){
        var user = Meteor.users.findOne({
            _id: this.userId
        });

        if (!user)
            return false;
    }
    return _ObjTypes.find({});
})
_Relations = new Meteor.Collection("dtype.relations");

_Services = {};
Collections= {};
_FieldTypes= {};

dType.core={

    //objTypes
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
        var oldObj=_ObjTypes.findOne({name: objType.name});
        if (oldObj){
            _ObjTypes.update({_id:oldObj._id},objType);
        }else{
            _ObjTypes.insert(objType);
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
    getObjType: function(name){
        return _ObjTypes.findOne({name: name});
    },
    getObjTypes: function(obj){
        return _ObjTypes.find({ name: { $in: obj.objNameArray } }).fetch();
    },
    getObjBaseType: function(obj){
        var types = this.getObjTypes(obj),
            base=types[0];
        while (base.parent){
            base= this.getObjType(base.parent);
        }
        return base;
    },
    getCollectionOfType: function(type){
        var typeObject= _.isObject(type) ? type : this.getObjType(type);
        while (typeObject && typeObject.parent){
            typeObject=this.getObjType(typeObject.parent)
        }
        return Collections[typeObject.collection];
    },

    //relations
    createRelation: function(relation){

        var oldRel=_Relations.findOne({name: relation.name});
        if (oldRel){
            _Relations.update({ _id:oldRel._id },relation);
        }else{
            _Relations.insert(relation);
        }
    },
    getCollection: function(collectionName){
        return Collections[collectionName];
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
    },

    //fieldTypes
    createFieldType: function(fieldType){
        _FieldTypes[fieldType.name]=fieldType;
    },
    getFieldType: function(name){
        return _FieldTypes[name];
    }
};
