Accounts.onCreateUser(function (options, user) {
    console.dir(options);
    console.dir(user);
    if (user.services) {
        if (user.services.google) {
            //todo: check if the account is already in the database
            var email = user.services.google.email;
            options.hierId = createHier(email.split('@')[0]);
            user.emails = [{
                "address": email,
                "verified": true
            }];
        }
    }
    if (options.hierId == null) {
        options.hierId = createHier(options.email.split('@')[0]);
    }

    user.hierId = options.hierId;
    user._id = Random.id();
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
Meteor.publish("userData", function () {
    return Meteor.users.find({
        _id: this.userId
    }, {
        fields: {
            'emails': 1,
            'emails': 1,
            'services.google.picture': 1,
            "hierId": 1
        }
    });
});