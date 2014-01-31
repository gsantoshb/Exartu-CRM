seedSystemRoles = function () {
	var existingRoles = Roles.getAllRoles().fetch();
	//console.dir(existingRoles);

	_.forEach(Enums.systemRoles, function (rol) {
		if (_.findWhere(existingRoles, {
			name: rol
		}) == null) {
			console.log('New system rol: ' + rol);
			Roles.createRole(rol);
		}
	});
};