Meteor.publish("leaderBoards", function () {
    var cursors = [
        Notes.aggregate([{$group: {
            _id: "$userId",
            count: {$sum:1}
        }}])
    ];

    generateLeaderBoardPublish(this, 'leaderBoards', cursors);
});
//db.sales.aggregate(
//    [
//        {
//            $group : {
//                _id : { month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } },
//                totalPrice: { $sum: { $multiply: [ "$price", "$quantity" ] } },
//                averageQuantity: { $avg: "$quantity" },
//                count: { $sum: 1 }
//            }
//        }
//    ]
//)



var generateLeaderBoardPublish = function (ctx, name, cursors) {
    console.log('curs',JSON.stringify(cursors));
    _.forEach(cursors, function(c){
        console.log('c',c);
        ctx.added(name, "notes", {
            counts:c
        });
    });

    ctx.ready();
};