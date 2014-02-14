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
    }
});

extendObject = function (doc) {
    doc.editable = methods.getHierarchiesRelation(doc.hierId, Meteor.user().hierId) == 1 ? false : true;
};
