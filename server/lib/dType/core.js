if (!process.dType){
    dType={};
}
/*
 * The core module provides an interface to access the objTypes, relations and services
 * This module make the hooks with the meteor collections
 */

dType.core={
    getObjType: function(name){},
    createObjType: function(objType){
        //save the objType
        //if objType.collection make the hooks
    },
    createRelation: function(objType){},
    getObjTypes: function(obj){},
    getServices: function(servicesConfig){},
    getRelations: function(obj){},
    //returns from the relations that use this type, the visibility on this type
    getTypeRelations: function(type){}
}