seedSystemRoles = function ()
{
    var systemRoles =
        [
            {
                name: Enums.roleFunction.System_Administrator,
                roleDescription: 'Administer system-wide clients',
                rolePermissions: [Enums.permissionFunction.SysAdmin,Enums.permissionFunction.ClientAdmin,
                    Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting,Enums.permissionFunction.Sales_Manager,
                    Enums.permissionFunction.Sales]
            },
            {
                name: Enums.roleFunction.Client_Administrator ,
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: [Enums.permissionFunction.ClientAdmin,
                    Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting,Enums.permissionFunction.Sales,
                Enums.permissionFunction.Sales]
            },
            {
                name: Enums.roleFunction.Recruiter_Consultant,
                roleDescription: 'Administer tenancy users and hierarchies',
                rolePermissions: [  Enums.permissionFunction.CRM,Enums.permissionFunction.Recruiting]
            },
            {
                name: Enums.roleFunction.Sales_Executive,
                roleDescription: 'Manages network, deals, quotes',
                rolePermissions: [Enums.permissionFunction.CRM,Enums.permissionFunction.Sales]
            },
            {
                name: Enums.roleFunction.Sales_Manager,
                roleDescription: 'Managers sales reps',
                rolePermissions: [Enums.permissionFunction.CRM,Enums.permissionFunction.Sales]
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
};