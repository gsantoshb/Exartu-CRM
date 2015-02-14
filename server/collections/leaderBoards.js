LeaderBoardView = new View('leaderBoards', {
    collection: Meteor.users,
    cursors: function (leaderBoard) {
    }
});


Meteor.paginatedPublish(LeaderBoardView, function () {
        var user = Meteor.users.findOne({
            _id: this.userId
        });
        if (!user)
            return [];
        if (!RoleManager.bUserIsSystemAdmin(user))
            return [];
        return Utils.filterCollectionByUserHier.call(this, LeaderBoardView.find({}, {
            fields: {
                'username': 1,
                'emails': 1,

                'hierRoles': 1,
                'createdAt': 1,
                'lastCustomerUsed': 1,
                'inactive': 1,
                'hierarchies': 1,
                'currentHierId': 1
            }
        }), {
            hierIdKeyName: 'hierarchies'
        });
    },
    {
        pageSize: 200,
        publicationName: 'leaderBoards'
    }
);

Meteor.publish('singleLeaderBoard', function (id) {
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    if (!user)
        return [];
    if (!RoleManager.bUserIsSystemAdmin(user))
        return [];
    return LeaderBoardView.find({_id: id});
});
