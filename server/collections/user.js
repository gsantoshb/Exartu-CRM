Accounts.onCreateUser(function (options, user) {
    var hierId = '';
    var userEmail = options.email;
    var roles = options.roles;
    console.log('on create user');
    console.dir(user);
    console.dir(options);
    if (user.services) {
        if (user.services.google) {
            //todo: check if the account is already in the database
            userEmail = user.services.google.email;
            user.username = user.services.google.name;
            user.emails = [{
                "address": userEmail,
                "verified": true
            }];

        }
    }
    if (!options.profile || !options.profile.hierId) {
        var userRoles = [];
        var userPermissions = [];
        _.forEach(Roles.find().fetch(), function (role) {
            userRoles.push(role.name);
            userPermissions = userPermissions.concat(role.rolePermissions);
        });
        roles = userRoles;
        user.permissions = _.uniq(userPermissions);
        hierId = Meteor.call('createHier', {
            name: userEmail.split('@')[0]
        });
    } else
        hierId = options.profile.hierId;

    if (!user.permissions) {
        var userPermissions = [];
        _.forEach(options.roles, function (role) {
            var dbrole = Roles.findOne({
                name: role
            });
            user.permissions = _.uniq(userPermissions.concat(dbrole.rolePermissions));
        });
    }
    user.roles = roles;
    user.hierId = hierId;


    Hierarchies.update({
        _id: user.hierId
    }, {
        $addToSet: {
            users: user._id
        }
    });

    return user;
});

/*
 * extending the user data that is sended to the client
 */
Meteor.publish(null, function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return;

    return Meteor.users.find({
        hierId: user.hierId
    }, {
        fields: {
            'username': 1,
            'emails': 1,
            'services.google.picture': 1,
            'profilePictureId': 1,
            "hierId": 1,
            "createdAt": 1,
            "roles": 1,
            "permissions": 1
        }
    });
});
Meteor.users.allow({
    update: function (userId, file, fields, modifier) {
        var user = Meteor.users.findOne({
            _id: userId
        });
        if (file.hierId != user.hierId)
            return false;
        if (!_.contains(user.roles, Enums.roleFunction.System_Administrator))
            return false;
        if (_.any(['createdAt', 'hierId', 'services'], function (field) {
            return _.contains(fields, field);
        }))
            return false;
        return true;
    }
});
Meteor.publish("users", function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    return Meteor.users.find({
        hierId: user.hierId
    });
});

var getPermissions = function (user) {
    var userPermissions = [];
    _.forEach(user.roles, function (role) {
        var dbrole = Roles.findOne({
            name: role
        });
        userPermissions = _.uniq(userPermissions.concat(dbrole.rolePermissions));
    });
    return userPermissions;
}

Meteor.methods({
    userRoleRemove: function (role, user) {
        if (!user || !user.roles) return;
        var index = user.roles.indexOf(role);
        if (index > -1) {
            user.roles.splice(index, 1);
        };
        Meteor.users.update({
            _id: user._id
        }, {
            $set: {
                roles: user.roles,
                permissions: getPermissions(user)
            }
        });
    },
    addHierUser: function (user, hierId) {
        hierId = hierId || Meteor.user().hierId;
        var options = {};
        options.username = user.username;
        options.email = user.email;
        options.password = user.password;
        options.roles = user.roles;

        options.profile = {
            hierId: hierId,
            // more information from user
        }
        var userId = Accounts.createUser(options);
        //        var userPermissions = [];
        //        _.forEach(user.roles, function (role) {
        //            var dbrole = Roles.findOne({
        //                name: role
        //            });
        //            userPermissions = _.uniq(userPermissions.concat(dbrole.rolePermissions));
        //        });
        //
        //        Meteor.users.update({
        //            _id: userId
        //        }, {
        //            $set: {
        //                roles: user.roles,
        //                permissions: userPermissions
        //            }
        //        });
        return userId;
    },
    getUserInformation: function (userId) {
        var user = Meteor.users.findOne({
            _id: userId
        });

        if (user == undefined)
            return null;

        var info = {};

        info.username = user.username || undefined;
        if (user.emails)
            info.email = user.emails[0].address;
        if (user.services) {
            if (user.services.google) {
                info.picture = user.services.google.picture;
            }
        }

        console.dir(info);
        return info;
    },
    checkUniqueness: function (query) {
        return Meteor.users.findOne(query) == null;
    },
    updateUserPicture: function (fileId) {
        console.log("user picture updated");

        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                profilePictureId: fileId
            }
        });
    }
});

/*
 * user files
 */

UsersFS = new FS.Collection('users',{
  stores: [
    new FS.Store.GridFS("userFiles", {})
  ]
});

Meteor.publish('usersFiles', function () {
    return UsersFS.find({});
});

UsersFS.allow({
    insert: function (userId, file) {
        return true;
    },
    update: function (userId, file, fields, modifier) {
        return true;
    },
    remove: function (userId, file) {
        return false;
    }
});

//var handler = {
//    default: function (options) {
//        console.dir('user default handler');
//        console.dir(options);
//        return {
//            blob: options.blob,
//            fileRecord: options.fileRecord
//        };
//    },
//}
//UsersFS.fileHandlers(handler);