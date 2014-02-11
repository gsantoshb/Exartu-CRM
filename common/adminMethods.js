/*
 * Return:
 *   1 if hier1 is parent of hier2
 *   -1 if hier1 is child of hier2
 *   and 0 if they don't are related
 */
adminMethods={};
adminMethods.getHierarchiesRelation = function (hier1, hier2) {
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
};

extendObject = function (doc) {
	doc.editable = adminMethods.getHierarchiesRelation(doc.hierId, Meteor.user().hierId) == 1 ? false : true;
}

adminMethods.getPermissions= function(user)
{
    if (!user) user=Meteor.user();
    if (adminMethods.permissions) return adminMethods.permissions;
    var permissions=[];
    _.each(user.roles, function(rolename) {
        var role=Roles.findOne({name: rolename});
        permissions=permissions.concat(role.rolePermissions);
    });
    return _.uniq(permissions);
};

adminMethods.userHasPermission= function(user,permission)
{
    if (!user) user=Meteor.user();
    return (adminMethods.getPermissions().indexOf(permission)>=0)
}
