//Search for all tags and add them to the collection tags
Migrations.add({
    version: 16,
    up: function() {
        Tasks.find({$or:[{begin:{$type: 2}},{end:{$type:2}}]}).forEach(
            //search tags in contables
            function (t) {
                if (!t.begin) return;
                else {
                    t.begin = new Date(t.begin);

                }
                if(!t.end) return;
                else{
                    t.end = new Date(t.end);
                }
                Tasks.update({
                    _id: t._id
                }, {
                    $set: {begin: t.begin, end: t.end}
                });

            }
        )
    }

});