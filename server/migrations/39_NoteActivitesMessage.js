Migrations.add({
  version: 39,
  up: function () {
    Activities.find({"type":Enums.activitiesType.noteAdd, "msg":{$exists: false}}).forEach(function (c) {
       console.log("ActivitieId", c._id);
       var note = Notes.findOne({_id: c.entityId});
       if(note) {
         Activities.update({_id: c._id}, {$set: {msg: note.msg}});
       }
    })
  }
});
