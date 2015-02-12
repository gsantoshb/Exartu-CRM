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
        return LeaderBoardView.find();
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
