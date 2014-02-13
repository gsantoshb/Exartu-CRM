/*
 * Return:
 *   1 if hier1 is parent of hier2
 *   -1 if hier1 is child of hier2
 *   and 0 if they don't are related
 */
methods={};
_.extend(methods, {
    getHierarchiesRelation: function (hier1, hier2) {
        var block = 0,
            minLength,
            result;

        if (hier1.length < hier2.length) {
            minLength = hier1.length;
            result = Enums.hierarchiesRelation.isParent;
        } else {
            minLength = hier2.length;
            result = Enums.hierarchiesRelation.isChild;
        }

        if (_.isEqual(hier1.substring(0, minLength).split('-'), hier2.substring(0, minLength).split('-')))
            return result;
        else
            return Enums.hierarchiesRelation.notRelated;
    },



    getObjNameArrayFromObject: function (obj) {
        //an object can have multiple names(objName), for example the same person can be both an employee and a contact
        // return an array of the objNames for the supplied object
        var objNameArray = [];
        _.map(ObjTypes.find().fetch(), function (type) {
            if (obj[type.objName]) objNameArray.push(type.objName);
        });
        return objNameArray;
    },
    getObjTypesFromObject: function (obj) {
        // an object can have multiple purposes (objTypes, for example the same person can be both an employee and a contact
        // return an array of the objTypes for the supplied object
        var objTypeArray = [];
        _.map(ObjTypes.find().fetch(), function (type) {
            if (obj[type.objName]) objTypeArray.push(type);

            console.dir(type);
        });
        return objTypeArray;
    }
});

extendObject = function (doc) {
    doc.editable = methods.getHierarchiesRelation(doc.hierId, Meteor.user().hierId) == 1 ? false : true;
};
