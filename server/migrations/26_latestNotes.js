Migrations.add({
  version: 26,
  up: function () {
    //clear all tags
    var contactables = Contactables.find({}).fetch();
    _.each(contactables, function(c){
       var newLatestNote = [];
       var n = Notes.find({'links.id':c._id},{$sort:{dateCreated:-1} }).fetch();
       if(n) {
         if (n[2]) {
          newLatestNote.push(n[2]);
         }
         if (n[1]) {
          newLatestNote.push(n[1]);
         }
         if (n[0]) {
          newLatestNote.push(n[0]);
         }
       }
       Contactables.update({_id:c._id},{$set: {latestNotes: newLatestNote}, $unset:{lastNote:""}});
    })
    }
});


