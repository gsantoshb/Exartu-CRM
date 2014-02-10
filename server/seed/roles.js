seedSystemRoles = function ()
{
    //todo: user these roles instead of the ones in the enum
    var systemRoles =
        [
            {
                name: 'SysAdmin',
                roleDescription: 'Administer system-wide tenants',
                rolePermissions: ['SysAdmin','TenantAdmin','CRM','Recruiting']
            },
            {
                name: 'Administrator',
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: ['TenantAdmin','CRM','Recruiting']
            },
            {
                name: 'Hiring_Manager',
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: ['CRM','Recruiting']
            },
            {
                name: 'Sales Rep',
                roleDescription: 'Manages contactables, deals, quotes',
                rolePermissions: ['CRM','Sales']
            },
            {
                name: 'Sales_Manager',
                roleDescription: 'Managers sales reps',
                rolePermissions: ['CRM','Sales','Sales_Manager']
            }
        ];
}
seedSystemRoles = function () {
	var existingRoles = Roles.getAllRoles().fetch();
	//console.dir(existingRoles);

	_.forEach(Enums.systemRoles, function (rol) {
		if (_.findWhere(existingRoles, {
			name: rol
		}) == null) {
			console.log('New system role: ' + rol);
			Roles.createRole(rol);
		}
	});

};