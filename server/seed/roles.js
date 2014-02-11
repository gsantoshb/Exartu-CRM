seedSystemRoles = function ()
{
    //todo: user these roles instead of the ones in the enum
    var systemRoles =
        [
            {
                name: 'SysAdmin',
                roleDescription: 'Administer system-wide tenants',
                rolePermissions: [Enums.permissionFunction.SystemAdmin,Enums.permissionFunction.TenantAdmin,
                    Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting,Enums.permissionFunction.Sales_Manager,
                    Enums.permissionFunction.Sales]
            },
            {
                name: 'Administrator',
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: [Enums.permissionFunction.TenantAdmin,
                    Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting,Enums.permissionFunction.Sales_Manager,
                    Enums.permissionFunction.Sales]
            },
            {
                name: 'Hiring_Manager',
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: [  Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting]
            },
            {
                name: 'Sales Rep',
                roleDescription: 'Manages contactables, deals, quotes',
                rolePermissions: [Enums.permissionFunction.CRM,Enums.permissionFunction.Sales]
            },
            {
                name: 'Sales_Manager',
                roleDescription: 'Managers sales reps',
                rolePermissions: [Enums.permissionFunction.CRM,Enums.permissionFunction.Sales,Enums.permissionFunction.Sales_Manager]
            }
        ];

    var existingRoles = Roles.find().fetch();
    _.forEach(systemRoles, function (role) {
        var oldRole = Roles.findOne({name: role.name});
        if (oldRole == null)
        {
            Roles.insert(role);
        }
    });
}