Meteor.publish('roles', function () {
    //
    // only show the systemadministrator role if system initialization or if this user is system administrator
    //

    if (isSystemAdministrator())
    {
        return Roles.find();
    }
    else
    {
        return Roles.find({name: {$ne: Enums.roleFunction.SystemAdministrator } });
    }
});

Roles.allow({
    insert: function (userId, party) {
        return isSystemAdministrator(this.userId);
    },
    update: function (userId, party) {
        return isSystemAdministrator(this.userId);
    }
});

isSystemAdministrator=function(userid)
{
    if(userid) {
        var user = Meteor.users.find(userid);
        var sysadmin=false;
        if (Hierarchies.find().count()===0 ) sysadmin=true;
        console.log(user);
        if (user && user.roles && user.roles.indexOf(Enums.roleFunction.SystemAdministrator)>=0)
            sysadmin=true;
        return sysadmin
    };
    return false;
}

