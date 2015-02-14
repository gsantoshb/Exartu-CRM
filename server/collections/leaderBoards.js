Meteor.publish("leaderBoards", function () {
    var day0 =  (new Date()).getTime() ;
    var day1 =  (new Date()).getTime() - 1000*60*60*24*1;
    var day7 =  (new Date()).getTime() - 7*1000*60*60*24*1;
    var day30 =  (new Date()).getTime() - 30*1000*60*60*24*1;
    var notesCursor=
        Notes.aggregate([{$group: {_id: "$userId",
            day1: {$sum: {$cond: [{$gte: ["$dateCreated", day1]}, 1, 0]}},
                day7: {$sum: {$cond: [{$gte: ["$dateCreated", day7]}, 1, 0]}},
                    day30: {$sum: {$cond: [{$gte: ["$dateCreated", day30]}, 1, 0]}}
            }}]);

    var cursors=[{name:"Notes",cursor:notesCursor}]
    generateLeaderBoardPublish(this, 'leaderBoards', cursors);
});


var generateLeaderBoardPublish = function (ctx, name, cursors) {
    _.forEach(cursors, function (c) {
        ctx.added(name, c.name, c.cursor);
    });

    ctx.ready();
};